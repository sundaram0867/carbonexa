
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  BriefcaseBusiness,
  Wallet,
} from "lucide-react";
import "./Dashboard.css";
import projectImage from "../assets/header-bg.png";
import sunriseMineImage from "../assets/bg.png";
import GoogleMineMap from "../components/GoogleMineMap.jsx";
import OpenStreetMapMineMap from "../components/OpenStreetMapMineMap.jsx";

const dashboardSlides = [
  {
    image: projectImage,
    eyebrow: "MINING OPERATIONS OVERVIEW",
    title: "Mining Intelligence Dashboard",
    description: "Monitor mining production, environmental performance, and reports.",
    action: "Explore project data",
    path: "/analysis",
    badge: "Portfolio sample",
    position: "center 54%",
  },
  {
    image: sunriseMineImage,
    eyebrow: "SUSTAINABLE OPERATIONS",
    title: "Track production. Protect the environment.",
    description: "Review illustrative production and environmental trends across sample mine sites.",
    action: "View environmental trends",
    path: "/analysis",
    badge: "Environmental demo",
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
  { id: "jharia", name: "Jharia Block", region: "Jharkhand", status: "Operating", production: 148, x: 55, y: 38, lat: 23.75, lng: 86.42 },
  { id: "bokaro", name: "Bokaro Project", region: "Jharkhand", status: "Operating", production: 126, x: 68, y: 30, lat: 23.67, lng: 86.15 },
  { id: "north-karanpura", name: "North Karanpura", region: "Jharkhand", status: "Monitoring", production: 92, x: 43, y: 52, lat: 23.80, lng: 84.90 },
  { id: "talcher", name: "Talcher Coalfield", region: "Odisha", status: "Operating", production: 174, x: 70, y: 68, lat: 20.95, lng: 85.23 },
  { id: "ib-valley", name: "Ib Valley", region: "Odisha", status: "Maintenance", production: 0, x: 84, y: 53, lat: 21.72, lng: 83.88 },
  { id: "mand-raigarh", name: "Mand-Raigarh", region: "Chhattisgarh", status: "Monitoring", production: 78, x: 31, y: 69, lat: 22.22, lng: 83.40 },
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

function Dashboard({ activeProject, projects = [] }) {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("6");
  const [showTarget, setShowTarget] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedProductionMonth, setSelectedProductionMonth] = useState(null);
  const [selectedEnvironmentMonth, setSelectedEnvironmentMonth] = useState(null);
  const [selectedReportMonth, setSelectedReportMonth] = useState(null);
  const [visibleReportSeries, setVisibleReportSeries] = useState({
    geological: true,
    mining: true,
    environment: true,
    safety: true,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [mineStatusFilter, setMineStatusFilter] = useState("All sites");
  const [selectedMineId, setSelectedMineId] = useState(mineSites[0].id);
  const [mapZoom, setMapZoom] = useState(1);
  const [showTerrain, setShowTerrain] = useState(true);
  const [showMineLabels, setShowMineLabels] = useState(true);
  const [googleMapsUnavailable, setGoogleMapsUnavailable] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || "";
  const googleMapsRequested = import.meta.env.VITE_MAP_PROVIDER?.trim().toLowerCase() === "google";
  const showGoogleMap = googleMapsRequested && Boolean(googleMapsApiKey) && !googleMapsUnavailable;
  const slide = dashboardSlides[activeSlide];
  const filteredMineSites = useMemo(
    () => mineSites.filter(
      (mine) => mineStatusFilter === "All sites" || mine.status === mineStatusFilter
    ),
    [mineStatusFilter]
  );
  const selectedMine =
    filteredMineSites.find((mine) => mine.id === selectedMineId) || filteredMineSites[0];
  const liveProjects = projects.filter((project) => !project.archived);
  const activeProjectCount = liveProjects.filter((project) => ['Operating', 'Monitoring', 'Maintenance', 'On Hold'].includes(project.status)).length;
  const developmentProjectCount = liveProjects.filter((project) => ['Planning', 'Under Development'].includes(project.status)).length;
  const completedProjectCount = liveProjects.filter((project) => ['Completed', 'Closed'].includes(project.status)).length;
  const delayedProjectCount = liveProjects.filter((project) => project.status === 'Delayed').length;
  const combinedProductionTarget = liveProjects.reduce((total, project) => total + (Number(project.productionTarget) || 0), 0);
  const combinedProjectCost = liveProjects.reduce((total, project) => total + (Number(project.estimatedCost) || 0), 0);

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

  const selectedProduction = visibleProduction.find(
    (item) => item.month === selectedProductionMonth
  );
  const selectedEnvironment = visibleEnvironment.find(
    (item) => item.month === selectedEnvironmentMonth
  );
  const selectedReportActivity = visibleReports.find(
    (item) => item.month === selectedReportMonth
  );

  const resetDashboard = () => {
    setPeriod("6");
    setShowTarget(true);
    setShowWater(true);
    setSelectedActivity(null);
    setSelectedProductionMonth(null);
    setSelectedEnvironmentMonth(null);
    setSelectedReportMonth(null);
    setVisibleReportSeries({
      geological: true,
      mining: true,
      environment: true,
      safety: true,
    });
    setSelectedReport(null);
    setMineStatusFilter("All sites");
    setSelectedMineId(mineSites[0].id);
    setMapZoom(1);
    setShowTerrain(true);
    setShowMineLabels(true);
  };

  const selectReportRow = (reportId) => {
    setSelectedReport((current) => current === reportId ? null : reportId);
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
    link.download = "carbonexa-sample-reports.csv";
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
          <button type="button" className="chart-toggle dashboard-reset-button" onClick={resetDashboard}>
            <RefreshCw size={14} /> Reset
          </button>
          <button type="button" className="chart-toggle dashboard-export-button" onClick={exportReports}>
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

      <section className="dashboard-context" aria-labelledby="dashboard-context-title">
        <div className="dashboard-context-project">
          <span className="dashboard-context-icon"><BriefcaseBusiness size={19} /></span>
          <div className="dashboard-context-details">
            <span className="dashboard-context-eyebrow">ACTIVE WORKSPACE PROJECT</span>
            <h2 id="dashboard-context-title">{activeProject?.name || "No project selected"}</h2>
            <p>
              {activeProject
                ? [activeProject.site, activeProject.region, activeProject.commodity].filter(Boolean).join(" · ") || "Add site and commodity details in Projects"
                : "Create a project profile to identify the project you are working on."}
            </p>
          </div>
          {activeProject && <span className="dashboard-context-status">{activeProject.status}</span>}
          <Link className="dashboard-context-link" to="/projects">
            {activeProject ? "Manage project" : "Create project"} <ChevronRight size={15} />
          </Link>
        </div>
        <p className="dashboard-data-disclaimer" role="note">
          <strong>Important:</strong> The project totals below use saved, non-archived project profiles. The charts, report list, and map are illustrative sample data—not live readings and not linked to a project profile.
        </p>
      </section>

      <section className="dashboard-kpis" aria-label="Key performance indicators">
        <button
          type="button"
          className="dashboard-kpi kpi-projects"
          aria-label="Open project directory"
          onClick={() => navigate("/projects")}
        >
          <span className="kpi-icon kpi-blue">
            <Layers size={21} />
          </span>
          <span className="kpi-label">Projects in portfolio</span>
          <strong>{liveProjects.length}</strong>
          <small>{activeProjectCount} active · {developmentProjectCount} in development · {completedProjectCount} completed · {delayedProjectCount} delayed</small>
          <span className="kpi-action-hint">Manage projects <ChevronRight size={13} /></span>
        </button>

        <button
          type="button"
          className="dashboard-kpi kpi-production"
          aria-label="Open project directory to review production targets"
          onClick={() => navigate("/projects")}
        >
          <span className="kpi-icon kpi-green">
            <Activity size={21} />
          </span>
          <span className="kpi-label">Combined annual production target</span>
          <strong>{combinedProductionTarget ? new Intl.NumberFormat().format(combinedProductionTarget) : "—"} <em>MT</em></strong>
          <small>Across {liveProjects.length} non-archived project profiles · target, not actual output</small>
          <span className="kpi-action-hint">Review project targets <ChevronRight size={13} /></span>
        </button>

        <button
          type="button"
          className="dashboard-kpi kpi-reports"
          aria-label="Open project directory to review estimated costs"
          onClick={() => navigate("/projects")}
        >
          <span className="kpi-icon kpi-purple">
            <Wallet size={21} />
          </span>
          <span className="kpi-label">Estimated project cost</span>
          <strong>{combinedProjectCost ? new Intl.NumberFormat().format(combinedProjectCost) : "—"} <em>₹ crore</em></strong>
          <small>Combined estimate · not actual expenditure</small>
          <span className="kpi-action-hint">Review project estimates <ChevronRight size={13} /></span>
        </button>

      </section>

      <section id="dashboard-mine-map" className="dashboard-panel dashboard-map-panel" aria-labelledby="mine-map-title">
        <div className="panel-heading dashboard-map-heading">
          <div>
            <h2 id="mine-map-title">
              <MapPinned size={17} /> Mine operations map
            </h2>
            <p>Illustrative mine locations and operating status · sample coordinates</p>
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
          <div className={`mine-map-viewport ${showGoogleMap && !showTerrain ? "terrain-hidden" : ""}`}>
            {showGoogleMap ? (
              <GoogleMineMap
                sites={filteredMineSites}
                selectedSiteId={selectedMine?.id}
                onSelect={setSelectedMineId}
                zoom={mapZoom}
                showTerrain={showTerrain}
                showLabels={showMineLabels}
                statusColors={mineStatusColors}
                onError={setGoogleMapsUnavailable}
              />
            ) : (
              <OpenStreetMapMineMap
                key={mineStatusFilter}
                sites={filteredMineSites}
                selectedSiteId={selectedMine?.id}
                onSelect={setSelectedMineId}
                zoom={mapZoom}
                showLabels={showMineLabels}
                statusColors={mineStatusColors}
              />
            )}
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
              {showGoogleMap && (
                <>
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
                </>
              )}
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
            <span className="mine-map-scale">
              {showGoogleMap
                ? "Google Maps · sample site coordinates"
                : "OpenStreetMap · sample site coordinates"}
            </span>
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
        <article id="dashboard-production-chart" className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <TrendingUp size={16} /> Monthly Production
              </h2>
              <p>Click a month to inspect actual output and target · million tonnes</p>
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
            type="button"
            className="chart-toggle"
            aria-pressed={showTarget}
            onClick={() => setShowTarget((current) => !current)}
          >
            {showTarget ? "Hide target line" : "Show target line"}
          </button>

          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleProduction}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                onClick={(chartState) => {
                  if (chartState?.activeLabel) {
                    setSelectedProductionMonth((current) => (
                      current === chartState.activeLabel ? null : chartState.activeLabel
                    ));
                  }
                }}
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
                  activeDot={{ r: 7, cursor: "pointer" }}
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
                    activeDot={{ r: 6, cursor: "pointer" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {selectedProduction && (
            <p className="dashboard-chart-selection" role="status">
              <strong>{selectedProduction.month} production:</strong> {selectedProduction.actual} Mt actual
              {showTarget && ` · ${selectedProduction.target} Mt target`}
              <button type="button" onClick={() => setSelectedProductionMonth(null)}>Clear</button>
            </p>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <Leaf size={16} /> Environmental Trends
              </h2>
              <p>Click a month to inspect environmental indices</p>
            </div>
          </div>

          <button
            type="button"
            className="chart-toggle"
            aria-pressed={showWater}
            onClick={() => setShowWater((current) => !current)}
          >
            {showWater ? "Hide water series" : "Show water series"}
          </button>

          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleEnvironment}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                onClick={(chartState) => {
                  if (chartState?.activeLabel) {
                    setSelectedEnvironmentMonth((current) => (
                      current === chartState.activeLabel ? null : chartState.activeLabel
                    ));
                  }
                }}
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
                  activeDot={{ r: 6, cursor: "pointer" }}
                />
                {showWater && (
                  <Line
                    type="monotone"
                    dataKey="water"
                    name="Water Quality Index"
                    stroke="#8bbdb3"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6, cursor: "pointer" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {selectedEnvironment && (
            <p className="dashboard-chart-selection" role="status">
              <strong>{selectedEnvironment.month} indices:</strong> Air {selectedEnvironment.air}/100
              {showWater && ` · Water ${selectedEnvironment.water}/100`}
              <button type="button" onClick={() => setSelectedEnvironmentMonth(null)}>Clear</button>
            </p>
          )}
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
                  type="button"
                  aria-pressed={selectedActivity === activity.name}
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
              <p>Click a month for totals; toggle categories below</p>
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
                onClick={(chartState) => {
                  if (chartState?.activeLabel) {
                    setSelectedReportMonth((current) => (
                      current === chartState.activeLabel ? null : chartState.activeLabel
                    ));
                  }
                }}
              >
                <CartesianGrid stroke="#e7edf4" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                {visibleReportSeries.geological && (
                  <Bar dataKey="geological" name="Geological" fill="#146c6c" radius={[3, 3, 0, 0]} />
                )}
                {visibleReportSeries.mining && (
                  <Bar dataKey="mining" name="Mining" fill="#168a78" radius={[3, 3, 0, 0]} />
                )}
                {visibleReportSeries.environment && (
                  <Bar dataKey="environment" name="Environment" fill="#4f9d98" radius={[3, 3, 0, 0]} />
                )}
                {visibleReportSeries.safety && (
                  <Bar dataKey="safety" name="Safety" fill="#8bbdb3" radius={[3, 3, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-series-controls" role="group" aria-label="Toggle report chart categories">
            {[
              ["geological", "Geological", "#146c6c"],
              ["mining", "Mining", "#168a78"],
              ["environment", "Environment", "#4f9d98"],
              ["safety", "Safety", "#8bbdb3"],
            ].map(([series, label, color]) => (
              <button
                key={series}
                type="button"
                aria-pressed={visibleReportSeries[series]}
                className={visibleReportSeries[series] ? "active" : ""}
                onClick={() => setVisibleReportSeries((current) => ({
                  ...current,
                  [series]: !current[series],
                }))}
              >
                <span style={{ backgroundColor: color }} />
                {label}
              </button>
            ))}
          </div>
          {selectedReportActivity && (
            <div className="dashboard-chart-selection" role="status">
              <strong>{selectedReportActivity.month} report activity:</strong>
              <span>
                {Object.entries({
                  geological: "Geological",
                  mining: "Mining",
                  environment: "Environment",
                  safety: "Safety",
                })
                  .filter(([series]) => visibleReportSeries[series])
                  .map(([series, label]) => `${label} ${selectedReportActivity[series]}`)
                  .join(" · ") || "No categories selected"}
              </span>
              <button type="button" onClick={() => setSelectedReportMonth(null)}>Clear</button>
            </div>
          )}
        </article>
      </section>

      <section id="dashboard-recent-reports" className="dashboard-panel dashboard-reports">
        <div className="panel-heading">
          <div>
            <h2>
              <CalendarDays size={16} /> Recent Reports
            </h2>
            <p>Select a report row to view its summary.</p>
          </div>
          <button type="button" className="chart-toggle" onClick={exportReports}>
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
                  tabIndex={0}
                  role="button"
                  aria-label={`${report.name}, ${report.project}, ${report.status}. Activate to view summary.`}
                  aria-pressed={selectedReport === report.id}
                  onClick={() => selectReportRow(report.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectReportRow(report.id);
                    }
                  }}
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
