# Building the iOS app (.ipa) — requires a Mac

The iOS app **cannot be built on Windows** — Apple's toolchain (Xcode) only runs on macOS.
Everything is already configured; on a Mac it's a few minutes of work.

## Option A — from the GitHub repo (recommended)
```bash
git clone https://github.com/Mamuthvel/girivalam_mobile_app.git
cd girivalam_mobile_app
npm install
# create .env with the same VITE_SUPABASE_* values (see .env.example)
npm run build
npx cap sync ios
npx cap open ios          # opens Xcode
```

## Option B — from the girivalam-ios-project.zip
The zip contains the `ios/` Xcode project with the web assets already bundled
(`ios/App/App/public`). It still needs the Capacitor Swift packages, so on a Mac:
```bash
# unzip, then from the project root that also has package.json:
npm install
npx cap sync ios
open ios/App/App.xcworkspace
```

## In Xcode
1. Select the **App** target → **Signing & Capabilities** → pick your Apple Developer Team
   (needed for a real device / App Store; the simulator works without one).
2. Bundle identifier is already `com.girivalam.app`.
3. Run on a simulator/device to verify (▶). The UI is identical to the web app.
4. To ship: **Product → Archive**, then **Distribute App → App Store Connect** to upload the `.ipa`.

## Requirements
- macOS with Xcode 15+
- An Apple Developer Program membership ($99/yr) to upload to the App Store
- CocoaPods is **not** required — this project uses Swift Package Manager
