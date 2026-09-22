import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { Link } from "react-router";
type User = {
  id: number;
  name: string;
  email: string;
  role: "SEEKER" | "EMPLOYER";
};

type MeResponse = {
  data: User;
};

type AccountPageProps = {
  token: string | null;
   onTokenChange: (newToken: string | null) => void;
};

function AccountPage({ token,onTokenChange }: AccountPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadAccount() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
  if (!controller.signal.aborted) {
    onTokenChange(null);
  }

  return;
}

if (!response.ok) {
  throw new Error("Failed to load account");
}

        const result: MeResponse = await response.json();

        if (!controller.signal.aborted) {
          setUser(result.data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Could not load your account");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      controller.abort();
    };
  }, [token,onTokenChange]);

  if (loading) {
    return <p>Loading account...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>No account data available.</p>;
  }

  return (
  <section className="workspace-page">
    <h1>My Account</h1>

    <div className="account-details">
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>

    <h2>Quick actions</h2>

    <div className="account-links">
      {user.role === "SEEKER" ? (
        <>
          <Link to="/">Browse Jobs</Link>
          <Link to="/applications">My Applications</Link>
        </>
      ) : (
        <>
          <Link to="/employer/jobs/new">Post a Job</Link>
          <Link to="/employer/jobs">My Jobs</Link>
        </>
      )}

      <Link to="/profile">My Profile</Link>
    </div>
  </section>
);
}

export default AccountPage;