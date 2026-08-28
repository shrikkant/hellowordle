'use client';

import { useState } from 'react';

type Status = { kind: 'idle' | 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

export default function DeletionForm() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/deletion-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, note }),
      });
      if (!res.ok) {
        setStatus({
          kind: 'error',
          message:
            res.status === 400
              ? 'That does not look like a valid email address. Please check it and try again.'
              : 'Something went wrong submitting your request. Please try again in a moment.',
        });
        return;
      }
      setStatus({ kind: 'sent' });
    } catch {
      setStatus({ kind: 'error', message: 'Could not reach the server. Please check your connection and try again.' });
    }
  }

  if (status.kind === 'sent') {
    return (
      <div className="form-note form-note-ok" role="status">
        <strong>Request received.</strong> We will delete the account for <strong>{email}</strong> and all game data
        linked to it, and email you at that address once it is done. If you do not hear back within 30 days, contact us
        at <a href="mailto:shrikkant@gmail.com">shrikkant@gmail.com</a>.
      </div>
    );
  }

  return (
    <form className="deletion-form" onSubmit={onSubmit}>
      <label htmlFor="email">
        Email address of the account
        <span className="field-hint">The Google address you sign in to Wordbaazi with.</span>
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        placeholder="you@example.com"
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="note">
        Anything else we should know <span className="field-hint">Optional.</span>
      </label>
      <textarea id="note" name="note" rows={4} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />

      {status.kind === 'error' && (
        <p className="form-note form-note-error" role="alert">
          <strong>Not submitted.</strong> {status.message}
        </p>
      )}

      <button type="submit" className="cta-btn" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'Submitting…' : 'Request deletion'}
      </button>
    </form>
  );
}
