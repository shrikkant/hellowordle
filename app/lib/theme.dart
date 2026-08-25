import 'package:flutter/material.dart';

// Wordbaazi "Peacock & Marigold" palette (SPEC.md), with a high-contrast
// (colour-blind friendly) variant: orange/blue instead of teal/gold.
final ValueNotifier<bool> highContrastMode = ValueNotifier(false);

const brandTeal = Color(0xFF0E7C86);
const _teal = brandTeal;
const _marigold = Color(0xFFE8A020);
const _hcOrange = Color(0xFFE5691E);
const _hcBlue = Color(0xFF4F9EE8);

Color get correctTeal => highContrastMode.value ? _hcOrange : _teal;
Color get presentMarigold => highContrastMode.value ? _hcBlue : _marigold;

const absentSlate = Color(0xFF3D4451);
const emptyBorder = Color(0xFFCBD5E1);
const pendingBorder = Color(0xFF94A3B8);
const keyBg = Color(0xFFE2E8F0);
const ink = Color(0xFF1E293B);

const tileRadius = 10.0;
const keyRadius = 8.0;

const filledTileShadow = BoxShadow(
  color: Color(0x2E0F172A), // rgba(15,23,42,0.18)
  offset: Offset(0, 2),
  blurRadius: 6,
);
