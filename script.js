document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor'); // For 𖹭 cursor
    const popupTriggers = document.querySelectorAll('.popup-trigger');
    const allPopups = document.querySelectorAll('.popup-menu');
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor');
    const stockLeftSpan = document.querySelector('#stock-left span'); // Select stock spans
    const stockRightSpan = document.querySelector('#stock-right span');
    // Removed drawing, footer, double-click links, ascii cats

    // Set the initial content for the custom cursor
    if (customCursor) {
        customCursor.textContent = '𖹭'; // Set character cursor
    }

    // --- Fake View Counter Logic ---
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }

    // --- Browser Tab Title Animation ---
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => { entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); } startStockTickers(); /* <<< Start Stock Tickers */ }, 500); }, { once: true });


    // --- Cursor Tracking, Popup Tilt, Falling Trail ---
    let visiblePopupForTilt = null;
    let lastTrailTime = 0;
    const trailInterval = 50; // Throttle trail creation

    document.addEventListener('mousemove', (e) => {
        // Move main custom cursor (𖹭)
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
        // Tilt visible popup
        if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); }
        // Throttled falling character trail creation
        const now = Date.now();
        if (now - lastTrailTime > trailInterval) {
            createFallingTrailChar(e.clientX, e.clientY);
            lastTrailTime = now;
        }
    });

    // --- Falling Character Trail Logic ---
    function createFallingTrailChar(x, y) {
        const trailEl = document.createElement('div');
        trailEl.classList.add('trail-cursor-char'); // Use the new CSS class
        trailEl.textContent = '𖹭'; // Use the same character

        // Position element centered on cursor coordinates
        trailEl.style.left = `${x}px`;
        trailEl.style.top = `${y}px`;

        document.body.appendChild(trailEl);

        // Remove the element after animation duration (match CSS)
        setTimeout(() => { trailEl.remove(); }, 1200); // Match 1.2s fall-fade-char animation
    }

    // --- Popup Tilt Logic ---
    function tiltPopup(e, popupElement) { const centerX = window.innerWidth / 2; const centerY = window.innerHeight / 2; const deltaX = e.clientX - centerX; const deltaY = e.clientY - centerY; const maxRotate = 15; const rotateY = -(deltaX / centerX) * maxRotate; const rotateX = (deltaY / centerY) * maxRotate; const clampedRotateX = Math.max(-maxRotate, Math.min(maxRotate, rotateX)); const clampedRotateY = Math.max(-maxRotate, Math.min(maxRotate, rotateY)); popupElement.style.transform = `translateX(-50%) rotateX(${clampedRotateX}deg) rotateY(${clampedRotateY}deg)`; }
    function resetPopupTilt(popupElement) { if(popupElement) { popupElement.style.transform = `translateX(-50%) rotateX(0deg) rotateY(0deg)`; } }

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
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); } });

    // --- Stock Ticker Logic START ---
    function updateStock(element, loopDuration, phaseRatio = 0.7, minVal = 20, maxVal = 110, randomFactor = 5) {
        if (!element) return;

        const cycleTime = Date.now() % loopDuration;
        const declineDuration = loopDuration * phaseRatio;
        const riseDuration = loopDuration * (1 - phaseRatio);
        let value;

        if (cycleTime < declineDuration) {
            // Phase 1: Slow decline
            const progress = cycleTime / declineDuration; // 0 to 1
            value = maxVal - (progress * (maxVal - minVal));
            // Add slight random downward fluctuation
            value -= Math.random() * randomFactor * progress;
        } else {
            // Phase 2: Fast rise
            const progress = (cycleTime - declineDuration) / riseDuration; // 0 to 1
             // Make rise faster initially (e.g., using Math.pow)
            value = minVal + (Math.pow(progress, 0.5) * (maxVal - minVal));
             // Add slight random upward fluctuation
             value += Math.random() * randomFactor * progress;
        }
        // Clamp values to prevent going too far below min or above max due to randomness
        value = Math.max(minVal - randomFactor, Math.min(maxVal + randomFactor, value));

        element.textContent = value.toFixed(2); // Format to 2 decimal places
    }

    function startStockTickers() {
        const loopDuration = 9000; // 9 seconds
        if (stockLeftSpan) {
            setInterval(() => updateStock(stockLeftSpan, loopDuration, 0.75, 15, 105, 3), 60); // Update ~16fps, slightly different params
        }
        if (stockRightSpan) {
            // Start right ticker slightly offset in its cycle
             setTimeout(() => {
                 setInterval(() => updateStock(stockRightSpan, loopDuration, 0.7, 25, 115, 4), 60);
             }, 1500); // Start 1.5 seconds later
        }
         console.log("Stock tickers started."); // Debug message
    }
    // --- Stock Ticker Logic END ---

    // --- ASCII Cat Animation Logic REMOVED ---
    // --- Drawing Logic REMOVED ---
    // --- Double Click Logic REMOVED ---
    // --- Footer Logic REMOVED ---

});
