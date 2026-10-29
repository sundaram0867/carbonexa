
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Mountain,
  Activity,
  FileText,
  RefreshCw,
  Layers,
  Download,
  TrendingUp,
  Leaf,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Factory,
} from "lucide-react";
import "./Dashboard.css";
import projectImage from "../assets/header-bg.png";
import sunriseMineImage from "../assets/bg.png";

const dashboardSlides = [
  {
    image: projectImage,
    eyebrow: "MINING OPERATIONS OVERVIEW",
    title: "Mining Intelligence Dashboard",
    description: "Monitor mining production, environmental performance, and reports.",
    action: "Explore project data",
    path: "/analysis",
    badge: "Current project",
    position: "center 54%",
  },
  {
    image: sunriseMineImage,
    eyebrow: "SUSTAINABLE OPERATIONS",
    title: "Track production. Protect the environment.",
    description: "Review illustrative production and environmental trends across your projects.",
    action: "View environmental trends",
    path: "/analysis",
    badge: "Environmental trends",
    position: "center 60%",
  },
];

const productionData = [
  { month: "Jan", actual: 4.2, target: 4.5 },
  { month: "Feb", actual: 5.1, target: 4.8 },
  { month: "Mar", actual: 6.3, target: 6.0 },
  { month: "Apr", actual: 6.8, target: 6.7 },
  { month: "May", actual: 7.1, target: 7.0 },
  { month: "Jun", actual: 8.1, target: 7.5 },
  { month: "Jul", actual: 7.6, target: 7.8 },
  { month: "Aug", actual: 8.4, target: 8.0 },
  { month: "Sep", actual: 8.0, target: 8.2 },
  { month: "Oct", actual: 8.8, target: 8.5 },
  { month: "Nov", actual: 9.1, target: 8.8 },
  { month: "Dec", actual: 9.4, target: 9.0 },
];

const environmentalData = [
  { month: "Jan", air: 72, water: 80 },
  { month: "Feb", air: 75, water: 78 },
  { month: "Mar", air: 69, water: 83 },
  { month: "Apr", air: 78, water: 85 },
  { month: "May", air: 82, water: 81 },
  { month: "Jun", air: 86, water: 88 },
  { month: "Jul", air: 84, water: 86 },
  { month: "Aug", air: 88, water: 90 },
  { month: "Sep", air: 85, water: 89 },
  { month: "Oct", air: 90, water: 91 },
  { month: "Nov", air: 92, water: 90 },
  { month: "Dec", air: 94, water: 93 },
];

const activityData = [
  { name: "Coal Mining", value: 40, color: "#146c6c" },
  { name: "Environment", value: 25, color: "#168a78" },
  { name: "Geology", value: 20, color: "#4f9d98" },
  { name: "Safety", value: 15, color: "#8bbdb3" },
];

const reportData = [
  { month: "Jan", geological: 28, mining: 22, environment: 12, safety: 8 },
  { month: "Feb", geological: 32, mining: 26, environment: 14, safety: 9 },
  { month: "Mar", geological: 35, mining: 28, environment: 18, safety: 11 },
  { month: "Apr", geological: 40, mining: 30, environment: 20, safety: 12 },
  { month: "May", geological: 38, mining: 27, environment: 16, safety: 10 },
  { month: "Jun", geological: 42, mining: 31, environment: 19, safety: 14 },
  { month: "Jul", geological: 39, mining: 29, environment: 21, safety: 13 },
  { month: "Aug", geological: 44, mining: 33, environment: 23, safety: 15 },
  { month: "Sep", geological: 41, mining: 32, environment: 20, safety: 14 },
  { month: "Oct", geological: 46, mining: 35, environment: 24, safety: 17 },
  { month: "Nov", geological: 48, mining: 37, environment: 25, safety: 18 },
  { month: "Dec", geological: 51, mining: 39, environment: 27, safety: 20 },
];

const recentReports = [
  {
    id: 1,
    name: "Geological Survey Report",
    project: "Jharia Block",
    type: "Geological",
    date: "Jun 28, 2026",
    status: "Approved",
  },
  {
    id: 2,
    name: "Monthly Production Report",
    project: "Bokaro Project",
    type: "Mining",
    date: "Jun 27, 2026",
    status: "In Review",
  },
  {
    id: 3,
    name: "Environmental Impact Assessment",
    project: "North Karanpura",
    type: "Environmental",
    date: "Jun 26, 2026",
    status: "Approved",
  },
  {
    id: 4,
    name: "Safety Compliance Report",
    project: "Talcher Coalfield",
    type: "Safety",
    date: "Jun 25, 2026",
    status: "Draft",
  },
  {
    id: 5,
    name: "Hydrogeological Analysis",
    project: "Ib Valley",
    type: "Geological",
    date: "Jun 24, 2026",
    status: "In Review",
  },
];

