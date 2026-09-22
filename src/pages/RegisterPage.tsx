import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { API_BASE_URL } from "../config/api";

function RegisterPage(){
    const [formData,setFormData]=useState({
        name: "",
    email: "",
    password: "",
    role: "SEEKER",
    })
    const [loading,setLoading]=useState(false);
    const[error,setError]=useState("")
    const [success,setSuccess]=useState(false)

    function handleChange(event:ChangeEvent<HTMLInputElement | HTMLSelectElement>){
const {name , value}=event.target
setFormData((prev)=>({
    ...prev,
    [name]:value
}))
    }
    async function handleSubmit(event:FormEvent<HTMLFormElement>){
        event.preventDefault();
setError("");
    setSuccess(false);
    
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    if (formData.password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    setLoading(true);
    try{
       const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.status === 409) {
        setError("This email is already registered");
        return;
      }
        if (!response.ok) {
        setError("Registration failed. Check your details.");
        return;
      }

      setSuccess(true);

       setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    }catch{
        setError("Could not connect to the server");
    }finally{setLoading(false);}
    
    }
  return (
  <section className="auth-page">
    <form className="auth-card auth-form" onSubmit={handleSubmit}>
      <h1>Create an account</h1>
      <p className="auth-description">
        Join Job Board and get started.
      </p>

      <div className="form-field">
        <label htmlFor="register-name">Name</label>
        <input
          id="register-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 10 characters"
        />
      </div>

      <div className="form-field">
        <label htmlFor="role">Account type</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="SEEKER">Job Seeker</option>
          <option value="EMPLOYER">Employer</option>
        </select>
      </div>

      <button
        className="auth-submit"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Register"}
      </button>

      {error && (
        <p className="auth-message error-message" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="auth-message success-message" role="status">
          Account created successfully!{" "}
          <Link to="/login">Go to Login</Link>
        </p>
      )}
    </form>
  </section>
);
}
export default RegisterPage