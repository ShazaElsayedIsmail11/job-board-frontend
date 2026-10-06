import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

type Job = {
  id: number;
  title: string;
  description: string;
};

type JobResponse = {
  data: Job;
};

type MyApplication = {
  id: number;
  status: string;

  job: {
    id: number;
    title: string;
  };
};

type MyApplicationsResponse = {
  data: MyApplication[];
};

type ApplicationState =
  | "checking"
  | "applied"
  | "not-applied";

function JobDetailsPage() {
  const { id } = useParams();

  const {
    token,
    user,
    loading: authLoading,
  } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applicationState, setApplicationState] =
    useState<ApplicationState>("checking");

  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  // =========================
  // 1. Load job details
  // =========================

  useEffect(() => {
    const controller = new AbortController();

    async function loadJob() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/jobs/${id}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }

        const result: JobResponse =
          await response.json();

        if (!controller.signal.aborted) {
          setJob(result.data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Could not load job details."
          );
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

  // =========================
  // 2. Check if seeker already applied
  // =========================

  useEffect(() => {
    if (
      authLoading ||
      !token ||
      user?.role !== "SEEKER" ||
      !id
    ) {
      return;
    }

    const controller = new AbortController();

    async function checkApplication() {
      try {
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
          throw new Error(
            "Could not check application"
          );
        }

        const result: MyApplicationsResponse =
          await response.json();

        const hasApplied = result.data.some(
          (application) =>
            application.job.id === Number(id)
        );

        if (!controller.signal.aborted) {
          setApplicationState(
            hasApplied
              ? "applied"
              : "not-applied"
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setApplyError(
            "Could not check your application status."
          );
        }
      }
    }

    void checkApplication();

    return () => {
      controller.abort();
    };
  }, [
    id,
    token,
    user?.role,
    authLoading,
  ]);

  // =========================
  // 3. Apply
  // =========================

  async function handleApply() {
    if (
      !token ||
      !id ||
      applying ||
      applicationState === "applied" ||
      user?.role !== "SEEKER"
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
        setApplicationState("applied");

        setApplyMessage(
          "You already applied to this job."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Only job seekers can apply."
            : "Could not submit your application."
        );
      }

      setApplicationState("applied");

      setApplyMessage(
        "Application submitted successfully!"
      );
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

  // =========================
  // 4. Render
  // =========================

  return (
    <section className="workspace-page job-details-page">
      <Link
        className="detail-back-link"
        to="/"
      >
        ← Back to Jobs
      </Link>

      {loading ? (
        <p role="status">
          Loading job details...
        </p>
      ) : error ? (
        <p
          className="auth-message error-message"
          role="alert"
        >
          {error}
        </p>
      ) : !job ? (
        <p className="empty-state">
          Job not found.
        </p>
      ) : (
        <>
        
          <h1>{job.title}</h1>

          <p className="job-detail-description">
            {job.description}
          </p>

          <div className="detail-apply-area">
            {!token ? (
              <Link
                className="primary-link"
                to="/login"
              >
                Log in to apply
              </Link>
            ) : authLoading ? (
              <p role="status">
                Checking account...
              </p>
            ) : user?.role !== "SEEKER" ? (
              <p>
                Only job seekers can apply.
              </p>
            ) : applicationState ===
              "checking" ? (
              <p role="status">
                Checking application status...
              </p>
            ) : (
              <button
                className="apply-button"
                type="button"
                onClick={() =>
                  void handleApply()
                }
                disabled={
                  applying ||
                  applicationState ===
                    "applied"
                }
              >
                {applying
                  ? "Applying..."
                  : applicationState ===
                      "applied"
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