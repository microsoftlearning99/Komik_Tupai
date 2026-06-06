// ==========================================================================
// COMIC VIEWER APPLICATION LOGIC
// ==========================================================================

// Constants
const NATIVE_WIDTH = 1024;
const NATIVE_HEIGHT = 558;

// Default Panel Definitions
const DEFAULT_PANELS = [
  { id: 1, name: "Halaman 1: Judul", x: 10, y: 10, w: 327, h: 175, text: "Tupai Kecil dan Daun Kering. Oleh Kelompok C3. Susila Wati Kuseladewi, Eksi Krisna Sandi, Agustina Dwi Purwaningsih, Verena Amabel Naindra Pramudita." },
  { id: 2, name: "Halaman 2: Sapu Halaman", x: 343, y: 10, w: 154, h: 175, text: "Lalala... aku mau membersihkan halaman hutan!" },
  { id: 3, name: "Halaman 3: Burung Menyapa", x: 503, y: 10, w: 154, h: 175, text: "Wah, rajin sekali, Tupai! Sapu... sapu... kumpulkan di sini!" },
  { id: 4, name: "Halaman 4: Ide Membakar", x: 663, y: 10, w: 154, h: 175, text: "Hmmm... supaya cepat bersih, aku bakar saja daun ini!" },
  { id: 5, name: "Halaman 5: Mulai Membakar", x: 823, y: 10, w: 191, h: 175, text: "Criiiing... fuuush... Api menyala membakar daun kering." },
  { id: 6, name: "Halaman 6: Api Mulai Tumbuh", x: 10, y: 195, w: 237, h: 175, text: "Tupai terus menyapu daun-daun ke arah api." },
  { id: 7, name: "Halaman 7: Api Membesar", x: 253, y: 195, w: 244, h: 175, text: "Awas! Apinya membesar! Cough! Gasp! Cough!" },
  { id: 8, name: "Halaman 8: Siram Air", x: 503, y: 195, w: 249, h: 175, text: "Byur! Byur! Byur! Kelinci menyiram air. Huft... hampir saja pohon terbakar." },
  { id: 9, name: "Halaman 9: Nasehat Kelinci", x: 758, y: 195, w: 256, h: 175, text: "Membakar daun bisa membuat kebakaran dan udara jadi kotor. Maaf teman-teman... aku tidak tahu kalau api bisa berbahaya." },
  { id: 10, name: "Halaman 10: Solusi Kompos", x: 10, y: 380, w: 283, h: 168, text: "Daun kering tidak perlu dibakar. Daun bisa ditimbun menjadi pupuk kompos. Kompos itu makanan untuk tanaman!" },
  { id: 11, name: "Halaman 11: Membuat Kompos", x: 299, y: 380, w: 249, h: 168, text: "Wah, ternyata mudah! Tupai dan Kelinci mengubur daun kering untuk kompos." },
  { id: 12, name: "Halaman 12: Hutan Terjaga", x: 554, y: 380, w: 254, h: 168, text: "Sekarang aku tahu cara menjaga hutan! Semua hewan pun hidup bahagia." },
  { id: 13, name: "Halaman 13: Pesan Moral", x: 814, y: 380, w: 200, h: 168, text: "Pesan Moral: Jangan membakar sampah sembarangan karena dapat menyebabkan kebakaran dan polusi. Daun kering bisa dijadikan pupuk kompos yang bermanfaat untuk tanaman dan lingkungan." }
];

// App State
let panels = JSON.parse(localStorage.getItem('comic_panels')) || [...DEFAULT_PANELS];
let currentIndex = 0;
let isPlaying = false;
let autoplayTimer = null;
let autoplayDuration = 5; // in seconds
let voiceoverEnabled = true;
let soundFxEnabled = true;
let transitionType = 'slide-horizontal';
let selectedVoiceName = '';
let voicePitch = 1.0;
let voiceRate = 1.0;
let scrollOrientation = localStorage.getItem('scroll_orientation') || 'horizontal';
let observer = null;
let hasScrolled = false;

// Editor Drag/Resize State
let selectedEditorPanelIndex = 0;
let dragMode = null; // 'move' or 'resize-tl', 'resize-tr', etc.
let dragStartX = 0;
let dragStartY = 0;
let dragStartCoords = { x: 0, y: 0, w: 0, h: 0 };

