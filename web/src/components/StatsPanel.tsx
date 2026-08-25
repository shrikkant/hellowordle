import Modal from './Modal';
import type { Stats, User } from '../game/storage';

interface StatsPanelProps {
  stats: Stats;
  user: User | null;
  highlightGuess: number | null; // today's winning guess count
  onClose: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function StatsPanel({ stats, user, highlightGuess, onClose, onSignIn, onSignOut }: StatsPanelProps) {
  const max = Math.max(1, ...Object.values(stats.distribution));
  return (
    <Modal onClose={onClose}>
      <div className="stats">
        <h2>Statistics</h2>
        <div className="stats-numbers">
          <div className="stat">
            <div className="value">{stats.played}</div>
            <div className="label">Played</div>
          </div>
          <div className="stat">
            <div className="value">{stats.winPct}</div>
            <div className="label">Win %</div>
          </div>
          <div className="stat">
            <div className="value">{stats.currentStreak}</div>
            <div className="label">Current Streak</div>
          </div>
          <div className="stat">
            <div className="value">{stats.maxStreak}</div>
            <div className="label">Max Streak</div>
          </div>
        </div>
        <h2>Guess Distribution</h2>
        <div className="dist">
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const count = stats.distribution[n] ?? 0;
            const pct = Math.max(8, Math.round((count / max) * 100));
            return (
              <div className="dist-row" key={n}>
                <div className="num">{n}</div>
                <div className="dist-bar-track">
                  <div
                    className={`dist-bar${n === highlightGuess ? ' highlight' : ''}`}
                    style={{ width: count ? `${pct}%` : undefined }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {user ? (
          <div className="signed-in-as">
            Signed in as {user.name} ·{' '}
            <button className="link-btn" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="signin-cta">
            <span>Sign in with Google to save your stats.</span>
            <button className="link-btn" onClick={onSignIn}>
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
