document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const allIconLinks = document.querySelectorAll('.icon-link');
    const popupTriggers = document.querySelectorAll('.popup-trigger'); // TikTok, Discord
    const doubleClickLinks = document.querySelectorAll('.double-clickable'); // Supercell, BrawlStars (Removed - Empty)
    const allPopups = document.querySelectorAll('.popup-menu');
    // Footer link REMOVED
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor'); // Select typing cursor

    // Set the initial content for the custom cursor
    if (customCursor) {
        customCursor.textContent = '𖹭';
    }

    // --- Fake View Counter Logic ---
    if (visitCountSpan) { /* ... (same as previous) ... */ }
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
    const typeSpeed = 180; // Adjusted speed
    const deleteSpeed = 120; // Adjusted speed
    const pauseDuration = 2500; // Pause after typing/deleting
    let charIndex = 0;
    let isDeleting = false;
    let loopTimeout; // To manage timeouts

    function typeDeleteLoop() {
        clearTimeout(loopTimeout); // Clear previous timeout
        const cursor = typingCursorElement; // Reference the cursor element

        if (!isDeleting) {
            // Typing
            if (charIndex < locationString.length) {
                // Insert char before the cursor
                locationTextElement.insertBefore(document.createTextNode(locationString.charAt(charIndex)), cursor);
                charIndex++;
                loopTimeout = setTimeout(typeDeleteLoop, typeSpeed);
            } else {
                // Pause after typing
                isDeleting = true;
                 if (cursor) cursor.style.animationPlayState = 'paused'; // Pause blink
                loopTimeout = setTimeout(typeDeleteLoop, pauseDuration);
            }
        } else {
            // Deleting
            if (locationTextElement.childNodes.length > 1) { // Check if text nodes exist before cursor
                 if (cursor) cursor.style.animationPlayState = 'running'; // Resume blink
                 // Remove the text node just before the cursor
                 locationTextElement.removeChild(locationTextElement.childNodes[locationTextElement.childNodes.length - 2]);
                 loopTimeout = setTimeout(typeDeleteLoop, deleteSpeed);
            } else {
                 // Pause after deleting
                isDeleting = false;
                charIndex = 0;
                loopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2);
            }
        }
    }
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
             if (locationTextElement && typingCursorElement) {
                 setTimeout(typeDeleteLoop, 800); // Start typing after main content fades in more
             }
        }, 500);
    }, { once: true });


    // --- Custom Cursor Tracking ---
    // (No Trail/Follower logic)
    document.addEventListener('mousemove', (e) => {
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
        // Call function to tilt popups based on mouse position
        tiltPopups(e);
    });


    // --- Popup Tilt Logic START ---
    function tiltPopups(e) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const maxRotate = 8; // Max degrees tilt

        // Calculate rotation - rotateY based on horizontal mouse pos, rotateX based on vertical
        // Use negative deltaX for opposite horizontal tilt
        const rotateY = -(deltaX / centerX) * maxRotate;
        // Use positive deltaY for opposite vertical tilt
        const rotateX = (deltaY / centerY) * maxRotate;

        // Apply to the currently VISIBLE popup
        allPopups.forEach(popup => {
            if (popup.classList.contains('visible')) {
                // Keep existing translateX for centering, add rotations
                popup.style.transform = `translateX(-50%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });
    }

    // Function to reset tilt when popups close
    function resetPopupTilt(popupElement) {
         if(popupElement) {
            popupElement.style.transform = `translateX(-50%) rotateX(0deg) rotateY(0deg)`;
         }
    }
    // --- Popup Tilt Logic END ---


     // --- Volume Control Logic ---
     function updateVolumeUI() { /* ... (same as previous version) ... */ }
     // ... (Mute button and Slider listeners remain the same) ...
     function updateVolumeUI() { if (!backgroundMusic || !volumeIcon || !volumeSlider) return; volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume; if (backgroundMusic.muted || backgroundMusic.volume === 0) { volumeIcon.className = 'fa-solid fa-volume-xmark'; } else if (backgroundMusic.volume <= 0.5) { volumeIcon.className = 'fa-solid fa-volume-low'; } else { volumeIcon.className = 'fa-solid fa-volume-high'; } volumeIcon.classList.add('fa-solid'); }
     if (muteButton) { muteButton.addEventListener('click', () => { if (!backgroundMusic) return; backgroundMusic.muted = !backgroundMusic.muted; if (!backgroundMusic.muted && backgroundMusic.volume === 0) { backgroundMusic.volume = 0.1; } updateVolumeUI(); }); }
     if (volumeSlider) { volumeSlider.addEventListener('input', function() { if (!backgroundMusic) return; backgroundMusic.volume = parseFloat(this.value); backgroundMusic.muted = (backgroundMusic.volume === 0); updateVolumeUI(); }); }
     setTimeout(updateVolumeUI, 100);
     if (backgroundMusic) { backgroundMusic.addEventListener('volumechange', updateVolumeUI); }


    // --- Popup Handling Logic START ---
    function closeAllPopups() {
        allPopups.forEach(popup => {
            if (popup.classList.contains('visible')) {
                popup.classList.remove('visible');
                resetPopupTilt(popup); // Reset tilt when closing
            }
        });
    }

    popupTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation();
            const targetPopupId = trigger.getAttribute('data-popup-target');
            const targetPopup = document.getElementById(targetPopupId);
            if (!targetPopup) return;
            const isCurrentlyVisible = targetPopup.classList.contains('visible');
            // Close others FIRST, then toggle the target
            closeAllPopups(); // This also resets tilt on others
            if (!isCurrentlyVisible) {
                targetPopup.classList.add('visible');
                // Optionally apply initial slight tilt based on current mouse? Or let mousemove handle it.
            }
             // If it was visible, closeAllPopups already handled it (and reset its tilt)
        });
    });

    // Double click listeners for specific icons (REMOVED - No elements with this class left)
    // doubleClickLinks.forEach(link => { ... });

    // Close Popups when Clicking Outside Logic
    document.addEventListener('click', function(event) {
        let clickedInsideAnyPopup = false;
        allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } });
        let clickedOnAnyTrigger = false;
        popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } });
        const volumeControl = document.getElementById('volume-control-container');
        const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false;

        if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) {
            closeAllPopups(); // This will also reset tilt on the closing popup
        }
    });
    // --- Popup Handling Logic END ---

    // --- Footer Link Double-Click Logic REMOVED ---

});
