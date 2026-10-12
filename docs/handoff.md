# Clarity — project handoff

## Live project

- App: <https://rishabmohandoss.github.io/eisenhower-matrix/>
- Source repository: <https://github.com/rishabmohandoss/eisenhower-matrix>
- Firebase project: `rishab-eisenhower`
- Firebase console: <https://console.firebase.google.com/project/rishab-eisenhower/overview>
- Hosting: GitHub Pages, branch `main`, folder `/docs`

The app is deployed and verified on desktop Chromium and iPhone-sized WebKit. Email/password sign-in is enabled. Live checks verified account creation and sign-in, desktop-to-phone synchronization, offline edits syncing after reconnect, and rejection of cross-account and signed-out Firestore reads. Temporary test users and test records are removed by the sync test.

## What it does

Four-quadrant Eisenhower matrix with task notes and due dates; edit, complete, restore, soft-delete and undo; drag tasks between quadrants on desktop; search; completed view; JSON export; system/light/dark appearance; keyboard shortcuts (`N` to add, `/` to search); responsive iPhone layout and Home Screen install support.

Signed-in task documents sync through Firestore and persist locally for offline access. Without an account, tasks stay in that browser's local storage. Signing in migrates local tasks to the account. Each task is a separate document, so updates to different tasks sync independently; simultaneous edits to the same task use last accepted write.

## Architecture and important files

- `index.html`, `src.js`, `style.css`: buildless Vite web app and UI.
- `firebase-config.json`: public Firebase web app configuration. Its API key identifies the client project; it is not a privileged server credential. Never add service account keys, admin tokens, or user task exports to Git.
- `firestore.rules`: authenticated per-user access rules and task field validation. Documents are stored under `users/{uid}/tasks/{taskId}`.
- `firebase.json`: Firebase CLI configuration for Firestore rules.
- `scripts/build.mjs`: Vite build, service worker generation, and `dist/.nojekyll`.
- `scripts/package-pages.mjs`: copies the production build from `dist/` into the published `docs/` folder.
- `docs/`: currently published GitHub Pages artifact. Commit it with source updates.
- `public/manifest.webmanifest`, `public/icon*.png`: install metadata and icons.
- `tests/ui.mjs`: Chromium and iPhone-sized WebKit behavior/layout test.
- `tests/offline.mjs`: production app shell and local task behavior while offline.
- `tests/sync.mjs`: live auth, cross-device/offline sync, and data isolation test. It creates disposable test accounts and deletes them when finished.

## Local development and release

Requirements: Node.js 22 or newer, npm, and a trusted checkout of this repository.

```sh
npm ci
npm run dev -- --port 5179
```

Build and publish to GitHub Pages:

```sh
npm run build
npm run package:pages
git add docs
# Commit source changes and docs together, then push main.
```

Pages is configured to serve `main:/docs`; the generated files are checked into Git so publishing does not require a GitHub Actions workflow. GitHub Pages runs a build/deploy workflow after a push. Check its status in the repository's Actions tab. Confirm the public URL returns HTTP 200 after a deployment.

## Verification

For local UI checks, start the dev server on port 5179 in one terminal and run in another:

```sh
node tests/ui.mjs
```

For the production offline check, build, package Pages, start Vite preview on port 5180, then run:

```sh
node tests/offline.mjs
```

For the cloud test against the live deployment:

```sh
APP_URL=https://rishabmohandoss.github.io/eisenhower-matrix/ node tests/sync.mjs
```

The cloud test requires working internet and email/password authentication. It uses random disposable test accounts. If interrupted before cleanup, inspect Firebase Authentication and Firestore for accounts beginning `clarity-test-` / `other-clarity-test-` and remove only those test records.

## Firebase operations

Firebase Authentication email/password sign-in and the default Firestore database are enabled. Firestore uses `nam5`. The app's authorized web domains include GitHub Pages and localhost. The project is on the Firebase Spark plan with no billing account; quota limits can pause cloud operations if exceeded.

Deploy changed Firestore rules from the repository root with the Firebase CLI authenticated to the project:

```sh
firebase deploy --only firestore:rules --project rishab-eisenhower
```

Review rules before changing them. Never add a public read rule: each user's tasks must remain restricted to the matching authenticated UID. Firebase web settings are visible to site visitors by design; security is enforced by Authentication and Firestore rules.

## User guidance

Open the live link on iPhone in Safari and select **Share → Add to Home Screen**. Use the same email account on the phone and laptop for cloud sync. Settings offers JSON export as an independent backup. Local browser data and Firestore's offline cache reside on the device, so use a trusted device and sign out before handing it to someone else.
