/// Core Wordbaazi game logic: puzzle-number math, tile evaluation, game state.
library;

enum TileState { correct, present, absent }

/// Wordbaazi epoch: puzzle #1 was 2026-08-25 (local time).
final DateTime baaziEpoch = DateTime(2026, 8, 25);

/// 1-based puzzle number for [now] (local calendar days since the epoch, +1).
int puzzleNumberFor(DateTime now) {
  final today = DateTime(now.year, now.month, now.day);
  // Use UTC-safe difference of calendar dates to avoid DST off-by-one.
  final a = DateTime.utc(today.year, today.month, today.day);
  final b = DateTime.utc(baaziEpoch.year, baaziEpoch.month, baaziEpoch.day);
  return a.difference(b).inDays + 1;
}

/// Evaluate [guess] against [answer]. Greens consume answer letters first,
/// then yellows are assigned left-to-right from remaining letters.
List<TileState> evaluate(String guess, String answer) {
  assert(guess.length == answer.length);
  final n = guess.length;
  final result = List<TileState>.filled(n, TileState.absent);
  final remaining = <String, int>{};
  for (var i = 0; i < n; i++) {
    if (guess[i] == answer[i]) {
      result[i] = TileState.correct;
    } else {
      remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
    }
  }
  for (var i = 0; i < n; i++) {
    if (result[i] == TileState.correct) continue;
    final c = guess[i];
    if ((remaining[c] ?? 0) > 0) {
      result[i] = TileState.present;
      remaining[c] = remaining[c]! - 1;
    }
  }
  return result;
}

enum GameStatus { playing, won, lost }

class GameState {
  GameState({required this.puzzleNumber, required this.answer});

  final int puzzleNumber;
  final String answer;
  final List<String> guesses = [];
  String current = '';
  GameStatus status = GameStatus.playing;

  bool get isOver => status != GameStatus.playing;

  List<TileState> evalRow(int i) => evaluate(guesses[i], answer);

  /// Best-known state per letter for keyboard coloring, considering only the
  /// first [upTo] guesses (defaults to all) so keys color after the reveal.
  Map<String, TileState> keyStates({int? upTo}) {
    final map = <String, TileState>{};
    for (final g in guesses.take(upTo ?? guesses.length)) {
      final ev = evaluate(g, answer);
      for (var i = 0; i < g.length; i++) {
        final c = g[i];
        final s = ev[i];
        final prev = map[c];
        if (prev == TileState.correct) continue;
        if (prev == TileState.present && s == TileState.absent) continue;
        map[c] = s;
      }
    }
    return map;
  }

  void addLetter(String c) {
    if (isOver || current.length >= 5) return;
    current += c;
  }

  void removeLetter() {
    if (isOver || current.isEmpty) return;
    current = current.substring(0, current.length - 1);
  }

  /// Commits [current] as a guess. Caller must have validated it.
  void submit() {
    guesses.add(current);
    if (current == answer) {
      status = GameStatus.won;
    } else if (guesses.length >= 6) {
      status = GameStatus.lost;
    }
    current = '';
  }
}
