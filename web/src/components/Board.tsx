import { useEffect, useState } from 'react';
import type { TileState } from '../game/logic';
import { evaluateGuess } from '../game/logic';

const FLIP_STAGGER = 300;
const FLIP_HALF = 250;

interface RowProps {
  letters: string;
  evaluation: TileState[] | null;
  animateReveal: boolean;
  shake: boolean;
  bounce: boolean;
  onRevealed?: () => void;
}

function Row({ letters, evaluation, animateReveal, shake, bounce, onRevealed }: RowProps) {
  // Per-tile phase: 0 = unrevealed, 1 = flipping in (still uncolored), 2 = revealed (colored)
  const [phases, setPhases] = useState<number[]>(() =>
    evaluation && !animateReveal ? [2, 2, 2, 2, 2] : [0, 0, 0, 0, 0]
  );
  useEffect(() => {
    if (!evaluation || !animateReveal) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 5; i++) {
      timers.push(setTimeout(() => setPhases((p) => p.map((v, j) => (j === i ? 1 : v))), i * FLIP_STAGGER));
      timers.push(setTimeout(() => setPhases((p) => p.map((v, j) => (j === i ? 2 : v))), i * FLIP_STAGGER + FLIP_HALF));
    }
    timers.push(setTimeout(() => onRevealed?.(), 4 * FLIP_STAGGER + 2 * FLIP_HALF));
    return () => timers.forEach(clearTimeout);
  }, [evaluation, animateReveal, onRevealed]);

  const tiles = [];
  for (let i = 0; i < 5; i++) {
    const letter = letters[i] ?? '';
    let cls = 'tile';
    if (evaluation && phases[i] === 2) {
      cls += ` ${evaluation[i]}`;
      if (phases.every((p) => p === 2) && animateReveal) cls += ' flip-out';
      if (bounce) cls += ' win-bounce';
    } else if (evaluation && phases[i] === 1) {
      cls += ' pending flip-in';
    } else if (letter && !evaluation) {
      cls += ' pending';
    }
    const style = bounce ? { animationDelay: `${i * 100}ms` } : undefined;
    tiles.push(
      <div key={i} className={cls} style={style}>
        {letter}
      </div>
    );
  }

  return <div className={`board-row${shake ? ' shake' : ''}`}>{tiles}</div>;
}

interface BoardProps {
  guesses: string[];
  current: string;
  answer: string;
  animateRowIndex: number | null; // row currently being revealed with animation
  shakeCurrentRow: boolean;
  won: boolean;
  onRevealed: () => void;
}

export default function Board({ guesses, current, answer, animateRowIndex, shakeCurrentRow, won, onRevealed }: BoardProps) {
  const rows = [];
  for (let r = 0; r < 6; r++) {
    const isCurrentRow = r === guesses.length;
    const submitted = r < guesses.length;
    rows.push(
      <Row
        key={submitted ? `${r}-${guesses[r]}` : `row-${r}`}
        letters={submitted ? guesses[r] : isCurrentRow ? current : ''}
        evaluation={submitted ? evaluateGuess(guesses[r], answer) : null}
        animateReveal={r === animateRowIndex}
        shake={isCurrentRow && shakeCurrentRow}
        bounce={won && r === guesses.length - 1 && animateRowIndex === null}
        onRevealed={r === animateRowIndex ? onRevealed : undefined}
      />
    );
  }
  return (
    <div className="board-wrap">
      <div className="board">{rows}</div>
    </div>
  );
}
