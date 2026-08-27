import 'package:flutter/material.dart';

import '../game.dart';
import '../store.dart';
import '../theme.dart';

const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/// "Aug 26, 2026" (or "Aug 26" without [year]) for puzzle [n].
String puzzleDateLabel(int n, {bool year = true}) {
  final d = puzzleDateFor(n);
  final base = '${_months[d.month - 1]} ${d.day}';
  return year ? '$base, ${d.year}' : base;
}

void showArchiveSheet(
  BuildContext context, {
  required int today,
  required int current,
  required Map<int, PuzzleResult> results,
  required ValueChanged<int> onPick,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12))),
    builder: (context) => FractionallySizedBox(
      heightFactor: 0.93,
      child: _Archive(
          today: today, current: current, results: results, onPick: onPick),
    ),
  );
}

class _Archive extends StatelessWidget {
  const _Archive(
      {required this.today,
      required this.current,
      required this.results,
      required this.onPick});

  final int today;
  final int current;
  final Map<int, PuzzleResult> results;
  final ValueChanged<int> onPick;

  @override
  Widget build(BuildContext context) {
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
          const Center(
            child: Text('ARCHIVE',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                    color: ink)),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              itemCount: today,
              itemBuilder: (context, i) {
                final n = today - i;
                return _row(context, n);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(BuildContext context, int n) {
    final r = results[n];
    final isCurrent = n == current;
    final String statusText;
    final Color statusColor;
    if (r == null) {
      statusText = 'Play';
      statusColor = correctTeal;
    } else if (r.won) {
      statusText = 'Solved in ${r.guesses}';
      statusColor = correctTeal;
    } else {
      statusText = 'Not solved';
      statusColor = const Color(0xFF9AA2AF);
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Material(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: isCurrent
              ? BorderSide(color: correctTeal, width: 2)
              : const BorderSide(color: emptyBorder),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            Navigator.pop(context);
            onPick(n);
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                SizedBox(
                  width: 44,
                  child: Text('#$n',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 15, color: ink)),
                ),
                Expanded(
                  child: Text(
                    n == today ? 'Today' : puzzleDateLabel(n),
                    style:
                        const TextStyle(fontSize: 15, color: Color(0xFF6B7280)),
                  ),
                ),
                Text(statusText,
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: statusColor)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
