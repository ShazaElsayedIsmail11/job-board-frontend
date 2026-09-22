import { useState } from "react";
import { API_BASE_URL } from "../config/api";

type LoginResponse = {
  data: {
    user: {
      name: string;
    };
    token: string;
  };
};
type MeResponse = {
  data: {
    name: string;
    role: "SEEKER" | "EMPLOYER";
  };
};
type loginProps={
  token: string | null,
  onTokenChange: (newToken:string | null)=>void
}
function LoginForm({token,onTokenChange}:loginProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
onTokenChange(null);
    setError("");
    setSuccess("");
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("email and password are required");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        setError("Invalid email or password");
        return;
      }
      const result: LoginResponse = await response.json();
      setSuccess(`Welcome, ${result.data.user.name}`);
      onTokenChange(result.data.token)
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }
async function handleCheckProfile(){
  if(!token){return;}
  setError("");
  try{
      const response=await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
              Authorization: `Bearer ${token}`,
        }
      })

        if (!response.ok) {
      throw new Error("Profile request failed");
    }

const result: MeResponse= await response.json()
setSuccess(
      `Authenticated as ${result.data.name} (${result.data.role})`
    );
  }catch{
      setError("Could not load your profile");
  }
}
function handleLogout() {
  onTokenChange(null);
  setSuccess("");
  setError("");
}
 return (
  <section className="auth-page">
    <form className="auth-card auth-form" onSubmit={handleSubmit}>
      <h1>Welcome back</h1>
      <p className="auth-description">
        Sign in to your account.
      </p>

      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <p className="auth-message error-message" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="auth-message success-message" role="status">
          {success}
        </p>
      )}

      <button
        className="auth-submit"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>

    {token && (
      <div className="auth-actions">
        <button type="button" onClick={handleCheckProfile}>
          Check My Profile
        </button>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    )}
  </section>
);
}

export default LoginForm;
