import type { ReactNode } from 'react';

export default function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog">
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
