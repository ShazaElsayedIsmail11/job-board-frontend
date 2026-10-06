import "./App.css";
import LoginForm from "./components/LoginForm";
import JobsFromApi from "./components/JobsFromApi";
import { Link,NavLink, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountPage from "./pages/AccountPage";
import RegisterPage from "./pages/RegisterPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import CreateJobPage from "./pages/CreateJobPage";
import MyJobsPage from "./pages/MyJobsPage";
import EditJobPage from "./pages/EditJobPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./context/AuthContext";
import NotFoundPage from "./pages/NotFoundPage";
import JobApplicationsPage from "./pages/JobApplicationsPage";
function App() {
  const { token, user, logout } = useAuth();
  return (
    <>
      <nav className="site-nav">
        <Link to="/" className="site-brand">
          Job Board
        </Link>

        <div className="nav-links">
         <NavLink
  to="/"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  Jobs
</NavLink>

          {!token ? (
            <>
            <NavLink
  to="/login"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  Login
</NavLink>
            <NavLink
  to="/register"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  Register
</NavLink>
            </>
          ) : (
            <>
             <NavLink
  to="/account"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  My Account
</NavLink>

              {user?.role === "SEEKER" && (
                <NavLink
  to="/applications"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  My applications
</NavLink>
              )}

              {user?.role === "EMPLOYER" && (
                <>
                 <NavLink
  to="/employer/jobs"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  My Jobs
</NavLink>
                 <NavLink
  to="/employer/jobs/new"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  Post Jobs
</NavLink>
                </>
              )}

           <button
  className="nav-logout-button"
  type="button"
  onClick={logout}
>
  Logout
</button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Find your next opportunity</h1>
              <p className="page-description">
                Explore available jobs and find the right role for you.
              </p>
              <JobsFromApi />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <LoginForm />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute >
              <ProfilePage  />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRole="SEEKER">
              <MyApplicationsPage  />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute >
              <AccountPage  />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage  />} />
        <Route
          path="/employer/jobs/new"
          element={
            <ProtectedRoute allowedRole="EMPLOYER">
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/employer/jobs/:id/applications"
  element={
    <ProtectedRoute allowedRole="EMPLOYER">
      <JobApplicationsPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/employer/jobs/:id/edit"
          element={
            <ProtectedRoute allowedRole="EMPLOYER">
              <EditJobPage  />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute allowedRole="EMPLOYER">
              <MyJobsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
