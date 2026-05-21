import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import API from "../api"

function Tasks() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectFilter = searchParams.get("project")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: projectFilter || "",
    assignedTo: "",
    dueDate: "",
    priority: "medium"
  })

  const fetchTasks = async () => {
    try {
      const url = projectFilter ? `/tasks?projectId=${projectFilter}` : "/tasks"
      const res = await API.get(url)
      setTasks(res.data)
    } catch (err) {
      console.error("Fetch tasks error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    API.get("/projects").then(r => setProjects(r.data)).catch(console.error)
    API.get("/projects/users/all").then(r => setUsers(r.data)).catch(console.error)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.project) {
      alert("Please fill Title and select a Project!")
      return
    }
    try {
      await API.post("/tasks", {
        title: form.title,
        description: form.description,
        project: form.project,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
        priority: form.priority
      })
      setShowForm(false)
      setForm({
        title: "",
        description: "",
        project: projectFilter || "",
        assignedTo: "",
        dueDate: "",
        priority: "medium"
      })
      fetchTasks()
    } catch (err) {
      console.error("Create task error:", err)
      alert(err.response?.data?.message || "Failed to create task")
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/tasks/${id}/status`, { status })
      fetchTasks()
    } catch (err) {
      console.error("Update status error:", err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return
    try {
      await API.delete(`/tasks/${id}`)
      fetchTasks()
    } catch (err) {
      alert("Delete failed")
    }
  }

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter)
  const statusColor = { "todo": "#f59e0b", "in-progress": "#6c63ff", "done": "#10b981" }
  const priorityColor = { "low": "#10b981", "medium": "#f59e0b", "high": "#ef4444" }
  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

  return (
    <div style={styles.wrapper}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>🚀 TaskFlow</div>
        <nav style={styles.nav}>
          <div style={styles.navItem} onClick={() => navigate("/dashboard")}>📊 Dashboard</div>
          <div style={styles.navItem} onClick={() => navigate("/projects")}>📁 Projects</div>
          <div style={{ ...styles.navItem, ...styles.navActive }}>✅ Tasks</div>
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>{user.role}</div>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate("/login") }} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Tasks</h1>
            <p style={styles.subheading}>{filtered.length} tasks found</p>
          </div>
          {user.role === "Admin" && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              {showForm ? "✕ Cancel" : "+ New Task"}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {["all", "todo", "in-progress", "done"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}
            >
              {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>➕ Create New Task</h3>
            <form onSubmit={handleCreate} style={styles.form}>

              <div style={styles.formRow}>
                <input
                  placeholder="Task Title *"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={styles.input}
                  required
                />
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  style={styles.input}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>

              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...styles.input, height: "70px", resize: "none" }}
              />

              <div style={styles.formRow}>
                <select
                  value={form.project}
                  onChange={e => setForm({ ...form, project: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="">-- Select Project * --</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  style={styles.input}
                >
                  <option value="">-- Assign To --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  ✅ Create Task
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div style={styles.loadingBox}>Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "48px" }}>✅</div>
            <p style={{ marginTop: "12px", color: "#94a3b8" }}>
              {user.role === "Admin" ? "No tasks yet. Create one!" : "No tasks assigned to you yet."}
            </p>
          </div>
        ) : (
          <div style={styles.tasksList}>
            {filtered.map(t => (
              <div
                key={t._id}
                style={{ ...styles.taskCard, ...(isOverdue(t) ? styles.overdueCard : {}) }}
              >
                <div style={styles.taskLeft}>
                  <div style={styles.taskHeader}>
                    <h3 style={styles.taskTitle}>{t.title}</h3>
                    {isOverdue(t) && (
                      <span style={styles.overdueTag}>🚨 Overdue</span>
                    )}
                    <span style={{
                      ...styles.priorityTag,
                      background: priorityColor[t.priority] + "20",
                      color: priorityColor[t.priority]
                    }}>
                      {t.priority}
                    </span>
                  </div>

                  {t.description && (
                    <p style={styles.taskDesc}>{t.description}</p>
                  )}

                  <div style={styles.taskMeta}>
                    <span>📁 {t.project?.name || "No Project"}</span>
                    <span>👤 {t.assignedTo?.name || "Unassigned"}</span>
                    {t.dueDate && (
                      <span>📅 {new Date(t.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div style={styles.taskRight}>
                  <select
                    value={t.status}
                    onChange={e => updateStatus(t._id, e.target.value)}
                    style={{
                      ...styles.statusSelect,
                      background: statusColor[t.status] + "20",
                      color: statusColor[t.status],
                      border: `1px solid ${statusColor[t.status]}`
                    }}
                  >
                    <option value="todo">📌 To Do</option>
                    <option value="in-progress">⚡ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>

                  {user.role === "Admin" && (
                    <button onClick={() => handleDelete(t._id)} style={styles.deleteBtn}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrapper: { display: "flex", minHeight: "100vh", background: "#f0f2f5" },
  sidebar: { width: "250px", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", display: "flex", flexDirection: "column", padding: "24px 0", position: "fixed", height: "100vh" },
  sidebarLogo: { color: "white", fontSize: "22px", fontWeight: "700", padding: "0 24px 32px" },
  nav: { flex: 1, padding: "0 12px" },
  navItem: { color: "#94a3b8", padding: "12px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", marginBottom: "4px" },
  navActive: { background: "rgba(108,99,255,0.2)", color: "#6c63ff", fontWeight: "600" },
  sidebarBottom: { padding: "0 16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" },
  userInfo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#6c63ff", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  userName: { color: "white", fontSize: "14px", fontWeight: "600" },
  userRole: { color: "#94a3b8", fontSize: "12px" },
  logoutBtn: { width: "100%", padding: "10px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  main: { marginLeft: "250px", flex: 1, padding: "32px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  heading: { fontSize: "28px", fontWeight: "700", color: "#1a1a2e" },
  subheading: { color: "#64748b", fontSize: "15px", marginTop: "4px" },
  addBtn: { padding: "12px 24px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "600" },
  filterTabs: { display: "flex", gap: "8px", marginBottom: "24px" },
  tab: { padding: "8px 20px", borderRadius: "20px", border: "1px solid #e0e0e0", background: "white", cursor: "pointer", fontSize: "14px", color: "#64748b" },
  tabActive: { background: "#6c63ff", color: "white", border: "1px solid #6c63ff", fontWeight: "600" },
  formCard: { background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  formTitle: { marginBottom: "16px", color: "#1a1a2e", fontSize: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#64748b" },
  input: { padding: "12px 16px", borderRadius: "8px", border: "1px solid #e0e0e0", fontSize: "14px", outline: "none", width: "100%", background: "white" },
  formActions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: { padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  submitBtn: { padding: "10px 24px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  loadingBox: { textAlign: "center", padding: "40px", color: "#94a3b8" },
  tasksList: { display: "flex", flexDirection: "column", gap: "12px" },
  taskCard: { background: "white", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  overdueCard: { border: "1px solid #fecaca", background: "#fff5f5" },
  taskLeft: { flex: 1 },
  taskHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" },
  taskTitle: { fontSize: "16px", fontWeight: "600", color: "#1a1a2e" },
  overdueTag: { padding: "2px 8px", borderRadius: "4px", fontSize: "12px", background: "#fee2e2", color: "#ef4444" },
  priorityTag: { padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" },
  taskDesc: { color: "#64748b", fontSize: "14px", marginBottom: "8px" },
  taskMeta: { display: "flex", gap: "16px", fontSize: "13px", color: "#94a3b8" },
  taskRight: { display: "flex", alignItems: "center", gap: "12px" },
  statusSelect: { padding: "8px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", outline: "none" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "18px", opacity: 0.6 },
  emptyState: { textAlign: "center", padding: "60px", color: "#94a3b8" },
}

export default Tasks