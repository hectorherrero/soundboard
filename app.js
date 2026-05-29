/**
 * Soundboard App — app.js
 * Tasks 7–14: modal logic, file reading, form submission, rendering,
 *             audio playback, localStorage persistence, delete, empty state.
 */

'use strict';

/* ============================================================
   i18n — Translations
   ============================================================ */
const LANG_STORAGE_KEY = 'soundboard_lang_v1';

/** Supported locales and their translations */
const TRANSLATIONS = {
  es: {
    subtitle:            'Haz clic para reproducir \u2022 Pulsa <kbd>+</kbd> para añadir sonidos',
    emptyTitle:          'Sin sonidos aún',
    emptySub:            'Haz clic en el botón <strong>+</strong> para añadir tu primer sonido',
    ttsSectionLabel:     '🗣️ Texto a Voz',
    addBtnAria:          'Añadir nuevo sonido',
    addBtnTitle:         'Añadir sonido',
    ttsPanelTitle:       '🗣️ Texto a Voz — escribe y pulsa Añadir (o Enter)',
    ttsPlaceholder:      'Escribe lo que quieres que se diga en voz alta…',
    ttsAddBtn:           'Añadir',
    dialogTitle:         'Añadir Nuevo Sonido',
    dialogClose:         'Cerrar diálogo',
    fieldLabel:          'Nombre del botón',
    fieldLabelPlaceholder: 'Ej: Bocina, Boom, Risa…',
    fieldFile:           'Archivo de audio',
    fileDropText:        'Elige o arrastra un archivo de audio',
    fieldEmoji:          'Emoji (opcional)',
    sizeWarning:         '⚠️ Archivo grande detectado (>5 MB). El almacenamiento puede ser limitado.',
    cancelBtn:           'Cancelar',
    submitBtn:           'Añadir Sonido',
    // JS-only strings
    errorLabel:          'Por favor introduce un nombre para el botón.',
    errorFile:           'Por favor selecciona un archivo de audio.',
    errorInvalidFile:    'Por favor selecciona un archivo de audio válido.',
    errorReadFile:       'No se pudo leer el archivo. Por favor inténtalo de nuevo.',
    storageAlert:        '⚠️ Límite de almacenamiento alcanzado. Algunos sonidos puede que no se guarden al recargar.\nUsa archivos más pequeños (MP3 a 128 kbps recomendado).',
    playbackError:       'Error de reproducción',
    playbackLocalHint:   'Esto es probablemente una restricción de seguridad del navegador para archivos locales. Prueba abriendo la página a través de un servidor local o añade tus propios sonidos usando el botón "+".',
    ttsNoSupport:        'Tu navegador no soporta síntesis de voz (Web Speech API).',
    amrLoadConverter:    'Cargando convertidor de audio…',
    amrReading:          'Leyendo archivo…',
    amrConverting:       'Convirtiendo AMR a WAV…',
    amrRetrying:         'Reintentando con detección automática…',
    amrFinalizing:       'Finalizando…',
    amrConvertedLabel:   '✅ {name} → convertido a WAV',
    amrErrorConvert:     '❌ Error al convertir AMR: {msg}',
    amrErrorRead:        'No se pudo leer el archivo. Por favor inténtalo de nuevo.',
    langTitle:           'Cambiar idioma',
  },
  eu: {
    subtitle:            'Egin klik erreproduzitzeko \u2022 Sakatu <kbd>+</kbd> soinuak gehitzeko',
    emptyTitle:          'Oraindik ez dago soinurik',
    emptySub:            'Sakatu <strong>+</strong> botoia zure lehen soinua gehitzeko',
    ttsSectionLabel:     '🗣️ Testua Ahots Bihurtzea',
    addBtnAria:          'Soinu berria gehitu',
    addBtnTitle:         'Soinua gehitu',
    ttsPanelTitle:       '🗣️ Testua Ahots Bihurtzea — idatzi eta sakatu Gehitu (edo Enter)',
    ttsPlaceholder:      'Idatzi ozen esatea nahi duzuna…',
    ttsAddBtn:           'Gehitu',
    dialogTitle:         'Soinu Berria Gehitu',
    dialogClose:         'Elkarrizketa itxi',
    fieldLabel:          'Botoiaren izena',
    fieldLabelPlaceholder: 'Adib.: Txirrina, Boom, Barre…',
    fieldFile:           'Audio fitxategia',
    fileDropText:        'Aukeratu edo arrastatu audio fitxategi bat',
    fieldEmoji:          'Emoji (aukerakoa)',
    sizeWarning:         '⚠️ Fitxategi handia hauteman da (>5 MB). Biltegiratzea mugatua izan daiteke.',
    cancelBtn:           'Utzi',
    submitBtn:           'Soinua Gehitu',
    // JS-only strings
    errorLabel:          'Mesedez sartu botoiaren izena.',
    errorFile:           'Mesedez hautatu audio fitxategi bat.',
    errorInvalidFile:    'Mesedez hautatu baliozko audio fitxategi bat.',
    errorReadFile:       'Ezin izan da fitxategia irakurri. Saiatu berriro.',
    storageAlert:        '⚠️ Biltegiratzeko muga gainditu da. Baliteke soinu batzuk ez gordetzea eguneratu ondoren.\nErabili fitxategi txikiagoak (128 kbps-ko MP3 gomendatua).',
    playbackError:       'Erreprodukzio errorea',
    playbackLocalHint:   'Hau ziurrenik nabigatzailearen segurtasun murrizketa bat da tokiko fitxategietarako. Saiatu orria tokiko zerbitzari baten bidez irekitzen edo gehitu zure soinuak "+" botoiaren bidez.',
    ttsNoSupport:        'Zure nabigatzaileak ez du ahots-sintesia onartzen (Web Speech API).',
    amrLoadConverter:    'Audio bihurgailua kargatzen…',
    amrReading:          'Fitxategia irakurtzen…',
    amrConverting:       'AMR WAV-era bihurtzen…',
    amrRetrying:         'Detekzio automatikoarekin berriro saiatzen…',
    amrFinalizing:       'Bukatzen…',
    amrConvertedLabel:   '✅ {name} → WAV-era bihurtua',
    amrErrorConvert:     '❌ AMR bihurtzeko errorea: {msg}',
    amrErrorRead:        'Ezin izan da fitxategia irakurri. Saiatu berriro.',
    langTitle:           'Hizkuntza aldatu',
  },
  en: {
    subtitle:            'Click a button to play \u2022 Press <kbd>+</kbd> to add sounds',
    emptyTitle:          'No sounds yet',
    emptySub:            'Click the <strong>+</strong> button to add your first sound',
    ttsSectionLabel:     '🗣️ Text to Speech',
    addBtnAria:          'Add a new sound button',
    addBtnTitle:         'Add sound',
    ttsPanelTitle:       '🗣️ Text to Speech — type and click Add (or Enter)',
    ttsPlaceholder:      'Type what you want to say aloud…',
    ttsAddBtn:           'Add',
    dialogTitle:         'Add New Sound',
    dialogClose:         'Close dialog',
    fieldLabel:          'Button Label',
    fieldLabelPlaceholder: 'e.g. Air Horn, Boom, Laugh…',
    fieldFile:           'Audio File',
    fileDropText:        'Choose or drop an audio file',
    fieldEmoji:          'Emoji (optional)',
    sizeWarning:         '⚠️ Large file detected (>5 MB). Storage may be limited.',
    cancelBtn:           'Cancel',
    submitBtn:           'Add Sound',
    // JS-only strings
    errorLabel:          'Please enter a label for the button.',
    errorFile:           'Please select an audio file.',
    errorInvalidFile:    'Please select a valid audio file.',
    errorReadFile:       'Could not read the file. Please try again.',
    storageAlert:        '⚠️ Storage limit reached. Some sounds may not be saved after refresh.\nTry using smaller audio files (MP3 at 128 kbps recommended).',
    playbackError:       'Playback Error',
    playbackLocalHint:   'This is likely a browser security restriction for local files. Try opening the page through a local server or adding your own sounds using the "+" button.',
    ttsNoSupport:        'Your browser does not support speech synthesis (Web Speech API).',
    amrLoadConverter:    'Loading audio converter…',
    amrReading:          'Reading file…',
    amrConverting:       'Converting AMR to WAV…',
    amrRetrying:         'Retrying with auto-detection…',
    amrFinalizing:       'Finalizing…',
    amrConvertedLabel:   '✅ {name} → converted to WAV',
    amrErrorConvert:     '❌ AMR conversion error: {msg}',
    amrErrorRead:        'Could not read the file. Please try again.',
    langTitle:           'Change language',
  },
};

