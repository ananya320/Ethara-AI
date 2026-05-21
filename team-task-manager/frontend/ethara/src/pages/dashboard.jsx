import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState({ total:0, todo:0, inProgress:0, done:0, overdue:0 });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          API.get("/tasks/stats"),
          API.get("/tasks"),
          API.get("/projects")
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data.slice(0, 5));
        setProjects(projectsRes.data.slice(0, 4));
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const logout = () => { localStorage.clear(); navigate("/login"); };

  const statusColor = { "todo":"#f59e0b", "in-progress":"#6c63ff", "done":"#10b981" };
  const priorityColor = { "low":"#10b981", "medium":"#f59e0b", "high":"#ef4444" };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>🚀 TaskFlow</div>
        <nav style={styles.nav}>
          <div style={{...styles.navItem, ...styles.navActive}}>📊 Dashboard</div>
          <div style={styles.navItem} onClick={() => navigate("/projects")}>📁 Projects</div>
          <div style={styles.navItem} onClick={() => navigate("/tasks")}>✅ Tasks</div>
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>{user.role}</div>
            </div>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Dashboard</h1>
            <p style={styles.subheading}>Welcome back, {user.name}! 👋</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {[
            { label:"Total Tasks", value:stats.total, icon:"📋", color:"#6c63ff" },
            { label:"To Do", value:stats.todo, icon:"📌", color:"#f59e0b" },
            { label:"In Progress", value:stats.inProgress, icon:"⚡", color:"#3b82f6" },
            { label:"Completed", value:stats.done, icon:"✅", color:"#10b981" },
            { label:"Overdue", value:stats.overdue, icon:"🚨", color:"#ef4444" },
          ].map((s, i) => (
            <div key={i} style={{...styles.statCard, borderTop:`4px solid ${s.color}`}}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={{...styles.statValue, color:s.color}}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.grid2}>
          {/* Recent Tasks */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Recent Tasks</h3>
              <button onClick={() => navigate("/tasks")} style={styles.viewAll}>View All →</button>
            </div>
            {tasks.length === 0 ? <p style={styles.empty}>No tasks yet</p> :
              tasks.map(t => (
                <div key={t._id} style={styles.taskRow}>
                  <div style={styles.taskInfo}>
                    <div style={styles.taskTitle}>{t.title}</div>
                    <div style={styles.taskMeta}>{t.project?.name} • {t.assignedTo?.name || "Unassigned"}</div>
                  </div>
                  <div style={{...styles.badge, background: statusColor[t.status] + "20", color: statusColor[t.status]}}>
                    {t.status}
                  </div>
                </div>
              ))
            }
          </div>

          {/* Projects */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Projects</h3>
              <button onClick={() => navigate("/projects")} style={styles.viewAll}>View All →</button>
            </div>
            {projects.length === 0 ? <p style={styles.empty}>No projects yet</p> :
              projects.map(p => (
                <div key={p._id} style={styles.projectRow}>
                  <div style={styles.projectIcon}>📁</div>
                  <div>
                    <div style={styles.taskTitle}>{p.name}</div>
                    <div style={styles.taskMeta}>{p.members?.length || 0} members</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display:"flex", minHeight:"100vh", background:"#f0f2f5" },
  loading: { display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", fontSize:"20px" },
  sidebar: { width:"250px", background:"linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", display:"flex", flexDirection:"column", padding:"24px 0", position:"fixed", height:"100vh" },
  sidebarLogo: { color:"white", fontSize:"22px", fontWeight:"700", padding:"0 24px 32px" },
  nav: { flex:1, padding:"0 12px" },
  navItem: { color:"#94a3b8", padding:"12px 16px", borderRadius:"8px", cursor:"pointer", fontSize:"15px", marginBottom:"4px", transition:"all 0.2s" },
  navActive: { background:"rgba(108,99,255,0.2)", color:"#6c63ff", fontWeight:"600" },
  sidebarBottom: { padding:"0 16px", borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:"16px" },
  userInfo: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" },
  avatar: { width:"36px", height:"36px", borderRadius:"50%", background:"#6c63ff", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700" },
  userName: { color:"white", fontSize:"14px", fontWeight:"600" },
  userRole: { color:"#94a3b8", fontSize:"12px" },
  logoutBtn: { width:"100%", padding:"10px", background:"rgba(239,68,68,0.15)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"8px", cursor:"pointer", fontSize:"14px", fontWeight:"600" },
  main: { marginLeft:"250px", flex:1, padding:"32px" },
  header: { marginBottom:"32px" },
  heading: { fontSize:"28px", fontWeight:"700", color:"#1a1a2e" },
  subheading: { color:"#64748b", fontSize:"15px", marginTop:"4px" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"16px", marginBottom:"32px" },
  statCard: { background:"white", borderRadius:"12px", padding:"20px", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  statIcon: { fontSize:"28px", marginBottom:"8px" },
  statValue: { fontSize:"32px", fontWeight:"700" },
  statLabel: { color:"#64748b", fontSize:"13px", marginTop:"4px" },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" },
  card: { background:"white", borderRadius:"12px", padding:"24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" },
  cardTitle: { fontSize:"16px", fontWeight:"700", color:"#1a1a2e" },
  viewAll: { background:"none", border:"none", color:"#6c63ff", cursor:"pointer", fontSize:"14px", fontWeight:"600" },
  taskRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f1f5f9" },
  taskInfo: {},
  taskTitle: { fontSize:"14px", fontWeight:"600", color:"#1a1a2e" },
  taskMeta: { fontSize:"12px", color:"#94a3b8", marginTop:"2px" },
  badge: { padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"600" },
  projectRow: { display:"flex", alignItems:"center", gap:"12px", padding:"12px 0", borderBottom:"1px solid #f1f5f9" },
  projectIcon: { fontSize:"24px" },
  empty: { color:"#94a3b8", textAlign:"center", padding:"20px" },
};

export default Dashboard;