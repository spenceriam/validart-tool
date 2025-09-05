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
    this.ctx = this.canvas.getContext('2d');
    this.banner = document.getElementById('banner');
    this.safeZoneOverlay = document.getElementById('safe-zone-overlay');
    this.punchHolesContainer = document.getElementById('punch-holes-container');
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', this.toggleTheme.bind(this));

    // File upload
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    fileInput.addEventListener('change', this.handleFileUpload.bind(this));
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
    uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
    uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));

    // Card dimensions
    document.getElementById('width-input').addEventListener('input', this.handleDimensionChange.bind(this));
    document.getElementById('height-input').addEventListener('input', this.handleDimensionChange.bind(this));

    // Safe zone
    const safeZoneSlider = document.getElementById('safe-zone-slider');
    safeZoneSlider.addEventListener('input', this.handleSafeZoneChange.bind(this));

    // Options
    document.getElementById('rounded-corners').addEventListener('change', this.handleOptionsChange.bind(this));

    // Punch hole templates
    document.querySelectorAll('.punch-hole-template').forEach(template => {
      template.addEventListener('mousedown', this.handleTemplateMouseDown.bind(this));
      template.addEventListener('touchstart', this.handleTemplateTouchStart.bind(this), { passive: false });
    });

    // Clear punch holes
    document.getElementById('clear-holes').addEventListener('click', this.clearPunchHoles.bind(this));

    // Canvas interactions
    this.canvas.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
    this.canvas.addEventListener('touchstart', this.handleCanvasTouchStart.bind(this), { passive: false });
    
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Download proof
    document.getElementById('download-proof').addEventListener('click', this.downloadProof.bind(this));

    // Clear storage
    document.getElementById('clear-storage').addEventListener('click', this.clearStorage.bind(this));
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    this.processFile(file);
  }

  handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  }

  handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
  }

  handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    this.processFile(file);
  }

  processFile(file) {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.showBanner('File too large. Maximum size is 10MB.', 'danger');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      this.showBanner('Invalid file type. Please upload JPG, PNG, or SVG.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.artwork = e.target.result;
      this.loadArtwork();
    };
    reader.readAsDataURL(file);
  }

  loadArtwork() {
    this.artworkImg = new Image();
    this.artworkImg.onload = () => {
      this.updatePreview();
      this.checkCollisions();
    };
    this.artworkImg.src = this.artwork;
  }

  handleDimensionChange() {
    this.cardWidth = parseFloat(document.getElementById('width-input').value) || 85;
    this.cardHeight = parseFloat(document.getElementById('height-input').value) || 55;
    this.updatePreview();
    this.checkCollisions();
  }

  handleSafeZoneChange() {
    this.safeZonePercent = parseInt(document.getElementById('safe-zone-slider').value);
    document.getElementById('safe-zone-value').textContent = this.safeZonePercent;
    this.updateSafeZoneOverlay();
    this.checkCollisions();
  }

  handleOptionsChange() {
    this.roundedCorners = document.getElementById('rounded-corners').checked;
    this.updatePreview();
  }

  handleTemplateMouseDown(event) {
    event.preventDefault();
    this.startTemplateDrag(event.currentTarget, event.clientX, event.clientY);
  }

  handleTemplateTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this.startTemplateDrag(event.currentTarget, touch.clientX, touch.clientY);
  }

  startTemplateDrag(template, clientX, clientY) {
    const size = parseInt(template.dataset.size);
    const rect = template.getBoundingClientRect();
    const offsetX = clientX - rect.left - rect.width / 2;
    const offsetY = clientY - rect.top - rect.height / 2;
    
    this.isDragging = true;
    this.dragTarget = {
      type: 'template',
      size: size,
      offsetX: offsetX,
      offsetY: offsetY
    };
  }

  handleCanvasMouseDown(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.canvasScale;
    const y = (event.clientY - rect.top) / this.canvasScale;
    this.handleCanvasInteraction(x, y);
  }

  handleCanvasTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / this.canvasScale;
    const y = (touch.clientY - rect.top) / this.canvasScale;
    this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    this.handleCanvasInteraction(x, y);
  }

  handleCanvasInteraction(x, y) {
    // Check if clicking on a resize handle
    for (let i = this.punchHoles.length - 1; i >= 0; i--) {
      const hole = this.punchHoles[i];
      const handleX = hole.x + hole.r;
      const handleY = hole.y + hole.r;
      const distance = Math.sqrt((x - handleX) ** 2 + (y - handleY) ** 2);
      
      if (distance <= 8) {
        this.isResizing = true;
        this.dragTarget = { type: 'resize', index: i };
        return;
      }
    }
    
    // Check if clicking on a punch hole
    for (let i = this.punchHoles.length - 1; i >= 0; i--) {
      const hole = this.punchHoles[i];
      const distance = Math.sqrt((x - hole.x) ** 2 + (y - hole.y) ** 2);
      
      if (distance <= hole.r) {
        this.isDragging = true;
        this.dragTarget = { type: 'hole', index: i };
        this.lastMousePos = { x: x, y: y };
        return;
      }
    }
  }

  handleMouseMove(event) {
    this.handleMove(event.clientX, event.clientY);
  }

  handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this.handleMove(touch.clientX, touch.clientY);
  }

  handleMove(clientX, clientY) {
    if (this.isDragging && this.dragTarget) {
      if (this.dragTarget.type === 'template') {
        // Handle template dragging
        const canvasRect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - canvasRect.left;
        const canvasY = clientY - canvasRect.top;
        
        if (canvasX >= 0 && canvasX <= canvasRect.width && 
            canvasY >= 0 && canvasY <= canvasRect.height) {
          
          const x = (canvasX + this.dragTarget.offsetX) / this.canvasScale;
          const y = (canvasY + this.dragTarget.offsetY) / this.canvasScale;
          
          // Create new punch hole
          const newHole = {
            x: Math.max(this.dragTarget.size, Math.min(this.canvas.width - this.dragTarget.size, x)),
            y: Math.max(this.dragTarget.size, Math.min(this.canvas.height - this.dragTarget.size, y)),
            r: this.dragTarget.size
          };
          
          this.punchHoles.push(newHole);
          this.isDragging = false;
          this.dragTarget = { type: 'hole', index: this.punchHoles.length - 1 };
          this.lastMousePos = { x: newHole.x, y: newHole.y };
          this.updatePunchHoles();
          this.checkCollisions();
        }
      } else if (this.dragTarget.type === 'hole') {
        // Handle hole dragging
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left) / this.canvasScale;
        const y = (clientY - rect.top) / this.canvasScale;
        
        const hole = this.punchHoles[this.dragTarget.index];
        const deltaX = x - this.lastMousePos.x;
        const deltaY = y - this.lastMousePos.y;
        
        hole.x = Math.max(hole.r, Math.min(this.canvas.width - hole.r, hole.x + deltaX));
        hole.y = Math.max(hole.r, Math.min(this.canvas.height - hole.r, hole.y + deltaY));
        
        this.lastMousePos = { x: x, y: y };
        this.updatePunchHoles();
        this.checkCollisions();
      }
    } else if (this.isResizing && this.dragTarget) {
      // Handle hole resizing
      const rect = this.canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / this.canvasScale;
      const y = (clientY - rect.top) / this.canvasScale;
      
      const hole = this.punchHoles[this.dragTarget.index];
      const distance = Math.sqrt((x - hole.x) ** 2 + (y - hole.y) ** 2);
      
      hole.r = Math.max(3, Math.min(10, distance));
      
      this.updatePunchHoles();
      this.checkCollisions();
    }
  }

  handleMouseUp() {
    this.endInteraction();
  }

  handleTouchEnd() {
    this.endInteraction();
  }

  endInteraction() {
    this.isDragging = false;
    this.isResizing = false;
    this.dragTarget = null;
  }

  clearPunchHoles() {
    this.punchHoles = [];
    this.updatePunchHoles();
    this.checkCollisions();
  }

  updatePreview() {
    if (!this.artworkImg) {
      this.canvas.width = 400;
      this.canvas.height = 250;
      this.canvasScale = 1;
      this.ctx.fillStyle = '#f0f0f0';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#999';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Upload artwork to preview', this.canvas.width / 2, this.canvas.height / 2);
      this.updateSafeZoneOverlay();
      return;
    }

    // Calculate canvas size based on card dimensions
    const maxCanvasSize = 600;
    const aspectRatio = this.cardWidth / this.cardHeight;
    
    let canvasWidth, canvasHeight;
    if (aspectRatio > 1) {
      canvasWidth = Math.min(maxCanvasSize, this.cardWidth * 6);
      canvasHeight = canvasWidth / aspectRatio;
    } else {
      canvasHeight = Math.min(maxCanvasSize, this.cardHeight * 6);
      canvasWidth = canvasHeight * aspectRatio;
    }

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvasScale = canvasWidth / this.cardWidth;

    // Check for large artwork warning
    if (canvasWidth > 8192 || canvasHeight > 8192) {
      this.showBanner('Large artwork may be slow', 'warning');
    }

    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw artwork (aspect fill, centered)
    const artworkAspect = this.artworkImg.width / this.artworkImg.height;
    const cardAspect = this.cardWidth / this.cardHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (artworkAspect > cardAspect) {
      // Artwork is wider - fit height
      drawHeight = canvasHeight;
      drawWidth = drawHeight * artworkAspect;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    } else {
      // Artwork is taller - fit width
      drawWidth = canvasWidth;
      drawHeight = drawWidth / artworkAspect;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    }

    this.ctx.drawImage(this.artworkImg, drawX, drawY, drawWidth, drawHeight);

    // Apply rounded corners if enabled
    if (this.roundedCorners) {
      this.applyRoundedCorners();
    }

    this.updateSafeZoneOverlay();
    this.updatePunchHoles();
    this.checkArtworkSize();
  }

  applyRoundedCorners() {
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.05;
    
    this.ctx.globalCompositeOperation = 'destination-in';
    this.ctx.beginPath();
    this.ctx.roundRect(0, 0, this.canvas.width, this.canvas.height, radius);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
  }

  updateSafeZoneOverlay() {
    const safeZoneInset = (this.safeZonePercent / 100) * Math.min(this.cardWidth, this.cardHeight) * this.canvasScale;
    
    this.safeZoneOverlay.style.top = safeZoneInset + 'px';
    this.safeZoneOverlay.style.left = safeZoneInset + 'px';
    this.safeZoneOverlay.style.right = safeZoneInset + 'px';
    this.safeZoneOverlay.style.bottom = safeZoneInset + 'px';
  }

  updatePunchHoles() {
    // Clear existing punch hole elements
    this.punchHolesContainer.innerHTML = '';
    
    this.punchHoles.forEach((hole, index) => {
      const holeElement = document.createElement('div');
      holeElement.className = 'punch-hole';
      holeElement.style.left = (hole.x - hole.r) * this.canvasScale + 'px';
      holeElement.style.top = (hole.y - hole.r) * this.canvasScale + 'px';
      holeElement.style.width = hole.r * 2 * this.canvasScale + 'px';
      holeElement.style.height = hole.r * 2 * this.canvasScale + 'px';
      
      // Add resize handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      holeElement.appendChild(resizeHandle);
      
      this.punchHolesContainer.appendChild(holeElement);
    });
  }

  checkArtworkSize() {
    if (!this.artworkImg) return;
    
    const safeZoneInset = (this.safeZonePercent / 100) * Math.min(this.cardWidth, this.cardHeight);
    const minRequiredSize = safeZoneInset * 2;
    
    // Check if the card dimensions themselves are smaller than safe zone requirements
    if (this.cardWidth < minRequiredSize || this.cardHeight < minRequiredSize) {
      this.showBanner('Artwork too small – upload larger file', 'danger');
    }
  }

  checkCollisions() {
    if (!this.artworkImg || this.punchHoles.length === 0) {
      this.hideBanner();
      return;
    }

    // Collision detection - check if any punch hole overlaps with safe zone
    const safeZoneInset = (this.safeZonePercent / 100) * Math.min(this.cardWidth, this.cardHeight) * this.canvasScale;
    
    let hasCollision = false;
    
    for (const hole of this.punchHoles) {
      const holeLeft = (hole.x - hole.r) * this.canvasScale;
      const holeRight = (hole.x + hole.r) * this.canvasScale;
      const holeTop = (hole.y - hole.r) * this.canvasScale;
      const holeBottom = (hole.y + hole.r) * this.canvasScale;
      
      // Check if hole intersects with artwork area (inside safe zone)
      if (holeRight > safeZoneInset && holeLeft < this.canvas.width - safeZoneInset &&
          holeBottom > safeZoneInset && holeTop < this.canvas.height - safeZoneInset) {
        hasCollision = true;
        break;
      }
    }
    
    if (hasCollision) {
      this.showBanner('Artwork intersects punch-hole – DO NOT PRINT', 'danger');
    } else {
      this.showBanner('OK to print', 'success');
    }
  }

  showBanner(message, type) {
    this.banner.textContent = message;
    this.banner.className = 'banner ' + type;
    this.banner.style.display = 'block';
  }

  hideBanner() {
    this.banner.style.display = 'none';
  }

  downloadProof() {
    if (!this.artworkImg) {
      this.showBanner('Please upload artwork first', 'danger');
      return;
    }

    const dpi = parseInt(document.getElementById('dpi-select').value);
    const scaleFactor = dpi / 150; // Base scale factor for 150 DPI
    
    // Create export canvas
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    const exportWidth = this.canvas.width * scaleFactor;
    const exportHeight = this.canvas.height * scaleFactor;
    
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    
    // Scale context
    exportCtx.scale(scaleFactor, scaleFactor);
    
    // Draw the current canvas content
    exportCtx.drawImage(this.canvas, 0, 0);
    
    // Draw punch holes on export canvas
    exportCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--punch-hole-color');
    this.punchHoles.forEach(hole => {
      exportCtx.beginPath();
      exportCtx.arc(hole.x * this.canvasScale, hole.y * this.canvasScale, hole.r * this.canvasScale, 0, 2 * Math.PI);
      exportCtx.fill();
    });
    
    // Add watermark
    exportCtx.save();
    exportCtx.globalAlpha = 0.4;
    exportCtx.fillStyle = 'white';
    exportCtx.font = '48px Lora, serif';
    exportCtx.textAlign = 'center';
    exportCtx.textBaseline = 'middle';
    exportCtx.fillText('VOID PRINT', exportWidth / 2 / scaleFactor, exportHeight / 2 / scaleFactor);
    exportCtx.restore();
    
    // Download
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `Validart-proof-${this.cardWidth}x${this.cardHeight}-${timestamp}.png`;
    
    exportCanvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  setupStorageCleanup() {
    // Mark current time for storage cleanup
    localStorage.setItem('validart_last_edit', Date.now().toString());
    
    // Check for old data on load
    const lastEdit = localStorage.getItem('validart_last_edit');
    if (lastEdit) {
      const hoursSinceEdit = (Date.now() - parseInt(lastEdit)) / (1000 * 60 * 60);
      if (hoursSinceEdit > 48) { // 48 hours
        this.clearStorage();
      }
    }
  }

  clearStorage() {
    // Clear all validart related storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('validart_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset application state
    this.artwork = null;
    this.artworkImg = null;
    this.punchHoles = [];
    document.getElementById('file-input').value = '';
    document.getElementById('width-input').value = '85';
    document.getElementById('height-input').value = '55';
    document.getElementById('safe-zone-slider').value = '12';
    document.getElementById('safe-zone-value').textContent = '12';
    document.getElementById('rounded-corners').checked = false;
    this.cardWidth = 85;
    this.cardHeight = 55;
    this.safeZonePercent = 12;
    this.roundedCorners = false;
    this.updatePreview();
    this.hideBanner();
    
    this.showBanner('Storage cleared successfully', 'success');
    setTimeout(() => this.hideBanner(), 3000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Validart();
});

// Add support for roundRect if not available (for older browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      radius = { tl: 0, tr: 0, br: 0, bl: 0, ...radius };
    }
    
    this.beginPath();
    this.moveTo(x + radius.tl, y);
    this.lineTo(x + width - radius.tr, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    this.lineTo(x + width, y + height - radius.br);
    this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    this.lineTo(x + radius.bl, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    this.lineTo(x, y + radius.tl);
    this.quadraticCurveTo(x, y, x + radius.tl, y);
    this.closePath();
  };
}