// DOM Elements - Navigation & Viewports
const readerView = document.getElementById('reader-view');
const editorView = document.getElementById('editor-view');
const modeReaderBtn = document.getElementById('mode-reader-btn');
const modeEditorBtn = document.getElementById('mode-editor-btn');
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsDrawer = document.getElementById('settings-drawer');
const settingsCloseBtn = document.getElementById('settings-close-btn');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const scrollReaderContainer = document.getElementById('scroll-reader-container');
const layoutToggleBtn = document.getElementById('layout-toggle-btn');
const layoutIcon = document.getElementById('layout-icon');
const layoutText = document.getElementById('layout-text');
const scrollHelpOverlay = document.getElementById('scroll-help-overlay');
const viewportOuter = document.querySelector('.viewport-outer');
const narrativeText = document.getElementById('narrative-text');
const speechSpeakBtn = document.getElementById('speech-speak-btn');
const progressDots = document.getElementById('progress-dots');

const autoplayBtn = document.getElementById('autoplay-btn');
const autoplayIcon = document.getElementById('autoplay-icon');
const autoplayText = document.getElementById('autoplay-text');
const voiceoverToggleBtn = document.getElementById('voiceover-toggle-btn');
const soundfxToggleBtn = document.getElementById('soundfx-toggle-btn');
const toolbarSheetViewBtn = document.getElementById('toolbar-sheet-view-btn');

// Global Image instance for ambient glow color sampling
const globalComicImg = new Image();
globalComicImg.src = 'comic.png';

// DOM Elements - Editor Workspace
const canvasContainer = document.getElementById('canvas-container');
const editorComicImg = document.getElementById('editor-comic-img');
const cropBoxOverlay = document.getElementById('crop-box-overlay');
const editorPanelList = document.getElementById('editor-panel-list');
const editorAddBtn = document.getElementById('editor-add-btn');
const editorDeleteBtn = document.getElementById('editor-delete-btn');
const editorSavePanelBtn = document.getElementById('editor-save-panel-btn');

const pCoordX = document.getElementById('p-coord-x');
const pCoordY = document.getElementById('p-coord-y');
const pCoordW = document.getElementById('p-coord-w');
const pCoordH = document.getElementById('p-coord-h');
const pText = document.getElementById('p-text');

const editorResetBtn = document.getElementById('editor-reset-btn');
const editorExportBtn = document.getElementById('editor-export-btn');
const editorImportBtn = document.getElementById('editor-import-btn');
const importFileInput = document.getElementById('import-file-input');

// DOM Elements - Modals & Drawer Configs
const sheetViewModal = document.getElementById('sheet-view-modal');
const sheetCloseBtn = document.getElementById('sheet-close-btn');
const sheetHotspotsOverlay = document.getElementById('sheet-hotspots-overlay');

const selectTransition = document.getElementById('select-transition');
const autoplaySpeedSlider = document.getElementById('autoplay-speed-slider');
const autoplaySpeedValue = document.getElementById('autoplay-speed-value');
const selectVoice = document.getElementById('select-voice');
const voicePitchSlider = document.getElementById('voice-pitch-slider');
const voicePitchValue = document.getElementById('voice-pitch-value');
const voiceRateSlider = document.getElementById('voice-rate-slider');
const voiceRateValue = document.getElementById('voice-rate-value');

// ==========================================================================
// CORE AUDIOS & SPEECH SYNTHESIS
// ==========================================================================

// Web Audio API Synthesized SFX: Realistic paper-flipping swoosh
function playPageFlipSound() {
  if (!soundFxEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const duration = 0.35; // seconds
    const sampleRate = audioCtx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate filtered noise simulation
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteNoise = Math.random() * 2 - 1;
      // Simple lowpass filter in noise generation
      data[i] = 0.8 * lastOut + 0.2 * whiteNoise;
      lastOut = data[i];
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    // Lowpass filter sweep
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + duration - 0.05);
    
    // Envelope gain control
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.06); // attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration); // decay
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noiseNode.start();
  } catch (err) {
    console.warn("Web Audio API error: ", err);
  }
}

// Populate Speech Voices List
function populateVoicesList() {
  if (typeof speechSynthesis === 'undefined') return;
  
  const voices = speechSynthesis.getVoices();
  selectVoice.innerHTML = '';
  
  // Create system default option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = 'default';
  defaultOpt.textContent = 'Suara Sistem Otomatis';
  selectVoice.appendChild(defaultOpt);
  
  // Filter for Indonesian voices first, then list others
  const idVoices = voices.filter(v => v.lang.startsWith('id') || v.lang.includes('IND') || v.name.toLowerCase().includes('indonesian'));
  
  idVoices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    if (voice.name === selectedVoiceName) option.selected = true;
    selectVoice.appendChild(option);
  });

  voices.forEach(voice => {
    if (!idVoices.includes(voice)) {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      if (voice.name === selectedVoiceName) option.selected = true;
      selectVoice.appendChild(option);
    }
  });
}

