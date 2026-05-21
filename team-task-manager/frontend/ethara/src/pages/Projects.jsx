import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Projects() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", description:"", members:[] });
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/projects/users/all");
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/projects", form);
      setForm({ name:"", description:"", members:[] });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) { alert("Delete failed"); }
  };

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter(m => m !== id)
        : [...prev.members, id]
    }));
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>🚀 TaskFlow</div>
        <nav style={styles.nav}>
          <div style={styles.navItem} onClick={() => navigate("/dashboard")}>📊 Dashboard</div>
          <div style={{...styles.navItem, ...styles.navActive}}>📁 Projects</div>
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
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Projects</h1>
            <p style={styles.subheading}>{projects.length} total projects</p>
          </div>
          {user.role === "Admin" && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              + New Project
            </button>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Project</h3>
            <form onSubmit={handleCreate} style={styles.form}>
              <input placeholder="Project Name *" value={form.name}
                onChange={e => setForm({...form, name:e.target.value})} style={styles.input} required />
              <textarea placeholder="Description" value={form.description}
                onChange={e => setForm({...form, description:e.target.value})}
                style={{...styles.input, height:"80px", resize:"none"}} />
              <div>
                <p style={styles.label}>Assign Members:</p>
                <div style={styles.memberGrid}>
                  {users.map(u => (
                    <div key={u._id}
                      onClick={() => toggleMember(u._id)}
                      style={{...styles.memberChip, ...(form.members.includes(u._id) ? styles.memberSelected : {})}}>
                      {u.name} ({u.role})
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Create Project</button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? <p>Loading...</p> : (
          <div style={styles.projectsGrid}>
            {projects.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📁</div>
                <p>No projects yet. {user.role === "Admin" ? "Create one!" : "Ask your admin."}</p>
              </div>
            ) : projects.map(p => (
              <div key={p._id} style={styles.projectCard}>
                <div style={styles.projectCardHeader}>
                  <div style={styles.projectIcon}>📁</div>
                  {user.role === "Admin" && (
                    <button onClick={() => handleDelete(p._id)} style={styles.deleteBtn}>🗑️</button>
                  )}
                </div>
                <h3 style={styles.projectName}>{p.name}</h3>
                <p style={styles.projectDesc}>{p.description || "No description"}</p>
                <div style={styles.projectFooter}>
                  <span style={styles.memberCount}>👥 {p.members?.length || 0} members</span>
                  <button onClick={() => navigate(`/tasks?project=${p._id}`)} style={styles.viewTasksBtn}>
                    View Tasks →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display:"flex", minHeight:"100vh", background:"#f0f2f5" },
  sidebar: { width:"250px", background:"linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", display:"flex", flexDirection:"column", padding:"24px 0", position:"fixed", height:"100vh" },
  sidebarLogo: { color:"white", fontSize:"22px", fontWeight:"700", padding:"0 24px 32px" },
  nav: { flex:1, padding:"0 12px" },
  navItem: { color:"#94a3b8", padding:"12px 16px", borderRadius:"8px", cursor:"pointer", fontSize:"15px", marginBottom:"4px" },
  navActive: { background:"rgba(108,99,255,0.2)", color:"#6c63ff", fontWeight:"600" },
  sidebarBottom: { padding:"0 16px", borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:"16px" },
  userInfo: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" },
  avatar: { width:"36px", height:"36px", borderRadius:"50%", background:"#6c63ff", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700" },
  userName: { color:"white", fontSize:"14px", fontWeight:"600" },
  userRole: { color:"#94a3b8", fontSize:"12px" },
  logoutBtn: { width:"100%", padding:"10px", background:"rgba(239,68,68,0.15)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"8px", cursor:"pointer", fontSize:"14px", fontWeight:"600" },
  main: { marginLeft:"250px", flex:1, padding:"32px" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"32px" },
  heading: { fontSize:"28px", fontWeight:"700", color:"#1a1a2e" },
  subheading: { color:"#64748b", fontSize:"15px", marginTop:"4px" },
  addBtn: { padding:"12px 24px", background:"linear-gradient(135deg, #667eea, #764ba2)", color:"white", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"15px", fontWeight:"600" },
  formCard: { background:"white", borderRadius:"12px", padding:"24px", marginBottom:"24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  formTitle: { marginBottom:"16px", color:"#1a1a2e" },
  form: { display:"flex", flexDirection:"column", gap:"12px" },
  input: { padding:"12px 16px", borderRadius:"8px", border:"1px solid #e0e0e0", fontSize:"14px", outline:"none", width:"100%" },
  label: { fontSize:"14px", fontWeight:"600", color:"#1a1a2e", marginBottom:"8px" },
  memberGrid: { display:"flex", flexWrap:"wrap", gap:"8px" },
  memberChip: { padding:"6px 14px", borderRadius:"20px", border:"1px solid #e0e0e0", cursor:"pointer", fontSize:"13px", background:"#f8fafc" },
  memberSelected: { background:"#6c63ff", color:"white", border:"1px solid #6c63ff" },
  formActions: { display:"flex", gap:"12px", justifyContent:"flex-end" },
  cancelBtn: { padding:"10px 20px", background:"#f1f5f9", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"14px" },
  submitBtn: { padding:"10px 20px", background:"linear-gradient(135deg, #667eea, #764ba2)", color:"white", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"14px", fontWeight:"600" },
  projectsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"20px" },
  projectCard: { background:"white", borderRadius:"12px", padding:"24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  projectCardHeader: { display:"flex", justifyContent:"space-between", marginBottom:"12px" },
  projectIcon: { fontSize:"32px" },
  deleteBtn: { background:"none", border:"none", cursor:"pointer", fontSize:"18px", opacity:0.6 },
  projectName: { fontSize:"18px", fontWeight:"700", color:"#1a1a2e", marginBottom:"8px" },
  projectDesc: { color:"#64748b", fontSize:"14px", marginBottom:"16px" },
  projectFooter: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  memberCount: { fontSize:"13px", color:"#94a3b8" },
  viewTasksBtn: { background:"none", border:"1px solid #6c63ff", color:"#6c63ff", padding:"6px 14px", borderRadius:"6px", cursor:"pointer", fontSize:"13px", fontWeight:"600" },
  emptyState: { gridColumn:"1/-1", textAlign:"center", padding:"60px", color:"#94a3b8" },
  emptyIcon: { fontSize:"48px", marginBottom:"16px" },
};

export default Projects;