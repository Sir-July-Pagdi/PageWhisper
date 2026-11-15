/* PageWhisper speech engine. Runs Kokoro in a Web Worker so the page never blocks while it generates,
   and so generation keeps going at full speed when the app is in the background or the screen is off. */
const SOURCES = [
  "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js",
  "https://unpkg.com/kokoro-js@1.2.1/dist/kokoro.web.js"
];
const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
let KokoroTTS = null, tts = null, device = "", choice = "auto", forceWasm = false, minRun = 0;
let chain = Promise.resolve();

async function importKokoro() {
  if (KokoroTTS) return KokoroTTS;
  let last;
  for (const u of SOURCES) {
    try {
      const m = await import(u);
      if (m.KokoroTTS) { KokoroTTS = m.KokoroTTS; return KokoroTTS; }
    } catch (e) { last = e; }
  }
  const err = new Error("Could not load the Kokoro library (" + (last && last.message || "network error") + ").");
  err.infra = true;
  throw err;
}

async function loadModel(id) {
  const K = await importKokoro();
  const canGpu = !!(self.navigator && self.navigator.gpu);
  if (choice === "webgpu" && !canGpu) throw new Error("This browser does not expose WebGPU. Choose Auto or WASM.");
  const order = (choice === "wasm" || !canGpu || forceWasm) ? ["wasm"] : choice === "webgpu" ? ["webgpu"] : ["webgpu", "wasm"];
  let lastErr;
  for (const dev of order) {
    try {
      self.postMessage({ type: "progress", id, text: `Loading Kokoro model (${dev === "webgpu" ? "WebGPU" : "WASM"})… first load downloads model files.` });
      tts = await K.from_pretrained(MODEL, {
        dtype: dev === "webgpu" ? "fp32" : "q8",
        device: dev,
        progress_callback: p => {
          if (p && p.status === "progress" && p.file)
            self.postMessage({ type: "progress", id, text: `Downloading ${p.file.split("/").pop()} · ${Math.round(p.progress || 0)}%` });
        }
      });
      device = dev;
      return;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Model failed to load.");
}

async function doLoad(m) {
  try {
    choice = m.choice || "auto";
    forceWasm = !!m.forceWasm;
    if (m.reload) tts = null;
    if (!tts) await loadModel(m.id);
    self.postMessage({ type: "ready", id: m.id, device });
  } catch (e) {
    self.postMessage({ type: "error", id: m.id, message: (e && e.message) || String(e), infra: !!(e && e.infra) });
  }
}

async function doGen(m) {
  if (m.run < minRun) { self.postMessage({ type: "skipped", id: m.id }); return; }
  try {
    const t0 = performance.now();
    if (!tts) await loadModel(m.id);
    const opts = { voice: m.voice, speed: m.speed };
    let g;
    try { g = await tts.generate(m.text, opts); }
    catch (e) {
      if (device === "webgpu" && choice === "auto") { // WebGPU failed at runtime: fall back to WASM
        forceWasm = true; tts = null;
        await loadModel(m.id);
        g = await tts.generate(m.text, opts);
      } else throw e;
    }
    const a = g.audio.slice();
    self.postMessage({ type: "audio", id: m.id, samples: a, rate: g.sampling_rate || 24000, ms: performance.now() - t0 }, [a.buffer]);
  } catch (e) {
    self.postMessage({ type: "error", id: m.id, message: (e && e.message) || String(e) });
  }
}

self.onmessage = e => {
  const m = e.data;
  if (m.type === "minRun") { minRun = Math.max(minRun, m.run); return; } // applies immediately, even mid-queue
  if (m.type === "load") chain = chain.then(() => doLoad(m));
  else if (m.type === "gen") chain = chain.then(() => doGen(m));
};
