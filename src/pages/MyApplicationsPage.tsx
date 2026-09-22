import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_BASE_URL } from "../config/api";

type MyApplicationsPageProps = {
  token: string | null;
};

type Application = {
  id: number;
  status: string;
  job: {
    id: number;
    title: string;
  };
};

type ApplicationsResponse = {
  data: Application[];
};

function MyApplicationsPage({
  token,
}: MyApplicationsPageProps) {
    const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
  const controller = new AbortController();

  async function loadApplications() {
    try {
      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/applications/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const result: ApplicationsResponse =
        await response.json();

      if (!controller.signal.aborted) {
        setApplications(result.data);
      }
    } catch {
      if (!controller.signal.aborted) {
        setError("Could not load your applications.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  void loadApplications();

  return () => {
    controller.abort();
  };
}, [token]);
 return (
  <section className="workspace-page listing-page">
    <h1>My Applications</h1>

    {loading ? (
      <p role="status">Loading applications...</p>
    ) : error ? (
      <p className="auth-message error-message" role="alert">
        {error}
      </p>
    ) : applications.length === 0 ? (
      <p className="empty-state">
        You have not applied to any jobs yet.
      </p>
    ) : (
      <div className="listing-items">
        {applications.map((application) => (
          <article
            className="listing-card"
            key={application.id}
          >
            <h2>{application.job.title}</h2>

            <p>
              Status:{" "}
              <span className="application-status">
                {application.status}
              </span>
            </p>

            <div className="listing-card-actions">
              <Link
                className="listing-edit-link"
                to={`/jobs/${application.job.id}`}
              >
                View Job
              </Link>
            </div>
          </article>
        ))}
      </div>
    )}

    <div className="listing-footer">
      <Link className="primary-link" to="/">
        Browse Jobs
      </Link>
    </div>
  </section>
);
}

export default MyApplicationsPage;