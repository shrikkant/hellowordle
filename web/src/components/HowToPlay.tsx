import Modal from './Modal';

function ExampleRow({ word, highlight, state }: { word: string; highlight: number; state: 'correct' | 'present' | 'absent' }) {
  return (
    <div className="example-row">
      {word.split('').map((ch, i) => (
        <div key={i} className={`example-tile${i === highlight ? ` ${state}` : ''}`}>
          {ch}
        </div>
      ))}
    </div>
  );
}

interface HowToPlayProps {
  onClose: () => void;
  signedIn: boolean;
  configured: boolean;
  renderButton: (el: HTMLElement | null) => void;
  onSignIn: () => void; // fallback when Google Sign-In isn't configured
}

export default function HowToPlay({ onClose, signedIn, configured, renderButton, onSignIn }: HowToPlayProps) {
  return (
    <Modal onClose={onClose}>
      <div className="htp">
        <h1>How To Play</h1>
        <p className="subtitle">Guess the word of the day in 6 tries.</p>
        <ul>
          <li>Type any valid 5-letter word and hit ENTER.</li>
          <li>After each guess, the tiles change colour to show how close you are.</li>
        </ul>
        <h2>Examples</h2>
        <div className="example">
          <ExampleRow word="tiger" highlight={0} state="correct" />
          <p>
            <b>T</b> is in the word and in the right place.
          </p>
        </div>
        <div className="example">
          <ExampleRow word="mango" highlight={2} state="present" />
          <p>
            <b>N</b> is in the word but in a different spot.
          </p>
        </div>
        <div className="example">
          <ExampleRow word="chair" highlight={1} state="absent" />
          <p>
            <b>H</b> is not in the word at all.
          </p>
        </div>
        {!signedIn && (
          <div className="signin-note">
            <div className="signin-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 20V10h3v10H4Zm6.5 0V4h3v16h-3ZM17 20v-7h3v7h-3Z" />
              </svg>
            </div>
            <div className="signin-note-body">
              <span>Link your stats across devices.</span>
              {/* Google renders its own branded button; the link is only a
                  fallback for local builds with no client ID configured. */}
              {configured ? (
                <div ref={renderButton} />
              ) : (
                <button className="link-btn" onClick={onSignIn}>
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        )}
        <p className="footer-note">A new puzzle drops every day at midnight.</p>
      </div>
    </Modal>
  );
}
