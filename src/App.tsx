import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AppWindow,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  FileKey2,
  LayoutDashboard,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

type Status = "Active" | "Disabled" | "Expired";

type Developer = {
  id: string;
  username: string;
  email: string;
  status: "Active" | "Disabled";
  createdAt: string;
};

type License = {
  id: string;
  key: string;
  developerId: string;
  status: Status;
  expiresAt: string;
};

type Tweak = {
  id: string;
  name: string;
  bundleId: string;
  version: string;
  status: "Active" | "Disabled";
};

type Log = {
  id: string;
  action: string;
  target: string;
  time: string;
};

const seedDevelopers: Developer[] = [
  { id: "dev_01", username: "NguyenA", email: "dev@example.com", status: "Active", createdAt: "2026-08-10" },
  { id: "dev_02", username: "DevB", email: "devb@example.com", status: "Active", createdAt: "2026-08-09" },
  { id: "dev_03", username: "TweakDev", email: "tweak@example.com", status: "Disabled", createdAt: "2026-08-03" },
];

const seedLicenses: License[] = [
  { id: "lic_01", key: "TWK-8H3K-2L9P-X7Q4", developerId: "dev_01", status: "Active", expiresAt: "2026-12-31" },
  { id: "lic_02", key: "TWK-4N8D-9S2A-K5P1", developerId: "dev_02", status: "Active", expiresAt: "2026-10-30" },
  { id: "lic_03", key: "TWK-7X2M-1Q8B-6R4C", developerId: "dev_03", status: "Disabled", expiresAt: "2026-09-01" },
];

const seedTweaks: Tweak[] = [
  { id: "twk_01", name: "Example ESP", bundleId: "com.example.esp", version: "1.0.0", status: "Active" },
  { id: "twk_02", name: "Example Menu", bundleId: "com.example.menu", version: "1.2.0", status: "Active" },
];

