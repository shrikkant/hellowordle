import { useCallback, useEffect, useRef, useState } from 'react';
import { signInWithGoogle } from './api';
import type { User } from './game/storage';
import { clearSession, getUser, saveSession } from './game/storage';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

export function useGoogleAuth(onError: (msg: string) => void) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  // Load the persisted session after mount so SSR and hydration agree.
  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const existing = document.querySelector('script[src*="gsi/client"]');
    if (existing) {
      setReady(!!window.google);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  const renderButton = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !ready || !window.google || !CLIENT_ID) return;
      if (!initialized.current) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response: { credential: string }) => {
            try {
              const { token, user: u } = await signInWithGoogle(response.credential);
              saveSession(token, u);
              setUser(u);
            } catch {
              onError('Sign-in failed — is the server running?');
            }
          },
        });
        initialized.current = true;
      }
      el.innerHTML = '';
      window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill' });
    },
    [ready, onError]
  );

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, configured: !!CLIENT_ID, renderButton, signOut };
}
