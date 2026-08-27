import Modal from './Modal';
import { getPuzzleDate } from '../game/logic';
import type { PuzzleResult } from '../game/storage';

interface ArchiveProps {
  today: number;
  current: number;
  results: Record<number, PuzzleResult>;
  onPick: (puzzleNumber: number) => void;
  onClose: () => void;
}

const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function Archive({ today, current, results, onPick, onClose }: ArchiveProps) {
  const rows = [];
  for (let n = today; n >= 1; n--) {
    const r = results[n];
    rows.push(
      <button
        key={n}
        className={`archive-row${n === current ? ' current' : ''}`}
        onClick={() => onPick(n)}
      >
        <span className="archive-num">#{n}</span>
        <span className="archive-date">
          {n === today ? 'Today' : fmt.format(getPuzzleDate(n))}
        </span>
        <span className={`archive-status${r ? (r.won ? ' won' : ' lost') : ''}`}>
          {r ? (r.won ? `Solved in ${r.guesses}` : 'Not solved') : 'Play'}
        </span>
      </button>
    );
  }
  return (
    <Modal onClose={onClose}>
      <div className="stats">
        <h2>Archive</h2>
        <div className="archive-list">{rows}</div>
      </div>
    </Modal>
  );
}
