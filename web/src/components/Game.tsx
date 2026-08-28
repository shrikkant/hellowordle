'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAnswer, getPuzzleDate, getPuzzleNumber, isValidWord, keyboardStates } from '../game/logic';
import type { GameStatus } from '../game/logic';
import { getLocalStats, getResults, loadGame, recordResult, saveGame } from '../game/storage';
import type { SavedGame, Stats } from '../game/storage';
import { fetchGame, fetchStats, postGame } from '../api';
import { gtmEvent } from '../gtm';
import { useGoogleAuth } from '../useGoogleAuth';
import Header from './Header';
import Board from './Board';
import Keyboard from './Keyboard';
import HowToPlay from './HowToPlay';
import StatsPanel from './StatsPanel';
import Archive from './Archive';
import Modal from './Modal';

const WIN_TOASTS = ['Chha gaye!', 'Zabardast!', 'Kya baat hai!', 'Shabash!', 'Badhiya!', 'Bach gaye!'];

let toastId = 0;

export default function Game() {
  const today = useMemo(() => getPuzzleNumber(), []);
  const [puzzleNumber, setPuzzleNumber] = useState(today);
  const answer = useMemo(() => getAnswer(puzzleNumber), [puzzleNumber]);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [current, setCurrent] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [animateRowIndex, setAnimateRowIndex] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [serverStats, setServerStats] = useState<Stats | null>(null);
  const [justWon, setJustWon] = useState(false);
  // Set while a finished game is being replayed row by row; holds the full saved game.
  const [replay, setReplay] = useState<SavedGame | null>(null);

  // Latest board state, readable from async callbacks without re-running effects.
  const guessesRef = useRef<string[]>([]);
  guessesRef.current = guesses;

  const toast = useCallback((text: string, duration = 1500) => {
    const id = ++toastId;
    setToasts((t) => [{ id, text }, ...t]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const { user, configured, renderButton, signOut } = useGoogleAuth(toast);

  // Re-run a finished game's guesses in order, with the usual flip reveal per row.
  const startReplay = useCallback((saved: SavedGame) => {
    if (saved.guesses.length === 0) {
      setGuesses([]);
      setStatus(saved.status);
      return;
    }
    setReplay(saved);
    setStatus('playing');
    setCurrent('');
    setJustWon(false);
    setGuesses(saved.guesses.slice(0, 1));
    setAnimateRowIndex(0);
  }, []);

  // Hydrate persisted state after mount (SSR renders the empty board).
  useEffect(() => {
    const saved = loadGame(today);
    if (saved) {
      if (saved.status !== 'playing') {
        startReplay(saved);
      } else {
        setGuesses(saved.guesses);
        setStatus(saved.status);
      }
    }
    if (!localStorage.getItem('hw-seen')) setShowHelp(true);
    localStorage.setItem('hw-seen', '1');
    setHighContrast(localStorage.getItem('wb-hc') === '1');
  }, [today, startReplay]);

  // Signed in with no local copy of this puzzle: pull a finished game from the
  // server (played on another device or before storage was cleared) and replay it.
  useEffect(() => {
    if (!user || loadGame(puzzleNumber)) return;
    let cancelled = false;
    fetchGame(puzzleNumber)
      .then((game) => {
        if (cancelled || !game.found || game.board.length === 0) return;
        // Don't clobber a game the user started while the fetch was in flight.
        if (guessesRef.current.length > 0) return;
        const saved: SavedGame = {
          puzzleNumber,
          guesses: game.board,
          status: game.won ? 'won' : 'lost',
        };
        saveGame(saved);
        recordResult(puzzleNumber, game.won, game.guesses);
        startReplay(saved);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, puzzleNumber, startReplay]);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('wb-hc', highContrast ? '1' : '0');
  }, [highContrast]);

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
      gtmEvent('game_complete', {
        puzzle_number: puzzleNumber,
        won,
        guesses: won ? finalGuesses.length : 6,
        signed_in: !!user,
      });
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
    if (replay) {
      const next = guesses.length;
      if (next < replay.guesses.length) {
        setGuesses(replay.guesses.slice(0, next + 1));
        setAnimateRowIndex(next);
      } else {
        // Replay finished: restore the recorded outcome without re-saving or re-posting.
        setAnimateRowIndex(null);
        setStatus(replay.status);
        if (replay.status === 'won') setJustWon(true);
        else toast(answer.toUpperCase(), 3500);
        setReplay(null);
      }
      return;
    }
    setAnimateRowIndex(null);
    const last = guesses[guesses.length - 1];
    if (last === answer) {
      finishGame(guesses, true);
    } else if (guesses.length === 6) {
      finishGame(guesses, false);
    } else {
      saveGame({ puzzleNumber, guesses, status: 'playing' });
    }
  }, [replay, guesses, answer, finishGame, puzzleNumber, toast]);

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
      if (showHelp || showStats || showAccount || showSettings || showArchive) return;
      onKey(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey, showHelp, showStats, showAccount, showSettings, showArchive]);

  const kbStates = useMemo(
    () => keyboardStates(animateRowIndex !== null ? guesses.slice(0, -1) : guesses, answer),
    [guesses, answer, animateRowIndex]
  );

  const openSignIn = () => {
    setShowHelp(false);
    setShowStats(false);
    setShowAccount(true);
  };

  const switchPuzzle = useCallback(
    (n: number) => {
      if (animateRowIndex !== null) return; // don't switch mid-reveal
      const saved = loadGame(n);
      setPuzzleNumber(n);
      setCurrent('');
      setJustWon(false);
      setShowArchive(false);
      if (saved && saved.status !== 'playing') {
        startReplay(saved);
      } else {
        setGuesses(saved?.guesses ?? []);
        setStatus(saved?.status ?? 'playing');
      }
    },
    [animateRowIndex, startReplay]
  );

  const stats = user && serverStats ? serverStats : getLocalStats();
  const todayWin = status === 'won' ? guesses.length : null;

  return (
    <>
    <div className="app">
      <Header
        user={user}
        onArchive={() => setShowArchive(true)}
        onStats={() => setShowStats(true)}
        onHelp={() => setShowHelp(true)}
        onSettings={() => setShowSettings(true)}
        onAccount={() => setShowAccount(true)}
      />
      {puzzleNumber !== today && (
        <div className="archive-banner">
          <span>
            Archive · Puzzle #{puzzleNumber} ·{' '}
            {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(getPuzzleDate(puzzleNumber))}
          </span>
          <button className="link-btn" onClick={() => switchPuzzle(today)}>
            Back to today
          </button>
        </div>
      )}
      <Board
        key={puzzleNumber}
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

      {showArchive && (
        <Archive
          today={today}
          current={puzzleNumber}
          results={getResults()}
          onPick={switchPuzzle}
          onClose={() => setShowArchive(false)}
        />
      )}
      {showHelp && (
        <HowToPlay
          onClose={() => setShowHelp(false)}
          signedIn={!!user}
          configured={configured}
          renderButton={renderButton}
          onSignIn={openSignIn}
        />
      )}
      {showStats && (
        <StatsPanel
          stats={stats}
          user={user}
          highlightGuess={todayWin}
          onClose={() => setShowStats(false)}
          configured={configured}
          renderButton={renderButton}
          onSignIn={openSignIn}
          onSignOut={() => {
            signOut();
            setServerStats(null);
          }}
        />
      )}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)}>
          <div className="stats">
            <h2>Settings</h2>
            <div className="settings-row">
              <div>
                <div className="title">High contrast mode</div>
                <div className="desc">For improved colour vision — orange and blue tiles instead of teal and gold.</div>
              </div>
              <button
                className={`switch${highContrast ? ' on' : ''}`}
                role="switch"
                aria-checked={highContrast}
                aria-label="High contrast mode"
                onClick={() => setHighContrast((v) => !v)}
              />
            </div>
          </div>
        </Modal>
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
                  Google Sign-In isn’t configured yet. Set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in{' '}
                  <code>web/.env</code> — see the README.
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
    </>
  );
}
