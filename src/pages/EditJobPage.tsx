import { useEffect, useState, type FormEvent  } from "react";
import { Link, useParams } from "react-router";
import { API_BASE_URL } from "../config/api";

type Job = {
  id: number;
  title: string;
  description: string;
};

type JobResponse = {
  data: Job;
};
type EditJobPageProps = {
  token: string | null;
};
function EditJobPage({ token }: EditJobPageProps) {
  const { id } = useParams();
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState("");
const [success, setSuccess] = useState("");
useEffect(() => {
  const controller = new AbortController();

  async function loadJob() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${id}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }

      const result: JobResponse = await response.json();

      if (!controller.signal.aborted) {
        setTitle(result.data.title);
        setDescription(result.data.description);
      }
    } catch {
      if (!controller.signal.aborted) {
        setError("Could not load job details.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  void loadJob();

  return () => {
    controller.abort();
  };
}, [id]);

async function handleSave(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSaveError("");
  setSuccess("");

 const cleanTitle = title.trim();
const cleanDescription = description.trim();

if (cleanTitle.length < 3 || cleanTitle.length > 100) {
  setSaveError("Title must be between 3 and 100 characters.");
  return;
}

if (cleanDescription.length < 20 || cleanDescription.length > 2000) {
  setSaveError("Description must be between 20 and 2000 characters.");
  return;
}

  if (!token || !id) {
    setSaveError("Could not verify your session or job.");
    return;
  }

  setSaving(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: cleanTitle,
        description:cleanDescription,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update job");
    }

    setSuccess("Job updated successfully!");
  } catch {
    setSaveError("Could not save changes. Please try again.");
  } finally {
    setSaving(false);
  }
}
return (
  <section className="workspace-page">
    <h1>Edit Job</h1>

    {loading ? (
      <p role="status">Loading job...</p>
    ) : error ? (
      <p className="auth-message error-message" role="alert">
        {error}
      </p>
    ) : (
      <form className="job-form" onSubmit={handleSave}>
        <div className="form-field">
          <label htmlFor="edit-title">Job Title</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="edit-description">
            Job Description
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {saveError && (
          <p className="auth-message error-message" role="alert">
            {saveError}
          </p>
        )}

        {success && (
          <p className="auth-message success-message" role="status">
            {success}
          </p>
        )}
      </form>
    )}

    <Link
      className="workspace-back-link"
      to="/employer/jobs"
    >
      Back to My Jobs
    </Link>
  </section>
);
}

export default EditJobPage;