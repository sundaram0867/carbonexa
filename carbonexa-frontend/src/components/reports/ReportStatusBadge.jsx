const statusStyles = {
  Approved: { background: '#dcfce7', color: '#16a34a' },
  'In Review': { background: '#fef3c7', color: '#d97706' },
  Draft: { background: '#fae8ff', color: '#9333ea' },
  'Pending Review': { background: '#fff7ed', color: '#c2410c' },
  Rejected: { background: '#fee2e2', color: '#dc2626' },
};

function ReportStatusBadge({ status }) {
  const colors = statusStyles[status] || { background: '#f1f5f9', color: '#475569' };
  return (
    <span
      style={{ ...colors, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}
      aria-label={`Report status: ${status}`}
    >
      {status}
    </span>
  );
}

export default ReportStatusBadge;
