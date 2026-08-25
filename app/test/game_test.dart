import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:hellowordle/game.dart';

const c = TileState.correct;
const p = TileState.present;
const a = TileState.absent;

void main() {
  group('evaluate', () {
    test('all correct', () {
      expect(evaluate('brick', 'brick'), [c, c, c, c, c]);
    });

    test('no letters match', () {
      expect(evaluate('dumpy', 'brick'), [a, a, a, a, a]);
    });

    test('duplicate guess letter, single in answer: green wins, no yellow',
        () {
      // answer "brick" has one K; guess "kayak": k(4) is green and consumes
      // the only K, so k(0) is absent — not yellow.
      expect(evaluate('kayak', 'brick'), [a, a, a, a, c]);
    });

    test('green consumes before yellow for duplicates', () {
      // answer "abbey": guess "bobby": b(2) and y(4) green. Remaining answer
      // letters {a, b, e}: b(0) yellow consumes the last B, so b(3) is absent.
      expect(evaluate('bobby', 'abbey'), [p, a, c, a, c]);
    });

    test('two yellows for two remaining copies, left-to-right', () {
      // answer "abbey": guess "babes": b(2) e(3) green; remaining {a, b, y};
      // b(0) yellow, a(1) yellow, s(4) absent.
      expect(evaluate('babes', 'abbey'), [p, p, c, c, a]);
    });

    test('double letter in guess, single in answer with green', () {
      // answer "shine": guess "sense" -> s green, e yellow? answer letters
      // left after greens (s0, e4): h,i,n. e(1) not among them... careful:
      // greens: s(0)=s ✓, e(4)=e ✓. remaining {h,i,n}. e(1) absent,
      // n(2) present, s(3) absent.
      expect(evaluate('sense', 'shine'), [c, a, p, a, c]);
    });

    test('triple letter guess vs double answer', () {
      // answer "geese": guess "eeeee" -> positions 1,2 green (e at idx 1? no:
      // g-e-e-s-e => greens at 1,2,4; remaining answer letters {g,s};
      // e(0), e(3) absent.
      expect(evaluate('eeeee', 'geese'), [a, c, c, a, c]);
    });
  });

  group('puzzleNumberFor', () {
    test('launch day is puzzle #1', () {
      expect(puzzleNumberFor(DateTime(2026, 8, 25, 15, 30)), 1);
    });

    test('next day is #2', () {
      expect(puzzleNumberFor(DateTime(2026, 8, 26, 0, 1)), 2);
    });

    test('known puzzle number', () {
      // 2027-08-25 is exactly 365 days after launch.
      expect(puzzleNumberFor(DateTime(2027, 8, 25)), 366);
    });
  });

  group('answer selection', () {
    // answers.txt puzzle order starts: widen, rupee, ...
    String answerFor(List<String> answers, int n) =>
        answers[(n - 1) % answers.length];

    test('puzzle #1 (2026-08-25) is "widen", #2 is "rupee"', () async {
      final raw = await File('assets/answers.txt').readAsString();
      final answers = raw
          .split('\n')
          .map((w) => w.trim())
          .where((w) => w.length == 5)
          .toList();
      expect(answerFor(answers, puzzleNumberFor(DateTime(2026, 8, 25))), 'widen');
      expect(answerFor(answers, puzzleNumberFor(DateTime(2026, 8, 26))), 'rupee');
    });
  });

  group('GameState', () {
    test('win flow', () {
      final g = GameState(puzzleNumber: 1, answer: 'brick');
      for (final ch in 'brick'.split('')) {
        g.addLetter(ch);
      }
      g.submit();
      expect(g.status, GameStatus.won);
      expect(g.guesses, ['brick']);
    });

    test('loss after 6 wrong guesses', () {
      final g = GameState(puzzleNumber: 1, answer: 'brick');
      for (var i = 0; i < 6; i++) {
        g.current = 'dumpy';
        g.submit();
      }
      expect(g.status, GameStatus.lost);
    });

    test('keyStates prefers correct over present over absent', () {
      final g = GameState(puzzleNumber: 1, answer: 'brick');
      g.current = 'crick'; // c present@0... c(0) vs b: yellow; rest green
      g.submit();
      final ks = g.keyStates();
      expect(ks['r'], c);
      expect(ks['c'], c); // green at index 3 beats yellow at index 0
      expect(ks['i'], c);
    });
  });
}
