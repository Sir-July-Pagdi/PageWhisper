# PageWhisper features and parity

The HTML app is **PageWhisper Lab**: new features are built and tried here first.
Once a feature feels right, it is ported to the native Android app using the spec below.

## How we work

1. Prototype in the Lab (`index.html`).
2. Write or update the feature's spec in this file (names, ranges, defaults, behavior).
3. Port to Android from the spec, and tick the Android column.

## Status

| Feature | Lab (web) | Android |
|---|---|---|
| Fetch a chapter by link (reader service, direct, proxy) | Done | Planned (OkHttp + Jsoup, no CORS limits) |
| Paste, clipboard, import `.txt`, share-sheet input | Done | Planned |
| Kokoro voices (28) and speed | Done | Planned (sherpa-onnx) |
| Sentence highlight, tap a sentence to jump | Done | Planned |
| Fullscreen reader | Done | Planned (immersive mode) |
| **Touch lock in fullscreen** (hold to unlock) | **Done** | Planned |
| Previous/next chapter, next link detection, auto-next | Done | Planned |
| Novel library with moving bookmarks | Done | Planned |
| Saved chapters | Done | Planned |
| Ambient sounds (9, generated on device) | Done | Planned (port the generators) |
| Keep screen on | Done | Planned (window flag) |
| Background / screen-off playback | Best effort | Planned (foreground service) |
| **Reading style** (fonts, spacing, alignment, themes) | **Done** | Planned |
| Browser fetch for bot-protected sites | Not possible on web | Planned for v1 (WebView as a tool) |
| JSON backup and restore | Not started | Planned (shared schema) |
| **Sleep timer** (timed or end of chapter, with fade-out) | **Done** | Planned |
| **Novel covers** (Library list only) | **Done** | Planned |
| **Brightness in fullscreen** | **Done** (software dimming) | Planned (real window brightness) |
| **Keep screen on while locked** | **Done** | Planned |
| **Flat SVG icons, no emoji** | **Done** | Planned (vector drawables) |
| Pronunciation fixes per novel (names) | Not started | Idea |

---

## Spec: Reading style

Opened from the **Aa** button in the Read toolbar (also works in fullscreen). Changes apply live to the
reader and are saved immediately. A **Reset** button restores the defaults.

### Settings

| Key | Meaning | Range / values | Default |
|---|---|---|---|
| `font` | Typeface | `serif`, `sans`, `mono`, `literata`, `merriweather`, `lora`, `atkinson`, `lexend`, `dyslexic` | `serif` |
| `size` | Text size (px on web, sp on Android) | 14 to 34, step 1 | 19 |
| `line` | Line height multiplier | 1.3 to 2.4, step 0.05 | 1.8 |
| `para` | Space after a paragraph, in em | 0.2 to 2.0, step 0.1 | 1.05 |
| `pad` | Side margins (px / dp) | 0 to 40, step 2 | 4 |
| `ls` | Letter spacing, in em | 0 to 0.12, step 0.01 | 0 |
| `align` | Text alignment | `left`, `justify`, `center` | `left` |
| `weight` | Text weight | 400 (Regular), 700 (Bold) | 400 |
| `hyph` | Hyphenate long words | true / false | false |
| `theme` | Color theme (whole app) | `dark`, `amoled`, `sepia`, `light` | `dark` |
| `hl` | Highlight color | `violet`, `gold`, `green`, `blue`, `pink`, `orange` | `violet` |
| `hlStyle` | Highlight style | `fill`, `underline`, `outline` | `fill` |

Out-of-range or unknown values are clamped or replaced by the default when loading (see `sanitizeReading`).

### Fonts

- System fonts: Serif, Sans, Mono (no download).
- Web fonts (Fontsource, loaded when first chosen, then cached for offline use): Literata, Merriweather, Lora,
  Atkinson Hyperlegible, Lexend, OpenDyslexic. Regular and Bold, Latin plus Latin Extended (so pinyin tone marks render).
- If a font cannot load (offline), a similar system font is used and the panel says so.
- **Android:** bundle these as font resources (all are open-licensed: OFL, plus OpenDyslexic's own open license; check each
  license text before a Play release).

### Themes (colors are shared by both versions)

| Theme | Background | Text | Panel | Accent |
|---|---|---|---|---|
| Dark | `#0e0e16` | `#ecebf5` | `#171722` | `#8b5cf6` |
| AMOLED | `#000000` | `#e8e8f0` | `#0b0b10` | `#8b5cf6` |
| Sepia | `#f4ecd8` | `#4a3b27` | `#ebe0c6` | `#9a5b2e` |
| Light | `#fafafa` | `#1d1d27` | `#ffffff` | `#6d3fe0` |

### Highlight colors (RGB)

violet `139,92,246` · gold `234,179,8` · green `34,197,94` · blue `59,130,246` · pink `236,72,153` · orange `249,115,22`