/** The currently active locale (e.g. 'es', 'eu', 'en') */
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'es';
if (!TRANSLATIONS[currentLang]) currentLang = 'es';

/**
 * Returns the translation string for the given key in the current locale.
 * @param {string} key
 * @returns {string}
 */
function t(key) {
  return (TRANSLATIONS[currentLang] || TRANSLATIONS.es)[key] || key;
}

/**
 * Applies all translations to the document.
 * Updates elements with data-i18n, data-i18n-placeholder and data-i18n-aria attributes.
 */
function applyTranslations() {
  // Update <html lang>
  document.getElementById('html-root').lang = currentLang;

  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    // Use innerHTML so we support <kbd>, <strong> tags in translations
    el.innerHTML = translation;
  });

  // Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // aria-label attributes
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    el.setAttribute('aria-label', t(key));
  });

  // title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });

  // Update the lang selector button label and tooltip
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.title = t('langTitle');

  // Mark active option
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.lang === currentLang ? 'true' : 'false');
    opt.classList.toggle('active', opt.dataset.lang === currentLang);
  });
}

/* ============================================================
   Language Selector Logic
   ============================================================ */

/**
 * Sets the active language, persists it, and applies all translations.
 * @param {string} lang - locale code ('es' | 'eu' | 'en')
 */
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);

  // Update the button display
  const option = document.querySelector(`.lang-option[data-lang="${lang}"]`);
  if (option) {
    document.getElementById('lang-flag').textContent = option.dataset.flag;
    document.getElementById('lang-code').textContent = option.dataset.code;
  }

  applyTranslations();
}

