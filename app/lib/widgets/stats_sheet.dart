import 'package:flutter/material.dart';

import '../theme.dart';

/// Displayable stats, shaped like the server response.
class StatsView {
  const StatsView({
    required this.played,
    required this.winPct,
    required this.currentStreak,
    required this.maxStreak,
    required this.distribution, // index 0 => won in 1
  });

  final int played;
  final int winPct;
  final int currentStreak;
  final int maxStreak;
  final List<int> distribution;
}

void showStatsSheet(BuildContext context,
    {required Future<StatsView> Function() load, int? highlightGuess}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12))),
    builder: (context) => FractionallySizedBox(
      heightFactor: 0.75,
      child: FutureBuilder<StatsView>(
        future: load(),
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(
                child: CircularProgressIndicator(color: absentSlate));
          }
          return _Stats(stats: snap.data!, highlightGuess: highlightGuess);
        },
      ),
    ),
  );
}

class _Stats extends StatelessWidget {
  const _Stats({required this.stats, this.highlightGuess});
  final StatsView stats;
  final int? highlightGuess;

  @override
  Widget build(BuildContext context) {
    final maxCount =
        stats.distribution.fold<int>(0, (m, v) => v > m ? v : m);
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              icon: const Icon(Icons.close, color: ink, size: 26),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(32, 0, 32, 24),
              children: [
                const Center(
                  child: Text('STATISTICS',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                          color: ink)),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _stat('${stats.played}', 'Played'),
                    _stat('${stats.winPct}', 'Win %'),
                    _stat('${stats.currentStreak}', 'Current\nStreak'),
                    _stat('${stats.maxStreak}', 'Max\nStreak'),
                  ],
                ),
                const SizedBox(height: 24),
                const Center(
                  child: Text('GUESS DISTRIBUTION',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                          color: ink)),
                ),
                const SizedBox(height: 12),
                for (var i = 0; i < 6; i++) _bar(i, maxCount),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(String value, String label) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          children: [
            Text(value,
                style: const TextStyle(
                    fontSize: 34, fontWeight: FontWeight.w400, color: ink)),
            Text(label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: ink)),
          ],
        ),
      );

  Widget _bar(int i, int maxCount) {
    final count = stats.distribution[i];
    final frac = maxCount == 0 ? 0.0 : count / maxCount;
    final isToday = highlightGuess != null && highlightGuess == i + 1;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: Row(
        children: [
          SizedBox(
              width: 14,
              child: Text('${i + 1}',
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.bold, color: ink))),
          const SizedBox(width: 4),
          Expanded(
            child: LayoutBuilder(builder: (context, c) {
              final minW = 24.0;
              final w = count == 0
                  ? minW
                  : minW + (c.maxWidth - minW) * frac;
              return Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  width: w,
                  height: 20,
                  color: count == 0
                      ? const Color(0xFF9E9E9E).withValues(alpha: 0.4)
                      : (isToday ? correctTeal : absentSlate),
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 6),
                  child: Text('$count',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold)),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
