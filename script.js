document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const popupTriggers = document.querySelectorAll('.popup-trigger');
    // Double clickable links removed
    const allPopups = document.querySelectorAll('.popup-menu');
    // Footer link removed
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor');
    const canvas = document.getElementById('drawing-canvas'); // Select canvas
    const ctx = canvas.getContext('2d'); // Get canvas context

    // --- Canvas Setup ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas(); // Initial size
    window.addEventListener('resize', resizeCanvas); // Adjust on resize

    // --- Drawing State ---
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hue = 270; // Start hue (purple)
    let drawTimeout = null;

    // Set the initial content for the custom cursor (CSS heart now)
    // customCursor.textContent = '𖹭'; // Removed

    // --- Fake View Counter Logic ---
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }

    // --- Browser Tab Title Animation ---
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let charIndex = 0; let isDeleting = false; let loopTimeout;
    function typeDeleteLoop() { /* ... (same as previous version, handles spans) ... */ }
     function typeDeleteLoop() { clearTimeout(loopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!isDeleting) { if (charIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(charIndex); locationTextElement.insertBefore(letterSpan, cursor); charIndex++; loopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { isDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; loopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); loopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { isDeleting = false; charIndex = 0; loopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => { entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); } }, 500); }, { once: true });

    // --- Custom Cursor Tracking & Popup Tilt ---
    let visiblePopupForTilt = null;
    document.addEventListener('mousemove', (e) => {
        // Move main cursor
        if (customCursor) { customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`; }
        // Tilt visible popup
        if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); }
        // Create falling heart trail
        createFallingHeartTrail(e.clientX, e.clientY);
        // Handle drawing on canvas if right button down
        if (isDrawing) { drawOnCanvas(e); }
    });

    function tiltPopup(e, popupElement) { /* ... (same as previous, increased maxRotate) ... */ }
    function tiltPopup(e, popupElement) { const centerX = window.innerWidth / 2; const centerY = window.innerHeight / 2; const deltaX = e.clientX - centerX; const deltaY = e.clientY - centerY; const maxRotate = 15; /* <<< INCREASED TILT MORE */ const rotateY = -(deltaX / centerX) * maxRotate; const rotateX = (deltaY / centerY) * maxRotate; const clampedRotateX = Math.max(-maxRotate, Math.min(maxRotate, rotateX)); const clampedRotateY = Math.max(-maxRotate, Math.min(maxRotate, rotateY)); popupElement.style.transform = `translateX(-50%) rotateX(${clampedRotateX}deg) rotateY(${clampedRotateY}deg)`; }
    function resetPopupTilt(popupElement) { if(popupElement) { popupElement.style.transform = `translateX(-50%) rotateX(0deg) rotateY(0deg)`; } }

    // --- Falling Heart Trail Logic START ---
    let lastTrailTime = 0;
    const trailInterval = 60; // Throttle interval

    function createFallingHeartTrail(x, y) {
        const now = Date.now();
        if (now - lastTrailTime < trailInterval) return; // Throttle
        lastTrailTime = now;

        const heart = document.createElement('div');
        heart.classList.add('trail-heart'); // Use the new CSS class

        // Position element centered on cursor coordinates
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;

        document.body.appendChild(heart);

        // Remove the element after animation duration (match CSS)
        setTimeout(() => {
            heart.remove();
        }, 1500); // 1500ms = 1.5 seconds (match CSS fall-and-fade duration)
    }
    // --- Falling Heart Trail Logic END ---

     // --- Volume Control Logic ---
     function updateVolumeUI() { /* ... (same as previous version) ... */ }
     function updateVolumeUI() { if (!backgroundMusic || !volumeIcon || !volumeSlider) return; volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume; if (backgroundMusic.muted || backgroundMusic.volume === 0) { volumeIcon.className = 'fa-solid fa-volume-xmark'; } else if (backgroundMusic.volume <= 0.5) { volumeIcon.className = 'fa-solid fa-volume-low'; } else { volumeIcon.className = 'fa-solid fa-volume-high'; } volumeIcon.classList.add('fa-solid'); }
     if (muteButton) { muteButton.addEventListener('click', () => { if (!backgroundMusic) return; backgroundMusic.muted = !backgroundMusic.muted; if (!backgroundMusic.muted && backgroundMusic.volume === 0) { backgroundMusic.volume = 0.1; } updateVolumeUI(); }); }
     if (volumeSlider) { volumeSlider.addEventListener('input', function() { if (!backgroundMusic) return; backgroundMusic.volume = parseFloat(this.value); backgroundMusic.muted = (backgroundMusic.volume === 0); updateVolumeUI(); }); }
     setTimeout(updateVolumeUI, 100);
     if (backgroundMusic) { backgroundMusic.addEventListener('volumechange', updateVolumeUI); }

    // --- Popup Handling Logic ---
    function closeAllPopups() { allPopups.forEach(popup => { if (popup.classList.contains('visible')) { popup.classList.remove('visible'); resetPopupTilt(popup); } }); visiblePopupForTilt = null; }
    popupTriggers.forEach(trigger => { trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); const targetPopupId = trigger.getAttribute('data-popup-target'); const targetPopup = document.getElementById(targetPopupId); if (!targetPopup) return; const isCurrentlyVisible = targetPopup.classList.contains('visible'); closeAllPopups(); if (!isCurrentlyVisible) { targetPopup.classList.add('visible'); visiblePopupForTilt = targetPopup; } }); });

    // --- Right Click Drawing Logic START ---
    function drawOnCanvas(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY); // Use offsetX/Y relative to canvas

        // Style
        ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`; // Cycle hue for color change
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 8;

        ctx.stroke();

        // Update last position and hue
        [lastX, lastY] = [e.offsetX, e.offsetY];
        hue = (hue + 2) % 360; // Increment hue for color change
    }

    // Prevent context menu on canvas itself and start drawing
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Use document listeners to capture mouse events anywhere
     document.addEventListener('mousedown', (e) => {
         // Check if it's the right mouse button (button code 2)
         if (e.button === 2) {
            e.preventDefault(); // Prevent context menu anywhere
            isDrawing = true;
            // Use clientX/Y adjusted by canvas offset if canvas doesn't fill screen perfectly
            // For simplicity with fixed canvas, offsetX/Y *should* be okay if event is on document
            // Let's use clientX/Y adjusted in case user starts drag outside canvas
            const rect = canvas.getBoundingClientRect();
             [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
            hue = 270; // Reset hue to purple on new drawing
            clearTimeout(drawTimeout); // Clear any existing fade timer
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawing immediately
         }
     });

     document.addEventListener('mouseup', (e) => {
         if (e.button === 2 && isDrawing) {
             isDrawing = false;
             // Start fade out / clear timer
             clearTimeout(drawTimeout); // Clear previous timer if right button released quickly
             drawTimeout = setTimeout(() => {
                 // Simple clear after delay
                 ctx.clearRect(0, 0, canvas.width, canvas.height);
                 // For fading: need requestAnimationFrame loop with decreasing alpha
             }, 1200); // 1.2 seconds
         }
     });

     // Optional: Stop drawing if mouse leaves the window
     document.addEventListener('mouseleave', () => {
         if (isDrawing) {
              isDrawing = false;
              clearTimeout(drawTimeout);
              drawTimeout = setTimeout(() => {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
              }, 1200);
         }
     });
    // --- Right Click Drawing Logic END ---


    // Close Popups when Clicking Outside Logic
    document.addEventListener('click', function(event) { /* ... (same as previous version) ... */ } );
     document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); } });

    // Double click listeners REMOVED
    // Footer link listener REMOVED

});
