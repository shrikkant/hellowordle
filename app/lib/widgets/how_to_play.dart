import 'package:flutter/material.dart';

import '../game.dart';
import '../theme.dart';
import 'tiles.dart' show tileColor;

void showHowToPlay(BuildContext context, {VoidCallback? onSignInTap}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12))),
    builder: (context) => FractionallySizedBox(
      heightFactor: 0.93,
      child: _HowToPlay(onSignInTap: onSignInTap),
    ),
  );
}

class _HowToPlay extends StatelessWidget {
  const _HowToPlay({this.onSignInTap});
  final VoidCallback? onSignInTap;

  @override
  Widget build(BuildContext context) {
    final body = const TextStyle(fontSize: 16, color: ink, height: 1.35);
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
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              children: [
                const Text('How To Play',
                    style: TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.w800,
                      color: ink,
                    )),
                const SizedBox(height: 4),
                const Text('Guess the word of the day in 6 tries.',
                    style: TextStyle(fontSize: 20, color: ink)),
                const SizedBox(height: 16),
                _bullet('Type any valid 5-letter word and hit ENTER.', body),
                _bullet(
                    'After each guess, the tiles change colour to show how close you are.',
                    body),
                const SizedBox(height: 20),
                const Text('Examples',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold, color: ink)),
                const SizedBox(height: 12),
                _example('tiger', 0, TileState.correct),
                _caption(context, 'T', ' is in the word and in the right place.'),
                const SizedBox(height: 16),
                _example('mango', 2, TileState.present),
                _caption(context, 'N', ' is in the word but in a different spot.'),
                const SizedBox(height: 16),
                _example('chair', 1, TileState.absent),
                _caption(context, 'H', ' is not in the word at all.'),
                const SizedBox(height: 24),
                const Divider(color: emptyBorder),
                const SizedBox(height: 12),
                if (onSignInTap != null)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                            color: correctTeal,
                            borderRadius: BorderRadius.circular(6)),
                        child: const Icon(Icons.leaderboard,
                            color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pop(context);
                            onSignInTap?.call();
                          },
                          child: Text.rich(
                            const TextSpan(children: [
                              TextSpan(
                                text: 'Sign in with Google',
                                style: TextStyle(
                                    color: Color(0xFF346EB1),
                                    decoration: TextDecoration.underline),
                              ),
                              TextSpan(text: ' to link your stats.'),
                            ]),
                            style: body,
                          ),
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 12),
                const Divider(color: emptyBorder),
                const SizedBox(height: 12),
                Text('A new puzzle drops every day at midnight.', style: body),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Widget _bullet(String text, TextStyle style) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('  •  ', style: TextStyle(fontSize: 16, color: ink)),
            Expanded(child: Text(text, style: style)),
          ],
        ),
      );

  static Widget _example(String word, int highlight, TileState state) {
    return Row(
      children: [
        for (var i = 0; i < word.length; i++)
          Padding(
            padding: const EdgeInsets.only(right: 4),
            child: Container(
              width: 34,
              height: 34,
              alignment: Alignment.center,
              decoration: i == highlight
                  ? BoxDecoration(
                      color: tileColor(state),
                      borderRadius: BorderRadius.circular(6))
                  : BoxDecoration(
                      border: Border.all(color: pendingBorder, width: 2),
                      borderRadius: BorderRadius.circular(6)),
              child: Text(
                word[i].toUpperCase(),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: i == highlight ? Colors.white : ink,
                ),
              ),
            ),
          ),
      ],
    );
  }

  static Widget _caption(BuildContext context, String letter, String rest) =>
      Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Text.rich(
          TextSpan(children: [
            TextSpan(
                text: letter,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            TextSpan(text: rest),
          ]),
          style: const TextStyle(fontSize: 16, color: ink),
        ),
      );
}
