import { useEffect, useMemo, useState } from "react";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowRight,
  IconChartLine,
  IconCheck,
  IconClock,
  IconCloudRain,
  IconCpu,
  IconDatabase,
  IconDeviceFloppy,
  IconDownload,
  IconDroplet,
  IconGauge,
  IconInfoCircle,
  IconLeaf2,
  IconLayoutGrid,
  IconMapPin,
  IconMenu2,
  IconRefresh,
  IconDeviceSdCard,
  IconSettings,
  IconTemperature,
  IconWifi,
  IconX,
} from "@tabler/icons-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const navigation = [
  { id: "resumen", label: "Resumen", icon: IconLayoutGrid },
  { id: "historial", label: "Historial", icon: IconChartLine },
  { id: "riego", label: "Riego", icon: IconDroplet },
  { id: "dispositivos", label: "Dispositivos y configuración", icon: IconSettings },
];

const metricIcons = {
  temperature: IconTemperature,
  humidity: IconDroplet,
  rain: IconCloudRain,
  irrigation: IconDroplet,
  update: IconClock,
};

const deviceIcons = {
  cpu: IconCpu,
  wifi: IconWifi,
  database: IconDatabase,
  storage: IconDeviceSdCard,
  gauge: IconGauge,
};

function formatDateTime(value) {
  if (!value) return "Sin dato";
  const date = new Date(value);
  const zonedParts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const part = (type) => zonedParts.find((item) => item.type === type)?.value;
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const datePart = `${part("day")} ${months[Number(part("month")) - 1]} ${part("year")}`;
  const timePart = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} · ${timePart}`;
}

function OriginChip({ tone = "simulated", children }) {
  return <span className={`origin-chip origin-${tone}`}>{children}</span>;
}

function StatusPill({ status }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("seco") || normalized.includes("bajo")
    ? "warning"
    : normalized.includes("exceso") || normalized.includes("desconect")
      ? "danger"
      : "success";
  return <span className={`status-pill status-${tone}`}>{status}</span>;
}

function Sidebar({ activeView, open, onNavigate, onClose }) {
  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Navegación principal">
        <div className="brand">
          <span className="brand-mark"><IconLeaf2 size={30} stroke={1.8} /></span>
          <span>
            <strong>HR AgroRiego</strong>
            <small>Monitoreo experimental<br />del suelo y el riego</small>
          </span>
        </div>

        <nav className="nav-list">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                className={activeView === item.id ? "nav-item active" : "nav-item"}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={23} stroke={1.7} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <IconLeaf2 size={30} stroke={1.7} />
          <span>Cultivos más sustentables<br />con mejor información</span>
        </div>
      </aside>
      {open && <button type="button" className="sidebar-scrim" aria-label="Cerrar menú" onClick={onClose} />}
    </>
  );
}

function Header({ data, onRefresh, refreshing, onMenu }) {
  return (
    <header className="topbar">
      <button type="button" className="mobile-menu" onClick={onMenu} aria-label="Abrir menú">
        <IconMenu2 size={24} />
      </button>
      <div className="location">
        <strong>Control operacional</strong>
        <span><IconMapPin size={17} /> Barrio de Chacras</span>
      </div>
      <div className="topbar-actions">
        <span className="disclosure"><IconInfoCircle size={17} /> Sensores locales simulados · Meteorología externa real</span>
        <button type="button" className="primary-button" onClick={onRefresh} disabled={refreshing}>
          <IconRefresh size={20} className={refreshing ? "spin" : ""} />
          {refreshing ? "Actualizando" : "Actualizar datos"}
        </button>
        <small>Última actualización: {formatDateTime(data?.lastUpdate)}</small>
      </div>
    </header>
  );
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">TABLERO / {eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function MetricCard({ metric }) {
  const Icon = metricIcons[metric.icon] || IconActivity;
  return (
    <article className={`metric-card metric-card-${metric.icon}`}>
      <div className={`metric-icon metric-${metric.tone}`}><Icon size={29} stroke={1.7} /></div>
      <div>
        <span className="metric-label">{metric.label}</span>
        <strong className="metric-value">{metric.value}</strong>
        {metric.subvalue && <small>{metric.subvalue}</small>}
        <OriginChip tone={metric.originTone}>{metric.origin}</OriginChip>
      </div>
    </article>
  );
}

function SectorCard({ sector }) {
  const percentage = Math.max(0, Math.min(100, sector.moisture));
  return (
    <article className={`sector-card ${sector.status === "Seco" ? "sector-warning" : ""}`}>
      <div className="sector-topline">
        <span>{sector.number}</span>
        <StatusPill status={sector.status} />
      </div>
      <h3>{sector.crop}</h3>
      <div className="sector-reading">
        <strong>{sector.moisture}<span>%</span></strong>
        <span>Rango<br /><b>{sector.min} – {sector.max} %</b></span>
      </div>
      <span className="reading-label">Humedad de suelo</span>
      <div className="progress-track" aria-label={`Humedad ${sector.moisture}%`}>
        <span className={sector.status === "Seco" ? "progress-warning" : "progress-ok"} style={{ width: `${percentage}%` }} />
        <i style={{ left: `${sector.min}%` }} />
      </div>
      <OriginChip tone="simulated"><IconLeaf2 size={15} /> Simulado</OriginChip>
      <p>{sector.status === "Seco" ? "Por debajo del rango objetivo." : "Nivel adecuado para el cultivo."}</p>
    </article>
  );
}

function DeviceStrip({ devices }) {
  return (
    <section className="panel devices-panel">
      <div className="panel-heading">
        <div>
          <h2>Estado de dispositivos</h2>
          <p>1 unidad central y 4 sensores de suelo.</p>
        </div>
      </div>
      <div className="device-strip">
        {devices.slice(0, 5).map((device) => {
          const Icon = deviceIcons[device.icon] || IconWifi;
          return (
            <div className="device-compact" key={device.id}>
              <Icon size={29} stroke={1.6} />
              <span className="online-line"><i /> {device.status}</span>
              <strong>{device.name}</strong>
              <small>{device.location}</small>
              <OriginChip tone="simulated">Simulado</OriginChip>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActivityPanel({ activities, onHistory }) {
  const icons = [IconCloudRain, IconDroplet, IconGauge, IconSettings];
  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <div><h2>Actividad reciente</h2></div>
        <button type="button" className="text-button" onClick={onHistory}>Ver historial <IconArrowRight size={18} /></button>
      </div>
      <div className="activity-list">
        {activities.map((activity, index) => {
          const Icon = icons[index] || IconActivity;
          return (
            <div className="activity-item" key={activity.id}>
              <Icon size={22} stroke={1.7} />
              <span><strong>{activity.title}</strong><small>{activity.detail}</small></span>
              <time>{activity.time}</time>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SummaryView({ data, onNavigate }) {
  const drySector = data.sectors.find((sector) => sector.status === "Seco");
  const weatherAvailable = data.weather.quality === "valido";
  const metrics = [
    { label: "Temperatura ambiente", value: `${data.environment.temperature.toFixed(1).replace(".", ",")} °C`, origin: "Simulado", originTone: "simulated", icon: "temperature", tone: "green" },
    { label: "Humedad ambiente", value: `${data.environment.humidity} %`, origin: "Simulado", originTone: "simulated", icon: "humidity", tone: "blue" },
    { label: "Precipitación hoy", value: weatherAvailable ? `${data.weather.dailyMm.toFixed(1).replace(".", ",")} mm` : "Sin dato", origin: weatherAvailable ? "Externo · real" : "Externo · faltante", originTone: weatherAvailable ? "external" : "missing", icon: "rain", tone: "blue" },
    { label: "Riego (hoy)", value: data.irrigation.active ? "Activo" : "Inactivo", subvalue: `${data.irrigation.dailyLiters.toFixed(1).replace(".", ",")} L aplicados`, origin: "Manual", originTone: "manual", icon: "irrigation", tone: "green" },
    { label: "Última actualización", value: formatDateTime(data.lastUpdate), origin: "Calculado", originTone: "calculated", icon: "update", tone: "blue" },
  ];

  return (
    <>
      <PageHeading eyebrow="RESUMEN" title="Resumen" description="Estado general del suelo, el riego y los dispositivos." />
      <section className="metrics-grid" aria-label="Indicadores principales">
        {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>

      <section className="sector-section">
        <div className="section-heading">
          <div><h2>Estado por sector</h2><p>Humedad de suelo actual, rango objetivo y estado del cultivo.</p></div>
        </div>
        <div className="sector-grid">
          {data.sectors.map((sector) => <SectorCard sector={sector} key={sector.id} />)}
        </div>
      </section>

      {drySector && (
        <section className="alert-banner" role="alert">
          <IconAlertTriangle size={34} stroke={1.8} />
          <span><strong>Atención requerida</strong><small>Sector {drySector.number} ({drySector.crop}) con humedad por debajo del rango objetivo ({drySector.moisture} % &lt; {drySector.min} %).</small></span>
          <button type="button" className="text-button" onClick={() => onNavigate("historial")}>Ver detalles <IconArrowRight size={18} /></button>
        </section>
      )}

      <div className="summary-bottom-grid">
        <DeviceStrip devices={data.devices} />
        <ActivityPanel activities={data.activities} onHistory={() => onNavigate("historial")} />
      </div>
    </>
  );
}

function HistoryView({ data }) {
  const [sector, setSector] = useState("s2");
  const [period, setPeriod] = useState("24h");
  const selected = data.sectors.find((item) => item.id === sector) || data.sectors[1];

  const exportCsv = () => {
    const rows = ["hora,humedad_suelo_pct,precipitacion_mm,origen_dato"];
    data.history.forEach((point) => rows.push(`${point.time},${point[sector]},${point.rain},simulado`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hr-agroriego-${sector}-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeading eyebrow="HISTORIAL" title="Historial" description="Evolución temporal de las mediciones y eventos de riego." />
      <section className="panel history-panel">
        <div className="history-toolbar">
          <div>
            <label htmlFor="sector-filter">Sector</label>
            <select id="sector-filter" value={sector} onChange={(event) => setSector(event.target.value)}>
              {data.sectors.map((item) => <option key={item.id} value={item.id}>Sector {item.number} · {item.crop}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="period-filter">Período</label>
            <select id="period-filter" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
          </div>
          <button type="button" className="secondary-button" onClick={exportCsv}><IconDownload size={18} /> Exportar CSV</button>
        </div>
        <div className="chart-heading">
          <div><h2>Humedad y lluvia</h2><p>{selected.crop} · valores simulados de humedad</p></div>
          <OriginChip tone="simulated">Humedad simulada</OriginChip>
        </div>
        <div className="chart-area" aria-label="Gráfico de humedad y lluvia">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history} margin={{ top: 12, right: 14, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#28443c" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="time" stroke="#8ca49d" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 80]} stroke="#8ca49d" tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={{ background: "#13251f", border: "1px solid #315148", borderRadius: 10 }} />
              <Legend />
              <ReferenceLine y={selected.min} stroke="#eeb740" strokeDasharray="6 5" label={{ value: `Mínimo ${selected.min}%`, fill: "#eeb740", position: "insideTopRight" }} />
              <Line type="monotone" dataKey={sector} name="Humedad de suelo" stroke="#3ee492" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              <Line type="step" dataKey="rain" name="Lluvia (mm)" stroke="#58baf2" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="history-note"><IconInfoCircle size={18} /> La lluvia se mostrará cuando el extractor externo entregue un dato válido. Los valores de humedad son simulados.</div>
      </section>
    </>
  );
}

function IrrigationView({ data, onAddRecord }) {
  const [form, setForm] = useState({ sectorId: "s1", start: "2026-09-20T16:30", duration: 10, flow: 0.8, volume: 8, notes: "" });
  const [saved, setSaved] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    onAddRecord(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <>
      <PageHeading eyebrow="RIEGO" title="Riego" description="Registro y análisis de intervenciones sin activación automática." />
      <div className="irrigation-layout">
        <form className="panel irrigation-form" onSubmit={submit}>
          <div className="panel-heading"><div><h2>Registrar riego manual</h2><p>El registro no activa bombas ni electroválvulas.</p></div></div>
          <label>Sector
            <select value={form.sectorId} onChange={(event) => setForm({ ...form, sectorId: event.target.value })}>
              {data.sectors.map((item) => <option key={item.id} value={item.id}>Sector {item.number} · {item.crop}</option>)}
            </select>
          </label>
          <div className="form-row">
            <label>Fecha y hora<input type="datetime-local" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} /></label>
            <label>Duración (min)<input type="number" min="1" value={form.duration} onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })} /></label>
          </div>
          <div className="form-row">
            <label>Caudal medio (L/min)<input type="number" min="0" step="0.1" value={form.flow} onChange={(event) => setForm({ ...form, flow: Number(event.target.value) })} /></label>
            <label>Volumen total (L)<input type="number" min="0" step="0.1" value={form.volume} onChange={(event) => setForm({ ...form, volume: Number(event.target.value) })} /></label>
          </div>
          <label>Observaciones<textarea rows="4" placeholder="Ej.: riego con manguera" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
          <div className="form-info"><IconInfoCircle size={18} /> Sector identificado manualmente · un sector regado por vez.</div>
          <button type="submit" className="primary-button wide"><IconDeviceFloppy size={19} /> Guardar registro</button>
          {saved && <div className="success-message"><IconCheck size={18} /> Registro guardado localmente.</div>}
        </form>

        <section className="panel records-panel">
          <div className="panel-heading"><div><h2>Últimos riegos</h2><p>Eventos manuales y detectados por caudalímetro.</p></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Sector</th><th>Inicio</th><th>Duración</th><th>Caudal</th><th>Volumen</th><th>Origen</th></tr></thead>
              <tbody>
                {data.irrigationRecords.map((record) => {
                  const item = data.sectors.find((sector) => sector.id === record.sectorId);
                  return <tr key={record.id}><td><strong>Sector {item?.number}</strong><small>{item?.crop}</small></td><td>{record.startLabel}</td><td>{record.duration} min</td><td>{record.flow.toFixed(1).replace(".", ",")} L/min</td><td>{record.volume.toFixed(1).replace(".", ",")} L</td><td><OriginChip tone={record.type === "Manual" ? "manual" : "calculated"}>{record.type}</OriginChip></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function DevicesView({ data }) {
  const [saved, setSaved] = useState(false);
  const [interval, setIntervalValue] = useState(15);
  return (
    <>
      <PageHeading eyebrow="DISPOSITIVOS" title="Dispositivos y configuración" description="Estado de la arquitectura provisional, sensores y parámetros locales." />
      <section className="panel device-table-panel">
        <div className="panel-heading"><div><h2>Nodo central y sensores</h2><p>Arquitectura provisional con un ESP32 central.</p></div><StatusPill status="Operativo" /></div>
        <div className="device-table">
          {data.devices.map((device) => {
            const Icon = deviceIcons[device.icon] || IconWifi;
            return <div className="device-row" key={device.id}><Icon size={25} /><span><strong>{device.name}</strong><small>{device.location}</small></span><span>{device.variable}</span><span className="online-line"><i /> {device.status}</span><span>{device.lastContact}</span><span>{device.signal}</span><OriginChip tone="simulated">Simulado</OriginChip></div>;
          })}
        </div>
      </section>
      <div className="config-grid">
        <section className="panel config-card">
          <h2>Medición y conectividad</h2>
          <label>Frecuencia de humedad (min)<input type="number" value={interval} min="10" max="60" onChange={(event) => setIntervalValue(event.target.value)} /></label>
          <label>Estado demorado desde (min)<input type="number" defaultValue="30" /></label>
          <label>Desconectado desde (min)<input type="number" defaultValue="60" /></label>
        </section>
        <section className="panel config-card">
          <h2>Calibración y respaldo</h2>
          <p><IconGauge size={19} /> Valores seca/húmeda configurados por sensor.</p>
          <p><IconDeviceSdCard size={19} /> Respaldo microSD: preparado.</p>
          <p><IconDatabase size={19} /> Almacenamiento remoto: pendiente de selección.</p>
          <p><IconCloudRain size={19} /> Fuente: Estación meteorológica cercana.</p>
        </section>
      </div>
      <button type="button" className="primary-button save-config" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2400); }}><IconDeviceFloppy size={19} /> Guardar configuración local</button>
      {saved && <div className="toast"><IconCheck size={18} /> Configuración guardada.</div>}
    </>
  );
}

export function App() {
  const [data, setData] = useState(null);
  const [activeView, setActiveView] = useState(() => window.location.hash.replace("#", "") || "resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/dashboard.json`).then((response) => response.json()),
      fetch(`${import.meta.env.BASE_URL}data/weather.json`).then((response) => response.json()),
    ]).then(([dashboard, weather]) => setData({ ...dashboard, weather }));
  }, []);

  useEffect(() => {
    const onHash = () => setActiveView(window.location.hash.replace("#", "") || "resumen");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (view) => {
    window.location.hash = view;
    setActiveView(view);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const refresh = () => {
    if (!data) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setData((current) => ({
        ...current,
        lastUpdate: new Date().toISOString(),
        sectors: current.sectors.map((sector) => ({ ...sector, moisture: Math.max(0, Math.min(100, sector.moisture + (Math.random() > 0.5 ? 1 : -1))) })),
      }));
      setRefreshing(false);
      setToast("Lecturas locales simuladas actualizadas.");
      window.setTimeout(() => setToast(""), 2600);
    }, 700);
  };

  const addRecord = (form) => {
    setData((current) => ({
      ...current,
      irrigationRecords: [{ id: `r-${Date.now()}`, sectorId: form.sectorId, startLabel: new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(form.start)), duration: form.duration, flow: form.flow, volume: form.volume, type: "Manual" }, ...current.irrigationRecords],
    }));
  };

  const content = useMemo(() => {
    if (!data) return null;
    if (activeView === "historial") return <HistoryView data={data} />;
    if (activeView === "riego") return <IrrigationView data={data} onAddRecord={addRecord} />;
    if (activeView === "dispositivos") return <DevicesView data={data} />;
    return <SummaryView data={data} onNavigate={navigate} />;
  }, [activeView, data]);

  if (!data) return <div className="loading"><IconLeaf2 size={42} /><span>Cargando HR AgroRiego…</span></div>;

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} open={sidebarOpen} onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header data={data} onRefresh={refresh} refreshing={refreshing} onMenu={() => setSidebarOpen(true)} />
        <main className="content">{content}</main>
        <footer><span>HR AgroRiego</span><span>Monitoreo experimental del suelo y el riego</span><span>Barrio de Chacras</span></footer>
      </div>
      {toast && <div className="toast"><IconCheck size={18} /> {toast}<button type="button" onClick={() => setToast("")} aria-label="Cerrar"><IconX size={17} /></button></div>}
    </div>
  );
}
