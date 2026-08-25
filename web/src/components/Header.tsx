import type { User } from '../game/storage';

interface HeaderProps {
  user: User | null;
  onStats: () => void;
  onHelp: () => void;
  onAccount: () => void;
}

export default function Header({ user, onStats, onHelp, onAccount }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>
      <div className="header-title">
        Word<span className="brand-accent">baazi</span>
      </div>
      <div className="header-right">
        <button className="icon-btn" aria-label="Statistics" onClick={onStats}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 20V10h3v10H4Zm6.5 0V4h3v16h-3ZM17 20v-7h3v7h-3Z" />
          </svg>
        </button>
        <button className="icon-btn" aria-label="How to play" onClick={onHelp}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.33c-.8.32-.9.92-.9 1.67" />
            <circle cx="12" cy="16.8" r="0.5" fill="currentColor" />
          </svg>
        </button>
        <button className="icon-btn" aria-label="Account" onClick={onAccount}>
          {user ? (
            <img className="avatar" src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20c1.2-3.4 4-5 7.5-5s6.3 1.6 7.5 5" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