const seedLogs: Log[] = [
  { id: "log_01", action: "Created license", target: "TWK-8H3K-2L9P-X7Q4", time: "Today, 00:12" },
  { id: "log_02", action: "Updated developer", target: "NguyenA", time: "Yesterday, 22:41" },
  { id: "log_03", action: "Added tweak", target: "Example Menu", time: "Yesterday, 19:20" },
];

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [page, setPage] = useState("Dashboard");
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [developers, setDevelopers] = useState(() => load("tweak-devs", seedDevelopers));
  const [licenses, setLicenses] = useState(() => load("tweak-licenses", seedLicenses));
  const [tweaks, setTweaks] = useState(() => load("tweak-tweaks", seedTweaks));
  const [logs, setLogs] = useState(() => load("tweak-logs", seedLogs));
  const [modal, setModal] = useState<"developer" | "license" | "tweak" | null>(null);

  useEffect(() => localStorage.setItem("tweak-devs", JSON.stringify(developers)), [developers]);
  useEffect(() => localStorage.setItem("tweak-licenses", JSON.stringify(licenses)), [licenses]);
  useEffect(() => localStorage.setItem("tweak-tweaks", JSON.stringify(tweaks)), [tweaks]);
  useEffect(() => localStorage.setItem("tweak-logs", JSON.stringify(logs)), [logs]);

  const activeDevelopers = developers.filter((x) => x.status === "Active").length;
  const activeLicenses = licenses.filter((x) => x.status === "Active").length;
  const expiredLicenses = licenses.filter((x) => new Date(x.expiresAt) < new Date()).length;

  const filteredDevelopers = useMemo(
    () => developers.filter((d) => `${d.username} ${d.email}`.toLowerCase().includes(search.toLowerCase())),
    [developers, search]
  );

  const addLog = (action: string, target: string) => {
    setLogs((prev) => [{ id: crypto.randomUUID(), action, target, time: "Just now" }, ...prev]);
  };

  const createDeveloper = (username: string, email: string) => {
    const developer = {
      id: `dev_${Math.random().toString(36).slice(2, 8)}`,
      username,
      email,
      status: "Active" as const,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDevelopers((prev) => [developer, ...prev]);
    addLog("Created developer", username);
    setModal(null);
  };

  const createLicense = (developerId: string, expiresAt: string) => {
    const key = `TWK-${crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
    setLicenses((prev) => [
      { id: crypto.randomUUID(), key, developerId, status: "Active", expiresAt },
      ...prev,
    ]);
    addLog("Created license", key);
    setModal(null);
  };

  const createTweak = (name: string, bundleId: string, version: string) => {
    const tweak = { id: crypto.randomUUID(), name, bundleId, version, status: "Active" as const };
    setTweaks((prev) => [tweak, ...prev]);
    addLog("Added tweak", name);
    setModal(null);
  };

  const toggleDeveloper = (id: string) => {
    setDevelopers((prev) => prev.map((d) => d.id === id ? { ...d, status: d.status === "Active" ? "Disabled" : "Active" } : d));
  };

  const deleteLicense = (id: string) => {
    const item = licenses.find((x) => x.id === id);
    setLicenses((prev) => prev.filter((x) => x.id !== id));
    if (item) addLog("Deleted license", item.key);
  };

  const nav = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Developers", icon: Users },
    { label: "Licenses", icon: FileKey2 },
    { label: "Tweaks", icon: Code2 },
    { label: "Logs", icon: Activity },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div className={dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={20} /></div>
          <div>
            <strong>TWK AUTH</strong>
            <span>THEOS MANAGER</span>
          </div>
        </div>

        <div className="nav-title">MENU</div>
        <nav>
          {nav.map(({ label, icon: Icon }) => (
            <button key={label} className={page === label ? "nav-item active" : "nav-item"} onClick={() => setPage(label)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="server-status"><span /> Server online</div>
          <small>V1.0.0 • Local mode</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="crumb">ADMIN / {page.toUpperCase()}</div>
            <h1>{page}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-btn" onClick={() => setDark((v) => !v)} title="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="admin">
              <div className="avatar">A</div>
              <div><strong>Administrator</strong><span>Admin</span></div>
            </div>
          </div>
        </header>

        <section className="content">
          {page === "Dashboard" && (
            <>
              <div className="stats">
                <Stat icon={<Users />} label="Developers" value={developers.length} />
                <Stat icon={<CheckCircle2 />} label="Active Licenses" value={activeLicenses} />
                <Stat icon={<XCircle />} label="Expired" value={expiredLicenses} />
                <Stat icon={<AppWindow />} label="Tweaks" value={tweaks.length} />
              </div>
              <div className="grid-two">
                <Panel title="Recent Developers" action="View all" onAction={() => setPage("Developers")}>
                  <Table headers={["Developer", "Status", "Created"]}>
                    {developers.slice(0, 5).map((d) => (
                      <tr key={d.id}><td><b>{d.username}</b><small>{d.email}</small></td><td><Badge status={d.status} /></td><td>{d.createdAt}</td></tr>
                    ))}
                  </Table>
                </Panel>
                <Panel title="Recent Activity" action="View logs" onAction={() => setPage("Logs")}>
                  <div className="activity-list">
                    {logs.slice(0, 5).map((l) => <div className="activity" key={l.id}><div className="activity-dot" /><div><b>{l.action}</b><span>{l.target}</span></div><time>{l.time}</time></div>)}
                  </div>
                </Panel>
              </div>
            </>
          )}

          {page === "Developers" && (
            <Panel title="Developer Management" action="+ Add Developer" onAction={() => setModal("developer")}>
              <Toolbar search={search} setSearch={setSearch} />
              <Table headers={["Developer", "ID", "Status", "Created", "Actions"]}>
                {filteredDevelopers.map((d) => (
                  <tr key={d.id}>
                    <td><b>{d.username}</b><small>{d.email}</small></td><td className="mono">{d.id}</td><td><Badge status={d.status} /></td><td>{d.createdAt}</td>
                    <td><button className="mini-btn" onClick={() => toggleDeveloper(d.id)}>{d.status === "Active" ? "Disable" : "Enable"}</button></td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {page === "Licenses" && (
            <Panel title="License Management" action="+ Create License" onAction={() => setModal("license")}>
              <Table headers={["License", "Developer", "Status", "Expires", "Actions"]}>
                {licenses.map((l) => {
                  const dev = developers.find((d) => d.id === l.developerId);
                  return <tr key={l.id}><td><span className="key-chip">{l.key}</span><button className="copy" onClick={() => navigator.clipboard?.writeText(l.key)}><Copy size={14}/></button></td><td>{dev?.username ?? "Unknown"}</td><td><Badge status={l.status} /></td><td>{l.expiresAt}</td><td><button className="danger-btn" onClick={() => deleteLicense(l.id)}><Trash2 size={15}/></button></td></tr>
                })}
              </Table>
            </Panel>
          )}

          {page === "Tweaks" && (
            <Panel title="Tweak Management" action="+ Add Tweak" onAction={() => setModal("tweak")}>
              <Table headers={["Tweak", "Bundle ID", "Version", "Status"]}>
                {tweaks.map((t) => <tr key={t.id}><td><b>{t.name}</b></td><td className="mono">{t.bundleId}</td><td>{t.version}</td><td><Badge status={t.status} /></td></tr>)}
              </Table>
            </Panel>
          )}

          {page === "Logs" && (
            <Panel title="Activity Logs">
              <Table headers={["Action", "Target", "Time"]}>
                {logs.map((l) => <tr key={l.id}><td><b>{l.action}</b></td><td className="mono">{l.target}</td><td>{l.time}</td></tr>)}
              </Table>
            </Panel>
          )}

          {page === "Settings" && (
            <Panel title="Settings">
              <div className="settings-card">
                <div><b>Storage</b><span>Browser localStorage — safe for this frontend demo.</span></div>
                <div><b>Theme</b><span>{dark ? "Dark" : "Light"} mode</span></div>
                <div><b>Backend</b><span>Not connected. V2 will connect to the API server.</span></div>
              </div>
            </Panel>
          )}
        </section>
      </main>

      {modal === "developer" && <DeveloperModal onClose={() => setModal(null)} onCreate={createDeveloper} />}
      {modal === "license" && <LicenseModal developers={developers} onClose={() => setModal(null)} onCreate={createLicense} />}
      {modal === "tweak" && <TweakModal onClose={() => setModal(null)} onCreate={createTweak} />}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="stat"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div><ChevronRight className="stat-arrow" size={18}/></div>;
}

function Panel({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return <div className="panel"><div className="panel-head"><div><h2>{title}</h2><span>Manage your resources</span></div>{action && <button className="primary-btn" onClick={onAction}><Plus size={16}/>{action.replace("+ ", "")}</button>}</div>{children}</div>;
}

function Toolbar({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  return <div className="toolbar"><div className="search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search developers..." /></div><button className="filter-btn"><MoreHorizontal size={18}/></button></div>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Badge({ status }: { status: string }) {
  return <span className={`badge ${status.toLowerCase()}`}><span />{status}</span>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><XCircle size={20}/></button></div>{children}</div></div>;
}

function DeveloperModal({ onClose, onCreate }: { onClose: () => void; onCreate: (u: string, e: string) => void }) {
  const [u, setU] = useState(""); const [e, setE] = useState("");
  return <Modal title="Add Developer" onClose={onClose}><label>Username<input value={u} onChange={x => setU(x.target.value)} placeholder="Developer username" /></label><label>Email<input value={e} onChange={x => setE(x.target.value)} placeholder="developer@email.com" /></label><button className="primary-btn full" disabled={!u || !e} onClick={() => onCreate(u, e)}>Create Developer</button></Modal>;
}

function LicenseModal({ developers, onClose, onCreate }: { developers: Developer[]; onClose: () => void; onCreate: (d: string, e: string) => void }) {
  const [d, setD] = useState(developers[0]?.id ?? ""); const [e, setE] = useState("2026-12-31");
  return <Modal title="Create License" onClose={onClose}><label>Developer<select value={d} onChange={x => setD(x.target.value)}>{developers.map(v => <option key={v.id} value={v.id}>{v.username}</option>)}</select></label><label>Expires<input type="date" value={e} onChange={x => setE(x.target.value)} /></label><button className="primary-btn full" onClick={() => onCreate(d, e)}>Generate License</button></Modal>;
}

function TweakModal({ onClose, onCreate }: { onClose: () => void; onCreate: (n: string, b: string, v: string) => void }) {
  const [n, setN] = useState(""); const [b, setB] = useState(""); const [v, setV] = useState("1.0.0");
  return <Modal title="Add Tweak" onClose={onClose}><label>Name<input value={n} onChange={x => setN(x.target.value)} placeholder="My Tweak" /></label><label>Bundle ID<input value={b} onChange={x => setB(x.target.value)} placeholder="com.example.tweak" /></label><label>Version<input value={v} onChange={x => setV(x.target.value)} /></label><button className="primary-btn full" disabled={!n || !b} onClick={() => onCreate(n, b, v)}>Add Tweak</button></Modal>;
}

export default App;
