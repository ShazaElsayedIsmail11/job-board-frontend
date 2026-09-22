import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_BASE_URL } from "../config/api";

type MyJobsPageProps = {
  token: string | null;
};

type Job = {
  id: number;
  title: string;
  description: string;
};

type MeResponse = {
  data: {
    id: number;
    role: "SEEKER" | "EMPLOYER";
  };
};

type JobsResponse = {
  data: Job[];
};
function MyJobsPage({ token }: MyJobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
const [deleteError, setDeleteError] = useState("");
  useEffect(() => {
  const controller = new AbortController();

  async function loadMyJobs() {
    try {
      if (!token) {
        throw new Error("Please log in again.");
      }

      const meResponse = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      if (!meResponse.ok) {
        throw new Error("Could not verify your account.");
      }

      const meResult: MeResponse = await meResponse.json();

      if (meResult.data.role !== "EMPLOYER") {
        throw new Error("This page is for employers only.");
      }

      const jobsResponse = await fetch(
        `${API_BASE_URL}/api/jobs?employerId=${meResult.data.id}`,
        { signal: controller.signal }
      );

      if (!jobsResponse.ok) {
        throw new Error("Could not fetch your jobs.");
      }

      const jobsResult: JobsResponse = await jobsResponse.json();

      if (!controller.signal.aborted) {
        setJobs(jobsResult.data);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  void loadMyJobs();



  return () => {
    controller.abort();
  };
}, [token]);
async function handleDelete(jobId: number) {
  if (deletingId !== null) {
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this job?"
  );

  if (!confirmed) {
    return;
  }

  if (!token) {
    setDeleteError("Please log in again.");
    return;
  }

  setDeleteError("");
  setDeletingId(jobId);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs/${jobId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete job");
    }

    setJobs((prevJobs) =>
      prevJobs.filter((job) => job.id !== jobId)
    );
  } catch {
    setDeleteError("Could not delete the job. Please try again.");
  } finally {
    setDeletingId(null);
  }
}
return (
  <section className="workspace-page listing-page">
    <h1>My Jobs</h1>

    {loading ? (
      <p role="status">Loading your jobs...</p>
    ) : error ? (
      <p className="auth-message error-message" role="alert">
        {error}
      </p>
    ) : jobs.length === 0 ? (
      <p className="empty-state">
        You have not posted any jobs yet.
      </p>
    ) : (
      <div className="listing-items">
        {jobs.map((job) => (
          <article className="listing-card" key={job.id}>
            <h2>{job.title}</h2>

            <p className="listing-description">
              {job.description}
            </p>

            <div className="listing-card-actions">
              <Link
                className="listing-edit-link"
                to={`/employer/jobs/${job.id}/edit`}
              >
                Edit Job
              </Link>

              <button
                className="listing-delete-button"
                type="button"
                onClick={() => void handleDelete(job.id)}
                disabled={deletingId !== null}
              >
                {deletingId === job.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </article>
        ))}
      </div>
    )}

    {deleteError && (
      <p
        className="auth-message error-message"
        role="alert"
      >
        {deleteError}
      </p>
    )}

    <div className="listing-footer">
      <Link
        className="primary-link"
        to="/employer/jobs/new"
      >
        Post a New Job
      </Link>
    </div>
  </section>
);
}

export default MyJobsPage;