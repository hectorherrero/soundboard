/**
 * Soundboard App — app.js
 * Tasks 7–14: modal logic, file reading, form submission, rendering,
 *             audio playback, localStorage persistence, delete, empty state.
 */

'use strict';

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */
const STORAGE_KEY = 'soundboard_buttons_v1';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB warning threshold
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
  fileDropText.textContent = 'Choose or drop an audio file';
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
 * Handles a newly selected/dropped audio file.
 * @param {File} file
 */
async function handleFileSelected(file) {
  if (!file) return;

  // Reset previous state
  fileError.textContent = '';
  fileDropZone.classList.remove('invalid', 'has-file');
  sizeWarning.hidden = true;

  // Validate MIME type
  if (!file.type.startsWith('audio/')) {
    fileError.textContent = 'Please select a valid audio file.';
    fileDropZone.classList.add('invalid');
    return;
  }

  // Size warning
  if (file.size > MAX_FILE_SIZE) {
    sizeWarning.hidden = false;
  }

  try {
    _pendingAudioDataUrl = await readFileAsDataUrl(file);
    _pendingAudioMime = file.type;
    fileDropText.textContent = `✅ ${file.name}`;
    fileDropZone.classList.add('has-file');
  } catch (err) {
    fileError.textContent = 'Could not read the file. Please try again.';
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
    labelError.textContent = 'Please enter a label for the button.';
    labelInput.classList.add('invalid');
    valid = false;
  } else {
    labelError.textContent = '';
    labelInput.classList.remove('invalid');
  }

  // Validate audio file
  if (!_pendingAudioDataUrl) {
    fileError.textContent = 'Please select an audio file.';
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
      alert(`Playback Error: ${err.message}\n\nThis is likely a browser security restriction for local files. Try opening the page through a local server or adding your own sounds using the "+" button.`);
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
    alert('⚠️ Storage limit reached. Some sounds may not be saved after refresh.\nTry using smaller audio files (MP3 at 128 kbps recommended).');
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
   INIT — Bootstrap the app
   ============================================================ */
(function init() {
  loadButtons();
  updateEmptyState();
})();
