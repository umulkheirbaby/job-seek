import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

const ROLE_LABELS = {
  job_seeker: 'Job seeker',
  employer: 'Employer',
  admin: 'Administrator',
};

export default function AccountPage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <section className="page page--narrow">
      <p className="eyebrow">Signed in</p>
      <h1>Your account</h1>
      <p className="lede">This page is protected. It only loads after the API confirms your session cookie.</p>

      <div className="status-grid">
        <article className="card">
          <p className="card__label">Name</p>
          <p className="card__value">{user.name}</p>
        </article>
        <article className="card">
          <p className="card__label">Email</p>
          <p className="card__value">{user.email}</p>
        </article>
        <article className="card">
          <p className="card__label">Role</p>
          <p className="pill pill--ok">{ROLE_LABELS[user.role] || user.role}</p>
        </article>
      </div>

      <div className="hero-actions">
        {user.role === 'job_seeker' && (
          <Link className="button" to="/dashboard">
            Open dashboard
          </Link>
        )}
        {user.role === 'employer' && (
          <Link className="button" to="/employer/dashboard">
            Open dashboard
          </Link>
        )}
        {user.role === 'admin' && (
          <Link className="button" to="/admin">
            Open programme dashboard
          </Link>
        )}
        <button className="button button--ghost" type="button" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </section>
  );
}
