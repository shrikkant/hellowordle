/// Local persistence: per-puzzle game state and a results map that local
/// stats are computed from (mirrors the web client's storage semantics).
library;

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'game.dart';

class PuzzleResult {
  PuzzleResult({required this.won, this.guesses});
  final bool won;
  final int? guesses; // null when lost

  Map<String, dynamic> toJson() => {'won': won, 'guesses': guesses};
  static PuzzleResult fromJson(Map<String, dynamic> j) =>
      PuzzleResult(won: j['won'] ?? false, guesses: j['guesses']);
}

class LocalStats {
  int played = 0;
  int wins = 0;
  int currentStreak = 0;
  int maxStreak = 0;
  List<int> distribution = List.filled(6, 0);

  int get winPct => played == 0 ? 0 : ((wins / played) * 100).round();

  /// Streaks run over consecutive puzzle numbers; the current streak is the
  /// run of wins ending at the highest played puzzle (archive fills extend it).
  static LocalStats fromResults(Map<int, PuzzleResult> results) {
    final s = LocalStats();
    final numbers = results.keys.toList()..sort();
    var run = 0;
    int? prev;
    for (final n in numbers) {
      final r = results[n]!;
      if (r.won) {
        s.wins++;
        final g = r.guesses;
        if (g != null && g >= 1 && g <= 6) s.distribution[g - 1]++;
        run = (prev == n - 1 && run > 0) ? run + 1 : 1;
      } else {
        run = 0;
      }
      if (run > s.maxStreak) s.maxStreak = run;
      prev = n;
    }
    s.played = numbers.length;
    s.currentStreak = run;
    return s;
  }
}

class Store {
  Store(this._prefs);
  final SharedPreferences _prefs;

  static Future<Store> load() async =>
      Store(await SharedPreferences.getInstance());

  // ---- per-puzzle game state ----

  void saveGame(GameState g) {
    _prefs.setString(
        'game-${g.puzzleNumber}',
        jsonEncode({
          'guesses': g.guesses,
          'status': g.status.name,
        }));
  }

  /// Restores guesses/status into [g] from its puzzle's saved slot, if any.
  void restoreInto(GameState g) {
    final raw = _prefs.getString('game-${g.puzzleNumber}');
    if (raw == null) return;
    final j = jsonDecode(raw) as Map<String, dynamic>;
    g.guesses.addAll(List<String>.from(j['guesses'] ?? []));
    g.status = GameStatus.values
        .firstWhere((s) => s.name == j['status'], orElse: () => GameStatus.playing);
  }

  // ---- results & stats ----

  Map<int, PuzzleResult> results() {
    final raw = _prefs.getString('results');
    if (raw == null) return {};
    final j = jsonDecode(raw) as Map<String, dynamic>;
    return j.map((k, v) => MapEntry(int.parse(k), PuzzleResult.fromJson(v)));
  }

  void recordFinish(GameState g) {
    final all = results();
    if (all.containsKey(g.puzzleNumber)) return; // first result stands
    all[g.puzzleNumber] = PuzzleResult(
      won: g.status == GameStatus.won,
      guesses: g.status == GameStatus.won ? g.guesses.length : null,
    );
    _prefs.setString('results',
        jsonEncode(all.map((k, v) => MapEntry('$k', v.toJson()))));
  }

  LocalStats stats() => LocalStats.fromResults(results());

  // ---- auth/session ----

  String? get token => _prefs.getString('token');
  set token(String? v) =>
      v == null ? _prefs.remove('token') : _prefs.setString('token', v);

  Map<String, dynamic>? get user {
    final raw = _prefs.getString('user');
    return raw == null ? null : jsonDecode(raw) as Map<String, dynamic>;
  }

  set user(Map<String, dynamic>? v) => v == null
      ? _prefs.remove('user')
      : _prefs.setString('user', jsonEncode(v));

  bool get seenHelp => _prefs.getBool('seenHelp') ?? false;
  set seenHelp(bool v) => _prefs.setBool('seenHelp', v);

  bool get highContrast => _prefs.getBool('hc') ?? false;
  set highContrast(bool v) => _prefs.setBool('hc', v);
}
