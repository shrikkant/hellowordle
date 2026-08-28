import type { Metadata } from 'next';
import Link from 'next/link';
import SeoPage from '../../components/SeoPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Wordbaazi',
  description:
    'How Wordbaazi handles your data: what we collect, what we store, and how to delete it — for the Wordbaazi website and mobile app.',
  alternates: { canonical: 'https://wordbaazi.com/privacy' },
};

export default function Page() {
  return (
    <SeoPage>
      <h1>Privacy Policy</h1>
      <p>
        <em>Effective 28 August 2026</em>
      </p>
      <p>
        This policy covers the Wordbaazi website (wordbaazi.com) and the Wordbaazi mobile app. Wordbaazi is a free daily
        word-guessing game. We collect as little as possible: you can play the daily puzzle without creating an account at
        all.
      </p>

      <h2>What We Collect</h2>
      <p>
        <strong>If you play without signing in</strong>, your game progress, statistics, and preferences are stored only
        on your own device (in your browser&rsquo;s local storage, or the app&rsquo;s local storage on your phone). They
        never leave it, and we cannot see them.
      </p>
      <p>
        <strong>If you choose to sign in with Google</strong>, we receive and store your Google account identifier, name,
        email address, and profile picture, and we link your game results to that account so your statistics and streaks
        sync across devices. A game result consists of the puzzle number, whether you solved it, and the words you
        guessed. Sign-in is handled by Google; their handling of your data is described in the{' '}
        <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.
      </p>
      <p>
        <strong>On the website</strong>, we use Google Tag Manager for basic, aggregate analytics — page views and game
        events such as a puzzle being completed — to understand how the game is used. The mobile app contains no
        analytics or tracking SDKs.
      </p>

      <h2>What We Don&rsquo;t Do</h2>
      <p>
        We show no ads, and we never sell, rent, or share your personal data with third parties. We don&rsquo;t use your
        email address for marketing. There is nothing in the app or site that profiles you beyond the gameplay described
        above.
      </p>

      <h2>Storage and Security</h2>
      <p>
        Account and game data are stored on our servers and transmitted only over HTTPS. After signing in, your device
        holds a signed session token so you stay logged in; signing out removes it.
      </p>

      <h2>Retention and Deletion</h2>
      <p>
        We keep your account data for as long as you have an account. To delete your account and all game data linked to
        it, use our <Link href="/data-deletion">data deletion request page</Link> — no sign-in needed — or email us at
        the address below. Local data on your own device can be cleared at any time by clearing the site&rsquo;s browser
        data or uninstalling the app.
      </p>

      <h2>Children</h2>
      <p>
        Wordbaazi is a general-audience word game. It shows no ads and requires no account to play. We do not knowingly
        collect personal information from children; the optional Google sign-in is subject to Google&rsquo;s own age
        requirements.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we will update this page and its effective date. Material changes will be noted on this
        page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or deletion requests: <a href="mailto:shrikkant@gmail.com">shrikkant@gmail.com</a>. You can also read
        more <Link href="/english-word-games">about Wordbaazi</Link> or <Link href="/">play today&rsquo;s puzzle</Link>.
      </p>
    </SeoPage>
  );
}
