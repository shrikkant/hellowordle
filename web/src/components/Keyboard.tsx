import type { TileState } from '../game/logic';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

interface KeyboardProps {
  states: Record<string, TileState>;
  onKey: (key: string) => void;
}

export default function Keyboard({ states, onKey }: KeyboardProps) {
  const key = (ch: string) => (
    <button
      key={ch}
      className={`key${states[ch] ? ` ${states[ch]}` : ''}`}
      onClick={() => onKey(ch)}
      aria-label={ch}
    >
      {ch}
    </button>
  );

  return (
    <div className="keyboard">
      <div className="kb-row">{ROWS[0].split('').map(key)}</div>
      <div className="kb-row">
        <div className="spacer" />
        {ROWS[1].split('').map(key)}
        <div className="spacer" />
      </div>
      <div className="kb-row">
        <button className="key wide" onClick={() => onKey('Enter')}>
          enter
        </button>
        {ROWS[2].split('').map(key)}
        <button className="key wide" onClick={() => onKey('Backspace')} aria-label="backspace">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M21 5H8l-5 7 5 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
            <path d="m11 9 6 6M17 9l-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
