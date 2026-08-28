/// Wordbaazi server client + Google sign-in.
library;

import 'dart:convert';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

import 'game.dart';

const apiBase =
    String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:3000');

/// The Web OAuth client ID (same value as the server's GOOGLE_CLIENT_ID).
/// Google mints ID tokens with this as the audience so the server can verify
/// them. Pass at build time: --dart-define=GOOGLE_SERVER_CLIENT_ID=...
const _googleServerClientId = String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class Api {
  /// Runs the Google sign-in flow and exchanges the ID token for an app JWT.
  /// Returns {token, user}. Throws [ApiException] with a readable message.
  static Future<Map<String, dynamic>> signInWithGoogle() async {
    GoogleSignInAccount account;
    if (_googleServerClientId.isEmpty) {
      throw ApiException(
          'This build has no Google client ID. Rebuild with '
          '--dart-define=GOOGLE_SERVER_CLIENT_ID=<web-client-id>');
    }
    try {
      final signIn = GoogleSignIn.instance;
      await signIn.initialize(serverClientId: _googleServerClientId);
      account = await signIn.authenticate(scopeHint: const ['email']);
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled) {
        throw ApiException('Sign-in canceled');
      }
      throw ApiException(
          'Google Sign-In is not configured for this build (${e.code.name}). '
          'See README for setup.');
    } catch (e) {
      throw ApiException('Google Sign-In unavailable: $e');
    }
    final idToken = account.authentication.idToken;
    if (idToken == null) {
      throw ApiException('Google did not return an ID token');
    }
    final res = await http.post(Uri.parse('$apiBase/api/auth/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}));
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException('Server rejected sign-in (${res.statusCode})');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<void> signOutGoogle() async {
    try {
      await GoogleSignIn.instance.signOut();
    } catch (_) {}
  }

  static Future<void> postGame(String token, GameState g) async {
    await http.post(Uri.parse('$apiBase/api/games'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'puzzleNumber': g.puzzleNumber,
          'won': g.status == GameStatus.won,
          'guesses': g.status == GameStatus.won ? g.guesses.length : null,
          'board': g.guesses,
        }));
  }

  /// Server stats, or null on any failure (caller falls back to local).
  static Future<Map<String, dynamic>?> fetchStats(String token) async {
    try {
      final res = await http.get(Uri.parse('$apiBase/api/stats'),
          headers: {'Authorization': 'Bearer $token'});
      if (res.statusCode != 200) return null;
      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }
}