- `fill`: background at 34% opacity
- `underline`: 3 px underline in the color, no background
- `outline`: 2 px ring in the color plus a 10% background

### Android mapping

| Setting | Compose |
|---|---|
| `font` | `FontFamily` from `res/font` |
| `size` | `TextStyle.fontSize` in `sp` |
| `line` | `lineHeight = fontSize * line` |
| `para` | spacing between paragraphs: `para * fontSize` |
| `pad` | horizontal `padding` |
| `ls` | `letterSpacing` in `em` |
| `align` | `TextAlign.Start` / `Justify` / `Center` |
| `weight` | `FontWeight.Normal` / `Bold` |
| `hyph` | `Hyphens.Auto` (with `LineBreak.Paragraph`) |
| `theme` | Material 3 `ColorScheme` per theme |
| `hl`, `hlStyle` | `SpanStyle` (`background` / `textDecoration` + color) on the active sentence |

Storage: one `DataStore` entry per key above. Backup JSON uses the same key names:

```json
{ "reading": { "font": "literata", "size": 20, "line": 1.8, "para": 1.05, "pad": 4, "ls": 0,
               "align": "left", "weight": 400, "hyph": false, "theme": "dark", "hl": "violet", "hlStyle": "fill" } }
```

### Acceptance checks

- Dragging any slider changes the text immediately, without moving to another screen.
- Choosing an unloaded web font shows "Loading…" then "ready"; offline shows the fallback message.
- Themes recolor the whole app, and the system status bar color matches.
- Reopening the app keeps every setting; Reset restores the table above.
- The highlighted sentence stays readable in all four themes and all three highlight styles.


---

## Spec: Touch lock (fullscreen only)

Stops accidental touches while reading or listening in the fullscreen view (pocket, palm, kids).

### Behavior

- A **lock button** appears in the fullscreen toolbar (between Auto and Exit). It is not shown outside fullscreen.
- **Locked:** every touch is swallowed. The reader, toolbar, player bar and the Reading style panel cannot be used,
  scrolled or tapped. The text still follows the narration automatically.
- The controls behind the lock are dimmed so it is obvious they are off.
- **Unlock:** a round lock button at the bottom right. **Press and hold for 1.1 seconds**; a ring fills while holding.
  Releasing early cancels. A normal tap never unlocks.
- The unlock button is faint after 3.5 s without touches. Any touch brightens it and shows the hint
  "Locked. Press and hold the lock button to unlock."
- A short vibration confirms locking, and a double pulse confirms unlocking (where the device supports it).
- **Still works while locked:** narration, notification and lock-screen controls, Bluetooth and headset buttons,
  volume keys, ambient sound.
- **Exiting fullscreen is blocked while locked.** If the system ends fullscreen anyway (for example a back gesture), the
  app stays in the fullscreen view and stays locked; unlock first, then use the exit button.
- Not remembered across restarts: the app always opens unlocked.
- Accessibility: the content behind the lock is hidden from screen readers and the keyboard too (`inert`).

### Constants

| Name | Value |
|---|---|
| Hold time to unlock | 1100 ms |
| Hint / button wake time | 3500 ms |
| Dimmed controls opacity | 0.3 |
| Idle unlock button opacity | 0.4 |

### Android mapping

| Behavior | Compose / Android |
|---|---|
| Swallow touches | full-screen overlay using `pointerInput` that consumes every `PointerEvent` |
| Hold to unlock | `detectTapGestures(onPress = ...)` with a 1.1 s timer; `CircularProgressIndicator` ring |
| Block back button | `BackHandler(enabled = locked) { }` (stronger than on the web) |
| Hide content from TalkBack | `Modifier.clearAndSetSemantics { }` on the content, or `semantics { invisibleToUser() }` |
| Haptics | `LocalHapticFeedback` or `VibrationEffect` |
| Keep playing | foreground service and MediaSession are unaffected |
| Optional later | `FLAG_KEEP_SCREEN_ON` while locked; auto-lock after N seconds in fullscreen |

### Acceptance checks

- Tapping the player buttons, text, toolbar and tabs while locked does nothing.
- A 0.5 s hold does not unlock; a full hold does.
- Locking and unlocking never interrupts narration.
- Ending fullscreen by a back gesture while locked leaves the app locked.
- After unlocking, every control works and the exit button leaves fullscreen.


---

## Design rule: icons

- No emoji anywhere. Every icon is a flat, single-color vector: 24 x 24 grid, 1.8 stroke, round caps and joins,
  `currentColor` (filled shapes only for play, pause, stop, skip and the saved star).
- Names used in the app: play, pause, prev, next, stop, lock, moon, sun, fs, close, star, star-fill, plus, book,
  and the ambient set (off, rain, heavy, storm, ocean, insects, forest, wind, fire, brown).
- **Android:** one vector drawable per name (Material Symbols outlined style is a close match).

---

## Spec: Sleep timer

A moon button in the player bar opens the timer panel. The button shows the time left, or "End".