// Speak Narrative Text using SpeechSynthesis
function speakCurrentPanel(onEndCallback = null) {
  if (typeof speechSynthesis === 'undefined') return;
  
  speechSynthesis.cancel(); // Stop any active speech
  
  if (!voiceoverEnabled) {
    if (onEndCallback) onEndCallback();
    return;
  }
  
  const text = panels[currentIndex].text;
  if (!text || text.trim() === "") {
    if (onEndCallback) onEndCallback();
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Resolve Voice Selection
  const voices = speechSynthesis.getVoices();
  if (selectedVoiceName && selectedVoiceName !== 'default') {
    const voice = voices.find(v => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;
  } else {
    // Attempt automatic Indonesian voice matching
    const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('IND') || v.name.toLowerCase().includes('indonesian'));
    if (idVoice) utterance.voice = idVoice;
  }
  
  utterance.pitch = voicePitch;
  utterance.rate = voiceRate;
  
  utterance.onstart = () => {
    speechSpeakBtn.classList.add('playing');
  };
  
  utterance.onend = () => {
    speechSpeakBtn.classList.remove('playing');
    if (onEndCallback) onEndCallback();
  };
  
  utterance.onerror = (e) => {
    console.error("Speech Synthesis error: ", e);
    speechSpeakBtn.classList.remove('playing');
    if (onEndCallback) onEndCallback();
  };
  
  speechSynthesis.speak(utterance);
}

// ==========================================================================
// COLOR SYSTEM - AMBILIGHT DYNAMIC BACKLIGHT GLOW
// ==========================================================================

// Sample colors of current panel and set background variables
function updateAmbientGlow(x, y, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  try {
    // Crop panel and draw to offscreen canvas
    ctx.drawImage(globalComicImg, x, y, w, h, 0, 0, 16, 16);
    const imgData = ctx.getImageData(0, 0, 16, 16).data;
    
    let r = 0, g = 0, b = 0, count = 0;
    // Average pixel color
    for (let i = 0; i < imgData.length; i += 4) {
      // Ignore absolute black margins
      if (imgData[i] < 15 && imgData[i+1] < 15 && imgData[i+2] < 15) continue;
      r += imgData[i];
      g += imgData[i+1];
      b += imgData[i+2];
      count++;
    }
    
    if (count > 0) {
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
    } else {
      // Default to neutral wood/sage if too dark
      r = 94; g = 185; b = 120;
    }
    
    // Update theme custom variables
    document.documentElement.style.setProperty('--ambient-color', `rgba(${r}, ${g}, ${b}, 0.2)`);
    document.documentElement.style.setProperty('--ambient-color-solid', `rgb(${r}, ${g}, ${b})`);
  } catch (err) {
    // In case of CORS or load issues, fall back silently
  }
}

// ==========================================================================
// READER VIEW NAV & DRAW SYSTEM
// ==========================================================================

// Render all panels in the scrollable viewport
function renderReaderPanel() {
  initializeScrollReader();
}

function initializeScrollReader() {
  if (panels.length === 0) return;
  scrollReaderContainer.innerHTML = '';
  
  panels.forEach((panel, idx) => {
    const slide = document.createElement('div');
    slide.className = `panel-slide ${idx === currentIndex ? 'active' : ''}`;
    slide.dataset.index = idx;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'panel-card-wrapper';
    wrapper.style.aspectRatio = `${panel.w} / ${panel.h}`;
    
    const clipper = document.createElement('div');
    clipper.className = 'panel-clipper';
    
    const img = document.createElement('img');
    img.className = 'panel-img';
    img.src = 'comic.png';
    img.alt = panel.name;
    
    // Scale and position calculation
    const scaleX = (NATIVE_WIDTH / panel.w) * 100;
    const scaleY = (NATIVE_HEIGHT / panel.h) * 100;
    const offsetX = (panel.x / panel.w) * 100;
    const offsetY = (panel.y / panel.h) * 100;
    
    img.style.width = `${scaleX}%`;
    img.style.height = `${scaleY}%`;
    img.style.left = `-${offsetX}%`;
    img.style.top = `-${offsetY}%`;
    
    clipper.appendChild(img);
    wrapper.appendChild(clipper);
    slide.appendChild(wrapper);
    scrollReaderContainer.appendChild(slide);
  });
  
  // Apply active direction styles
  updateScrollLayoutStyles();
  
  // Center on currently active panel immediately without scroll animation
  scrollToActivePanel(false);
  
  // Setup intersection observer to detect active panel when user swipes/scrolls manually
  setupScrollObserver();
  
  // Render dots
  updateProgressDots();
  
  // Trigger initial TTS & ambient glow
  const currentPanel = panels[currentIndex];
  if (currentPanel) {
    if (globalComicImg.complete) {
      updateAmbientGlow(currentPanel.x, currentPanel.y, currentPanel.w, currentPanel.h);
    } else {
      globalComicImg.onload = () => updateAmbientGlow(currentPanel.x, currentPanel.y, currentPanel.w, currentPanel.h);
    }
    narrativeText.textContent = currentPanel.text || "(Tidak ada dialog)";
    speakCurrentPanel();
  }
}

function updateScrollLayoutStyles() {
  if (scrollOrientation === 'horizontal') {
    scrollReaderContainer.classList.add('scroll-horizontal');
    scrollReaderContainer.classList.remove('scroll-vertical');
    layoutText.textContent = 'Arah: Horizontal';
    layoutIcon.innerHTML = `<path d="M3 3h18v18H3z M9 3v18 M15 3v18"></path>`; // Column style layout icon
  } else {
    scrollReaderContainer.classList.add('scroll-vertical');
    scrollReaderContainer.classList.remove('scroll-horizontal');
    layoutText.textContent = 'Arah: Vertikal';
    layoutIcon.innerHTML = `<path d="M3 3h18v18H3z M3 9h18 M3 15h18"></path>`; // Row style layout icon
  }
}

function toggleScrollLayout() {
  scrollOrientation = scrollOrientation === 'horizontal' ? 'vertical' : 'horizontal';
  localStorage.setItem('scroll_orientation', scrollOrientation);
  updateScrollLayoutStyles();
  setupScrollObserver();
  scrollToActivePanel(false);
}

function scrollToActivePanel(smooth = true) {
  if (panels.length === 0) return;
  const activeSlide = scrollReaderContainer.querySelector(`.panel-slide[data-index="${currentIndex}"]`);
  if (!activeSlide) return;
  
  // Temporarily detach observer during programmatic scrolling to avoid race triggers
  if (observer) {
    const slides = scrollReaderContainer.querySelectorAll('.panel-slide');
    slides.forEach(slide => observer.unobserve(slide));
  }
  
  activeSlide.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'center',
    inline: 'center'
  });
  
  // Reconnect observer after scroll transition completes
  setTimeout(() => {
    if (observer) {
      const slides = scrollReaderContainer.querySelectorAll('.panel-slide');
      slides.forEach(slide => observer.observe(slide));
    }
  }, smooth ? 600 : 50);
}

