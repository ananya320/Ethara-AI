import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Member" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return alert("All fields required");
    try {
      setLoading(true);
      await API.post("/auth/signup", form);
      alert("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSignup} style={styles.form}>
        <div style={styles.logo}>🚀</div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join your team workspace</p>

        <input name="name" placeholder="Full Name" value={form.name}
          onChange={handleChange} style={styles.input} />
        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={handleChange} style={styles.input} />
        <input name="password" type="password" placeholder="Password" value={form.password}
          onChange={handleChange} style={styles.input} />

        <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
          <option value="Member">Member</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p style={styles.link}>Already have an account? <Link to="/login" style={styles.a}>Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: { display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  form: { background:"white", padding:"40px", borderRadius:"16px", width:"380px", display:"flex", flexDirection:"column", gap:"16px", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" },
  logo: { fontSize:"40px", textAlign:"center" },
  title: { textAlign:"center", fontSize:"24px", fontWeight:"700", color:"#1a1a2e" },
  subtitle: { textAlign:"center", color:"#666", marginTop:"-10px", fontSize:"14px" },
  input: { padding:"12px 16px", borderRadius:"8px", border:"1px solid #e0e0e0", fontSize:"14px", outline:"none" },
  button: { padding:"14px", background:"linear-gradient(135deg, #667eea, #764ba2)", color:"white", border:"none", borderRadius:"8px", fontSize:"16px", fontWeight:"600", cursor:"pointer" },
  link: { textAlign:"center", fontSize:"14px", color:"#666" },
  a: { color:"#667eea", fontWeight:"600" }
};

export default Signup;