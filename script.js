document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const previewSection = document.getElementById('preview-section');
  const galleryPreview = document.getElementById('gallery-preview');
  const photoCount = document.getElementById('photo-count');
  
  const slideDurationInput = document.getElementById('slide-duration');
  const durationVal = document.getElementById('duration-val');
  
  const startBtn = document.getElementById('start-btn');
  const clearBtn = document.getElementById('clear-btn');
  
  const slideshowContainer = document.getElementById('slideshow-container');
  const slidesWrapper = document.getElementById('slides-wrapper');
  const exitBtn = document.getElementById('exit-btn');
  
  let photos = [];
  let slideshowInterval = null;
  let currentSlideIndex = 0;
  let idleTimer = null;

  function resetIdleTimer() {
      if (slideshowContainer.classList.contains('hidden')) return;
      slideshowContainer.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
          slideshowContainer.classList.add('idle');
      }, 2500);
  }

  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('touchstart', resetIdleTimer);
  document.addEventListener('click', resetIdleTimer);

  // Settings
  slideDurationInput.addEventListener('input', (e) => {
      durationVal.textContent = e.target.value;
  });

  // Drag and drop handlers
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
  });

  dropZone.addEventListener('drop', handleDrop, false);
  fileInput.addEventListener('change', handleFilesSelect, false);

  function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
  }

  function handleFilesSelect(e) {
      const files = e.target.files;
      handleFiles(files);
  }

  function handleFiles(files) {
      const newFiles = [...files].filter(file => file.type.startsWith('image/'));
      
      newFiles.forEach(file => {
          const url = URL.createObjectURL(file);
          photos.push({ file, url });
          addPreviewImage(url);
      });
      
      updateUI();
  }

  function addPreviewImage(url) {
      const img = document.createElement('img');
      img.src = url;
      img.classList.add('preview-item');
      galleryPreview.appendChild(img);
  }

  function updateUI() {
      photoCount.textContent = photos.length;
      if (photos.length > 0) {
          previewSection.classList.remove('hidden');
      } else {
          previewSection.classList.add('hidden');
      }
  }

  clearBtn.addEventListener('click', () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.url));
      photos = [];
      galleryPreview.innerHTML = '';
      updateUI();
      fileInput.value = ''; // Reset input
  });

  // Slideshow logic
  startBtn.addEventListener('click', startSlideshow);
  exitBtn.addEventListener('click', stopSlideshow);
  
  // Listen for escape key in fullscreen
  document.addEventListener('fullscreenchange', (e) => {
      if (!document.fullscreenElement) {
          stopSlideshow();
      }
  });

  function startSlideshow() {
      if (photos.length === 0) return;
      
      // Request fullscreen on the container
      if (slideshowContainer.requestFullscreen) {
          slideshowContainer.requestFullscreen();
      } else if (slideshowContainer.webkitRequestFullscreen) { /* Safari */
          slideshowContainer.webkitRequestFullscreen();
      } else if (slideshowContainer.msRequestFullscreen) { /* IE11 */
          slideshowContainer.msRequestFullscreen();
      }

      // Prepare DOM
      slidesWrapper.innerHTML = '';
      photos.forEach((photo, index) => {
          const img = document.createElement('img');
          img.src = photo.url;
          img.className = `slide ${index === 0 ? 'active' : ''}`;
          img.dataset.index = index;
          slidesWrapper.appendChild(img);
      });
      
      slideshowContainer.classList.remove('hidden');
      slideshowContainer.style.opacity = '1';
      
      resetIdleTimer();
      
      // Setup timing
      currentSlideIndex = 0;
      const delayMs = parseInt(slideDurationInput.value, 10) * 1000;
      
      slideshowInterval = setInterval(() => {
          advanceSlide();
      }, delayMs);
  }

  function advanceSlide() {
      const slides = document.querySelectorAll('.slide');
      if (slides.length === 0) return;
      
      // Fade out current
      slides[currentSlideIndex].classList.remove('active');
      
      // Move to next, loop back to 0
      currentSlideIndex = (currentSlideIndex + 1) % photos.length;
      
      // Fade in next
      slides[currentSlideIndex].classList.add('active');
  }

  function stopSlideshow() {
      if (slideshowInterval) {
          clearInterval(slideshowInterval);
          slideshowInterval = null;
      }
      clearTimeout(idleTimer);
      slideshowContainer.classList.remove('idle');
      
      slideshowContainer.classList.add('hidden');
      slidesWrapper.innerHTML = ''; // Clear memory
      
      // Exit fullscreen mode if active
      if (document.fullscreenElement) {
          if (document.exitFullscreen) {
              document.exitFullscreen().catch(err => console.log(err));
          }
      }
  }
});