- **Presets:** 5, 10, 15, 30, 45, 60, 90 minutes, a custom value (1 to 600 minutes), and **End of chapter**.
- **Active timer:** the panel shows the countdown with **+10 min** and **Turn off**. The last chosen custom value is remembered.
- **Fade:** over the last `min(30 s, total / 4)` the volume (narration and ambient together) falls from 100% to 3%.
- **When it ends:** playback is **paused where you stopped** (not reset), ambient sound stops, and a message appears.
  Pressing play restores full volume and carries on.
- **End of chapter:** playback stops when the chapter finishes, and auto-next does not start the next chapter.
- It counts real clock time (an end timestamp), so it stays accurate if the page is throttled in the background.
- Pausing or stopping does not cancel the timer; it simply runs out.

| Android mapping | |
|---|---|
| Timer | end timestamp on `SystemClock.elapsedRealtime()`, checked from the playback service |
| Fade | ramp the player volume (`Player.volume`) and the ambient volume |
| Expiry | `player.pause()`; the notification and lock-screen controls stay available |

---

## Spec: Novel covers (Library only)

Covers appear **only** in the Library's list of saved novels, never in the reader, the player or notifications.

- **Where it looks:** the novel's own page (the chapter link without its chapter number), then the saved link.
  For each page: the page itself, then a public proxy, then the reader service.
- **Candidates:** `og:image`, `twitter:image`, `image_src`, then images inside cover-like elements
  (`.cover`, `.book-cover`, `[class*=poster]`, `itemprop=image`...). Logos, icons, banners, avatars, sprites, `.svg`
  and `.gif` are skipped.
- **Choosing:** the first image that is portrait (height at least 1.1 times its width); a wide image is used only if nothing else is found.
- **Storing:** shrunk to at most 240 x 340, JPEG quality 0.82 (about 5 to 25 KB), kept in `pw-covers` keyed by novel id.
  If the image host blocks cross-site reads, an image proxy (`wsrv.nl`) is tried.
- **When:** automatically when a novel is added; again at most once a week for novels that still have none;
  **Find missing covers** in the Library; or **Find cover automatically** in the cover panel.
- **Manual:** tap a cover (or the book placeholder) to open the cover panel: find automatically, choose from the device,
  use an image link, or remove. Sites that block fetching are handled by choosing an image.
- Removing a novel removes its cover.

| Android mapping | |
|---|---|
| Fetching | OkHttp + Jsoup, same candidate rules, no CORS limits so the proxy is not needed |
| Storing | image files in app storage (not base64), keyed by novel id |
| Display | Coil `AsyncImage` in the Library list only |
| Picking | `ActivityResultContracts.PickVisualMedia` |

---

## Spec: Brightness (fullscreen)

A sun button appears in the fullscreen toolbar (before the lock button) and opens a brightness panel.

- **Range:** 10% to 100%, presets 25, 50, 75 and 100. Saved across restarts.
- **Web:** a web page cannot change the phone's real brightness, so a black layer dims the screen. Opacity is
  `min(0.9, 1 - brightness)`, so the lowest setting never goes fully black. It only exists in fullscreen, lets touches through,
  and stays on top of the touch lock. While the panel is open the preview is capped at 0.55 so the panel stays readable.
- It cannot make the screen brighter than the phone's own setting.
- **Android:** set the real window brightness (`window.attributes.screenBrightness`, 0.1 to 1.0). This can be brighter
  than the system level, needs no permission, and is restored to "system default" (-1) when fullscreen ends.

---

## Spec: Keep screen on

The screen is kept on when **either** applies:

1. "Keep screen on while the app is open" is on (Settings), or
2. the touch lock is on and "Keep screen on while the screen is locked" is on (Settings, **on by default**).

- **Web method:** the browser's Screen Wake Lock. It is requested again whenever the browser drops it (after the app
  returns from the background, after a fullscreen change, or if it is released for any other reason), with at most 5
  quick retries per 10 seconds and a re-check every 20 seconds.
- **Fallback:** if the browser refuses or does not support it, a tiny silent looping video plays inside the app
  (the long-used "NoSleep" method).
- **Status:** Settings shows whether it is active, using the fallback, or refused (for example by battery saver).
  The lock screen hint says "The screen stays on." only when it really is.
- Unlocking, switching the setting off, or leaving the condition releases it immediately.
- **Android:** `FLAG_KEEP_SCREEN_ON` on the window while the condition holds. It is reliable, so there is no fallback.

### Acceptance checks

- Locking the screen starts keep-awake without touching the Settings toggle; unlocking releases it.
- If the browser drops the wake lock, the app gets it again within about a second.
- If the browser refuses it, the fallback runs and the status says so.
- A browser that keeps dropping it does not cause a request loop.
- In fullscreen, the brightness button is visible and dimming works; outside fullscreen there is no dimming.
- Dimming also applies while locked, and survives a reload.
