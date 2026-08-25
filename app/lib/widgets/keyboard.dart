import 'package:flutter/material.dart';

import '../game.dart';
import '../theme.dart';
import 'tiles.dart' show tileColor;

class BaaziKeyboard extends StatelessWidget {
  const BaaziKeyboard(
      {super.key, required this.keyStates, required this.onKey});

  final Map<String, TileState> keyStates;

  /// Receives 'a'..'z', 'ENTER' or 'BACK'.
  final void Function(String key) onKey;

  static const _rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _row(_rows[0].split('')),
          _row(_rows[1].split('')),
          _row(['ENTER', ..._rows[2].split(''), 'BACK']),
        ],
      ),
    );
  }

  Widget _row(List<String> keys) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (final k in keys)
          Expanded(
            flex: (k == 'ENTER' || k == 'BACK') ? 15 : 10,
            child: _KeyCap(
              label: k,
              state: k.length == 1 ? keyStates[k] : null,
              onTap: () => onKey(k),
            ),
          ),
      ],
    );
  }
}

class _KeyCap extends StatelessWidget {
  const _KeyCap({required this.label, required this.state, required this.onTap});

  final String label;
  final TileState? state;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bg = state == null ? keyBg : tileColor(state!);
    final fg = state == null ? ink : Colors.white;
    return Padding(
      padding: const EdgeInsets.all(3),
      child: Material(
        color: bg,
        borderRadius: BorderRadius.circular(keyRadius),
        child: InkWell(
          borderRadius: BorderRadius.circular(keyRadius),
          onTap: onTap,
          child: SizedBox(
            height: 58,
            child: Center(
              child: label == 'BACK'
                  ? Icon(Icons.backspace_outlined, size: 22, color: fg)
                  : Text(
                      label.toUpperCase(),
                      style: TextStyle(
                        fontSize: label == 'ENTER' ? 11 : 15,
                        fontWeight: FontWeight.bold,
                        color: fg,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
