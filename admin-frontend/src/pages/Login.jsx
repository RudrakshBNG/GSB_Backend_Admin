import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("admin");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password, loginType);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <img
            src="/logo.png"
            alt="GSB Pathy Logo"
            style={{ width: "200px", height: "150px" }}
          />
        </div>

        <div className="form-group">
          <label>Login as:</label>
          <div className="login-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${loginType === "admin" ? "active" : ""}`}
              onClick={() => setLoginType("admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className={`toggle-btn ${loginType === "team" ? "active" : ""}`}
              onClick={() => setLoginType("team")}
            >
              Team Member
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
// import React, { useState } from "react";
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { login, teamMemberLogin } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // First try admin login
//     let result = await login(email, password);

//     // If admin login fails, try team member login
//     if (!result.success) {
//       result = await teamMemberLogin(email, password);
//     }

//     if (!result.success) {
//       setError(result.error);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="login-container">
//       <form className="login-form" onSubmit={handleSubmit}>
//         <div className="login-header">
//           <img
//             src="/logo.png"
//             alt="GSB Pathy Logo"
//             style={{ width: "200px", height: "150px" }}
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             placeholder="admin@gsbpathy.com"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             placeholder="Enter your password"
//           />
//         </div>

//         <button type="submit" className="login-btn" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         {error && <div className="error-message">{error}</div>}
//       </form>
//     </div>
//   );
// };

// export default Login;