function setupScrollObserver() {
  if (observer) observer.disconnect();
  
  const options = {
    root: scrollReaderContainer,
    threshold: 0.55,
    rootMargin: '0px'
  };
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index);
        if (index !== currentIndex) {
          onActivePanelChanged(index);
        }
      }
    });
  }, options);
  
  const slides = scrollReaderContainer.querySelectorAll('.panel-slide');
  slides.forEach(slide => observer.observe(slide));
}

function onActivePanelChanged(newIndex) {
  currentIndex = newIndex;
  
  // Highlight active slide
  const slides = scrollReaderContainer.querySelectorAll('.panel-slide');
  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentIndex);
  });
  
  const panel = panels[currentIndex];
  if (!panel) return;
  
  // Update dialogue bubble
  narrativeText.textContent = panel.text || "(Tidak ada dialog)";
  
  // Update progress dots
  updateProgressDots();
  
  // Update ambient glow color
  if (globalComicImg.complete) {
    updateAmbientGlow(panel.x, panel.y, panel.w, panel.h);
  } else {
    globalComicImg.onload = () => updateAmbientGlow(panel.x, panel.y, panel.w, panel.h);
  }
  
  // Speech Playback
  if (isPlaying) {
    speakCurrentPanel(() => {
      // Advance automatically after speech finishes if still playing
      if (isPlaying && currentIndex === newIndex) {
        autoplayTimer = setTimeout(() => {
          advanceNextPanel();
        }, 1500);
      }
    });
  } else {
    speakCurrentPanel();
  }
}

// Change panel with transition
function transitionToPanel(newIndex, direction) {
  if (newIndex < 0 || newIndex >= panels.length) return;
  
  if (autoplayTimer) clearTimeout(autoplayTimer);
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  
  playPageFlipSound();
  
  currentIndex = newIndex;
  onActivePanelChanged(currentIndex);
  scrollToActivePanel(true);
}

function advanceNextPanel() {
  if (currentIndex < panels.length - 1) {
    transitionToPanel(currentIndex + 1, 'next');
  } else {
    if (isPlaying) toggleAutoplay(false);
    transitionToPanel(0, 'next'); // loops back
  }
}

// Clean up unused advancePrevPanel argument
function advancePrevPanel() {
  if (currentIndex > 0) {
    transitionToPanel(currentIndex - 1, 'prev');
  } else {
    transitionToPanel(panels.length - 1, 'prev');
  }
}

