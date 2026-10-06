import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

type Application = {
  id: number;
  status: ApplicationStatus;
  appliedAt: string;

  seeker: {
    id: number;
    name: string;
    email: string;

    seekerProfile: {
      bio: string | null;
      skills: string[];
      cvUrl: string | null;
    } | null;
  };
};

type ApplicationsResponse = {
  data: Application[];
};

function JobApplicationsPage() {
  const { id } = useParams();

  const { token } = useAuth();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [updateError, setUpdateError] =
    useState("");

  useEffect(() => {
    if (!token || !id) {
      return;
    }

    const controller = new AbortController();

    async function loadApplications() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/jobs/${id}/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load applications"
          );
        }

        const result: ApplicationsResponse =
          await response.json();

        if (!controller.signal.aborted) {
          setApplications(result.data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Could not load applications."
          );
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
  }, [id, token]);

  async function handleStatusChange(
    applicationId: number,
    status: "ACCEPTED" | "REJECTED"
  ) {
    if (!token || updatingId !== null) {
      return;
    }

    setUpdatingId(applicationId);
    setUpdateError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update status"
        );
      }

      setApplications((prevApplications) =>
        prevApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
              }
            : application
        )
      );
    } catch {
      setUpdateError(
        "Could not update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="workspace-page listing-page">
      <h1>Job Applications</h1>

      {loading ? (
        <p role="status">
          Loading applications...
        </p>
      ) : error ? (
        <p
          className="auth-message error-message"
          role="alert"
        >
          {error}
        </p>
      ) : applications.length === 0 ? (
        <p className="empty-state">
          No applications for this job yet.
        </p>
      ) : (
        <div className="listing-items">
          {applications.map((application) => (
            <article
              className="listing-card application-card"
              key={application.id}
            >
              <div>
                <h2>
                  {application.seeker.name}
                </h2>

                <p>
                  {application.seeker.email}
                </p>
              </div>

              <p>
                Status:{" "}
                <span
  className={`application-status status-${application.status.toLowerCase()}`}
>
  {application.status}
</span>
              </p>

              {application.seeker.seekerProfile ? (
                <>
                  {application.seeker
                    .seekerProfile.bio && (
                    <p>
                      {
                        application.seeker
                          .seekerProfile.bio
                      }
                    </p>
                  )}

                  <div className="skills-list">
                    {application.seeker
                      .seekerProfile.skills.map(
                        (skill) => (
                          <span
                            className="skill-badge"
                            key={skill}
                          >
                            {skill}
                          </span>
                        )
                      )}
                  </div>
                </>
              ) : (
                <p>No seeker profile available.</p>
              )}

              <div className="application-actions">
                <button
                  type="button"
                  className="accept-button"
                  disabled={
                    updatingId !== null ||
                    application.status ===
                      "ACCEPTED"
                  }
                  onClick={() =>
                    void handleStatusChange(
                      application.id,
                      "ACCEPTED"
                    )
                  }
                >
                  {updatingId ===
                  application.id
                    ? "Updating..."
                    : "Accept"}
                </button>

                <button
                  type="button"
                  className="reject-button"
                  disabled={
                    updatingId !== null ||
                    application.status ===
                      "REJECTED"
                  }
                  onClick={() =>
                    void handleStatusChange(
                      application.id,
                      "REJECTED"
                    )
                  }
                >
                  {updatingId ===
                  application.id
                    ? "Updating..."
                    : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {updateError && (
        <p
          className="auth-message error-message"
          role="alert"
        >
          {updateError}
        </p>
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

export default JobApplicationsPage;