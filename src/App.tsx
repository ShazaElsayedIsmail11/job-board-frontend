import { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import JobsFromApi from "./components/JobsFromApi";
import { Link, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountPage from "./pages/AccountPage";
import RegisterPage from "./pages/RegisterPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import CreateJobPage from "./pages/CreateJobPage";
import MyJobsPage from "./pages/MyJobsPage";
import EditJobPage from "./pages/EditJobPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ProfilePage from "./pages/ProfilePage";
function App() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <>
   <nav className="site-nav">
  <Link to="/" className="site-brand">
    Job Board
  </Link>

  <div className="nav-links">
    <Link to="/">Jobs</Link>
    <Link to="/login">Login</Link>
    <Link to="/account">My account</Link>
    <Link to="/register">Register</Link>
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
              
              <LoginForm token={token} onTokenChange={setToken} />
            </>
          }
        />
        <Route
  path="/profile"
  element={
    <ProtectedRoute token={token}>
      <ProfilePage token={token}/>
    </ProtectedRoute>
  }
/>
        <Route
          path="/applications"
          element={
            <ProtectedRoute token={token}>
              <MyApplicationsPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute token={token}>
              <AccountPage token={token} onTokenChange={setToken} />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage token={token} />} />
        <Route
          path="/employer/jobs/new"
          element={
            <ProtectedRoute token={token}>
              <CreateJobPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/edit"
          element={
            <ProtectedRoute token={token}>
              <EditJobPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute token={token}>
              <MyJobsPage token={token} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
