# PageWhisper

A web novel reader that reads chapters aloud with **Kokoro**, a neural text-to-speech model that runs entirely on your device. It's a static web app that you can host free on GitHub Pages and install on Android as an app. There's no account, no server and no API key.

## Features

- **Natural neural voices:** 28 Kokoro voices (American and British, female and male), with adjustable speed.
- **Runs on your device:** after a one-time model download, speech is generated locally and works offline.
- **Open chapters your way:**
  - fetch a chapter from its web address
  - paste text or load it from the clipboard
  - import a `.txt` file
  - share text or a link to the app from Chrome's share sheet
- **Reader view:** the sentence being spoken is highlighted and followed automatically. Tap any sentence to start from there. Text size is adjustable, and there's a distraction-free fullscreen mode.
- **Chapter navigation:** Previous/Next chapter, a next-chapter link that's auto-detected (or guessed from the chapter number), and optional auto-play of the next chapter.
- **Novel library:** keep links to novels from any site. Continue reads from your last chapter, and the bookmark moves as you read.
- **Saved chapters:** stored on your device for offline reading.
- **Ambient sounds:** rain, heavy rain, thunderstorm, ocean waves, night insects, night forest, wind, campfire and brown noise. They're generated on the device, loop seamlessly, have their own volume, and can play only while narrating.
- **Background playback:** audio keeps playing with the screen off or in other apps, with lock-screen and notification controls (play, pause, previous and next section, stop).
- **Keep screen on:** an optional toggle.
- **Installable (PWA):** opens fullscreen like a native app, with offline support.

## Files

Upload all of these to the **same folder** (no subfolders needed):

| File | Purpose |
|---|---|
| `index.html` | The app (interface and logic) |
| `tts-worker.js` | Runs Kokoro in a background worker |
| `sw.js` | Service worker (offline support and caching) |
| `manifest.json` | Install and app metadata |
| `icon-192.png`, `icon-512.png` | App icons |
| `icon-maskable-512.png` | Adaptive icon for Android |
| `apple-touch-icon.png` | Icon for iOS home screens |

## Deploy on GitHub Pages

1. Create a repository and upload all the files above to its root.
2. Go to **Settings → Pages**, choose your branch and the `/ (root)` folder, then save.
3. Open `https://<your-username>.github.io/<repo-name>/` once Pages finishes building.

The app must be served over **HTTPS**, which GitHub Pages does. It will not work correctly from `file://`.

## Install on Android

1. Open your Pages link in **Chrome**.
2. Tap the **⋮** menu and choose **Install app** (or **Add to Home screen**).
3. Launch it from your home screen.

Installing also enables **Share to PageWhisper**: in Chrome, select chapter text or use Share on a page and pick PageWhisper.

## Using the app

The bottom tabs are:

- **Read:** the chapter, with a toolbar for text size, previous/next chapter, auto-next, and fullscreen.
- **Open:** fetch by link, paste or import text, and set the next-chapter link.
- **Library:** your novels and saved chapters.
- **Voice:** voice, speed, chunk size, engine, ambient sound and playback options.

The player bar at the bottom (previous section, play/pause, next section, stop) stays visible on every tab.

**First run:** press play. The app downloads the model once (about 90 MB in WASM mode, about 330 MB in WebGPU mode), then caches it. Keep the app open while it downloads.

### Sites that block fetching

Some sites use bot protection or require a login, so no static web app can fetch them directly. If fetching fails:

1. Open the chapter in your browser.
2. Select and copy the text, then in PageWhisper tap **Paste from clipboard & load** (Open tab).
3. Or select the text and use **Share → PageWhisper**.
4. Tap the first real sentence to skip any menus copied before the chapter text.

In the Library, **Open in browser** takes you straight to a saved novel's page.

## Settings worth knowing

- **Engine:** Auto tries WebGPU and falls back to WASM. WASM is the most compatible; WebGPU is faster on supported phones.
- **Chunk size:** shorter chunks start sooner; longer chunks sound smoother.
- **Only play while narrating:** keeps the ambient sound in step with the reading.
- **Keep screen on:** stops the screen from sleeping while the app is open.

## Background playback tips

Audio keeps playing with the screen off, but Android's battery manager can still stop apps. If playback stops:

- Go to **Settings → Apps → PageWhisper (or Chrome) → Battery** and choose **Unrestricted**.
- Choose **WASM** as the engine (WebGPU can pause when the screen is off).
- Open **Voice → Playback log**, tap **Copy log**, and check what happened when it stopped.

An ambient sound helps keep the app active in the background.

## Privacy

- Your chapter text and saved data stay on your device (browser local storage).
- Speech is generated locally. No audio or text is sent to any server.
- Network requests the app makes:
  - **Model files and voices** are downloaded from Hugging Face (cached after the first time).
  - **Kokoro library code** is loaded from jsDelivr (backup: unpkg).
  - **Fetching a chapter by link** sends that link to `r.jina.ai` (reader extraction) and, if needed, a public proxy (`api.allorigins.win`). Use paste or import if you'd rather not send links to third parties.

## Troubleshooting

| Problem | What to try |
|---|---|
| Old version keeps showing after an update | Close the app fully and reopen it twice. If needed, clear the site's data in Chrome's site settings. |
| "Failed to fetch" / site blocks fetching | Use paste or share (see above). |
| Nothing speaks / engine error | Check your connection (the model must download once). Try the WASM engine. Copy the playback log. |
| Choppy audio or long pauses | Use WASM with the Long chunk size, or close other heavy apps. |
| Ambient sound won't start | Tap a sound chip once, since browsers need a tap before audio can play. |
| Stops with the screen off | See Background playback tips. |

## Browser support

Built for **Chrome on Android**. It also works in current desktop Chrome and Edge. WebGPU depends on your device; the WASM mode works more widely. Fullscreen and Keep screen on depend on browser support, and the app tells you when something isn't available.

## Tech notes

- **Text-to-speech:** [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) through `kokoro-js` and Transformers.js (ONNX Runtime Web), running in a Web Worker.
- **Playback:** Web Audio is not used for speech; sections are generated ahead as WAV clips and played through an `<audio>` element, so Media Session controls and background audio work.
- **Ambient sounds:** procedural synthesis (filtered noise plus event layers), generated to seamless loops on the device.
- **Offline:** a service worker caches the app shell and library code; the model is cached by Transformers.js.

## Credits

- Kokoro-82M (Apache 2.0) and `kokoro-js`
- Hugging Face Transformers.js
- r.jina.ai reader service
- App icon and design by the project owner

## License

Add your preferred license here (for example MIT). Kokoro and the other libraries keep their own licenses.
