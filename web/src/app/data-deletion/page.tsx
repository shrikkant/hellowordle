import type { Metadata } from 'next';
import Link from 'next/link';
import SeoPage from '../../components/SeoPage';
import DeletionForm from '../../components/DeletionForm';

export const metadata: Metadata = {
  title: 'Delete Your Data | Wordbaazi',
  description:
    'Request deletion of your Wordbaazi account and all game data linked to it. No sign-in needed — just tell us the email address you play with.',
  alternates: { canonical: 'https://wordbaazi.com/data-deletion' },
};

export default function Page() {
  return (
    <SeoPage>
      <h1>Delete Your Data</h1>
      <p>
        You can ask us to delete your Wordbaazi account and everything linked to it at any time. You do not need to be
        signed in, and you do not need the app installed — just give us the email address you play with.
      </p>

      <h2>What Gets Deleted</h2>
      <p>
        We delete your account record (the Google account identifier, name, email address, and profile picture we
        stored) and every game result linked to it — puzzle numbers, whether you solved them, and your guesses. Nothing
        connected to your account is kept, and there is no archived copy.
      </p>
      <p>
        Statistics saved only on your own device are not covered by this request, because we never receive them. Clear
        them by clearing this site&rsquo;s browser data, or by uninstalling the app.
      </p>

      <h2>Request Deletion</h2>
      <DeletionForm />

      <h2>What Happens Next</h2>
      <p>
        Requests are handled manually, so allow a few days. We will email you at the address you give us once the
        deletion is done. If you play again afterwards and sign in, a fresh account is created — deletion does not block
        you from coming back.
      </p>
      <p>
        See our <Link href="/privacy">privacy policy</Link> for what we collect in the first place, or{' '}
        <Link href="/">go back to today&rsquo;s puzzle</Link>.
      </p>
    </SeoPage>
  );
}
