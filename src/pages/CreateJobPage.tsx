import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

function CreateJobPage() {
   const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
const cleanTitle = title.trim();
const cleanDescription = description.trim();

if (cleanTitle.length < 3 || cleanTitle.length > 100) {
  setError("Title must be between 3 and 100 characters.");
  return;
}

if (cleanDescription.length < 20 || cleanDescription.length > 2000) {
  setError("Description must be between 20 and 2000 characters.");
  return;
}
    

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title:cleanTitle,
          description: cleanDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create job");
      }

      setSuccess("Job posted successfully!");
      setTitle("");
      setDescription("");
    } catch {
      setError("Could not post the job. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <section className="workspace-page">
    <h1>Post a Job</h1>

    <form className="job-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="job-title">Job Title</label>
        <input
          id="job-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Frontend Developer"
        />
      </div>

      <div className="form-field">
        <label htmlFor="job-description">Job Description</label>
        <textarea
          id="job-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the role and requirements..."
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post Job"}
      </button>
    </form>

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

    <Link className="workspace-back-link" to="/account">
      Back to Account
    </Link>
  </section>
);
}

export default CreateJobPage;
