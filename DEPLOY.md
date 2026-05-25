# AnyMemo deployment guide

Deploy the Vite + React + Supabase memo app in order: **web → desktop (Tauri) → (later) mobile stores**.

**한국어:** [배포.md](./배포.md)

| Stage | Platform | Status |
|-------|----------|--------|
| 1 | Web + PWA (Vercel) | ✅ Live: https://anymemo.vercel.app |
| 2 | Windows / macOS (Tauri v2) | ✅ macOS v0.1.0 [GitHub Release](https://github.com/minbokang/anymemo/releases/tag/v0.1.0) |
| 3 | App Store / Play Store (Capacitor) | ⏸️ Planned later |

### Downloads (v0.1.0)

| OS | Installers |
|----|------------|
| **macOS** (Apple Silicon) | [DMG](https://github.com/minbokang/anymemo/releases/download/v0.1.0/AnyMemo_0.1.0_aarch64.dmg) · [ZIP](https://github.com/minbokang/anymemo/releases/download/v0.1.0/AnyMemo_0.1.0_macos_aarch64.zip) |
| **Windows** | No `.msi`/`.exe` on v0.1.0 yet — [Releases](https://github.com/minbokang/anymemo/releases) · [Build on Windows](#stage-2-desktop-tauri-v2) |

---

## Shared: environment variables

Web and desktop builds embed these values **at build time**.

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public key |

- Local: `.env.local` (not in git)
- Vercel: Project → Settings → Environment Variables
- Tauri: same `.env.local` must exist before `npm run build` / `npm run tauri:build`

In Supabase **Authentication → URL Configuration**, add production URLs (e.g. `https://anymemo.vercel.app`) to Redirect URLs.

---

## Stage 1: Web & PWA (Vercel)

### Verify build

```bash
npm run build
```

Confirm `dist/` contains `index.html`, `assets/`, `registerSW.js`, and `manifest.webmanifest`.

### Deploy

```bash
npx vercel deploy --prod --yes
```

Or push to GitHub `main` for automatic Vercel deployment.

### PWA

- On mobile Safari/Chrome, open the site → **Add to Home Screen**
- The in-app install banner also guides users (app-like use without a store)

### Sharing with users

For web-only use, sharing the URL is enough. The sign-in screen and help point to `https://anymemo.vercel.app`.

---

## Stage 2: Desktop (Tauri v2)

### Prerequisites

1. **Rust** — https://rustup.rs (one-time install)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
   source "$HOME/.cargo/env"   # PATH for current shell
   rustc --version
   ```
   New terminals pick up PATH from `~/.zshrc` after rustup.
2. **Platform tools**
   - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
   - **Windows**: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) + WebView2 (usually included on Windows 11)

Full list: https://v2.tauri.app/start/prerequisites/

### Project layout (already initialized)

- `src-tauri/` — Rust shell, `tauri.conf.json`
- Web assets: `../dist` (Vite build output)
- Dev server: `http://localhost:5173`

### Development

```bash
npm run tauri:dev
```

Starts the Vite dev server and the AnyMemo desktop window. For web-only work, use `npm run dev` as before.

### Production installers

```bash
npm run tauri:build
```

**Output** (`src-tauri/target/release/bundle/`):

| OS | Examples |
|----|----------|
| macOS | `AnyMemo.app` (drag to Applications), `.dmg` (if DMG build fails, use `.app` only) |
| Windows | `.msi`, `.exe` (build on a Windows PC) |

The first build may take **several minutes** while Rust dependencies compile.

If `.dmg` creation fails but `bundle/macos/AnyMemo.app` exists, double-click to run or copy to `/Applications`.

### Refresh icons

After changing `public/favicon.svg`:

```bash
npx tauri icon public/favicon.svg
```

### Distributing installers (without app stores)

Typical flow without App Store / Microsoft Store:

1. **GitHub Releases** (recommended)
   - Create tag `v0.1.0`
   - Upload `.dmg` / `.msi` from `bundle/`
   - Note macOS vs Windows in release notes
2. **Download page**
   - Optional Vercel static `/download` or README links
   - OS buttons → latest Release asset URLs
3. **Sign-in screen** (`PlatformInstallGuide`)
   - Web URL · PWA hints · Mac/Windows downloads · GitHub Releases link
   - Optional direct file URLs in env:
     - `VITE_DOWNLOAD_MAC_DMG` — direct Mac `.dmg` link
     - `VITE_DOWNLOAD_WINDOWS_MSI` — direct Windows `.msi` link
   - Otherwise links fall back to `releases/latest`

### macOS notes

- Unsigned / un-notarized builds may trigger Gatekeeper warnings.
- For production: Apple Developer ID + `codesign` + notarization.

### Windows notes

- A code-signing certificate reduces SmartScreen warnings.

### Bumping version

1. `version` in `src-tauri/tauri.conf.json`
2. (Optional) `version` in `package.json`
3. `npm run tauri:build`, then upload new files to Releases

---

## Stage 3: Mobile stores (Capacitor) — later

Play Store / App Store review, developer accounts, screenshots, etc. come first.

**For now, use PWA (Add to Home Screen)** on iOS/Android.

Example setup (when ready):

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "AnyMemo" "com.anymemo.app" --web-dir=dist
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

After web changes:

```bash
npm run build
npx cap sync
npx cap open android   # or ios
```

---

## Pre-release checklist

1. **Supabase RLS** — `memos` table: users only access their own rows
2. **Auth redirect URLs** — production Vercel URL registered
3. **Migrations** — `npm run supabase:push` if needed
4. **Desktop build** — `npm run tauri:build` succeeds with `.env.local` present
5. **Icons** — run `npx tauri icon public/favicon.svg`, then rebuild

---

## Repository & hosting

- Git: https://github.com/minbokang/anymemo.git
- Web: Vercel (`anymemo.vercel.app`)
- Desktop: publish installers on GitHub Releases (stage 2 above)
