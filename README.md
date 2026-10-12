# Clarity

A calm Eisenhower matrix for your laptop and iPhone.

**App:** https://rishabmohandoss.github.io/eisenhower-matrix/

**Project handoff:** https://rishabmohandoss.github.io/eisenhower-matrix/handoff.md

## Use it

Create an account using your email and a password, then sign in with that same account on both devices. Tasks sync automatically through Firebase Authentication and Firestore. In Safari on iPhone, choose **Share → Add to Home Screen**.

Without an account, tasks are saved only in the current browser. On signing in, these tasks are added to your cloud account. Signed-in offline edits are queued and synchronize after reconnecting. The app shell works offline after its first successful online load.

- Four quadrants, task editing, notes, and due dates
- Drag tasks between quadrants on desktop; use the task editor on any device
- Search, completed history, undo, and JSON export
- System/light/dark appearance
- Keyboard shortcuts: `N` for a new task, `/` to search, `Esc` to dismiss dialogs

## Develop

```sh
npm ci
npm run dev
npm run build
```

GitHub Pages publishes the `docs/` directory on `main`. Run `npm run build` and `npm run package:pages`, then commit and push to publish changes. `dist` is a temporary build; `docs` contains the deployed version. Home Screen icons are committed; `node scripts/icons.mjs` regenerates them with Playwright.

## Data and security

Dedicated Firebase project: `rishab-eisenhower`. Each account's records live at `users/{uid}/tasks/{taskId}`. Firestore rules require the matching authenticated user and validate task fields. Public Firebase web configuration is intentionally committed; it grants no database access without authentication. No admin keys or personal tasks are in this repository.

Tasks use separate documents, so concurrent changes to different tasks do not overwrite one another. For concurrent changes to the same task, the last server-accepted edit wins. Deleted tasks are retained as tombstones for undo. Offline persistence stores data in this browser; use a trusted device.

Deploy database rules with:

```sh
firebase deploy --only firestore:rules --project rishab-eisenhower
```

The project uses the Firebase Spark plan with no billing account attached. Free service quotas apply; exceeding quotas can temporarily prevent syncing. Export tasks from Settings to keep an independent backup.

## Design references

- [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple Human Interface Guidelines — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Duolingo design and typography](https://design.duolingo.com/identity/typography)
- [Eisenhower matrix interaction examples](https://www.eisenhower.me/updates/eisenhower-for-iphone/)

The design uses readable system-compatible typography, touch controls, explicit labels alongside color, keyboard focus states, reduced motion support, responsive layouts, and restrained feedback.

## Validation

`node tests/ui.mjs` exercises task creation, editing, moving, completion, undo, guest persistence, search, themes, and mobile layout in Chromium and iPhone-sized WebKit. `APP_URL=https://rishabmohandoss.github.io/eisenhower-matrix/ node tests/sync.mjs` verifies email sign-in, desktop-to-iPhone sync, offline reconciliation, and per-account isolation with disposable test accounts. Both checks clean up after themselves.
