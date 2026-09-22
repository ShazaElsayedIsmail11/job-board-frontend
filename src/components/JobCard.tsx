import { Link } from "react-router";

type JobCardProps = {
  id: number;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
};

function JobCard({
  id,
  title,
  description,
  isOpen,
  onToggle,
}: JobCardProps) {
  return (
    <article className="job-card">
      <div className="job-card-content">
        <span className="job-card-label">Job opportunity</span>

        <h3 className="job-card-title">{title}</h3>

        {isOpen && (
          <p className="job-card-description">{description}</p>
        )}
      </div>

      <div className="job-card-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onToggle}
        >
          {isOpen ? "Hide description" : "Show description"}
        </button>

        <Link className="primary-link" to={`/jobs/${id}`}>
          View job
        </Link>
      </div>
    </article>
  );
}

export default JobCard;