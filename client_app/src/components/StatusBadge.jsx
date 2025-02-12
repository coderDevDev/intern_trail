import React from 'react';

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        }`}
    >
      {isActive ? 'Yes' : 'No'}
    </span>
  );
}

export default StatusBadge; 