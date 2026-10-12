export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const alertClass = type === 'success' ? 'alert-success' : type === 'info' ? 'alert-info' : 'alert-error';

  return (
    <div className={`alert ${alertClass}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.1rem',
            paddingLeft: '1rem',
          }}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
}