// Generate Dot Trackers
function updateProgressDots() {
  progressDots.innerHTML = '';
  panels.forEach((panel, idx) => {
    const dot = document.createElement('div');
    dot.className = `dot ${idx === currentIndex ? 'active' : ''}`;
    dot.title = panel.name;
    dot.addEventListener('click', () => {
      if (idx !== currentIndex) {
        transitionToPanel(idx, idx > currentIndex ? 'next' : 'prev');
      }
    });
    progressDots.appendChild(dot);
  });
}

// Autoplay Toggle
function toggleAutoplay(forceState) {
  isPlaying = forceState !== undefined ? forceState : !isPlaying;
  
  if (isPlaying) {
    autoplayBtn.classList.add('active');
    autoplayIcon.className = 'icon-play active';
    autoplayIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `; // Pause icon
    autoplayText.textContent = 'Jeda Putar';
    
    // Resume speech
    speakCurrentPanel(() => {
      if (isPlaying) {
        autoplayTimer = setTimeout(() => {
          advanceNextPanel();
        }, 1500);
      }
    });
  } else {
    if (autoplayTimer) clearTimeout(autoplayTimer);
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    autoplayBtn.classList.remove('active');
    autoplayIcon.className = 'icon-play';
    autoplayIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`; // Play icon
    autoplayText.textContent = 'Putar Otomatis';
  }
}

// Full Sheet hotspot renderer
function populateSheetHotspots() {
  sheetHotspotsOverlay.innerHTML = '';
  panels.forEach((panel, idx) => {
    const hotspot = document.createElement('div');
    hotspot.className = 'hotspot-area';
    
    // Convert native pixel coordinates to percentage coordinates
    const leftPct = (panel.x / NATIVE_WIDTH) * 100;
    const topPct = (panel.y / NATIVE_HEIGHT) * 100;
    const widthPct = (panel.w / NATIVE_WIDTH) * 100;
    const heightPct = (panel.h / NATIVE_HEIGHT) * 100;
    
    hotspot.style.left = `${leftPct}%`;
    hotspot.style.top = `${topPct}%`;
    hotspot.style.width = `${widthPct}%`;
    hotspot.style.height = `${heightPct}%`;
    hotspot.title = `${panel.name}: ${panel.text}`;
    
    hotspot.addEventListener('click', () => {
      sheetViewModal.classList.remove('active');
      transitionToPanel(idx, idx > currentIndex ? 'next' : 'prev');
    });
    sheetHotspotsOverlay.appendChild(hotspot);
  });
}

// ==========================================================================
// EDITOR VIEW: VISUAL PANEL CRAPPING (DRAG / RESIZE / SYNC)
// ==========================================================================

// Populate visual panels list sidebar
function renderEditorPanelList() {
  editorPanelList.innerHTML = '';
  panels.forEach((panel, idx) => {
    const item = document.createElement('div');
    item.className = `editor-panel-item ${idx === selectedEditorPanelIndex ? 'active' : ''}`;
    
    item.innerHTML = `
      <div class="panel-item-left">
        <span>#${idx + 1}</span>
        <span>${panel.name}</span>
      </div>
      <div class="panel-item-coords">[${panel.x}, ${panel.y}, ${panel.w}x${panel.h}]</div>
    `;
    
    item.addEventListener('click', () => {
      selectEditorPanel(idx);
    });
    
    editorPanelList.appendChild(item);
  });
}

// Select a panel to edit
function selectEditorPanel(idx) {
  if (idx < 0 || idx >= panels.length) return;
  selectedEditorPanelIndex = idx;
  
  // Render active selection classes in list
  const items = editorPanelList.querySelectorAll('.editor-panel-item');
  items.forEach((item, i) => {
    item.className = `editor-panel-item ${i === idx ? 'active' : ''}`;
  });
  
  // Sync Sidebar coordinate form
  const panel = panels[idx];
  pCoordX.value = panel.x;
  pCoordY.value = panel.y;
  pCoordW.value = panel.w;
  pCoordH.value = panel.h;
  pText.value = panel.text;
  
  // Render visual bounding boxes in canvas
  renderCanvasCropBoxes();
}

