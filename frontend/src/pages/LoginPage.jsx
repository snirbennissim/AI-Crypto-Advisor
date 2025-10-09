import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axiosInstance.post("/auth/login", { email, password });
      const { data } = await axiosInstance.get("/onboarding/profile");
      navigate(data.onboarded ? "/dashboard" : "/onboarding");
    } catch (error) {
      setError(error.response.data?.message || "Failed to login");
    }
  };

  return (
    <div className="app-shell">
      {/* Header/Brand */}
      <div className="header">
        <div className="brand">
          <span>AI Crypto Advisor</span>
        </div>
        <div className="badges">
          <span className="badge">Auth</span>
          <span className="badge">Login</span>
        </div>
      </div>

      {/* Card */}
      <div className="card" style={{ maxWidth: 460, margin: "32px auto" }}>
        <h2>Login</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div className="muted" style={{ color: "#ef4444" }}>
              {error}
            </div>
          )}
          <div className="form-actions">
            <button className="btn primary" type="submit">
              Login
            </button>
          </div>
        </form>
        <div className="muted" style={{ marginTop: 12 }}>
          Not a user? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
