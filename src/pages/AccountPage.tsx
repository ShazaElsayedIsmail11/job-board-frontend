import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>No account data available.</p>;
  }

  return (
    <section className="workspace-page">
      <h1>My Account</h1>

      <div className="account-details">
        <p>
          <strong>Name:</strong> {user.name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>
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