/** Toggles the language dropdown open/closed. */
function toggleLangDropdown(open) {
  const btn      = document.getElementById('lang-btn');
  const dropdown = document.getElementById('lang-dropdown');
  if (!btn || !dropdown) return;
  const isOpen = open !== undefined ? open : dropdown.hidden;
  dropdown.hidden = !isOpen;
  btn.setAttribute('aria-expanded', String(isOpen));
}

// Wire up the language selector after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const langBtn      = document.getElementById('lang-btn');
  const langDropdown = document.getElementById('lang-dropdown');

  langBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLangDropdown();
  });

  langDropdown?.addEventListener('click', (e) => {
    const opt = e.target.closest('.lang-option');
    if (!opt) return;
    setLanguage(opt.dataset.lang);
    toggleLangDropdown(false);
  });

  // Close dropdown when clicking elsewhere
  document.addEventListener('click', () => toggleLangDropdown(false));

  // Keyboard navigation within dropdown
  langDropdown?.addEventListener('keydown', (e) => {
    const opts = [...langDropdown.querySelectorAll('.lang-option')];
    const idx  = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); opts[(idx + 1) % opts.length]?.focus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); opts[(idx - 1 + opts.length) % opts.length]?.focus(); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement?.click(); }
    if (e.key === 'Escape')    { toggleLangDropdown(false); langBtn?.focus(); }
  });

  // Apply initial language (restores from localStorage or defaults to es)
  setLanguage(currentLang);
});


const STORAGE_KEY = 'soundboard_buttons_v1';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB warning threshold

/** AMR MIME types and file extensions that require conversion */
const AMR_MIMES = new Set(['audio/amr', 'audio/amr-nb', 'audio/amr-wb', 'audio/3gpp', 'audio/3gpp2']);
const AMR_EXTENSIONS = new Set(['.amr', '.3gp', '.3gpp']);

/** Cached ffmpeg instance (lazy-loaded on first AMR use) */
let _ffmpegInstance = null;
let _ffmpegLoading = false;
const DEFAULT_EMOJI = '🔊';
const GRADIENT_COUNT = 6;

/** @type {{ id: string, label: string, emoji: string, audioDataUrl: string }[]} */
let buttons = [];

