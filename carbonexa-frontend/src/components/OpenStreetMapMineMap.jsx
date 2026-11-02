import { useEffect, useMemo, useRef, useState } from "react";

const TILE_SIZE = 256;
const DEFAULT_CENTER = { lat: 22.7, lng: 85 };
const MAX_LATITUDE = 85.05112878;

function project({ lat, lng }, zoom) {
  const safeLatitude = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));
  const worldSize = TILE_SIZE * (2 ** zoom);
  const sinLatitude = Math.sin((safeLatitude * Math.PI) / 180);

  return {
    x: ((lng + 180) / 360) * worldSize,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * worldSize,
  };
}

function unproject({ x, y }, zoom) {
  const worldSize = TILE_SIZE * (2 ** zoom);
  const wrappedX = ((x % worldSize) + worldSize) % worldSize;
  const lng = (wrappedX / worldSize) * 360 - 180;
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / worldSize)));

  return {
    lat: (latitudeRadians * 180) / Math.PI,
    lng,
  };
}

function centerOfSites(sites) {
  if (!sites.length) return DEFAULT_CENTER;
  return {
    lat: sites.reduce((sum, site) => sum + site.lat, 0) / sites.length,
    lng: sites.reduce((sum, site) => sum + site.lng, 0) / sites.length,
  };
}

function OpenStreetMapMineMap({ sites, selectedSiteId, onSelect, zoom, showLabels, statusColors }) {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [center, setCenter] = useState(() => centerOfSites(sites));
  const [isDragging, setIsDragging] = useState(false);

  const zoomLevel = Math.max(6, Math.min(10, Math.round(8 + (zoom - 1) * 3)));
  const centerPixel = project(center, zoomLevel);

  const tiles = useMemo(() => {
    if (!mapSize.width || !mapSize.height) return [];

    const worldTiles = 2 ** zoomLevel;
    const leftWorldPixel = centerPixel.x - mapSize.width / 2;
    const topWorldPixel = centerPixel.y - mapSize.height / 2;
    const firstTileX = Math.floor(leftWorldPixel / TILE_SIZE);
    const firstTileY = Math.floor(topWorldPixel / TILE_SIZE);
    const columns = Math.ceil(mapSize.width / TILE_SIZE) + 2;
    const rows = Math.ceil(mapSize.height / TILE_SIZE) + 2;
    const visibleTiles = [];

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const tileX = firstTileX + column;
        const tileY = firstTileY + row;
        if (tileY < 0 || tileY >= worldTiles) continue;

        visibleTiles.push({
          key: `${zoomLevel}-${tileX}-${tileY}`,
          src: `https://tile.openstreetmap.org/${zoomLevel}/${((tileX % worldTiles) + worldTiles) % worldTiles}/${tileY}.png`,
          left: tileX * TILE_SIZE - leftWorldPixel,
          top: tileY * TILE_SIZE - topWorldPixel,
        });
      }
    }

    return visibleTiles;
  }, [centerPixel.x, centerPixel.y, mapSize.height, mapSize.width, zoomLevel]);

  const markers = useMemo(() => sites.map((site) => {
    const point = project(site, zoomLevel);
    return {
      site,
      left: point.x - centerPixel.x + mapSize.width / 2,
      top: point.y - centerPixel.y + mapSize.height / 2,
    };
  }).filter(({ left, top }) => (
    left > -190 && left < mapSize.width + 190 && top > -40 && top < mapSize.height + 40
  )), [centerPixel.x, centerPixel.y, mapSize.height, mapSize.width, sites, zoomLevel]);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return undefined;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setMapSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  function handlePointerDown(event) {
    if (event.pointerType === "touch" || event.button !== 0 || event.target.closest("button, a")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      centerPixel,
    };
    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setCenter(unproject({
      x: drag.centerPixel.x - (event.clientX - drag.startX),
      y: drag.centerPixel.y - (event.clientY - drag.startY),
    }, zoomLevel));
  }

  function handlePointerUp(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  }

  return (
    <div
      ref={mapRef}
      className={`osm-mine-map${isDragging ? " is-dragging" : ""}`}
      role="region"
      aria-label="OpenStreetMap showing illustrative mine locations in eastern India"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="osm-mine-map-tiles" aria-hidden="true">
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable="false"
            loading="lazy"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      <div className="osm-mine-map-markers" aria-label="Mine site markers">
        {markers.map(({ site, left, top }) => {
          const selected = site.id === selectedSiteId;
          return (
            <button
              type="button"
              key={site.id}
              className={`google-mine-marker osm-mine-marker${selected ? " selected" : ""}`}
              style={{
                left,
                top,
                "--mine-status-color": statusColors[site.status] || "#168a78",
              }}
              aria-label={`${site.name}, ${site.status}${site.production ? `, ${site.production} thousand tonnes this month` : ""}`}
              aria-pressed={selected}
              onClick={() => onSelect(site.id)}
            >
              <span className="mine-map-marker-dot" />
              {showLabels && <span>{site.name}</span>}
            </button>
          );
        })}
      </div>

      <a
        className="osm-mine-map-attribution"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        aria-label="OpenStreetMap copyright and attribution"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}

export default OpenStreetMapMineMap;
