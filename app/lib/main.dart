import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;

import 'api.dart';
import 'game.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets/archive.dart';
import 'widgets/google_button.dart';
import 'widgets/how_to_play.dart';
import 'widgets/keyboard.dart';
import 'widgets/stats_sheet.dart';
import 'widgets/tiles.dart';

void main() {
  runApp(const WordbaaziApp());
}

class WordbaaziApp extends StatelessWidget {
  const WordbaaziApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Wordbaazi',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.white,
        colorScheme: ColorScheme.fromSeed(seedColor: correctTeal),
        fontFamily: 'Helvetica Neue',
      ),
      home: ValueListenableBuilder<bool>(
        valueListenable: highContrastMode,
        builder: (context, hc, child) => GameScreen(),
      ),
    );
  }
}

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  Store? _store;
  List<String> _answers = [];
  Set<String> _valid = {};
  GameState? _game;
  int _today = 1;

  int _revealedRows = 0;
  int _animateRow = -1;
  int _shakeTrigger = 0;
  String _popCell = '';
  bool _busy = false; // during reveal animation

  static const _winToasts = [
    'Chha gaye!', 'Zabardast!', 'Kya baat hai!', 'Shabash!', 'Badhiya!', 'Bach gaye!'
  ];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final store = await Store.load();
    highContrastMode.value = store.highContrast;
    final answersRaw = await rootBundle.loadString('assets/answers.txt');
    final validRaw = await rootBundle.loadString('assets/valid-guesses.txt');
    final answers = answersRaw
        .split('\n')
        .map((w) => w.trim())
        .where((w) => w.length == 5)
        .toList();
    final valid = validRaw
        .split('\n')
        .map((w) => w.trim())
        .where((w) => w.length == 5)
        .toSet()
      ..addAll(answers);

    final n = puzzleNumberFor(DateTime.now());
    final game = GameState(
        puzzleNumber: n, answer: answers[(n - 1) % answers.length]);
    store.restoreInto(game);

    setState(() {
      _store = store;
      _answers = answers;
      _valid = valid;
      _game = game;
      _today = n;
      _revealedRows = game.guesses.length;
    });

    if (!store.seenHelp) {
      store.seenHelp = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) showHowToPlay(context, onSignInTap: _signIn);
      });
    }
  }

  // ---- archive ----

  void _switchPuzzle(int n) {
    if (_busy || _store == null || _answers.isEmpty) return;
    final game = GameState(
        puzzleNumber: n, answer: _answers[(n - 1) % _answers.length]);
    _store!.restoreInto(game);
    setState(() {
      _game = game;
      _revealedRows = game.guesses.length;
      _animateRow = -1;
      _popCell = '';
    });
  }

  void _showArchive() {
    final g = _game;
    if (g == null || _busy) return;
    showArchiveSheet(
      context,
      today: _today,
      current: g.puzzleNumber,
      results: _store!.results(),
      onPick: _switchPuzzle,
    );
  }

  // ---- input ----

  void _onKey(String key) {
    final g = _game;
    if (g == null || g.isOver || _busy) return;
    setState(() {
      if (key == 'ENTER') {
        _submit();
      } else if (key == 'BACK') {
        g.removeLetter();
      } else {
        final before = g.current.length;
        g.addLetter(key);
        if (g.current.length > before) {
          _popCell = '${g.guesses.length}-${g.current.length - 1}';
        }
      }
    });
  }

  void _submit() {
    final g = _game!;
    if (g.current.length < 5) {
      _shakeTrigger++;
      _toast('Not enough letters');
      return;
    }
    if (!_valid.contains(g.current)) {
      _shakeTrigger++;
      _toast('Not in word list');
      return;
    }
    final row = g.guesses.length;
    g.submit();
    _store!.saveGame(g);
    _animateRow = row;
    _busy = true;
    // Last tile starts at 4*300ms and flips for 500ms.
    Timer(const Duration(milliseconds: 1750), () {
      if (!mounted) return;
      setState(() {
        _revealedRows = g.guesses.length;
        _animateRow = -1;
        _busy = false;
      });
      if (g.isOver) _onGameOver();
    });
  }

  void _onGameOver() {
    final g = _game!;
    _store!.recordFinish(g);
    if (_store!.token != null) {
      Api.postGame(_store!.token!, g).catchError((_) {});
    }
    if (g.status == GameStatus.won) {
      _toast(_winToasts[g.guesses.length - 1]);
    } else {
      _toast(g.answer.toUpperCase(), duration: const Duration(seconds: 3));
    }
    Timer(const Duration(milliseconds: 1500), () {
      if (mounted) _showStats();
    });
  }

  // ---- toast ----

  void _toast(String msg, {Duration duration = const Duration(milliseconds: 1300)}) {
    final overlay = Overlay.of(context);
    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 70,
        left: 0,
        right: 0,
        child: Center(
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: ink,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(msg,
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14)),
            ),
          ),
        ),
      ),
    );
    overlay.insert(entry);
    Timer(duration, () => entry.remove());
  }

  // ---- stats & auth ----

  Future<StatsView> _loadStats() async {
    final store = _store!;
    if (store.token != null) {
      final s = await Api.fetchStats(store.token!);
      if (s != null) {
        final dist = s['distribution'] as Map<String, dynamic>? ?? {};
        return StatsView(
          played: s['played'] ?? 0,
          winPct: s['winPct'] ?? 0,
          currentStreak: s['currentStreak'] ?? 0,
          maxStreak: s['maxStreak'] ?? 0,
          distribution: [for (var i = 1; i <= 6; i++) dist['$i'] ?? 0],
        );
      }
    }
    final l = store.stats();
    return StatsView(
      played: l.played,
      winPct: l.winPct,
      currentStreak: l.currentStreak,
      maxStreak: l.maxStreak,
      distribution: l.distribution,
    );
  }

  void _showStats() {
    final g = _game;
    showStatsSheet(
      context,
      load: _loadStats,
      highlightGuess: (g != null && g.status == GameStatus.won)
          ? g.guesses.length
          : null,
    );
  }

  Future<void> _signIn() async {
    try {
      final res = await Api.signInWithGoogle();
      setState(() {
        _store!.token = res['token'] as String;
        _store!.user = res['user'] as Map<String, dynamic>;
      });
      _toast('Signed in');
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  Future<void> _signOut() async {
    await Api.signOutGoogle();
    setState(() {
      _store!.token = null;
      _store!.user = null;
    });
  }

  void _showSettings() {
    final user = _store?.user;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(12))),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            const Text('Settings',
                style: TextStyle(
                    fontSize: 18, fontWeight: FontWeight.bold, color: ink)),
            if (user != null)
              ListTile(
                leading: _avatar(user, 32),
                title: Text(user['name'] ?? '', style: const TextStyle(color: ink)),
                subtitle: Text(user['email'] ?? ''),
              ),
            ValueListenableBuilder<bool>(
              valueListenable: highContrastMode,
              builder: (context, hc, _) => SwitchListTile(
                value: hc,
                activeThumbColor: Colors.white,
                activeTrackColor: correctTeal,
                title: const Text('High contrast mode',
                    style:
                        TextStyle(color: ink, fontWeight: FontWeight.w600)),
                subtitle: const Text(
                    'For improved colour vision — orange and blue tiles instead of teal and gold.'),
                onChanged: (v) {
                  _store?.highContrast = v;
                  highContrastMode.value = v;
                },
              ),
            ),
            if (user == null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: GoogleSignInButton(onPressed: () {
                  Navigator.pop(context);
                  _signIn();
                }),
              )
            else
              ListTile(
                leading: const Icon(Icons.logout, color: ink),
                title: const Text('Sign out', style: TextStyle(color: ink)),
                onTap: () {
                  Navigator.pop(context);
                  _signOut();
                },
              ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _avatar(Map<String, dynamic> user, double size) {
    final pic = user['picture'] as String?;
    if (pic != null && pic.isNotEmpty) {
      return CircleAvatar(radius: size / 2, backgroundImage: NetworkImage(pic));
    }
    final name = (user['name'] as String? ?? '?');
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: correctTeal,
      child: Text(name.isEmpty ? '?' : name[0].toUpperCase(),
          style: const TextStyle(color: Colors.white)),
    );
  }

  // ---- build ----

  @override
  Widget build(BuildContext context) {
    final g = _game;
    if (g == null || _answers.isEmpty) {
      return const Scaffold(
          body: Center(child: CircularProgressIndicator(color: absentSlate)));
    }
    final user = _store?.user;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: emptyBorder)),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Title centered on the full header width; padded past the
                  // icon clusters and scaled down on narrow screens so the
                  // icons never overlap it.
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 124),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text.rich(
                        TextSpan(
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: ink,
                            letterSpacing: 0.2,
                          ),
                          children: const [
                            TextSpan(text: 'Word'),
                            TextSpan(
                                text: 'baazi',
                                style: TextStyle(color: brandTeal)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(Icons.menu, color: ink),
                        onPressed: _showArchive,
                      ),
                      const Spacer(),
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(Icons.leaderboard_outlined, color: ink),
                        onPressed: _showStats,
                      ),
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(Icons.help_outline, color: ink),
                        onPressed: () =>
                            showHowToPlay(context, onSignInTap: _signIn),
                      ),
                      if (user == null)
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          icon: const Icon(Icons.settings, color: ink),
                          onPressed: _showSettings,
                        )
                      else
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: GestureDetector(
                              onTap: _showSettings, child: _avatar(user, 28)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            if (g.puzzleNumber != _today)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  border: Border(bottom: BorderSide(color: emptyBorder)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Archive · Puzzle #${g.puzzleNumber} · ${puzzleDateLabel(g.puzzleNumber, year: false)}',
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: ink),
                    ),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () => _switchPuzzle(_today),
                      child: Text(
                        'Back to today',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: correctTeal,
                            decoration: TextDecoration.underline,
                            decorationColor: correctTeal),
                      ),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Board(
                    key: ValueKey(g.puzzleNumber),
                    game: g,
                    revealedRows: _revealedRows,
                    animateRow: _animateRow,
                    shakeTrigger: _shakeTrigger,
                    popCell: _popCell,
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: BaaziKeyboard(
                keyStates: g.keyStates(upTo: _revealedRows),
                onKey: _onKey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
