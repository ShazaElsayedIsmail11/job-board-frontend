import { Link } from "react-router";

function NotFoundPage() {
  return (
    <section className="workspace-page not-found-page">
      <h1>404</h1>

      <h2>Page not found</h2>

      <p>
        The page you are looking for does not exist.
      </p>

      <Link className="primary-link" to="/">
        Back to Jobs
      </Link>
    </section>
  );
}

export default NotFoundPage;