import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackBanner from '../../components/FeedbackBanner';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_TYPES, labelFor } from './jobLabels';
import { listJobs } from './services/jobApi';

const emptyFilters = {
  search: '',
  skill: '',
  workType: '',
  employmentType: '',
  experienceLevel: '',
};

export default function JobsPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value));
      const result = await listJobs(params);
      setJobs(result.data.jobs);
      setMessage(result.message);
    } catch (err) {
      setMessage('');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(emptyFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="page page--wide">
      <p className="eyebrow">Opportunities</p>
      <h1>Browse jobs</h1>
      <p className="lede">Only ILO-approved roles are listed here. Filter by skill, work type, or seniority.</p>

      <FeedbackBanner type="error">{error}</FeedbackBanner>
      <FeedbackBanner type="ok">{message}</FeedbackBanner>

      <form
        className="panel"
        onSubmit={(event) => {
          event.preventDefault();
          load(filters);
        }}
      >
        <div className="form-grid">
          <label>
            Search
            <input name="search" value={filters.search} onChange={onChange} placeholder="React, Nairobi…" />
          </label>
          <label>
            Skill
            <input name="skill" value={filters.skill} onChange={onChange} placeholder="JavaScript" />
          </label>
          <label>
            Work type
            <select name="workType" value={filters.workType} onChange={onChange}>
              <option value="">Any</option>
              {WORK_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Employment
            <select name="employmentType" value={filters.employmentType} onChange={onChange}>
              <option value="">Any</option>
              {EMPLOYMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Experience
            <select name="experienceLevel" value={filters.experienceLevel} onChange={onChange}>
              <option value="">Any</option>
              {EXPERIENCE_LEVELS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="hero-actions">
          <button className="button" type="submit">
            Apply filters
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => {
              setFilters(emptyFilters);
              load(emptyFilters);
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {loading && <p className="status-note">Loading jobs…</p>}
      {!loading && jobs.length === 0 && <p className="status-note">No published jobs match those filters.</p>}

      <div className="status-grid">
        {jobs.map((job) => (
          <article className="card" key={job._id}>
            <p className="card__label">{job.companyName || 'Employer'}</p>
            <p className="card__value">{job.title}</p>
            <p>
              {labelFor(WORK_TYPES, job.workType)} · {labelFor(EMPLOYMENT_TYPES, job.employmentType)} ·{' '}
              {labelFor(EXPERIENCE_LEVELS, job.experienceLevel)}
            </p>
            <p>{job.skills.slice(0, 4).join(', ')}</p>
            <Link className="button" to={`/jobs/${job._id}`}>
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
