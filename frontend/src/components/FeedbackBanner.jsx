export default function FeedbackBanner({ type = 'ok', children }) {
  if (!children) {
    return null;
  }

  return (
    <p className={`banner banner--${type} feedback`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
