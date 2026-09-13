import { useEffect, useState } from 'react';
import { getHealth } from './services/healthApi';

export default function StatusPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const payload = await getHealth();
        if (!cancelled) {
          setResult(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setResult(null);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const health = result?.data;
  const databaseReady = health?.database?.status === 'connected';

  return (
    <section className="page">
      <p className="eyebrow">Monitoring</p>
      <h1>Platform status</h1>
      <p className="lede">
        Live health for the API and MongoDB. Use this page after a deploy to confirm the stack is
        reachable.
      </p>

      {loading && <p className="status-note">Checking the API…</p>}
      {error && (
        <div className="banner banner--error" role="alert">
          Could not reach the API. {error}
        </div>
      )}

      {health && (
        <div className="status-grid">
          <article className="card">
            <p className="card__label">API</p>
            <p className={`pill ${health.status === 'ok' ? 'pill--ok' : 'pill--warn'}`}>
              {health.status === 'ok' ? 'Healthy' : 'Degraded'}
            </p>
            <p>{result.message}</p>
          </article>
          <article className="card">
            <p className="card__label">Database</p>
            <p className={`pill ${databaseReady ? 'pill--ok' : 'pill--warn'}`}>
              {health.database.status}
            </p>
            <p>{health.database.name || 'No database name yet'}</p>
          </article>
          <article className="card">
            <p className="card__label">Service</p>
            <p className="card__value">{health.service}</p>
            <p>Uptime {health.uptimeSeconds}s · {health.environment || 'local'}</p>
          </article>
        </div>
      )}
    </section>
  );
}