// Render Draggable bounding boxes on Canvas
function renderCanvasCropBoxes() {
  cropBoxOverlay.innerHTML = '';
  
  // Work out visual scaling ratio of image on screen vs original dimensions
  const scale = editorComicImg.clientWidth / NATIVE_WIDTH;
  
  panels.forEach((panel, idx) => {
    const box = document.createElement('div');
    box.className = `crop-box ${idx === selectedEditorPanelIndex ? 'active' : ''}`;
    box.dataset.index = idx;
    
    // Scale parameters
    box.style.left = `${panel.x * scale}px`;
    box.style.top = `${panel.y * scale}px`;
    box.style.width = `${panel.w * scale}px`;
    box.style.height = `${panel.h * scale}px`;
    
    // Add box label
    const label = document.createElement('div');
    label.className = 'crop-box-label';
    label.textContent = `#${idx + 1} ${panel.name}`;
    box.appendChild(label);
    
    // Add resizing handles ONLY to active box
    if (idx === selectedEditorPanelIndex) {
      const handles = ['tl', 'tr', 'bl', 'br'];
      handles.forEach(h => {
        const handle = document.createElement('div');
        handle.className = `handle ${h}`;
        handle.dataset.handle = h;
        box.appendChild(handle);
      });
    }
    
    cropBoxOverlay.appendChild(box);
  });
}

// Mouse/Touch Drag Handlers for Editor Bounding Boxes
cropBoxOverlay.addEventListener('mousedown', onDragStart);
document.addEventListener('mousemove', onDragMove);
document.addEventListener('mouseup', onDragEnd);

// Touch support
cropBoxOverlay.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) onDragStart(e.touches[0]);
});
document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1) onDragMove(e.touches[0]);
});
document.addEventListener('touchend', onDragEnd);

function onDragStart(e) {
  const target = e.target;
  
  // Find associated cropbox elements
  const cropBox = target.closest('.crop-box');
  if (!cropBox) return;
  
  const index = parseInt(cropBox.dataset.index);
  
  // Select panel if not selected
  if (index !== selectedEditorPanelIndex) {
    selectEditorPanel(index);
    return;
  }
  
  // Check if handle or box body is dragged
  if (target.classList.contains('handle')) {
    dragMode = `resize-${target.dataset.handle}`;
  } else {
    dragMode = 'move';
  }
  
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  
  const panel = panels[index];
  dragStartCoords = { x: panel.x, y: panel.y, w: panel.w, h: panel.h };
  
  // Prevent default scroll/select behaviors
  if (e.preventDefault) e.preventDefault();
}

function onDragMove(e) {
  if (!dragMode) return;
  
  const scale = editorComicImg.clientWidth / NATIVE_WIDTH;
  
  // Delta movements in screen pixels converted to original canvas pixels
  const deltaX = Math.round((e.clientX - dragStartX) / scale);
  const deltaY = Math.round((e.clientY - dragStartY) / scale);
  
  const panel = panels[selectedEditorPanelIndex];
  
  if (dragMode === 'move') {
    // Boundaries checks
    let newX = dragStartCoords.x + deltaX;
    let newY = dragStartCoords.y + deltaY;
    
    newX = Math.max(0, Math.min(NATIVE_WIDTH - dragStartCoords.w, newX));
    newY = Math.max(0, Math.min(NATIVE_HEIGHT - dragStartCoords.h, newY));
    
    panel.x = newX;
    panel.y = newY;
  } else if (dragMode.startsWith('resize-')) {
    const handle = dragMode.replace('resize-', '');
    
    let newX = dragStartCoords.x;
    let newY = dragStartCoords.y;
    let newW = dragStartCoords.w;
    let newH = dragStartCoords.h;
    
    if (handle.includes('l')) { // left resize
      const computedX = dragStartCoords.x + deltaX;
      newX = Math.max(0, Math.min(dragStartCoords.x + dragStartCoords.w - 10, computedX));
      newW = dragStartCoords.w + (dragStartCoords.x - newX);
    }
    if (handle.includes('r')) { // right resize
      const computedW = dragStartCoords.w + deltaX;
      newW = Math.max(10, Math.min(NATIVE_WIDTH - dragStartCoords.x, computedW));
    }
    if (handle.includes('t')) { // top resize
      const computedY = dragStartCoords.y + deltaY;
      newY = Math.max(0, Math.min(dragStartCoords.y + dragStartCoords.h - 10, computedY));
      newH = dragStartCoords.h + (dragStartCoords.y - newY);
    }
    if (handle.includes('b')) { // bottom resize
      const computedH = dragStartCoords.h + deltaY;
      newH = Math.max(10, Math.min(NATIVE_HEIGHT - dragStartCoords.y, computedH));
    }
    
    panel.x = newX;
    panel.y = newY;
    panel.w = newW;
    panel.h = newH;
  }
  
  // Live Sync Sidebar inputs
  pCoordX.value = panel.x;
  pCoordY.value = panel.y;
  pCoordW.value = panel.w;
  pCoordH.value = panel.h;
  
  // Render boxes updates on screen
  renderCanvasCropBoxes();
  
  // Live sync sidebar list coordinates text
  const item = editorPanelList.children[selectedEditorPanelIndex];
  if (item) {
    item.querySelector('.panel-item-coords').textContent = `[${panel.x}, ${panel.y}, ${panel.w}x${panel.h}]`;
  }
}

