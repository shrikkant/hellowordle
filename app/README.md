# Wordbaazi — Flutter app

Wordbaazi, a daily word-guessing game, for iOS/Android. Plays fully
offline/signed-out; sign in with Google to store stats on the Wordbaazi server.

## Run

```sh
cd app
flutter pub get
flutter run                                   # uses http://localhost:3000
flutter run --dart-define=API_BASE=https://your-server.example.com
```

`API_BASE` points at the NestJS server (see `../server`). On a physical device,
`localhost` won't reach your machine — use your LAN IP
(e.g. `--dart-define=API_BASE=http://192.168.1.10:3000`). On the Android
emulator use `http://10.0.2.2:3000`.

## Google Sign-In setup

The game works without this; sign-in shows a friendly error until configured.

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create OAuth client IDs:
   - **Web** client ID — set this as `GOOGLE_CLIENT_ID` on the server (it is
     the audience the server verifies ID tokens against).
   - **iOS** client ID (bundle id `com.hellowordle.hellowordle`).
   - **Android** client ID (package `com.hellowordle.hellowordle` + your
     debug/release SHA-1: `cd android && ./gradlew signingReport`).
2. iOS: add the **reversed client ID** (from the iOS client's plist) as a URL
   scheme in `ios/Runner/Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array><dict>
     <key>CFBundleURLSchemes</key>
     <array><string>com.googleusercontent.apps.YOUR-IOS-CLIENT-ID</string></array>
   </dict></array>
   ```
   and add `GIDClientID` (the iOS client ID) plus `GIDServerClientID` (the web
   client ID, so `idToken` is minted for the server's audience):
   ```xml
   <key>GIDClientID</key><string>YOUR_IOS_CLIENT_ID.apps.googleusercontent.com</string>
   <key>GIDServerClientID</key><string>YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
   ```
3. Android: no code change needed — google_sign_in reads the Android client
   from the console by package+SHA-1. Pass the web client ID as the server
   audience by adding to `android/app/src/main/res/values/strings.xml` if you
   use `serverClientId`, or rely on the default configuration.

## Tests

```sh
flutter test      # game logic: tile evaluation (duplicate letters), date math
flutter analyze
```

## Structure

- `lib/game.dart` — puzzle-number math, tile evaluation, game state
- `lib/store.dart` — shared_preferences persistence (game-in-progress, stats, session)
- `lib/api.dart` — Google sign-in + server client
- `lib/widgets/` — board tiles (flip/pop/shake), keyboard, How-To-Play, stats sheet
- `assets/` — answer + valid-guess word lists (embedded, from `../shared`;
  clean-room lists generated from the public-domain ENABLE dictionary)
