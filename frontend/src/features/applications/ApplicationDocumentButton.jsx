import { useState } from 'react';
import { openApplicationDocument } from './services/applicationApi';

export default function ApplicationDocumentButton({ application }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  if (!application?.hasDocument && !application?.cvUrl) {
    return null;
  }

  const onOpen = async () => {
    setOpening(true);
    setError('');
    try {
      await openApplicationDocument(application._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="stack">
      {application.hasDocument ? (
        <button className="button button--ghost" type="button" onClick={onOpen} disabled={opening}>
          {opening ? 'Opening…' : 'View combined PDF'}
        </button>
      ) : (
        <a href={application.cvUrl} target="_blank" rel="noreferrer">
          View CV
        </a>
      )}
      {application.documentOriginalName && (
        <p className="field-hint">{application.documentOriginalName}</p>
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
