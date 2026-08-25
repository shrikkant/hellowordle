// Clean-room word list generation for Wordbaazi.
// Sources: ENABLE dictionary (public domain) + Norvig count_1w frequency list.
// Valid guesses: every 5-letter ENABLE word.
// Answers: the ~2000 most frequent non-plural 5-letter words, shuffled with our own seed.
const fs = require('fs');

const enable = new Set(
  fs.readFileSync('enable1.txt', 'utf8').trim().split('\n')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => /^[a-z]{5}$/.test(w))
);

const freqRank = new Map();
fs.readFileSync('count_1w.txt', 'utf8').trim().split('\n').forEach((line, i) => {
  const word = line.split('\t')[0].trim().toLowerCase();
  if (!freqRank.has(word)) freqRank.set(word, i);
});

const EXCLUDE = new Set(['bitch', 'cunts', 'semen', 'whore', 'slut', 'negro', 'sluts', 'boobs', 'penis', 'porno', 'farts']);

const candidates = [...enable]
  .filter((w) => freqRank.has(w))
  .filter((w) => !(w.endsWith('s') && !w.endsWith('ss'))) // drop plurals, keep glass/press etc.
  .filter((w) => !EXCLUDE.has(w))
  .sort((a, b) => freqRank.get(a) - freqRank.get(b))
  .slice(0, 2000);

// Deterministic shuffle — our own seed & ordering (mulberry32).
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260825);
for (let i = candidates.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
}

fs.writeFileSync('answers.txt', candidates.join('\n') + '\n');
fs.writeFileSync('valid-guesses.txt', [...enable].sort().join('\n') + '\n');
console.log('answers:', candidates.length, 'valid:', enable.size);
console.log('first 10 answers (puzzle order):', candidates.slice(0, 10).join(', '));
