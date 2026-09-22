import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_BASE_URL } from "../config/api";
type Job={
    id:number;
    title:string;
    description:string
}
type JobResponse={
    data:Job
}
type JobDetailsPageProps = {
  token: string | null;
};
type Viewer = {
  token: string;
  role?: "SEEKER" | "EMPLOYER";
  error?: boolean;
};
type MeResponse = {
  data: {
    role: "SEEKER" | "EMPLOYER";
  };
};

function JobDetailsPage({token}:JobDetailsPageProps) {
    
  const { id } = useParams();
const [job, setJob] = useState<Job | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [applying, setApplying] = useState(false);
const [applied, setApplied] = useState(false);
const [applyMessage, setApplyMessage] = useState("");
const [applyError, setApplyError] = useState("");
const [viewer, setViewer] = useState<Viewer | null>(null);
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
        setJob(result.data);
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
useEffect(() => {
  if (!token) return;

  const activeToken = token;
  const controller = new AbortController();

  async function loadViewer() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Could not verify account");
      }

      const result: MeResponse = await response.json();

      if (!controller.signal.aborted) {
        setViewer({
          token: activeToken,
          role: result.data.role,
        });
      }
    } catch {
      if (!controller.signal.aborted) {
        setViewer({
          token: activeToken,
          error: true,
        });
      }
    }
  }

  void loadViewer();

  return () => controller.abort();
}, [token]);
async function handleApply() {
 if (
  !token ||
  !id ||
  applying ||
  applied ||
  viewer?.token !== token ||
  viewer.role !== "SEEKER"
) {
  return;
}

  setApplying(true);
  setApplyError("");
  setApplyMessage("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs/${id}/apply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 409) {
      setApplied(true);
      setApplyMessage("You already applied to this job.");
      return;
    }

    if (!response.ok) {
      throw new Error(
        response.status === 403
          ? "Only job seekers can apply."
          : "Could not submit your application."
      );
    }

    setApplied(true);
    setApplyMessage("Application submitted successfully!");
  } catch (err) {
    setApplyError(
      err instanceof Error
        ? err.message
        : "Could not submit your application."
    );
  } finally {
    setApplying(false);
  }
}
return (
  <section className="workspace-page job-details-page">
    <Link className="detail-back-link" to="/">
      ← Back to Jobs
    </Link>

    {loading ? (
      <p role="status">Loading job details...</p>
    ) : error ? (
      <p className="auth-message error-message" role="alert">
        {error}
      </p>
    ) : !job ? (
      <p className="empty-state">Job not found.</p>
    ) : (
      <>
        <span className="job-card-label">Job opportunity</span>

        <h1>{job.title}</h1>

        <p className="job-detail-description">
          {job.description}
        </p>

        <div className="detail-apply-area">
          {!token ? (
            <Link className="primary-link" to="/login">
              Log in to apply
            </Link>
          ) : viewer?.token !== token ? (
            <p>Checking account...</p>
          ) : viewer.error ? (
            <p role="alert">Could not verify your account.</p>
          ) : viewer.role !== "SEEKER" ? (
            <p>Only job seekers can apply.</p>
          ) : (
            <button
              className="apply-button"
              type="button"
              onClick={() => void handleApply()}
              disabled={applying || applied}
            >
              {applying
                ? "Applying..."
                : applied
                  ? "Applied"
                  : "Apply for this Job"}
            </button>
          )}

          {applyMessage && (
            <p
              className="auth-message success-message"
              role="status"
            >
              {applyMessage}
            </p>
          )}

          {applyError && (
            <p
              className="auth-message error-message"
              role="alert"
            >
              {applyError}
            </p>
          )}
        </div>
      </>
    )}
  </section>
);
}

export default JobDetailsPage;