document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Setting up elements...");

    // --- Standard Elements ---
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const popupTriggers = document.querySelectorAll('.popup-trigger');
    const allPopups = document.querySelectorAll('.popup-menu');
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor');
    // Chart/Ticker elements REMOVED

    // --- Global State ---
    let visiblePopupForTilt = null; let lastTrailTime = 0; const trailInterval = 50;

    // --- Initial Setup ---
    if (customCursor) { customCursor.textContent = '𖹭'; }
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Ticker/Chart Logic Removed ---

    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        console.log("Entry screen clicked!");
        entryScreen.classList.add('hidden'); setTimeout(() => {
            entryScreen.style.display = 'none';
            mainContent.classList.add('visible');
            if (volumeContainer) { volumeContainer.classList.add('visible'); }
            backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); });
            updateVolumeUI();
            if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); }
            // No chart/ticker start needed
        }, 500);
    }, { once: true });


    // --- Cursor Tracking, Popup Tilt, Falling Trail ---
    document.addEventListener('mousemove', (e) => {
        if (customCursor) { customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`; }
        if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); } // Tilt active popup
        const now = Date.now();
        if (now - lastTrailTime > trailInterval) { createFallingTrailChar(e.clientX, e.clientY); lastTrailTime = now; }
    });

    function createFallingTrailChar(x, y) { const trailEl = document.createElement('div'); trailEl.classList.add('trail-cursor-char'); trailEl.textContent = '𖹭'; trailEl.style.left = `${x}px`; trailEl.style.top = `${y}px`; document.body.appendChild(trailEl); setTimeout(() => { trailEl.remove(); }, 1000); } // Match fall animation

    function tiltPopup(e, popupElement) {
        const centerX = window.innerWidth / 2; const centerY = window.innerHeight / 2;
        const deltaX = e.clientX - centerX; const deltaY = e.clientY - centerY;
        const maxRotate = 15; // Tilt intensity kept from previous step
        const rotateY = -(deltaX / centerX) * maxRotate;
        const rotateX = (deltaY / centerY) * maxRotate;
        const clampedRotateX = Math.max(-maxRotate, Math.min(maxRotate, rotateX));
        const clampedRotateY = Math.max(-maxRotate, Math.min(maxRotate, rotateY));
        // Add translateZ based on distance from center for more 3D feel
        const maxDist = Math.sqrt(centerX**2 + centerY**2);
        const currentDist = Math.sqrt(deltaX**2 + deltaY**2);
        const tiltAmount = Math.min(1, currentDist / (maxDist * 0.7)); // Normalize distance (adjust 0.7 sensitivity)
        const translateZ = tiltAmount * 25; // Max lift towards viewer (adjust px value)

        popupElement.style.transform = `translateX(-50%) translateZ(${translateZ}px) rotateX(${clampedRotateX}deg) rotateY(${clampedRotateY}deg)`;
    }

    function resetPopupTilt(popupElement) {
         if(popupElement) {
            // Reset all transforms including translateZ
            popupElement.style.transform = `translateX(-50%) translateZ(0px) rotateX(0deg) rotateY(0deg)`;
         }
    }

     // --- Volume Control Logic ---
     function updateVolumeUI() { if (!backgroundMusic || !volumeIcon || !volumeSlider) return; volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume; if (backgroundMusic.muted || backgroundMusic.volume === 0) { volumeIcon.className = 'fa-solid fa-volume-xmark'; } else if (backgroundMusic.volume <= 0.5) { volumeIcon.className = 'fa-solid fa-volume-low'; } else { volumeIcon.className = 'fa-solid fa-volume-high'; } volumeIcon.classList.add('fa-solid'); }
     if (muteButton) { muteButton.addEventListener('click', () => { if (!backgroundMusic) return; backgroundMusic.muted = !backgroundMusic.muted; if (!backgroundMusic.muted && backgroundMusic.volume === 0) { backgroundMusic.volume = 0.1; } updateVolumeUI(); }); }
     if (volumeSlider) { volumeSlider.addEventListener('input', function() { if (!backgroundMusic) return; backgroundMusic.volume = parseFloat(this.value); backgroundMusic.muted = (backgroundMusic.volume === 0); updateVolumeUI(); }); }
     setTimeout(updateVolumeUI, 100);
     if (backgroundMusic) { backgroundMusic.addEventListener('volumechange', updateVolumeUI); }

    // --- Popup Handling Logic ---
    function closeAllPopups() { allPopups.forEach(popup => { if (popup.classList.contains('visible')) { popup.classList.remove('visible'); resetPopupTilt(popup); } }); visiblePopupForTilt = null; }
    popupTriggers.forEach(trigger => { trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); const targetPopupId = trigger.getAttribute('data-popup-target'); const targetPopup = document.getElementById(targetPopupId); if (!targetPopup) return; const isCurrentlyVisible = targetPopup.classList.contains('visible'); closeAllPopups(); if (!isCurrentlyVisible) { targetPopup.classList.add('visible'); visiblePopupForTilt = targetPopup; } }); });

    // --- Right-Click Disable ---
    document.addEventListener('contextmenu', event => event.preventDefault());

    // --- Close Popups when Clicking Outside Logic ---
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; /* Removed chart check */ if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); } });

}); // End of DOMContentLoaded listener
