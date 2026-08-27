import Game from '../components/Game';
import SeoContent from '../components/SeoContent';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Wordbaazi',
  url: 'https://wordbaazi.com/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description:
    'Wordbaazi is a free guess the word game. A new 5-letter English word puzzle drops every day at midnight — solve it in 6 tries and keep your streak alive.',
  inLanguage: 'en',
  genre: 'Word game',
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Game />
      <SeoContent />
    </>
  );
}
