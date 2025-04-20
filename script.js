document.addEventListener('DOMContentLoaded', () => {
    // --- Standard Elements ---
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const popupTriggers = document.querySelectorAll('.popup-trigger');
    const allPopups = document.querySelectorAll('.popup-menu');
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor');
    // Custom cursor / Follower / Drawing / Footer Elements REMOVED

    // --- Global State ---
    let visiblePopupForTilt = null;

    // --- Fake View Counter Logic ---
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }

    // --- Browser Tab Title Animation ---
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => { entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); } startAsciiCatAnimations(); /* <<< Start Cat Animations */ }, 500); }, { once: true });

    // --- Falling Dot Trail Logic START ---
    let lastTrailTime = 0;
    const trailInterval = 50; // Throttle interval
    document.addEventListener('mousemove', (e) => {
        // No main custom cursor to move now
        // Tilt visible popup
        if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); }
        // Throttled trail creation
        const now = Date.now();
        if (now - lastTrailTime > trailInterval) {
            createFallingDot(e.clientX, e.clientY);
            lastTrailTime = now;
        }
    });
    function createFallingDot(x, y) {
        const dot = document.createElement('div');
        dot.classList.add('trail-dot'); // Use the new CSS class
        // Position based on viewport coordinates
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        document.body.appendChild(dot);
        // Remove the element after animation duration (match CSS)
        setTimeout(() => { dot.remove(); }, 1000); // 1.0 second fall
    }
    // --- Falling Dot Trail Logic END ---

    // --- Popup Tilt Logic ---
    function tiltPopup(e, popupElement) { const centerX = window.innerWidth / 2; const centerY = window.innerHeight / 2; const deltaX = e.clientX - centerX; const deltaY = e.clientY - centerY; const maxRotate = 15; /* Increased tilt */ const rotateY = -(deltaX / centerX) * maxRotate; const rotateX = (deltaY / centerY) * maxRotate; const clampedRotateX = Math.max(-maxRotate, Math.min(maxRotate, rotateX)); const clampedRotateY = Math.max(-maxRotate, Math.min(maxRotate, rotateY)); popupElement.style.transform = `translateX(-50%) rotateX(${clampedRotateX}deg) rotateY(${clampedRotateY}deg)`; }
    function resetPopupTilt(popupElement) { if(popupElement) { popupElement.style.transform = `translateX(-50%) rotateX(0deg) rotateY(0deg)`; } }

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
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); } });

    // --- Right-Click Disable ---
    document.addEventListener('contextmenu', event => event.preventDefault());

    // --- ASCII Cat Animation START ---
    const catArt = [
        " |\\---/|",
        " | o_o |",
        "  \\_^_/ "
    ];
    const catTypeSpeed = 7000 / (catArt.join('\n').length); // ms per char for 7s total type
    const catDeleteSpeed = 4000 / (catArt.join('\n').length); // ms per char for 4s total delete
    const catPauseDuration = 3000; // 3s pause
    const catRepeatDelay = 500; // ms pause before repeat

    function createAsciiAnimator(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        let lines = catArt;
        let currentLine = 0;
        let currentChar = 0;
        let isDeleting = false;
        let isPaused = false;
        let typeTimeout;
        let lineContent = '';

        function run() {
            clearTimeout(typeTimeout);
            if (isPaused) return; // Don't do anything if paused

            let cursorHtml = `<span class="typing-cursor-cat">|</span>`;

            if (!isDeleting) { // Typing
                if (currentLine < lines.length) {
                    const line = lines[currentLine];
                    if (currentChar < line.length) {
                        lineContent += line[currentChar];
                        element.innerHTML = lines.slice(0, currentLine).join('\n') + '\n' + lineContent + cursorHtml;
                        currentChar++;
                        typeTimeout = setTimeout(run, catTypeSpeed);
                    } else { // End of line
                        element.innerHTML = lines.slice(0, currentLine + 1).join('\n') + cursorHtml; // Show full line + cursor
                        currentLine++;
                        currentChar = 0;
                        lineContent = '';
                        if (currentLine < lines.length) {
                            typeTimeout = setTimeout(run, catTypeSpeed * 2); // Pause slightly between lines
                        } else {
                            // Finished typing all lines
                            isPaused = true;
                            element.innerHTML = lines.join('\n'); // Remove cursor
                            typeTimeout = setTimeout(() => {
                                isPaused = false;
                                isDeleting = true;
                                currentLine = lines.length - 1; // Start deleting from last line
                                lineContent = lines[currentLine]; // Preload last line content
                                currentChar = lineContent.length;
                                run();
                            }, catPauseDuration);
                        }
                    }
                }
            } else { // Deleting
                 if (currentLine >= 0) {
                     if (currentChar > 0) {
                         lineContent = lineContent.substring(0, currentChar - 1);
                         element.innerHTML = lines.slice(0, currentLine).join('\n') + (currentLine >= 0 ? '\n' : '') + lineContent + cursorHtml;
                         currentChar--;
                         typeTimeout = setTimeout(run, catDeleteSpeed);
                     } else { // Finished deleting line
                         currentLine--;
                         if (currentLine >= 0) {
                             lineContent = lines[currentLine];
                             currentChar = lineContent.length;
                             element.innerHTML = lines.slice(0, currentLine + 1).join('\n') + cursorHtml; // Show lines up to current + cursor
                             typeTimeout = setTimeout(run, catDeleteSpeed * 2); // Pause slightly between lines
                         } else {
                              // Finished deleting all
                             element.innerHTML = ''; // Clear completely
                             isDeleting = false;
                             currentLine = 0;
                             currentChar = 0;
                             lineContent = '';
                             typeTimeout = setTimeout(run, catRepeatDelay); // Pause before repeating
                         }
                     }
                 }
            }
        }
        return { start: run }; // Return object with start method
    }

    let catLeftAnimator = null;
    let catRightAnimator = null;

    function startAsciiCatAnimations() {
        if (!catLeftAnimator) {
            catLeftAnimator = createAsciiAnimator('cat-left');
            if(catLeftAnimator) catLeftAnimator.start();
        }
         if (!catRightAnimator) {
            // Add a slight delay to the right one for visual separation
            setTimeout(() => {
                catRightAnimator = createAsciiAnimator('cat-right');
                if(catRightAnimator) catRightAnimator.start();
            }, 500); // 0.5s delay
        }
    }
    // --- ASCII Cat Animation END ---

});
