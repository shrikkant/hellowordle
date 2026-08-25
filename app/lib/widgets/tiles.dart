import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../game.dart';
import '../theme.dart';

Color tileColor(TileState s) => switch (s) {
      TileState.correct => correctTeal,
      TileState.present => presentMarigold,
      TileState.absent => absentSlate,
    };

/// A single board tile. When [state] is set and [animate] is true it plays the
/// flip reveal (rotateX, color swap at halfway) after [delayMs].
class FlipTile extends StatefulWidget {
  const FlipTile({
    super.key,
    required this.letter,
    required this.state,
    this.animate = false,
    this.delayMs = 0,
    this.pop = false,
    required this.size,
  });

  final String letter;
  final TileState? state;
  final bool animate;
  final int delayMs;
  final bool pop; // scale-pop when a letter is typed
  final double size;

  @override
  State<FlipTile> createState() => _FlipTileState();
}

class _FlipTileState extends State<FlipTile> with TickerProviderStateMixin {
  late final AnimationController _flip = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 500));
  late final AnimationController _pop = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      lowerBound: 1.0,
      upperBound: 1.1);

  @override
  void initState() {
    super.initState();
    if (widget.state != null && !widget.animate) _flip.value = 1;
    if (widget.state != null && widget.animate) {
      Future.delayed(Duration(milliseconds: widget.delayMs), () {
        if (mounted) _flip.forward();
      });
    }
    if (widget.pop) {
      _pop.forward().then((_) {
        if (mounted) _pop.reverse();
      });
    }
  }

  @override
  void didUpdateWidget(FlipTile old) {
    super.didUpdateWidget(old);
    if (widget.state != null && old.state == null) {
      if (widget.animate) {
        Future.delayed(Duration(milliseconds: widget.delayMs), () {
          if (mounted) _flip.forward();
        });
      } else {
        _flip.value = 1;
      }
    }
    if (widget.state == null) _flip.value = 0;
    if (widget.pop && !old.pop) {
      _pop.forward().then((_) {
        if (mounted) _pop.reverse();
      });
    }
  }

  @override
  void dispose() {
    _flip.dispose();
    _pop.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_flip, _pop]),
      builder: (context, _) {
        final t = _flip.value;
        final revealed = t >= 0.5;
        // 0 -> pi/2 for first half, -pi/2 -> 0 for second half.
        final angle =
            t < 0.5 ? t * math.pi : (1 - t) * math.pi;
        final showState = revealed ? widget.state : null;

        final Color bg;
        final Border? border;
        final Color fg;
        final List<BoxShadow>? shadow;
        if (showState != null) {
          bg = tileColor(showState);
          border = null;
          fg = Colors.white;
          shadow = const [filledTileShadow];
        } else {
          bg = Colors.white;
          border = Border.all(
              color: widget.letter.isEmpty ? emptyBorder : pendingBorder,
              width: 2);
          fg = ink;
          shadow = null;
        }

        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.002)
            ..rotateX(angle)
            ..scaleByDouble(_pop.value, _pop.value, 1, 1),
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              color: bg,
              border: border,
              borderRadius: BorderRadius.circular(tileRadius),
              boxShadow: shadow,
            ),
            alignment: Alignment.center,
            child: Text(
              widget.letter.toUpperCase(),
              style: TextStyle(
                fontSize: widget.size * 0.5,
                fontWeight: FontWeight.bold,
                color: fg,
                height: 1,
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Wraps a row; shakes horizontally whenever [trigger] increments.
class Shake extends StatefulWidget {
  const Shake({super.key, required this.trigger, required this.child});
  final int trigger;
  final Widget child;

  @override
  State<Shake> createState() => _ShakeState();
}

class _ShakeState extends State<Shake> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 500));

  @override
  void didUpdateWidget(Shake old) {
    super.didUpdateWidget(old);
    if (widget.trigger != old.trigger && widget.trigger > 0) {
      _c.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (context, child) {
        final dx = math.sin(_c.value * math.pi * 8) *
            6 *
            (1 - _c.value);
        return Transform.translate(offset: Offset(dx, 0), child: child);
      },
      child: widget.child,
    );
  }
}

/// The 5x6 game board.
class Board extends StatelessWidget {
  const Board({
    super.key,
    required this.game,
    required this.revealedRows,
    required this.animateRow,
    required this.shakeTrigger,
    required this.popCell,
  });

  final GameState game;
  final int revealedRows; // rows whose colors may show
  final int animateRow; // row index that should flip (last submitted), -1 none
  final int shakeTrigger; // increments to shake the current row
  final String popCell; // "row-col" of last typed cell for pop effect

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      final w = math.min(constraints.maxWidth, 350.0);
      final tile = (w - 4 * 5) / 5; // 5px gaps between tiles
      final rows = <Widget>[];
      for (var r = 0; r < 6; r++) {
        final isCurrent =
            r == game.guesses.length && game.status == GameStatus.playing;
        final word = r < game.guesses.length
            ? game.guesses[r]
            : (isCurrent ? game.current : '');
        final eval = r < game.guesses.length ? game.evalRow(r) : null;
        final tiles = <Widget>[];
        for (var c = 0; c < 5; c++) {
          final letter = c < word.length ? word[c] : '';
          tiles.add(Padding(
            padding: const EdgeInsets.all(2.5),
            child: FlipTile(
              key: ValueKey('t$r-$c'),
              letter: letter,
              state: (eval != null && (r < revealedRows || r == animateRow))
                  ? eval[c]
                  : null,
              animate: r == animateRow,
              delayMs: c * 300,
              pop: isCurrent && popCell == '$r-$c',
              size: tile,
            ),
          ));
        }
        Widget row = Row(mainAxisSize: MainAxisSize.min, children: tiles);
        if (isCurrent) {
          row = Shake(trigger: shakeTrigger, child: row);
        }
        rows.add(row);
      }
      return Column(mainAxisSize: MainAxisSize.min, children: rows);
    });
  }
}
