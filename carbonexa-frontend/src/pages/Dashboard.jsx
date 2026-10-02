
import { useMemo, useState } from "react";
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
  BrainCircuit,
  RefreshCw,
  Layers,
  Download,
  TrendingUp,
  Leaf,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import "./Dashboard.css";

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
  { name: "Coal Mining", value: 40, color: "#1976d2" },
  { name: "Environment", value: 25, color: "#16a36a" },
  { name: "Geology", value: 20, color: "#f0a526" },
  { name: "Safety", value: 15, color: "#8056d9" },
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
      <header className="dashboard-heading">
        <div>
          <p> CMPDI / CIL ANALYTICS </p>
          <h1>Mining Intelligence Dashboard</h1>
          <p>
            Monitor mining production, environmental performance, and reports.
          </p>
        </div>

        <div className="dashboard-heading-actions">
          <button className="chart-toggle" onClick={resetDashboard}>
            <RefreshCw size={14} /> Reset
          </button>

          <button className="chart-toggle" onClick={exportReports}>
            <Download size={14} /> Export Reports
          </button>
        </div>
      </header>

      <section className="dashboard-kpis">
        <article className="dashboard-kpi">
          <span className="kpi-icon kpi-blue">
            <Layers size={21} />
          </span>
          <span>Active Projects</span>
          <strong>24</strong>
          <small>Mining projects tracked</small>
        </article>

        <article className="dashboard-kpi">
          <span className="kpi-icon kpi-green">
            <Activity size={21} />
          </span>
          <span>June Production</span>
          <strong>5,700 <em>tonnes</em></strong>
          <small>Illustrative target: 6,200 tonnes</small>
        </article>

        <article className="dashboard-kpi">
          <span className="kpi-icon kpi-purple">
            <FileText size={21} />
          </span>
          <span>Reports Generated</span>
          <strong>186</strong>
          <small>Across project categories</small>
        </article>

        <article className="dashboard-kpi">
          <span className="kpi-icon kpi-gold">
            <BrainCircuit size={21} />
          </span>
          <span>AI Insights</span>
          <strong>12</strong>
          <small>Illustrative insights available</small>
        </article>
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
                  stroke="#1976d2"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
                {showTarget && (
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target Production"
                    stroke="#16a36a"
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
                  stroke="#8056d9"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                {showWater && (
                  <Line
                    type="monotone"
                    dataKey="water"
                    name="Water Quality Index"
                    stroke="#159caa"
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
                  fill="#1976d2"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="mining"
                  name="Mining"
                  fill="#16a36a"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="environment"
                  name="Environment"
                  fill="#f0a526"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="safety"
                  name="Safety"
                  fill="#8056d9"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-chart-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <BrainCircuit size={16} /> AI Insights
              </h2>
              <p>Sample observations for the dashboard prototype</p>
            </div>
            <span className="demo-label">DEMO</span>
          </div>

          <div className="dashboard-insight">
            <span className="insight-dot insight-green" />
            <div>
              <strong>Production trend</strong>
              <p>
                Review monthly output against the production target to identify
                potential operational gaps.
              </p>
            </div>
          </div>

          <div className="dashboard-insight">
            <span className="insight-dot insight-gold" />
            <div>
              <strong>Environmental monitoring</strong>
              <p>
                Review air and water monitoring records against applicable
                compliance limits.
              </p>
            </div>
          </div>

          <div className="dashboard-insight">
            <span className="insight-dot" style={{ background: "#8056d9" }} />
            <div>
              <strong>Report review</strong>
              <p>
                Follow up on reports marked In Review or Draft before final
                submission.
              </p>
            </div>
          </div>

          <p className="dashboard-demo-note">
            These are example observations, not live AI-generated findings.
            Connect the backend and verified monitoring data for operational use.
          </p>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <ShieldCheck size={16} /> System Health
              </h2>
              <p>Prototype service status</p>
            </div>
          </div>

          {[
            ["Document Processing", "Demo"],
            ["AI Analysis Engine", "Demo"],
            ["Database", "Demo"],
            ["API Services", "Demo"],
          ].map(([service, status]) => (
            <div className="dashboard-insight" key={service}>
              <span className="insight-dot insight-green" />
              <div>
                <strong>{service}</strong>
                <p>{status} status — connect the service to verify availability.</p>
              </div>
            </div>
          ))}
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
