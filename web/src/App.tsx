import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnswer, getPuzzleNumber, isValidWord, keyboardStates } from './game/logic';
import type { GameStatus } from './game/logic';
import { getLocalStats, loadGame, recordResult, saveGame } from './game/storage';
import type { Stats } from './game/storage';
import { fetchStats, postGame } from './api';
import { useGoogleAuth } from './useGoogleAuth';
import Header from './components/Header';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import HowToPlay from './components/HowToPlay';
import StatsPanel from './components/StatsPanel';
import Modal from './components/Modal';

const WIN_TOASTS = ['Chha gaye!', 'Zabardast!', 'Kya baat hai!', 'Shabash!', 'Badhiya!', 'Bach gaye!'];

let toastId = 0;

export default function App() {
  const puzzleNumber = useMemo(() => getPuzzleNumber(), []);
  const answer = useMemo(() => getAnswer(puzzleNumber), [puzzleNumber]);

  const saved = useMemo(() => loadGame(puzzleNumber), [puzzleNumber]);
  const [guesses, setGuesses] = useState<string[]>(saved?.guesses ?? []);
  const [status, setStatus] = useState<GameStatus>(saved?.status ?? 'playing');
  const [current, setCurrent] = useState('');
  const [animateRowIndex, setAnimateRowIndex] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem('hw-seen'));
  const [showStats, setShowStats] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [serverStats, setServerStats] = useState<Stats | null>(null);
  const [justWon, setJustWon] = useState(false);

  const toast = useCallback((text: string, duration = 1500) => {
    const id = ++toastId;
    setToasts((t) => [{ id, text }, ...t]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const { user, configured, renderButton, signOut } = useGoogleAuth(toast);

  useEffect(() => {
    localStorage.setItem('hw-seen', '1');
  }, []);

  // Load server stats when signed in and stats visible
  useEffect(() => {
    if (user && showStats) {
      fetchStats().then(setServerStats).catch(() => setServerStats(null));
    }
  }, [user, showStats]);

  const finishGame = useCallback(
    (finalGuesses: string[], won: boolean) => {
      const newStatus: GameStatus = won ? 'won' : 'lost';
      setStatus(newStatus);
      saveGame({ puzzleNumber, guesses: finalGuesses, status: newStatus });
      recordResult(puzzleNumber, won, won ? finalGuesses.length : null);
      if (won) {
        setJustWon(true);
        toast(WIN_TOASTS[finalGuesses.length - 1], 2000);
      } else {
        toast(answer.toUpperCase(), 3500);
      }
      if (user) {
        postGame(puzzleNumber, won, won ? finalGuesses.length : null, finalGuesses).catch(() => {});
      }
      setTimeout(() => setShowStats(true), 1500);
    },
    [puzzleNumber, answer, user, toast]
  );

  const onRevealed = useCallback(() => {
    setAnimateRowIndex(null);
    const last = guesses[guesses.length - 1];
    if (last === answer) {
      finishGame(guesses, true);
    } else if (guesses.length === 6) {
      finishGame(guesses, false);
    } else {
      saveGame({ puzzleNumber, guesses, status: 'playing' });
    }
  }, [guesses, answer, finishGame, puzzleNumber]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== 'playing' || animateRowIndex !== null) return;
      if (key === 'Enter') {
        if (current.length < 5) {
          toast('Not enough letters');
          setShake(true);
          setTimeout(() => setShake(false), 650);
          return;
        }
        if (!isValidWord(current)) {
          toast('Not in word list');
          setShake(true);
          setTimeout(() => setShake(false), 650);
          return;
        }
        setAnimateRowIndex(guesses.length);
        setGuesses([...guesses, current.toLowerCase()]);
        setCurrent('');
      } else if (key === 'Backspace') {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(key)) {
        setCurrent((c) => (c.length < 5 ? c + key.toLowerCase() : c));
      }
    },
    [status, animateRowIndex, current, guesses, toast]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (showHelp || showStats || showAccount) return;
      onKey(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey, showHelp, showStats, showAccount]);

  const kbStates = useMemo(
    () => keyboardStates(animateRowIndex !== null ? guesses.slice(0, -1) : guesses, answer),
    [guesses, answer, animateRowIndex]
  );

  const openSignIn = () => {
    setShowHelp(false);
    setShowStats(false);
    setShowAccount(true);
  };

  const stats = user && serverStats ? serverStats : getLocalStats();
  const todayWin = status === 'won' ? guesses.length : null;

  return (
    <div className="app">
      <Header user={user} onStats={() => setShowStats(true)} onHelp={() => setShowHelp(true)} onAccount={() => setShowAccount(true)} />
      <Board
        guesses={guesses}
        current={current}
        answer={answer}
        animateRowIndex={animateRowIndex}
        shakeCurrentRow={shake}
        won={justWon}
        onRevealed={onRevealed}
      />
      <Keyboard states={kbStates} onKey={onKey} />

      <div className="toast-wrap">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            {t.text}
          </div>
        ))}
      </div>

      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} signedIn={!!user} onSignIn={openSignIn} />}
      {showStats && (
        <StatsPanel
          stats={stats}
          user={user}
          highlightGuess={todayWin}
          onClose={() => setShowStats(false)}
          onSignIn={openSignIn}
          onSignOut={() => {
            signOut();
            setServerStats(null);
          }}
        />
      )}
      {showAccount && (
        <Modal onClose={() => setShowAccount(false)}>
          <div className="stats">
            <h2>Account</h2>
            {user ? (
              <div className="signin-cta">
                <img className="avatar" src={user.picture} alt="" style={{ width: 56, height: 56 }} referrerPolicy="no-referrer" />
                <span>
                  Signed in as <b>{user.name}</b>
                </span>
                <span style={{ color: 'var(--gray)', fontSize: 13 }}>{user.email}</span>
                <button
                  className="link-btn"
                  onClick={() => {
                    signOut();
                    setServerStats(null);
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : configured ? (
              <div className="signin-cta">
                <span>Sign in with Google to save your stats across devices.</span>
                <div ref={renderButton} />
              </div>
            ) : (
              <div className="signin-cta">
                <span>
                  Google Sign-In isn’t configured yet. Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>web/.env</code> — see the
                  README.
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
