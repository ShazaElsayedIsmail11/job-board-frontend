import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import JobCard from "./JobCard";
type Job = {
  id: number;
  title: string;
  description: string;
};

type pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
type JobsResponse = {
  data: Job[];
  pagination: pagination;
};

function JobsFromApi() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
const [loading, setLoading] = useState(true);
const [selectedJobId,setSelectedJobId]=useState<number | null>(null)
const [searchInput, setSearchInput] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [pagination, setPagination] =useState<pagination | null>(null);
const [page,setPage]=useState(1)

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchInput.trim());
    setPage(1);
    setSelectedJobId(null);
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [searchInput]);

useEffect(() => {
  
  const controller = new AbortController();

  async function loadJobs() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(
       `${API_BASE_URL}/api/jobs?search=${encodeURIComponent(debouncedSearch)}&page=${page}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const result: JobsResponse = await response.json();

      if (!controller.signal.aborted) {
        setJobs(result.data);
        setPagination(result.pagination);
      }
    } catch {
      if (!controller.signal.aborted) {
        setError("Could not load jobs");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  void loadJobs();

  return () => {
    controller.abort();
  };
}, [debouncedSearch,page]);

function handleToggle(jobId: number) {
  if (selectedJobId === jobId) {
    setSelectedJobId(null);
  } else {
    setSelectedJobId(jobId);
  }
}
function handleNext() {
  if (!pagination || loading || page >= pagination.totalPages) {
    return;
  }

  setLoading(true);
  setError("");
  setPagination(null);
  setSelectedJobId(null);

  setPage((prev) => prev + 1);
}
function handlePrevious() {
  if (loading || page <= 1) {
    return;
  }

  setLoading(true);
  setError("");
  setPagination(null);
  setSelectedJobId(null);

  setPage((prev) => prev - 1);
}
return (
  <section className="jobs-section">
    <h2>Available jobs</h2>

   <div className="job-search">
  <input
    type="search"
    aria-label="Search jobs"
    value={searchInput}
    onChange={(event) =>
      setSearchInput(event.target.value)
    }
    placeholder="Search jobs..."
  />
</div>

    {loading ? (
      <p role="status">Loading jobs...</p>
    ) : error ? (
      <p role="alert">{error}</p>
    ) : jobs.length === 0 ? (
      <p>No jobs found.</p>
    ) : (
      <div className="jobs-list">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            id={job.id}
            title={job.title}
            description={job.description}
            isOpen={selectedJobId === job.id}
            onToggle={() => handleToggle(job.id)}
          />
        ))}
      </div>
    )}

    {pagination && pagination.totalPages > 0 && (
      <div className="jobs-pagination">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={loading || page <= 1}
        >
          Previous
        </button>

        <p>
          Page {pagination.page} of {pagination.totalPages}
        </p>

        <button
          type="button"
          onClick={handleNext}
          disabled={loading || page >= pagination.totalPages}
        >
          Next
        </button>
      </div>
    )}
  </section>
);
}

export default JobsFromApi;