
# PageWhisper

**A mobile-friendly web novel reader with Kokoro neural text-to-speech.**

PageWhisper lets you open a web novel chapter, read it in a focused reading view, and listen using Kokoro-generated voices directly in your browser. It is a static web app designed for GitHub Pages and can be installed as a Progressive Web App (PWA) on supported devices.

## Live App

https://sir-july-pagdi.github.io/PageWhisper/

## Features

- **Load chapters:** Fetch a chapter from a URL, paste text, paste from the clipboard, or import a `.txt` file.
- **Kokoro neural TTS:** Generate speech in the browser with the Kokoro-82M ONNX model.
- **Multiple voices:** Choose from available American and British English voices.
- **Inference options:** Use WebGPU where supported or WASM for broader compatibility.
- **Reading controls:** Adjust speech speed, speech chunk size, and reader font size.
- **Sentence-level playback:** Tap a sentence to begin playback from that point. The currently spoken section is highlighted.
- **Chapter navigation:** Use previous/next navigation and load following chapters.
- **Auto-next:** Optionally play the next chapter when the current chapter finishes.
- **Saved chapters:** Keep a local library of chapters in the browser.
- **Playback integration:** Media Session controls for compatible browsers, operating systems, and headphones.
- **PWA installation:** Includes a web app manifest, app icons, and a service worker.
- **Share target:** Compatible apps can share chapter URLs or text to PageWhisper.
- **Offline app shell:** Previously cached application files can open offline.

## How It Works

PageWhisper is a client-side application. Its interface and reading logic run in the browser. Kokoro performs speech synthesis on the device after the required model assets have been downloaded.

1. Load a chapter by URL, pasted text, clipboard, or text file.
2. For URL loading, PageWhisper attempts reader-style extraction and other available page-access methods.
3. The extracted text is cleaned and divided into manageable speech sections.
4. When playback starts, the app loads Kokoro and generates audio for the sections.
5. Generated audio is played in sequence while the current section is highlighted.

The application uses the `kokoro-js` browser runtime and the `onnx-community/Kokoro-82M-v1.0-ONNX` model.

Model assets are downloaded on first use and cached by the browser/runtime.

## Getting Started

### Use the Hosted App

1. Open the [PageWhisper web app](https://sir-july-pagdi.github.io/PageWhisper/).
2. Enter a chapter URL and select **Fetch chapter**, or use one of the paste/import options.
3. Choose a voice and inference mode.
4. Press **Play**.
5. On first use, wait for the Kokoro runtime and model assets to download.
6. Save chapters to keep them in this browser's local library.

### Run Locally

Do not open `index.html` directly using a `file://` URL. PageWhisper uses browser modules, service workers, and browser APIs that require a local web server.

With Python installed, run:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

### Deploy to GitHub Pages

PageWhisper is a static website and does not require a build step or application backend.

1. Push the project files to the repository's `main` branch.
2. Open **Settings → Pages** in GitHub.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose **main** and the **/(root)** folder.
5. Save and wait for deployment to finish.

Keep the application files together in the repository root. The manifest and service worker use relative paths.

## Browser and Device Notes

- Use a modern browser with JavaScript modules, WebAssembly, service worker, and browser storage support.
- WebGPU is optional. If unavailable or unstable, select **WASM**.
- The interface estimates first-use model downloads at approximately **90 MB in WASM mode** and **330 MB in WebGPU mode**. Actual download and storage sizes may vary.
- Speech generation is computationally intensive. Performance depends on the device, browser, available memory, and inference mode.
- Keep the page open while the model loads and while starting playback.
- Mobile operating systems may suspend browser activity or restrict background playback.
- Browser storage may be cleared or evicted. The local chapter library is not a backup.

## URL Extraction Limitations

PageWhisper cannot guarantee that every novel website can be fetched.

A website may:
- Require login or a subscription.
- Block automated requests.
- Use anti-bot protection.
- Prevent cross-origin access.
- Use a page structure that makes chapter extraction difficult.

If URL loading fails or returns incomplete text, use **Paste text**, **Paste from clipboard**, or **Import .txt**.

Only access and load content you are authorized to use.

## Privacy and Data

- Chapter text, saved chapters, and reading settings are handled in the browser.
- Saved chapters and settings use local browser storage and are not synchronized between devices.
- Kokoro speech synthesis runs on the device after model assets are downloaded.
- Loading a chapter URL may contact the source website and extraction/proxy services used by the app.
- The browser also downloads Kokoro runtime and model assets from their hosting/CDN providers.
- PageWhisper does not provide user accounts or a cloud chapter library.

## Project Structure

| File | Purpose |
|---|---|
| `index.html` | Main application, interface, chapter extraction, reader, and Kokoro playback logic |
| `manifest.json` | PWA metadata, icons, and share-target configuration |
| `sw.js` | Service worker for app-shell and runtime CDN caching |
| `icon-192.png` | PWA icon |
| `icon-512.png` | High-resolution PWA icon |
| `icon-maskable-512.png` | Maskable PWA icon |
| `apple-touch-icon.png` | Apple home-screen icon |

## Acknowledgements

- [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) by Hexgrad.
- [Kokoro JS](https://github.com/hexgrad/kokoro) and its browser inference tooling.
- [ONNX Community Kokoro Model](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX).
- [Hugging Face](https://huggingface.co/) for model hosting and related tooling.

Refer to the upstream projects for their respective licenses and terms.

---

**PageWhisper** · Static GitHub Pages app · Built for reading and listening.
