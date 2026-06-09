const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');
const topbar = document.querySelector('.topbar');
let lastScrollY = window.scrollY;

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  topbar.classList.remove('hidden');
});

navLinks.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (link) {
    navLinks.classList.remove('active');
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) {
    navLinks.classList.remove('active');
  }
});

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > lastScrollY && currentScroll > 100 && !navLinks.classList.contains('active')) {
    topbar.classList.add('hidden');
  } else {
    topbar.classList.remove('hidden');
  }
  lastScrollY = currentScroll;
});

window.addEventListener('mousemove', (event) => {
  if (event.clientY < 80) {
    topbar.classList.remove('hidden');
  }
});

// Document viewer modal logic (PDF.js + image fallback)
const docModal = document.getElementById('doc-modal');
const docCanvas = document.getElementById('doc-canvas');
const docImage = document.getElementById('doc-image');
const galleryView = document.getElementById('gallery-view');
const docTitle = document.getElementById('doc-title');
const canvasCtx = docCanvas.getContext && docCanvas.getContext('2d');

// Configure PDF.js worker (CDN)
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

function renderPDFToCanvas(src) {
  if (!window.pdfjsLib) return Promise.reject(new Error('PDF.js not loaded'));
  return pdfjsLib.getDocument(src).promise.then(pdf => {
    return pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = document.querySelector('.doc-modal-content').clientWidth - 40;
      const scale = Math.max(0.5, Math.min(2, containerWidth / viewport.width));
      const vp = page.getViewport({ scale });
      docCanvas.width = vp.width;
      docCanvas.height = vp.height;
      docCanvas.style.display = 'block';
      docImage.style.display = 'none';
      const renderContext = { canvasContext: canvasCtx, viewport: vp };
      return page.render(renderContext).promise;
    });
  });
}

function showGallery(images, title) {
  galleryView.innerHTML = '';
  galleryView.style.display = 'flex';
  docCanvas.style.display = 'none';
  docImage.style.display = 'none';

  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${title || 'Project image'} ${index + 1}`;
    galleryView.appendChild(img);
  });
}

function openDoc(src, title) {
  docTitle.textContent = title || '';
  document.body.classList.add('modal-open');
  docModal.classList.add('open');
  docModal.setAttribute('aria-hidden', 'false');
  galleryView.style.display = 'none';
  galleryView.innerHTML = '';

  if (Array.isArray(src)) {
    showGallery(src, title);
    return;
  }

  if (src && src.toLowerCase().endsWith('.pdf')) {
    renderPDFToCanvas(src).catch(err => {
      console.error('PDF render failed', err);
      // fallback: show as image if server provides a PNG/JPG alternative
      docCanvas.style.display = 'none';
      docImage.style.display = 'block';
      docImage.src = src;
      docImage.alt = title || 'Document preview';
    });
  } else {
    // show image preview
    docCanvas.style.display = 'none';
    galleryView.style.display = 'none';
    docImage.style.display = 'block';
    docImage.src = src;
    docImage.alt = title || 'Document preview';
  }
}

function closeDoc() {
  document.body.classList.remove('modal-open');
  docModal.classList.remove('open');
  docModal.setAttribute('aria-hidden', 'true');
  // clear preview
  try {
    if (canvasCtx) canvasCtx.clearRect(0, 0, docCanvas.width, docCanvas.height);
  } catch (e) {}
  docCanvas.style.display = 'none';
  docImage.style.display = 'none';
  docImage.src = '';
}

document.querySelectorAll('.doc-open').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const src = el.getAttribute('data-src');
    const title = el.getAttribute('data-title');
    openDoc(src, title);
  });
});

document.querySelectorAll('.certificate-card, .document-card, .work-card').forEach(card => {
  const images = card.dataset.images ? card.dataset.images.split(',').map(src => src.trim()).filter(Boolean) : [];
  const src = card.dataset.src;
  const title = card.dataset.title || card.querySelector('h3')?.textContent || '';

  const openCard = () => {
    if (images.length > 0) {
      openDoc(images, title);
    } else if (src) {
      openDoc(src, title);
    }
  };

  card.addEventListener('click', openCard);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openCard();
    }
  });
});

docModal.addEventListener('click', (e) => {
  if (e.target && e.target.dataset && e.target.dataset.action === 'close') {
    closeDoc();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && docModal.classList.contains('open')) {
    closeDoc();
  }
});

const scrollUpBtn = document.getElementById('scroll-up-btn');

function updateScrollUpButton() {
  if (!scrollUpBtn) return;
  if (window.scrollY > 400) {
    scrollUpBtn.classList.add('visible');
  } else {
    scrollUpBtn.classList.remove('visible');
  }
}

window.addEventListener('scroll', updateScrollUpButton);
scrollUpBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});