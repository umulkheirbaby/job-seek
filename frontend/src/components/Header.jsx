import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function Header() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand">
          <span className="brand__mark">EW</span>
          EmpoweWithIT
        </NavLink>
        <nav className="site-nav" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
          {user?.role === 'job_seeker' && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/applications">Applications</NavLink>
            </>
          )}
          {user?.role === 'employer' && (
            <>
              <NavLink to="/employer/dashboard">Dashboard</NavLink>
              <NavLink to="/employer/company">Company</NavLink>
              <NavLink to="/employer/jobs">My jobs</NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin" end>
                Dashboard
              </NavLink>
              <NavLink to="/admin/job-seekers">Seekers</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/employers">Employers</NavLink>
              <NavLink to="/admin/jobs">Jobs</NavLink>
              <NavLink to="/admin/applications">Placements</NavLink>
              <NavLink to="/status">Platform status</NavLink>
            </>
          )}
          {user ? (
            <>
              <NavLink to="/account">Account</NavLink>
              <button className="text-button" type="button" onClick={onLogout}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login">Sign in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
