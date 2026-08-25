/// Local persistence: in-progress game per puzzle and lifetime stats.
library;

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'game.dart';

class LocalStats {
  int played = 0;
  int wins = 0;
  int currentStreak = 0;
  int maxStreak = 0;
  List<int> distribution = List.filled(6, 0);
  int lastWonPuzzle = -10;

  int get winPct => played == 0 ? 0 : ((wins / played) * 100).round();

  Map<String, dynamic> toJson() => {
        'played': played,
        'wins': wins,
        'currentStreak': currentStreak,
        'maxStreak': maxStreak,
        'distribution': distribution,
        'lastWonPuzzle': lastWonPuzzle,
      };

  static LocalStats fromJson(Map<String, dynamic> j) {
    final s = LocalStats();
    s.played = j['played'] ?? 0;
    s.wins = j['wins'] ?? 0;
    s.currentStreak = j['currentStreak'] ?? 0;
    s.maxStreak = j['maxStreak'] ?? 0;
    s.distribution = List<int>.from(j['distribution'] ?? List.filled(6, 0));
    s.lastWonPuzzle = j['lastWonPuzzle'] ?? -10;
    return s;
  }
}

class Store {
  Store(this._prefs);
  final SharedPreferences _prefs;

  static Future<Store> load() async =>
      Store(await SharedPreferences.getInstance());

  // ---- in-progress game ----

  void saveGame(GameState g) {
    _prefs.setString(
        'game',
        jsonEncode({
          'puzzle': g.puzzleNumber,
          'guesses': g.guesses,
          'status': g.status.name,
        }));
  }

  /// Restores guesses/status into [g] if a saved game matches its puzzle.
  void restoreInto(GameState g) {
    final raw = _prefs.getString('game');
    if (raw == null) return;
    final j = jsonDecode(raw) as Map<String, dynamic>;
    if (j['puzzle'] != g.puzzleNumber) return;
    g.guesses.addAll(List<String>.from(j['guesses'] ?? []));
    g.status = GameStatus.values
        .firstWhere((s) => s.name == j['status'], orElse: () => GameStatus.playing);
  }

  // ---- stats ----

  LocalStats stats() {
    final raw = _prefs.getString('stats');
    if (raw == null) return LocalStats();
    return LocalStats.fromJson(jsonDecode(raw));
  }

  void recordFinish(GameState g) {
    final s = stats();
    s.played++;
    if (g.status == GameStatus.won) {
      s.wins++;
      s.distribution[g.guesses.length - 1]++;
      s.currentStreak =
          s.lastWonPuzzle == g.puzzleNumber - 1 ? s.currentStreak + 1 : 1;
      if (s.currentStreak > s.maxStreak) s.maxStreak = s.currentStreak;
      s.lastWonPuzzle = g.puzzleNumber;
    } else {
      s.currentStreak = 0;
    }
    _prefs.setString('stats', jsonEncode(s.toJson()));
  }

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
