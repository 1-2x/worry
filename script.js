document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const allIconLinks = document.querySelectorAll('.icon-link');
    const popupTriggers = document.querySelectorAll('.popup-trigger'); // TikTok, Discord
    const doubleClickLinks = document.querySelectorAll('.double-clickable'); // Supercell, BrawlStars (REMOVED) - Now empty NodeList
    const allPopups = document.querySelectorAll('.popup-menu');
    // Footer link REMOVED
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text'); // For typing effect

    // Set the initial content for the custom cursor
    if (customCursor) {
        customCursor.textContent = '𖹭';
    }

    // --- Fake View Counter Logic ---
    if (visitCountSpan) {
        let currentCount = localStorage.getItem('pageVisits_worrySite');
        let visitNumber = 0;
        if (currentCount && !isNaN(parseInt(currentCount))) { visitNumber = parseInt(currentCount); }
        visitNumber += 1;
        visitCountSpan.textContent = visitNumber;
        localStorage.setItem('pageVisits_worrySite', visitNumber.toString());
    }

    // --- Browser Tab Title Animation ---
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .'];
    let titleIndex = 0;
    setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect START ---
    const locationString = "London, UK";
    const typeSpeed = 150; // ms per character
    const deleteSpeed = 100; // ms per character
    const pauseDuration = 2000; // ms to pause after typing/deleting
    let charIndex = 0;
    let isDeleting = false;

    function typeDeleteLoop() {
        const currentText = locationTextElement.textContent;

        if (!isDeleting) {
            // Typing
            if (charIndex < locationString.length) {
                locationTextElement.textContent += locationString.charAt(charIndex);
                charIndex++;
                setTimeout(typeDeleteLoop, typeSpeed);
            } else {
                // Pause after typing
                isDeleting = true;
                setTimeout(typeDeleteLoop, pauseDuration);
            }
        } else {
            // Deleting
            if (currentText.length > 0) {
                locationTextElement.textContent = currentText.substring(0, currentText.length - 1);
                setTimeout(typeDeleteLoop, deleteSpeed);
            } else {
                 // Pause after deleting
                isDeleting = false;
                charIndex = 0;
                setTimeout(typeDeleteLoop, pauseDuration / 2); // Shorter pause before retyping
            }
        }
    }
     // Start the typing effect after a delay when main content shows
     // --- Location Typing Effect END ---


    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        entryScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.style.display = 'none';
            mainContent.classList.add('visible');
            if (volumeContainer) { volumeContainer.classList.add('visible'); }
            backgroundMusic.play().catch(error => { console.warn("Background music autoplay failed initially.", error); });
             updateVolumeUI();
             // Start typing effect only after entry
             if (locationTextElement) {
                 setTimeout(typeDeleteLoop, 500); // Start typing after main content fades in
             }
        }, 500);
    }, { once: true });


    // --- Custom Cursor Tracking (No Trail) ---
    document.addEventListener('mousemove', (e) => {
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
    });
    // Trail/Follower logic REMOVED


     // --- Volume Control Logic ---
     function updateVolumeUI() {
        if (!backgroundMusic || !volumeIcon || !volumeSlider) return;
        volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume;
        if (backgroundMusic.muted || backgroundMusic.volume === 0) { volumeIcon.className = 'fa-solid fa-volume-xmark'; }
        else if (backgroundMusic.volume <= 0.5) { volumeIcon.className = 'fa-solid fa-volume-low'; }
        else { volumeIcon.className = 'fa-solid fa-volume-high'; }
        volumeIcon.classList.add('fa-solid');
    }
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            if (!backgroundMusic) return; backgroundMusic.muted = !backgroundMusic.muted;
            if (!backgroundMusic.muted && backgroundMusic.volume === 0) { backgroundMusic.volume = 0.1; }
            updateVolumeUI();
        });
    }
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            if (!backgroundMusic) return; backgroundMusic.volume = parseFloat(this.value);
            backgroundMusic.muted = (backgroundMusic.volume === 0); updateVolumeUI();
        });
    }
     setTimeout(updateVolumeUI, 100);
     if (backgroundMusic) { backgroundMusic.addEventListener('volumechange', updateVolumeUI); }


    // --- Popup Handling Logic START ---
    function closeAllPopups() { allPopups.forEach(popup => { popup.classList.remove('visible'); }); }

    popupTriggers.forEach(trigger => { // Only targets TikTok, Discord now
        trigger.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation();
            const targetPopupId = trigger.getAttribute('data-popup-target');
            const targetPopup = document.getElementById(targetPopupId);
            if (!targetPopup) return;
            const isCurrentlyVisible = targetPopup.classList.contains('visible');
            closeAllPopups();
            if (!isCurrentlyVisible) { targetPopup.classList.add('visible'); }
        });
    });

    // Double click listeners for specific icons (REMOVED as icons were deleted)
    // doubleClickLinks.forEach(link => { ... });

    // Close Popups when Clicking Outside Logic
    document.addEventListener('click', function(event) {
        let clickedInsideAnyPopup = false;
        allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } });
        let clickedOnAnyTrigger = false;
        popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } });
        const volumeControl = document.getElementById('volume-control-container');
        const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false;

        if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); }
    });
    // --- Popup Handling Logic END ---

    // --- Footer Link Double-Click Logic REMOVED ---
    // if (footerLink) { ... }

});