const DEFAULT_SOUNDS = [
  {
    id: 'default-electronic-hit',
    label: 'Electronic Hit',
    emoji: '⚡',
    audioDataUrl: './resources/Electronic hit.mp3'
  },
  {
    id: 'default-power-up',
    label: 'Power Up',
    emoji: '🔋',
    audioDataUrl: './resources/Powerup.wav'
  },
  {
    id: 'default-button-pressed',
    label: 'Button Click',
    emoji: '🔘',
    audioDataUrl: './resources/Button-pressed.wav'
  },
  {
    id: 'default-chicken',
    label: 'Chicken',
    emoji: '🐔',
    audioDataUrl: './resources/Chicken.wav'
  },
  {
    id: 'default-aaaah',
    label: 'Aaaah!',
    emoji: '😱',
    audioDataUrl: './resources/Aaaah.wav'
  }
];

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const addBtn = document.getElementById('add-btn');
const dialog = document.getElementById('add-dialog');
const closeBtn = document.getElementById('dialog-close');
const cancelBtn = document.getElementById('cancel-btn');
const addForm = document.getElementById('add-form');
const labelInput = document.getElementById('sound-label');
const fileInput = document.getElementById('sound-file');
const emojiInput = document.getElementById('sound-emoji');
const fileDropZone = document.getElementById('file-drop-zone');
const fileDropText = document.getElementById('file-drop-text');
const labelError = document.getElementById('label-error');
const fileError = document.getElementById('file-error');
const sizeWarning = document.getElementById('size-warning');
const buttonGrid = document.getElementById('button-grid');
const emptyState = document.getElementById('empty-state');
const amrProgressWrap = document.getElementById('amr-progress-wrap');
const amrProgressBar = document.getElementById('amr-progress-bar');
const amrProgressLabel = document.getElementById('amr-progress-label');

/* ============================================================
   TASK 7 — Modal Open / Close Logic
   ============================================================ */

/** Opens the add-sound dialog and resets the form. */
function openDialog() {
  resetForm();
  dialog.showModal();
  labelInput.focus();
}

/** Closes the add-sound dialog. */
function closeDialog() {
  dialog.close();
}

/** Resets the form to its initial state. */
function resetForm() {
  addForm.reset();
  labelError.textContent = '';
  fileError.textContent = '';
  sizeWarning.hidden = true;
  fileDropZone.classList.remove('has-file', 'drag-over', 'invalid');
  labelInput.classList.remove('invalid');
  fileDropText.textContent = t('fileDropText');
  _pendingAudioDataUrl = null;
  _pendingAudioMime = null;
}

// FAB → open modal
addBtn.addEventListener('click', openDialog);

// Close button & Cancel button
closeBtn.addEventListener('click', closeDialog);
cancelBtn.addEventListener('click', closeDialog);

// Click on backdrop closes dialog.
// Note: Chromium doesn't propagate ::backdrop clicks to the dialog element,
// so we use pointerdown and check whether the pointer landed outside the card.
dialog.addEventListener('pointerdown', (e) => {
  const card = dialog.querySelector('.dialog-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const outsideX = e.clientX < rect.left || e.clientX > rect.right;
  const outsideY = e.clientY < rect.top || e.clientY > rect.bottom;
  if (outsideX || outsideY) closeDialog();
});

// Keyboard shortcut: '+' key opens dialog (when not already focused on an input)
document.addEventListener('keydown', (e) => {
  if ((e.key === '+' || e.key === '=') && !dialog.open) {
    const tag = document.activeElement?.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      openDialog();
    }
  }
  if (e.key === 'Escape' && dialog.open) {
    // Dialog handles Escape natively, but we ensure reset
    closeDialog();
  }
});

/* ============================================================
   TASK 8 — Local File Reading
   ============================================================ */

/** Stores the data URL of the pending audio selection. */
let _pendingAudioDataUrl = null;
let _pendingAudioMime = null;

/**
 * Reads an audio File as a base64 data URL.
 * @param {File} file
 * @returns {Promise<string>} data URL
 */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Returns true if the file is an AMR audio file (by MIME or extension).
 * Mobile recorders sometimes produce files with empty or generic MIME types.
 * @param {File} file
 * @returns {boolean}
 */
function isAmrFile(file) {
  if (AMR_MIMES.has(file.type)) return true;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return AMR_EXTENSIONS.has(ext);
}

/**
 * Returns true if the file appears to be a supported audio type.
 * Accepts standard audio/* MIME types plus AMR variants.
 * @param {File} file
 * @returns {boolean}
 */
function isValidAudioFile(file) {
  if (file.type.startsWith('audio/')) return true;
  if (isAmrFile(file)) return true;
  // Some mobile browsers send empty MIME for AMR files — check by extension
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const knownExts = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus', '.webm', '.amr', '.3gp', '.3gpp']);
  return knownExts.has(ext);
}

/**
 * Shows the AMR conversion progress bar with the given label and progress (0–1).
 * @param {string} label
 * @param {number} ratio  0..1
 */
function showProgress(label, ratio) {
  amrProgressWrap.hidden = false;
  amrProgressLabel.textContent = label;
  // ratio from ffmpeg can be slightly > 1; clamp it
  const pct = Math.min(100, Math.round(ratio * 100));
  amrProgressBar.style.width = pct + '%';
  amrProgressBar.setAttribute('aria-valuenow', pct);
}