function onDragEnd() {
  if (dragMode) {
    dragMode = null;
    // Save to LocalStorage
    savePanelsConfig();
  }
}

// Save panel configurations
function savePanelsConfig() {
  localStorage.setItem('comic_panels', JSON.stringify(panels));
}

// Sync fields back to coordinates when user types manually
function syncFormInputsToActivePanel() {
  if (selectedEditorPanelIndex === -1) return;
  
  const panel = panels[selectedEditorPanelIndex];
  panel.x = Math.max(0, parseInt(pCoordX.value) || 0);
  panel.y = Math.max(0, parseInt(pCoordY.value) || 0);
  panel.w = Math.max(10, parseInt(pCoordW.value) || 10);
  panel.h = Math.max(10, parseInt(pCoordH.value) || 10);
  panel.text = pText.value;
  
  savePanelsConfig();
  renderCanvasCropBoxes();
  renderEditorPanelList();
}

// Global window resize: cropbox coordinates adapt
window.addEventListener('resize', () => {
  if (editorView.classList.contains('active')) {
    renderCanvasCropBoxes();
  }
});

// ==========================================================================
// BIND EVENTS & HANDLERS
// ==========================================================================

// Navigation Arrow Button events
prevBtn.addEventListener('click', advancePrevPanel);
nextBtn.addEventListener('click', advanceNextPanel);

// Keyboard arrow listeners
document.addEventListener('keydown', (e) => {
  // Only listen to hotkeys if reader mode is active and user is not inside textareas
  if (!readerView.classList.contains('active')) return;
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
  
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    advanceNextPanel();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    advancePrevPanel();
  }
});

// Layout direction switcher
layoutToggleBtn.addEventListener('click', toggleScrollLayout);

// Help overlay dismiss and desktop mouse wheel translation
function handleFirstScroll() {
  if (hasScrolled) return;
  hasScrolled = true;
  if (scrollHelpOverlay) {
    scrollHelpOverlay.classList.add('fade-out');
    setTimeout(() => {
      scrollHelpOverlay.style.display = 'none';
    }, 800);
  }
}

scrollReaderContainer.addEventListener('scroll', handleFirstScroll, { passive: true });

scrollReaderContainer.addEventListener('wheel', (e) => {
  if (scrollOrientation === 'horizontal') {
    if (e.deltaY !== 0) {
      e.preventDefault();
      scrollReaderContainer.scrollLeft += e.deltaY;
      handleFirstScroll();
    }
  }
}, { passive: false });

// Double click panel viewport: open Full Sheet View modal
viewportOuter.addEventListener('dblclick', () => {
  populateSheetHotspots();
  sheetViewModal.classList.add('active');
});

// Narrator Speak Click trigger
speechSpeakBtn.addEventListener('click', () => {
  if (speechSpeakBtn.classList.contains('playing')) {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    speechSpeakBtn.classList.remove('playing');
  } else {
    speakCurrentPanel();
  }
});

// View switchers
modeReaderBtn.addEventListener('click', () => {
  if (modeReaderBtn.classList.contains('active')) return;
  
  // Toggle buttons
  modeReaderBtn.classList.add('active');
  modeEditorBtn.classList.remove('active');
  
  // Toggle views
  readerView.classList.add('active');
  editorView.classList.remove('active');
  
  // Cancel active sounds & reload panel layout
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  renderReaderPanel();
});

modeEditorBtn.addEventListener('click', () => {
  if (modeEditorBtn.classList.contains('active')) return;
  
  // Stop autoplay if active
  if (isPlaying) toggleAutoplay(false);
  
  modeEditorBtn.classList.add('active');
  modeReaderBtn.classList.remove('active');
  
  editorView.classList.add('active');
  readerView.classList.remove('active');
  
  // Load workspace lists
  setTimeout(() => {
    renderEditorPanelList();
    selectEditorPanel(selectedEditorPanelIndex);
  }, 100); // slight buffer for transitions
});

// Settings Drawer
settingsToggleBtn.addEventListener('click', () => {
  settingsDrawer.classList.add('active');
});
settingsCloseBtn.addEventListener('click', () => {
  settingsDrawer.classList.remove('active');
});
settingsDrawer.addEventListener('click', (e) => {
  if (e.target === settingsDrawer) settingsDrawer.classList.remove('active');
});

// Sheet modal
toolbarSheetViewBtn.addEventListener('click', () => {
  populateSheetHotspots();
  sheetViewModal.classList.add('active');
});
sheetCloseBtn.addEventListener('click', () => {
  sheetViewModal.classList.remove('active');
});
sheetViewModal.addEventListener('click', (e) => {
  if (e.target === sheetViewModal) sheetViewModal.classList.remove('active');
});

