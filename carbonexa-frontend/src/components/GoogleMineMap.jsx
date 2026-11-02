import { useEffect, useRef, useState } from "react";

let googleMapsScriptPromise;

function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const callbackName = "__carbonexaGoogleMapsApiReady";
    const params = new URLSearchParams({
      key: apiKey,
      loading: "async",
      v: "weekly",
      callback: callbackName,
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google?.maps?.importLibrary) {
        resolve(window.google.maps);
      } else {
        googleMapsScriptPromise = undefined;
        reject(new Error("Google Maps loaded without the Maps JavaScript API."));
      }
    };
    script.onerror = () => {
      delete window[callbackName];
      googleMapsScriptPromise = undefined;
      script.remove();
      reject(new Error("Google Maps could not be loaded."));
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

function GoogleMineMap({
  sites,
  selectedSiteId,
  onSelect,
  zoom,
  showTerrain,
  showLabels,
  statusColors,
  onError,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const mapsRef = useRef(null);
  const markerClassRef = useRef(null);
  const markerRefs = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";

  useEffect(() => {
    let active = true;
    const previousAuthFailure = window.gm_authFailure;
    const handleAuthFailure = () => {
      try {
        previousAuthFailure?.();
      } finally {
        if (active) onError?.(new Error("Google Maps authentication failed."));
      }
    };

    window.gm_authFailure = handleAuthFailure;

    async function initializeMap() {
      try {
        const maps = await loadGoogleMaps(apiKey);
        const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
          maps.importLibrary("maps"),
          maps.importLibrary("marker"),
        ]);

        if (!active || !containerRef.current) return;

        mapsRef.current = maps;
        markerClassRef.current = AdvancedMarkerElement;
        mapRef.current = new Map(containerRef.current, {
          center: { lat: 22.25, lng: 84.85 },
          zoom: 6,
          mapId,
          mapTypeId: showTerrain ? "terrain" : "roadmap",
          clickableIcons: false,
          disableDefaultUI: true,
          gestureHandling: "cooperative",
          keyboardShortcuts: true,
          scaleControl: true,
        });

        setMapReady(true);
      } catch (error) {
        if (active) onError?.(error);
      }
    }

    initializeMap();

    return () => {
      active = false;
      if (window.gm_authFailure === handleAuthFailure) {
        if (previousAuthFailure) window.gm_authFailure = previousAuthFailure;
        else delete window.gm_authFailure;
      }
      markerRefs.current.forEach((marker) => {
        marker.map = null;
      });
      markerRefs.current = [];
      mapRef.current = null;
      mapsRef.current = null;
      markerClassRef.current = null;
    };
  }, [apiKey, mapId, onError]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    map.setOptions({
      mapTypeId: showTerrain ? "terrain" : "roadmap",
      zoom: Math.max(5, Math.min(10, Math.round(6 + (zoom - 1) * 5))),
    });
  }, [mapReady, showTerrain, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps || !mapReady || sites.length === 0) return;

    const bounds = new maps.LatLngBounds();
    sites.forEach((site) => bounds.extend({ lat: site.lat, lng: site.lng }));

    if (sites.length === 1) {
      map.setCenter({ lat: sites[0].lat, lng: sites[0].lng });
      map.setZoom(9);
    } else {
      map.fitBounds(bounds, 42);
    }
  }, [mapReady, sites]);

  useEffect(() => {
    const map = mapRef.current;
    const AdvancedMarkerElement = markerClassRef.current;
    if (!map || !AdvancedMarkerElement || !mapReady) return undefined;

    markerRefs.current.forEach((marker) => {
      marker.map = null;
    });

    markerRefs.current = sites.map((site) => {
      const isSelected = site.id === selectedSiteId;
      const markerContent = document.createElement("button");
      markerContent.type = "button";
      markerContent.className = `google-mine-marker${isSelected ? " selected" : ""}`;
      markerContent.style.setProperty(
        "--mine-status-color",
        statusColors[site.status] || "#168a78"
      );
      markerContent.setAttribute(
        "aria-label",
        `${site.name}, ${site.status}${site.production ? `, ${site.production} thousand tonnes this month` : ""}`
      );
      markerContent.setAttribute("aria-pressed", String(isSelected));

      const dot = document.createElement("span");
      dot.className = "mine-map-marker-dot";
      markerContent.append(dot);

      if (showLabels) {
        const label = document.createElement("span");
        label.textContent = site.name;
        markerContent.append(label);
      }

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: site.lat, lng: site.lng },
        title: `${site.name} · ${site.status}`,
        content: markerContent,
        gmpClickable: true,
        zIndex: isSelected ? 10 : 1,
      });

      marker.addEventListener("gmp-click", () => onSelect(site.id));
      return marker;
    });

    return () => {
      markerRefs.current.forEach((marker) => {
        marker.map = null;
      });
      markerRefs.current = [];
    };
  }, [mapReady, onSelect, selectedSiteId, showLabels, sites, statusColors]);

  return (
    <div
      ref={containerRef}
      className="google-mine-map"
      role="region"
      aria-label="Google map showing illustrative mine locations in eastern India"
    />
  );
}

export default GoogleMineMap;