/** Hides the progress bar and resets it. */
function hideProgress() {
  amrProgressWrap.hidden = true;
  amrProgressBar.style.width = '0%';
  amrProgressLabel.textContent = '';
}

/**
 * Lazily creates and loads an ffmpeg instance (v0.11.x UMD API).
 * The global `FFmpeg` object is provided by the ffmpeg.min.js script tag.
 * @returns {Promise<object>} ffmpeg instance
 */
async function loadFfmpeg() {
  if (_ffmpegInstance) return _ffmpegInstance;
  if (_ffmpegLoading) {
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (!_ffmpegLoading) { clearInterval(check); resolve(); }
      }, 100);
    });
    return _ffmpegInstance;
  }

  // Guard: ffmpeg.min.js must be loaded via <script> tag
  if (typeof FFmpeg === 'undefined' || typeof FFmpeg.createFFmpeg !== 'function') {
    throw new Error('La librería ffmpeg.js no se cargó. Comprueba tu conexión a internet y recarga la página.');
  }

  _ffmpegLoading = true;
  try {
    const { createFFmpeg } = FFmpeg;
    const ff = createFFmpeg({
      log: true,   // visible en DevTools → Console
      // jsDelivr mirror — more reliable than unpkg on mobile networks
      corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
    });
    await ff.load();
    _ffmpegInstance = ff;
    return ff;
  } finally {
    _ffmpegLoading = false;
  }
}

/**
 * Converts an AMR audio file to WAV using ffmpeg.wasm (v0.11.x API).
 * Shows progress in the progress bar while working.
 * @param {File} file
 * @returns {Promise<File>} WAV file
 */
async function convertAmrToWav(file) {
  showProgress(t('amrLoadConverter'), 0.02);

  const ff = await loadFfmpeg();

  // Wire up real-time progress: ffmpeg emits ratio 0–1 during transcode
  ff.setProgress(({ ratio }) => {
    const r = Number(ratio);
    if (Number.isFinite(r) && r > 0) {
      showProgress(t('amrConverting'), Math.min(r, 0.95));
    }
  });

  // Use arrayBuffer() directly — more reliable than fetchFile() on mobile
  const ext = (file.name.split('.').pop() || 'amr').toLowerCase();
  const inputName = 'input.' + ext;

  showProgress(t('amrReading'), 0.05);
  const rawBuffer = await file.arrayBuffer();
  ff.FS('writeFile', inputName, new Uint8Array(rawBuffer));

  showProgress(t('amrConverting'), 0.1);

  // Attempt 1: force raw AMR-NB format (most common from Android recorders)
  try {
    await ff.run('-f', 'amrnb', '-i', inputName, '-ar', '8000', '-ac', '1', '-c:a', 'pcm_s16le', 'output.wav');
  } catch (_firstErr) {
    // Attempt 2: let ffmpeg auto-detect (handles 3GPP containers and AMR-WB)
    showProgress(t('amrRetrying'), 0.3);
    try {
      await ff.run('-i', inputName, '-vn', '-ar', '8000', '-ac', '1', '-c:a', 'pcm_s16le', 'output.wav');
    } catch (secondErr) {
      throw new Error('ffmpeg no pudo decodificar el audio. ¿Tiene el codec AMR disponible? Detalle: ' + secondErr.message);
    }
  }

  showProgress(t('amrFinalizing'), 0.98);
  let data;
  try {
    data = ff.FS('readFile', 'output.wav');
  } catch (readErr) {
    throw new Error('La conversión no generó audio válido. Detalle: ' + readErr.message);
  }

  // Clean up virtual FS
  try { ff.FS('unlink', inputName); } catch (_) {}
  try { ff.FS('unlink', 'output.wav'); } catch (_) {}

  const wavBlob = new Blob([data.buffer], { type: 'audio/wav' });
  const baseName = file.name.replace(/\.[^.]+$/, '') + '.wav';
  return new File([wavBlob], baseName, { type: 'audio/wav' });
}

/**
 * Handles a newly selected/dropped audio file.
 * Automatically converts AMR files to WAV before processing.
 * @param {File} file
 */
