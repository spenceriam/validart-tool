/*
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

class Validart {
  constructor() {
    this.artwork = null;
    this.artworkImg = null;
    this.cardWidth = 85;
    this.cardHeight = 55;
    this.safeZonePercent = 12;
    this.roundedCorners = false;
    this.punchHoles = [];
    this.canvas = null;
    this.ctx = null;
    this.canvasScale = 1;
    this.isDragging = false;
    this.isResizing = false;
    this.dragTarget = null;
    this.lastMousePos = { x: 0, y: 0 };
    this.touchStartPos = { x: 0, y: 0 };
    
    this.init();
    this.setupStorageCleanup();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.updatePreview();
  }

  setupElements() {
    this.canvas = document.getElementById('preview-canvas');
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.banner = document.getElementById('banner');
    this.safeZoneOverlay = document.getElementById('safe-zone-overlay');
    this.punchHolesContainer = document.getElementById('punch-holes-container');
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }

    // File upload
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    if (fileInput) {
      fileInput.addEventListener('change', this.handleFileUpload.bind(this));
    }
    if (uploadArea) {
      uploadArea.addEventListener('click', () => fileInput && fileInput.click());
      uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
      uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
      uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
    }

    // Card dimensions
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    if (widthInput) widthInput.addEventListener('input', this.handleDimensionChange.bind(this));
    if (heightInput) heightInput.addEventListener('input', this.handleDimensionChange.bind(this));

    // Safe zone
    const safeZoneSlider = document.getElementById('safe-zone-slider');
    if (safeZoneSlider) {
      safeZoneSlider.addEventListener('input', this.handleSafeZoneChange.bind(this));
    }

    // Options
    const roundedCorners = document.getElementById('rounded-corners');
    if (roundedCorners) {
      roundedCorners.addEventListener('change', this.handleOptionsChange.bind(this));
    }

    // Punch hole templates
    document.querySelectorAll('.punch-hole-template').forEach(template => {
      template.addEventListener('mousedown', this.handleTemplateMouseDown.bind(this));
      template.addEventListener('touchstart', this.handleTemplateTouchStart.bind(this), { passive: false });
    });

    // Clear punch holes
    const clearHoles = document.getElementById('clear-holes');
    if (clearHoles