// Theme Selectors
const themeButtons = document.querySelectorAll('.theme-btn');
themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    themeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const theme = btn.dataset.theme;
    document.body.className = theme;
  });
});

// Transitions Selector
selectTransition.addEventListener('change', (e) => {
  transitionType = e.target.value;
});

// Autoplay Speed Controls
autoplayBtn.addEventListener('click', () => toggleAutoplay());
autoplaySpeedSlider.addEventListener('input', (e) => {
  autoplayDuration = parseInt(e.target.value);
  autoplaySpeedValue.textContent = `${autoplayDuration}s`;
});

// Voiceover Configs
voiceoverToggleBtn.addEventListener('click', () => {
  voiceoverEnabled = !voiceoverEnabled;
  voiceoverToggleBtn.classList.toggle('active', voiceoverEnabled);
  if (!voiceoverEnabled && typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel();
  }
});
soundfxToggleBtn.addEventListener('click', () => {
  soundFxEnabled = !soundFxEnabled;
  soundfxToggleBtn.classList.toggle('active', soundFxEnabled);
});

selectVoice.addEventListener('change', (e) => {
  selectedVoiceName = e.target.value;
});
voicePitchSlider.addEventListener('input', (e) => {
  voicePitch = parseFloat(e.target.value);
  voicePitchValue.textContent = voicePitch.toFixed(1);
});
voiceRateSlider.addEventListener('input', (e) => {
  voiceRate = parseFloat(e.target.value);
  voiceRateValue.textContent = voiceRate.toFixed(1);
});

// Load Speech synthesis system configurations
if (typeof speechSynthesis !== 'undefined') {
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoicesList;
  }
  populateVoicesList();
}

// Form sync listeners
pCoordX.addEventListener('input', syncFormInputsToActivePanel);
pCoordY.addEventListener('input', syncFormInputsToActivePanel);
pCoordW.addEventListener('input', syncFormInputsToActivePanel);
pCoordH.addEventListener('input', syncFormInputsToActivePanel);
pText.addEventListener('input', syncFormInputsToActivePanel);

// Save Changes btn sidebar
editorSavePanelBtn.addEventListener('click', () => {
  syncFormInputsToActivePanel();
  alert('Panel berhasil disimpan!');
});

// Editor Add Panel
editorAddBtn.addEventListener('click', () => {
  const newId = panels.length + 1;
  const newPanel = {
    id: newId,
    name: `Halaman ${newId}: Panel Baru`,
    x: 50,
    y: 50,
    w: 200,
    h: 200,
    text: "Tulis narasi di sini."
  };
  panels.push(newPanel);
  savePanelsConfig();
  renderEditorPanelList();
  selectEditorPanel(panels.length - 1);
  
  // Auto scroll to bottom of list
  editorPanelList.scrollTop = editorPanelList.scrollHeight;
});

// Editor Delete Panel
editorDeleteBtn.addEventListener('click', () => {
  if (panels.length <= 1) {
    alert("Komik harus menyisakan setidaknya 1 panel!");
    return;
  }
  
  if (confirm("Apakah Anda yakin ingin menghapus panel ini?")) {
    panels.splice(selectedEditorPanelIndex, 1);
    savePanelsConfig();
    
    // Adjust active indexes
    selectedEditorPanelIndex = Math.max(0, selectedEditorPanelIndex - 1);
    renderEditorPanelList();
    selectEditorPanel(selectedEditorPanelIndex);
  }
});

// Reset Configurations
editorResetBtn.addEventListener('click', () => {
  if (confirm("Apakah Anda yakin ingin mengembalikan koordinat panel ke pengaturan bawaan? Perubahan kustom Anda akan terhapus.")) {
    panels = [...DEFAULT_PANELS];
    savePanelsConfig();
    renderEditorPanelList();
    selectEditorPanel(0);
  }
});

// Export Configs
editorExportBtn.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(panels, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "komik_panel_koordinat.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// Import Configs
editorImportBtn.addEventListener('click', () => {
  importFileInput.click();
});
importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const importedData = JSON.parse(evt.target.result);
      if (Array.isArray(importedData)) {
        panels = importedData;
        savePanelsConfig();
        selectedEditorPanelIndex = 0;
        renderEditorPanelList();
        selectEditorPanel(0);
        alert('File koordinat berhasil diimpor!');
      } else {
        alert('Format file JSON salah. Harus berupa Array koordinat panel.');
      }
    } catch(err) {
      alert('Gagal membaca JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
});

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderReaderPanel();
});
// Trigger a backup render in case image was cached
if (globalComicImg.complete) {
  renderReaderPanel();
}