async function handleFileSelected(file) {
  if (!file) return;

  // Reset previous state
  fileError.textContent = '';
  fileDropZone.classList.remove('invalid', 'has-file');
  sizeWarning.hidden = true;

  // Validate: must be a known audio type (standard or AMR)
  if (!isValidAudioFile(file)) {
    fileError.textContent = t('errorInvalidFile');
    fileDropZone.classList.add('invalid');
    return;
  }

  // Size warning
  if (file.size > MAX_FILE_SIZE) {
    sizeWarning.hidden = false;
  }

  try {
    let audioFile = file;

    // AMR files need to be converted to WAV first (browsers don't support AMR)
    if (isAmrFile(file)) {
      fileDropZone.classList.add('has-file');
      try {
        audioFile = await convertAmrToWav(file);
        hideProgress();
        fileDropText.textContent = t('amrConvertedLabel').replace('{name}', file.name);
      } catch (convErr) {
        console.error('[AMR] Conversion failed:', convErr);
        hideProgress();
        fileError.textContent = t('amrErrorConvert').replace('{msg}', convErr.message || convErr);
        fileDropZone.classList.remove('has-file');
        fileDropZone.classList.add('invalid');
        fileDropText.textContent = t('fileDropText');
        _pendingAudioDataUrl = null;
        return;
      }
    }

    _pendingAudioDataUrl = await readFileAsDataUrl(audioFile);
    _pendingAudioMime = audioFile.type;
    if (!isAmrFile(file)) {
      fileDropText.textContent = `✅ ${file.name}`;
      fileDropZone.classList.add('has-file');
    }
  } catch (err) {
    fileError.textContent = t('errorReadFile');
    _pendingAudioDataUrl = null;
  }
}

// File input change
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFileSelected(file);
});

// Drag & drop on the drop zone
fileDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  fileDropZone.classList.add('drag-over');
});

fileDropZone.addEventListener('dragleave', () => {
  fileDropZone.classList.remove('drag-over');
});

fileDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  fileDropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelected(file);
});

/* ============================================================
   TASK 9 — Form Submission & Validation
   ============================================================ */

/**
 * Validates the form fields.
 * @returns {boolean} true if valid
 */
