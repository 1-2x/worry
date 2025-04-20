document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    // Select only remaining interactive icons
    const popupTriggers = document.querySelectorAll('.popup-trigger'); // TikTok, Discord
    // Double clickable links REMOVED
    const allPopups = document.querySelectorAll('.popup-menu');
    // Footer link REMOVED
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor');

    if (customCursor) { customCursor.textContent = '𖹭'; }

    // Fake View Counter Logic
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }

    // Browser Tab Title Animation
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // Location Typing Effect
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let charIndex = 0; let isDeleting = false; let loopTimeout;
    function typeDeleteLoop() { clearTimeout(loopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!isDeleting) { if (charIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(charIndex); locationTextElement.insertBefore(letterSpan, cursor); charIndex++; loopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { isDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; loopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); loopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { isDeleting = false; charIndex = 0; loopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // Entry Screen Logic
    entryScreen.addEventListener('click', () => { entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); } }, 500); }, { once: true });

    // Custom Cursor Tracking & Popup Tilt
    let visiblePopupForTilt = null; // Keep track of the currently tilted popup
    document.addEventListener('mousemove', (e) => {
        if (customCursor) { customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`; }
        // Tilt ONLY the currently visible popup
        if(visiblePopupForTilt) {
            tiltPopup(e, visiblePopupForTilt);
        }
    });

    function tiltPopup(e, popupElement) {
        const centerX = window.innerWidth / 2; const centerY = window.innerHeight / 2;
        const deltaX = e.clientX - centerX; const deltaY = e.clientY - centerY;
        const maxRotate = 12; // <<< INCREASED TILT
        const rotateY = -(deltaX / centerX) * maxRotate; const rotateX = (deltaY / centerY) * maxRotate;
        popupElement.style.transform = `translateX(-50%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function resetPopupTilt(popupElement) { if(popupElement) { popupElement.style.transform = `translateX(-50%) rotateX(0deg) rotateY(0deg)`; } }

     // Volume Control Logic
     function updateVolumeUI() { if (!backgroundMusic || !volumeIcon || !volumeSlider) return; volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume; if (backgroundMusic.muted || backgroundMusic.volume === 0) { volumeIcon.className = 'fa-solid fa-volume-xmark'; } else if (backgroundMusic.volume <= 0.5) { volumeIcon.className = 'fa-solid fa-volume-low'; } else { volumeIcon.className = 'fa-solid fa-volume-high'; } volumeIcon.classList.add('fa-solid'); }
     if (muteButton) { muteButton.addEventListener('click', () => { if (!backgroundMusic) return; backgroundMusic.muted = !backgroundMusic.muted; if (!backgroundMusic.muted && backgroundMusic.volume === 0) { backgroundMusic.volume = 0.1; } updateVolumeUI(); }); }
     if (volumeSlider) { volumeSlider.addEventListener('input', function() { if (!backgroundMusic) return; backgroundMusic.volume = parseFloat(this.value); backgroundMusic.muted = (backgroundMusic.volume === 0); updateVolumeUI(); }); }
     setTimeout(updateVolumeUI, 100);
     if (backgroundMusic) { backgroundMusic.addEventListener('volumechange', updateVolumeUI); }

    // Popup Handling Logic
    function closeAllPopups() { allPopups.forEach(popup => { if (popup.classList.contains('visible')) { popup.classList.remove('visible'); resetPopupTilt(popup); } }); visiblePopupForTilt = null; } // Reset tilt tracker
    popupTriggers.forEach(trigger => { // Only targets TikTok, Discord now
        trigger.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation();
            const targetPopupId = trigger.getAttribute('data-popup-target');
            const targetPopup = document.getElementById(targetPopupId);
            if (!targetPopup) return;
            const isCurrentlyVisible = targetPopup.classList.contains('visible');
            closeAllPopups(); // Close others and reset their tilt
            if (!isCurrentlyVisible) {
                targetPopup.classList.add('visible');
                visiblePopupForTilt = targetPopup; // Set this as the one to tilt
                // Optionally trigger initial tilt calculation if needed, otherwise mousemove handles it
            } // If it was visible, closeAllPopups already handled it
        });
    });

    // Close Popups when Clicking Outside Logic
    document.addEventListener('click', function(event) {
        let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } });
        let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } });
        const volumeControl = document.getElementById('volume-control-container');
        const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false;
        if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); }
    });

    // Double Click listeners REMOVED
    // Footer link listener REMOVED

});