const mineSites = [
  { id: "jharia", name: "Jharia Block", region: "Jharkhand", status: "Operating", production: 148, x: 55, y: 38 },
  { id: "bokaro", name: "Bokaro Project", region: "Jharkhand", status: "Operating", production: 126, x: 68, y: 30 },
  { id: "north-karanpura", name: "North Karanpura", region: "Jharkhand", status: "Monitoring", production: 92, x: 43, y: 52 },
  { id: "talcher", name: "Talcher Coalfield", region: "Odisha", status: "Operating", production: 174, x: 70, y: 68 },
  { id: "ib-valley", name: "Ib Valley", region: "Odisha", status: "Maintenance", production: 0, x: 84, y: 53 },
  { id: "mand-raigarh", name: "Mand-Raigarh", region: "Chhattisgarh", status: "Monitoring", production: 78, x: 31, y: 69 },
];

const mineStatusColors = {
  Operating: "#168a78",
  Monitoring: "#e5a331",
  Maintenance: "#d16d58",
};

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #dce4ed",
  borderRadius: "8px",
  color: "#243247",
  fontSize: "12px",
};

function Dashboard() {
  const [period, setPeriod] = useState("6");
  const [showTarget, setShowTarget] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [mineStatusFilter, setMineStatusFilter] = useState("All sites");
  const [selectedMineId, setSelectedMineId] = useState(mineSites[0].id);
  const [mapZoom, setMapZoom] = useState(1);
  const [showTerrain, setShowTerrain] = useState(true);
  const [showMineLabels, setShowMineLabels] = useState(true);
  const slide = dashboardSlides[activeSlide];
  const filteredMineSites = mineSites.filter(
    (mine) => mineStatusFilter === "All sites" || mine.status === mineStatusFilter
  );
  const selectedMine =
    filteredMineSites.find((mine) => mine.id === selectedMineId) || filteredMineSites[0];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const slideTimer = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % dashboardSlides.length);
    }, 7000);
    return () => window.clearInterval(slideTimer);
  }, []);

  const visibleProduction = useMemo(
    () => productionData.slice(-Number(period)),
    [period]
  );

  const visibleEnvironment = useMemo(
    () => environmentalData.slice(-Number(period)),
    [period]
  );

  const visibleReports = useMemo(
    () => reportData.slice(-Number(period)),
    [period]
  );

  const resetDashboard = () => {
    setPeriod("6");
    setShowTarget(true);
    setShowWater(true);
    setSelectedActivity(null);
    setSelectedReport(null);
    setMineStatusFilter("All sites");
    setSelectedMineId(mineSites[0].id);
    setMapZoom(1);
    setShowTerrain(true);
    setShowMineLabels(true);
  };

  const changeMineStatusFilter = (status) => {
    setMineStatusFilter(status);
    const firstMatchingMine = mineSites.find(
      (mine) => status === "All sites" || mine.status === status
    );
    if (firstMatchingMine) setSelectedMineId(firstMatchingMine.id);
  };

  const exportReports = () => {
    const headers = ["Report", "Project", "Type", "Updated On", "Status"];
    const rows = recentReports.map((report) => [
      report.name,
      report.project,
      report.type,
      report.date,
      report.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const file = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "carbonexa-recent-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="carbon-dashboard">
      <header
        className="dashboard-heading"
        aria-label="Dashboard highlights"
        aria-roledescription="carousel"
      >
        <div className="dashboard-project-visual" aria-hidden="true">
          <img src={slide.image} alt="" style={{ objectPosition: slide.position }} />
        </div>
        <button
          type="button"
          className="dashboard-carousel-arrow previous"
          aria-label="Show previous dashboard highlight"
          onClick={() => setActiveSlide((currentSlide) => (currentSlide - 1 + dashboardSlides.length) % dashboardSlides.length)}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="dashboard-title-block" key={activeSlide} role="group" aria-roledescription="slide" aria-label={`${activeSlide + 1} of ${dashboardSlides.length}`}>
          <span className="dashboard-eyebrow">
            <Mountain size={14} /> {slide.eyebrow}
          </span>
          <h1>{slide.title}</h1>
          <p className="dashboard-description">{slide.description}</p>
          <Link className="dashboard-slide-link" to={slide.path}>{slide.action}<ChevronRight size={16} /></Link>
        </div>
        <div className="dashboard-heading-actions">
          <span className="dashboard-prototype-badge">
            <span /> {slide.badge}
          </span>
          <button className="chart-toggle dashboard-reset-button" onClick={resetDashboard}>
            <RefreshCw size={14} /> Reset
          </button>
          <button className="chart-toggle dashboard-export-button" onClick={exportReports}>
            <Download size={14} /> Export Reports
          </button>
        </div>
        <button
          type="button"
          className="dashboard-carousel-arrow next"
          aria-label="Show next dashboard highlight"
          onClick={() => setActiveSlide((currentSlide) => (currentSlide + 1) % dashboardSlides.length)}
        >
          <ChevronRight size={20} />
        </button>
        <div className="dashboard-carousel-dots" role="group" aria-label="Choose dashboard highlight">
          {dashboardSlides.map((dashboardSlide, index) => (
            <button
              key={dashboardSlide.eyebrow}
              type="button"
              aria-label={`Show highlight ${index + 1}: ${dashboardSlide.eyebrow.toLowerCase()}`}
              aria-pressed={activeSlide === index}
              className={activeSlide === index ? "active" : ""}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </header>

      <section className="dashboard-kpis">
        <article className="dashboard-kpi kpi-projects">
          <span className="kpi-icon kpi-blue">
            <Layers size={21} />
          </span>
          <span className="kpi-label">Active Projects</span>
          <strong>24</strong>
          <small>Mining projects tracked</small>
        </article>

        <article className="dashboard-kpi kpi-production">
          <span className="kpi-icon kpi-green">
            <Activity size={21} />
          </span>
          <span className="kpi-label">June Production</span>
          <strong>5,700 <em>tonnes</em></strong>
          <small>Illustrative target: 6,200 tonnes</small>
          <span
            className="kpi-progress"
            role="progressbar"
            aria-label="June production against illustrative target"
            aria-valuenow="92"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span />
          </span>
        </article>

        <article className="dashboard-kpi kpi-reports">
          <span className="kpi-icon kpi-purple">
            <FileText size={21} />
          </span>
          <span className="kpi-label">Reports Generated</span>
          <strong>186</strong>
          <small>Across project categories</small>
        </article>

      </section>

      <section className="dashboard-panel dashboard-map-panel" aria-labelledby="mine-map-title">
        <div className="panel-heading dashboard-map-heading">
          <div>
            <h2 id="mine-map-title">
              <MapPinned size={17} /> Mine operations map
            </h2>
            <p>Illustrative site layout · sample locations and operating status</p>
          </div>
          <label className="mine-map-filter">
            <span>Show</span>
            <select
              aria-label="Filter mine sites by operating status"
              value={mineStatusFilter}
              onChange={(event) => changeMineStatusFilter(event.target.value)}
            >
              <option>All sites</option>
              <option>Operating</option>
              <option>Monitoring</option>
              <option>Maintenance</option>
            </select>
          </label>
        </div>

        <div className="dashboard-map-layout">
          <div className={`mine-map-viewport ${showTerrain ? "" : "terrain-hidden"}`}>
            <div
              className="mine-map-scene"
              style={{ transform: `scale(${mapZoom})` }}
              aria-label="Schematic map showing sample mine locations in eastern India"
            >
              <svg className="mine-map-art" viewBox="0 0 800 440" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <pattern id="mine-map-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                    <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#91aaa0" strokeOpacity=".2" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="mine-map-wash" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dcebe1" />
                    <stop offset="100%" stopColor="#c6ddd1" />
                  </linearGradient>
                </defs>
                <rect width="800" height="440" fill="url(#mine-map-wash)" />
                <rect width="800" height="440" fill="url(#mine-map-grid)" />
                <g className="mine-map-contours" fill="none" stroke="#729b88" strokeOpacity=".3" strokeWidth="1.3">
                  <path d="M-30 98 C96 20 154 175 277 105 S456 32 550 105 706 182 835 84" />
                  <path d="M-28 122 C90 48 164 201 285 132 S452 64 545 132 719 207 832 109" />
                  <path d="M-20 312 C90 233 184 362 291 296 S455 229 560 303 704 369 827 270" />
                  <path d="M-20 338 C99 257 185 389 304 322 S460 252 563 328 709 397 830 296" />
                  <path d="M115 -25 C166 50 89 111 150 182 S220 306 162 464" />
                  <path d="M134 -26 C188 53 110 116 171 187 S242 311 182 463" />
                  <path d="M615 -22 C556 49 645 122 581 196 S540 324 615 462" />
                </g>
                <g fill="none" stroke="#faf7e9" strokeWidth="8" strokeLinecap="round" opacity=".8">
                  <path d="M55 386 C160 328 223 280 333 250 S514 199 748 54" />
                  <path d="M122 28 C216 106 292 147 405 206 S597 303 751 400" />
                </g>
                <g fill="none" stroke="#cda96c" strokeWidth="2" strokeDasharray="5 7" opacity=".8">
                  <path d="M55 386 C160 328 223 280 333 250 S514 199 748 54" />
                  <path d="M122 28 C216 106 292 147 405 206 S597 303 751 400" />
                </g>
                <path d="M-15 225 C113 186 205 247 322 214 S520 180 620 224 735 250 821 214" fill="none" stroke="#74aeca" strokeWidth="4" strokeLinecap="round" opacity=".68" />
                <g className="mine-map-regions" fill="#4a6b60" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="700" letterSpacing="2">
                  <text x="96" y="115">JHARKHAND</text>
                  <text x="583" y="351">ODISHA</text>
                  <text x="168" y="378">CHHATTISGARH</text>
                </g>
                <g className="mine-map-compass" fill="#4b6a5e">
                  <path d="M750 28 L758 48 L750 44 L742 48 Z" />
                  <text x="747" y="21" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="700">N</text>
                </g>
              </svg>
              <div className="mine-map-markers" aria-label="Mine site markers">
                {filteredMineSites.map((mine) => (
                  <button
                    type="button"
                    key={mine.id}
                    className={`mine-map-marker ${selectedMine?.id === mine.id ? "selected" : ""}`}
                    style={{ left: `${mine.x}%`, top: `${mine.y}%`, "--mine-status-color": mineStatusColors[mine.status] }}
                    aria-label={`${mine.name}, ${mine.status}${mine.production ? `, ${mine.production} thousand tonnes this month` : ""}`}
                    aria-pressed={selectedMine?.id === mine.id}
                    onClick={() => setSelectedMineId(mine.id)}
                  >
                    <span className="mine-map-marker-dot" />
                    {showMineLabels && <span className="mine-map-marker-label">{mine.name}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="mine-map-controls" aria-label="Map controls">
              <button
                type="button"
                aria-label="Zoom in"
                title="Zoom in"
                disabled={mapZoom >= 1.5}
                onClick={() => setMapZoom((zoom) => Math.min(1.5, Number((zoom + 0.1).toFixed(1))))}
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                aria-label="Zoom out"
                title="Zoom out"
                disabled={mapZoom <= 0.8}
                onClick={() => setMapZoom((zoom) => Math.max(0.8, Number((zoom - 0.1).toFixed(1))))}
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                aria-label="Reset map zoom"
                title="Reset map zoom"
                onClick={() => setMapZoom(1)}
              >
                <RotateCcw size={15} />
              </button>
              <span className="mine-map-control-divider" />
              <button
                type="button"
                className={showTerrain ? "active" : ""}
                aria-label={`${showTerrain ? "Hide" : "Show"} terrain layer`}
                aria-pressed={showTerrain}
                title="Toggle terrain layer"
                onClick={() => setShowTerrain((visible) => !visible)}
              >
                <Factory size={15} />
              </button>
              <button
                type="button"
                className={showMineLabels ? "active" : ""}
                aria-label={`${showMineLabels ? "Hide" : "Show"} mine labels`}
                aria-pressed={showMineLabels}
                title="Toggle mine labels"
                onClick={() => setShowMineLabels((visible) => !visible)}
              >
                <MapPinned size={15} />
              </button>
            </div>
            <span className="mine-map-scale">Schematic view · not to scale</span>
          </div>

          <aside className="mine-map-details" aria-live="polite">
            <div className="mine-map-site-count">
              <span>PROJECT SITES</span>
              <strong>{filteredMineSites.length}<small> / {mineSites.length}</small></strong>
            </div>
            {selectedMine ? (
              <div className="mine-map-selected-site">
                <span className="mine-site-status" style={{ "--mine-status-color": mineStatusColors[selectedMine.status] }}>
                  <span /> {selectedMine.status}
                </span>
                <h3>{selectedMine.name}</h3>
                <p>{selectedMine.region} · Sample project location</p>
                <div className="mine-site-production">
                  <span>Monthly output</span>
                  <strong>{selectedMine.production ? `${selectedMine.production} kt` : "Paused"}</strong>
                </div>
                <div className="mine-map-links">
                  <Link to="/analysis">View analysis <ChevronRight size={14} /></Link>
                  <Link to="/reports">Reports <ChevronRight size={14} /></Link>
                </div>
              </div>
            ) : (
              <p className="mine-map-empty">No sites match this filter.</p>
            )}
            <div className="mine-map-legend" aria-label="Map status legend">
              {Object.entries(mineStatusColors).map(([status, color]) => (
                <button
                  type="button"
                  key={status}
                  className={mineStatusFilter === status ? "active" : ""}
                  aria-pressed={mineStatusFilter === status}
                  onClick={() => changeMineStatusFilter(mineStatusFilter === status ? "All sites" : status)}
                >
                  <span style={{ background: color }} /> {status}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="dashboard-chart-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <TrendingUp size={16} /> Monthly Production
              </h2>
              <p>Actual output compared with target · million tonnes</p>
            </div>

            <select
              aria-label="Production chart time range"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>

          <button
            className="chart-toggle"
            onClick={() => setShowTarget((current) => !current)}
          >
            {showTarget ? "Hide target line" : "Show target line"}
          </button>

          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleProduction}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke="#e7edf4" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Production"
                  stroke="#146c6c"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
                {showTarget && (
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target Production"
                    stroke="#8bbdb3"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <Leaf size={16} /> Environmental Trends
              </h2>
              <p>Illustrative environmental monitoring indices</p>
            </div>
          </div>

          <button
            className="chart-toggle"
            onClick={() => setShowWater((current) => !current)}
          >
            {showWater ? "Hide water series" : "Show water series"}
          </button>

          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleEnvironment}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke="#e7edf4" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${value}/100`, name]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="air"
                  name="Air Quality Index"
                  stroke="#146c6c"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                {showWater && (
                  <Line
                    type="monotone"
                    dataKey="water"
                    name="Water Quality Index"
                    stroke="#8bbdb3"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-chart-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <Mountain size={16} /> Activity Distribution
              </h2>
              <p>Click a chart segment or category to highlight it.</p>
            </div>
          </div>

          <div className="dashboard-pie-layout">
            <div className="dashboard-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="48%"
                    outerRadius="78%"
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                    isAnimationActive
                    onClick={(entry) =>
                      setSelectedActivity((current) =>
                        current === entry.name ? null : entry.name
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {activityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        opacity={
                          !selectedActivity || selectedActivity === entry.name
                            ? 1
                            : 0.3
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}%`, "Distribution"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-legend">
              {activityData.map((activity) => (
                <button
                  key={activity.name}
                  className={`dashboard-legend-row ${
                    selectedActivity === activity.name ? "chosen" : ""
                  }`}
                  onClick={() =>
                    setSelectedActivity((current) =>
                      current === activity.name ? null : activity.name
                    )
                  }
                >
                  <span
                    className="legend-dot"
                    style={{ background: activity.color }}
                  />
                  <span>{activity.name}</span>
                  <strong>{activity.value}%</strong>
                </button>
              ))}

              <p className="selected-category">
                {selectedActivity
                  ? `Selected: ${selectedActivity}`
                  : "Select a category to highlight it"}
              </p>
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <FileText size={16} /> Monthly Report Activity
              </h2>
              <p>Reports generated by category</p>
            </div>

            <select
              aria-label="Report chart time range"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>

          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={visibleReports}
                margin={{ top: 10, right: 4, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="#e7edf4" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar
                  dataKey="geological"
                  name="Geological"
                  fill="#146c6c"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="mining"
                  name="Mining"
                  fill="#168a78"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="environment"
                  name="Environment"
                  fill="#4f9d98"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="safety"
                  name="Safety"
                  fill="#8bbdb3"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-panel dashboard-reports">
        <div className="panel-heading">
          <div>
            <h2>
              <CalendarDays size={16} /> Recent Reports
            </h2>
            <p>Select a report row to view its summary.</p>
          </div>
          <button className="chart-toggle" onClick={exportReports}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Report Name</th>
                <th>Project / Site</th>
                <th>Type</th>
                <th>Updated On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr
                  key={report.id}
                  className={selectedReport === report.id ? "report-selected" : ""}
                  onClick={() =>
                    setSelectedReport((current) =>
                      current === report.id ? null : report.id
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{report.id}</td>
                  <td>{report.name}</td>
                  <td>{report.project}</td>
                  <td>{report.type}</td>
                  <td>{report.date}</td>
                  <td>
                    <span
                      className={`report-status ${
                        report.status === "Approved"
                          ? "status-done"
                          : "status-review"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedReport && (
          <div className="dashboard-demo-note">
            <strong>
              {recentReports.find((report) => report.id === selectedReport)?.name}
            </strong>
            <p>
              Project:{" "}
              {recentReports.find((report) => report.id === selectedReport)?.project}
              {" · "}
              Status:{" "}
              {recentReports.find((report) => report.id === selectedReport)?.status}
            </p>
            <p>
              This is sample report metadata. Detailed report content will be
              available after document storage and backend integration.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