function validateForm() {
  let valid = true;

  // Validate label
  const label = labelInput.value.trim();
  if (!label) {
    labelError.textContent = t('errorLabel');
    labelInput.classList.add('invalid');
    valid = false;
  } else {
    labelError.textContent = '';
    labelInput.classList.remove('invalid');
  }

  // Validate audio file
  if (!_pendingAudioDataUrl) {
    fileError.textContent = t('errorFile');
    fileDropZone.classList.add('invalid');
    valid = false;
  } else {
    fileError.textContent = '';
    fileDropZone.classList.remove('invalid');
  }

  return valid;
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const config = {
    id: `btn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: labelInput.value.trim(),
    emoji: emojiInput.value.trim() || DEFAULT_EMOJI,
    audioDataUrl: _pendingAudioDataUrl,
  };

  // Add to state, render, persist
  buttons.push(config);
  saveButtons();
  renderButton(config);
  updateEmptyState();

  closeDialog();
});

/* ============================================================
   TASK 10 — Dynamic Button Rendering
   ============================================================ */

/**
 * Creates and appends a sound button element to the grid.
 * @param {{ id: string, label: string, emoji: string, audioDataUrl: string }} config
 */
function renderButton(config) {
  const btn = document.createElement('button');
  btn.className = 'sound-btn';
  btn.id = config.id;
  btn.setAttribute('role', 'listitem');
  btn.setAttribute('aria-label', `Play ${config.label}`);
  btn.dataset.id = config.id;

  btn.innerHTML = `
    <span class="sound-btn-emoji" aria-hidden="true">${escapeHtml(config.emoji)}</span>
    <span class="sound-btn-label">${escapeHtml(config.label)}</span>
    <button
      class="delete-btn"
      aria-label="Delete ${escapeHtml(config.label)}"
      data-id="${config.id}"
      title="Delete"
      tabindex="-1"
    >&times;</button>
  `;

  // TASK 11 — Audio playback
  btn.addEventListener('click', (e) => {
    // Don't trigger if delete button was clicked
    if (e.target.closest('.delete-btn')) return;
    playSound(config, btn);
  });

  // TASK 13 — Delete button
  btn.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteButton(config.id);
  });

  buttonGrid.appendChild(btn);
}

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   TASK 11 — Audio Playback
   ============================================================ */

/** Map of button id → currently active Audio instance */
const activeAudio = new Map();

/**
 * Plays the audio for a given button config.
 * If already playing, restarts from the beginning.
 * @param {{ id: string, audioDataUrl: string }} config
 * @param {HTMLElement} btnEl
 */
function playSound(config, btnEl) {
  // Stop existing playback for this button
  if (activeAudio.has(config.id)) {
    const prev = activeAudio.get(config.id);
    prev.pause();
    prev.currentTime = 0;
    activeAudio.delete(config.id);
  }

  const audio = new Audio(config.audioDataUrl);
  activeAudio.set(config.id, audio);

  // Visual feedback
  btnEl.classList.add('playing');
  audio.addEventListener('ended', () => {
    btnEl.classList.remove('playing');
    activeAudio.delete(config.id);
  });
  audio.addEventListener('pause', () => {
    btnEl.classList.remove('playing');
  });

  audio.play().catch((err) => {
    console.warn(`Playback failed for "${config.label}":`, err);
    btnEl.classList.remove('playing');
    activeAudio.delete(config.id);

    // Help user debug local file access issues
    if (config.audioDataUrl.startsWith('./resources')) {
      alert(`${t('playbackError')}: ${err.message}\n\n${t('playbackLocalHint')}`);
    }
  });
}

/* ============================================================
   TASK 12 — localStorage Persistence
   ============================================================ */

/**
 * Saves the current buttons array to localStorage.
 */
function saveButtons() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buttons));
  } catch (err) {
    // Storage quota likely exceeded (large audio files)
    console.warn('localStorage quota exceeded — consider using fewer or smaller files.', err);
    alert(t('storageAlert'));
  }
}

/**
 * Loads buttons from localStorage and renders them all.
 * If no buttons are found, loads the default example set.
 */
function loadButtons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        buttons = parsed;
      } else {
        buttons = [...DEFAULT_SOUNDS];
      }
    } else {
      // First time loading: use defaults
      buttons = [...DEFAULT_SOUNDS];
    }

    buttons.forEach(renderButton);
  } catch (err) {
    console.warn('Failed to load saved buttons:', err);
    // Fallback to defaults on error
    buttons = [...DEFAULT_SOUNDS];
    buttons.forEach(renderButton);
  }
}

/* ============================================================
   TASK 13 — Delete Button
   ============================================================ */

/**
 * Removes a button by id from state, DOM, and localStorage.
 * @param {string} id
 */
function deleteButton(id) {
  // Stop any playing audio
  if (activeAudio.has(id)) {
    activeAudio.get(id).pause();
    activeAudio.delete(id);
  }

  // Remove from state
  buttons = buttons.filter(b => b.id !== id);
  saveButtons();

  // Remove from DOM with a fade-out animation
  const el = document.getElementById(id);
  if (el) {
    el.style.transition = 'opacity 200ms ease, transform 200ms ease';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.8)';
    setTimeout(() => {
      el.remove();
      updateEmptyState();
    }, 210);
  } else {
    updateEmptyState();
  }
}

/* ============================================================
   TASK 14 — Empty State
   ============================================================ */

/**
 * Shows or hides the empty state based on current button count.
 */
function updateEmptyState() {
  if (buttons.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }
}

/* ============================================================
   TTS — Text-to-Speech Module
   ============================================================ */

const TTS_STORAGE_KEY = 'soundboard_tts_v1';

/** @type {{ id: string, text: string }[]} */
let ttsItems = [];

/* TTS DOM refs */
const ttsSection    = document.getElementById('tts-section');
const ttsGrid       = document.getElementById('tts-grid');
const ttsTextInput  = document.getElementById('tts-text-input');
const ttsAddBtn     = document.getElementById('tts-add-btn');

/** Cached reference to the preferred Spanish female voice. */
let _spanishVoice = null;

/**
 * Scans available SpeechSynthesis voices and caches the best
 * Spanish (Spain) female voice. Falls back to any es-ES voice.
 */
function findSpanishVoice() {
  if (!('speechSynthesis' in window)) return null;

  const voices = speechSynthesis.getVoices();
  const esVoices = voices.filter(v =>
    v.lang === 'es-ES' || v.lang === 'es_ES' || v.lang.startsWith('es-ES')
  );

  // Common female voice name fragments (Chrome, Edge, Firefox, Safari)
  const femaleHints = [
    'helena', 'mónica', 'monica', 'esperanza', 'elvira',
    'lucía', 'lucia', 'paulina', 'female', 'mujer',
  ];

  const female = esVoices.find(v =>
    femaleHints.some(h => v.name.toLowerCase().includes(h))
  );

  _spanishVoice = female || esVoices[0] || null;
  return _spanishVoice;
}

/**
 * Speaks the given text using the Web Speech API.
 * Uses a Spanish (Spain) female voice when available.
 * @param {string}      text  - Text to synthesise
 * @param {HTMLElement} [btnEl] - Button element to animate while speaking
 */
function speak(text, btnEl) {
  if (!('speechSynthesis' in window)) {
    alert(t('ttsNoSupport'));
    return;
  }

  // Stop anything currently playing
  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang  = 'es-ES';
  utter.rate  = 1.0;
  utter.pitch = 1.1; // slightly higher → sounds more feminine on voices without gender metadata

  const voice = _spanishVoice || findSpanishVoice();
  if (voice) utter.voice = voice;

  if (btnEl) {
    btnEl.classList.add('playing');
    utter.onend   = () => btnEl.classList.remove('playing');
    utter.onerror = () => btnEl.classList.remove('playing');
  }

  speechSynthesis.speak(utter);
}

/**
 * Shows or hides the TTS section depending on whether there are items.
 */
function updateTtsSection() {
  ttsSection.hidden = ttsItems.length === 0;
}

/**
 * Renders a single TTS button into #tts-grid.
 * @param {{ id: string, text: string }} item
 */
function renderTtsButton(item) {
  const btn = document.createElement('button');
  btn.className = 'tts-btn';
  btn.id        = item.id;
  btn.setAttribute('role', 'listitem');
  btn.setAttribute('aria-label', `Reproducir: ${item.text}`);
  btn.dataset.id = item.id;

  btn.innerHTML = `
    <span class="tts-btn-icon" aria-hidden="true">🔊</span>
    <span class="tts-btn-text">${escapeHtml(item.text)}</span>
    <button
      class="delete-btn tts-delete-btn"
      aria-label="Eliminar"
      data-id="${item.id}"
      title="Eliminar"
      tabindex="-1"
    >&times;</button>
  `;

  btn.addEventListener('click', (e) => {
    if (e.target.closest('.delete-btn')) return;
    speak(item.text, btn);
  });

  btn.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTtsItem(item.id);
  });

  ttsGrid.appendChild(btn);
  updateTtsSection();
}

/**
 * Removes a TTS item from state, DOM, and localStorage.
 * @param {string} id
 */
function deleteTtsItem(id) {
  // Stop speech if this item is currently playing
  speechSynthesis.cancel();

  ttsItems = ttsItems.filter(t => t.id !== id);
  saveTtsItems();

  const el = document.getElementById(id);
  if (el) {
    el.style.transition = 'opacity 200ms ease, transform 200ms ease';
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(20px)';
    setTimeout(() => { el.remove(); updateTtsSection(); }, 210);
  } else {
    updateTtsSection();
  }
}

/** Persists ttsItems to localStorage. */
function saveTtsItems() {
  try {
    localStorage.setItem(TTS_STORAGE_KEY, JSON.stringify(ttsItems));
  } catch (err) {
    console.warn('TTS localStorage error:', err);
  }
}

/** Loads TTS items from localStorage and renders them. */
function loadTtsItems() {
  try {
    const raw = localStorage.getItem(TTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        ttsItems = parsed;
        ttsItems.forEach(renderTtsButton);
      }
    }
  } catch (err) {
    console.warn('Failed to load TTS items:', err);
  }
  updateTtsSection();
}

/* ── TTS Add button ── */
ttsAddBtn.addEventListener('click', () => {
  const text = ttsTextInput.value.trim();
  if (!text) {
    ttsTextInput.focus();
    return;
  }

  const item = {
    id:   `tts-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
  };

  ttsItems.push(item);
  saveTtsItems();
  renderTtsButton(item);

  ttsTextInput.value = '';
  ttsTextInput.focus();

  // Scroll newly added button into view
  const newBtn = document.getElementById(item.id);
  if (newBtn) newBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* Enter (without Shift) submits; Shift+Enter adds a newline */
ttsTextInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    ttsAddBtn.click();
  }
});

/* Load voices — the event fires asynchronously in Chrome/Edge */
if ('speechSynthesis' in window) {
  findSpanishVoice(); // may already be populated in Firefox/Safari
  speechSynthesis.addEventListener('voiceschanged', findSpanishVoice);
}

/* ============================================================
   INIT — Bootstrap the app
   ============================================================ */
(function init() {
  loadButtons();
  updateEmptyState();
  loadTtsItems();
})();

