document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const allIconLinks = document.querySelectorAll('.icon-link'); // Links that might trigger something
    const popupTriggers = document.querySelectorAll('.popup-trigger'); // Links that trigger popups
    const doubleClickLinks = document.querySelectorAll('.double-clickable'); // Links that redirect on double click
    const allPopups = document.querySelectorAll('.popup-menu'); // All popup divs
    const footerLink = document.querySelector('.footer-credit');
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    // Follower cat REMOVED

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

    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        entryScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.style.display = 'none';
            mainContent.classList.add('visible');
            if (volumeContainer) { volumeContainer.classList.add('visible'); }
            backgroundMusic.play().catch(error => { console.warn("Background music autoplay failed initially.", error); });
             updateVolumeUI();
        }, 500);
    }, { once: true });

    // --- Custom Cursor Tracking (No Trail/Follower) ---
    document.addEventListener('mousemove', (e) => {
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
        // Trail/Follower function calls REMOVED
    });
    // createTrailElement function REMOVED

     // --- Volume Control Logic ---
     function updateVolumeUI() { /* ... (same as previous version) ... */ }
     // ... (Mute button and Slider listeners remain the same) ...
     function updateVolumeUI() {
        if (!backgroundMusic || !volumeIcon || !volumeSlider) return;
        volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume;
        if (backgroundMusic.muted || backgroundMusic.volume === 0) { // Combine mute and volume 0 for icon
             volumeIcon.className = 'fa-solid fa-volume-xmark'; // Use mute icon for both
        } else if (backgroundMusic.volume <= 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
             volumeIcon.className = 'fa-solid fa-volume-high';
        }
        volumeIcon.classList.add('fa-solid');
    }
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            if (!backgroundMusic) return;
            backgroundMusic.muted = !backgroundMusic.muted;
             if (!backgroundMusic.muted && backgroundMusic.volume === 0) { backgroundMusic.volume = 0.1; }
            updateVolumeUI();
        });
    }
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            if (!backgroundMusic) return;
            backgroundMusic.volume = parseFloat(this.value);
            backgroundMusic.muted = (backgroundMusic.volume === 0); // Mute if slider dragged to 0
            updateVolumeUI();
        });
    }
     setTimeout(updateVolumeUI, 100);
     if (backgroundMusic) { backgroundMusic.addEventListener('volumechange', updateVolumeUI); }


    // --- Popup Handling Logic START ---
    // Function to close all popups
    function closeAllPopups() {
        allPopups.forEach(popup => {
            popup.classList.remove('visible');
        });
    }

    // Add click listeners to popup triggers
    popupTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation(); // Prevent triggering document click listener

            const targetPopupId = trigger.getAttribute('data-popup-target');
            const targetPopup = document.getElementById(targetPopupId);

            if (!targetPopup) return;

            // Check if the clicked popup is already visible
            const isCurrentlyVisible = targetPopup.classList.contains('visible');

            // First, close all popups
            closeAllPopups();

            // If the clicked popup wasn't the one already visible, show it
            if (!isCurrentlyVisible) {
                targetPopup.classList.add('visible');
            }
            // If it *was* visible, toggling is handled by closing all first.
        });
    });

    // Add double-click listeners for non-popup links
    doubleClickLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent single click
            event.stopPropagation();
        });
        link.addEventListener('dblclick', (event) => {
            const targetLink = event.currentTarget.href;
            if (targetLink) { window.open(targetLink, '_blank', 'noopener,noreferrer'); }
        });
    });

    // Add double-click listener for the footer link
    if (footerLink) {
        footerLink.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); });
        footerLink.addEventListener('dblclick', (event) => {
            const targetLink = event.currentTarget.href;
            if (targetLink) { window.open(targetLink, '_blank', 'noopener,noreferrer'); }
        });
    }

    // Close Popups when Clicking Outside Logic
    document.addEventListener('click', function(event) {
        let clickedInsideAnyPopup = false;
        allPopups.forEach(p => {
            if (p.contains(event.target)) {
                clickedInsideAnyPopup = true;
            }
        });

        let clickedOnAnyTrigger = false;
        popupTriggers.forEach(t => {
            if (t.contains(event.target)) {
                clickedOnAnyTrigger = true;
            }
        });

        const volumeControl = document.getElementById('volume-control-container');
        const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false;

        // If the click was not inside any popup, not on any trigger, and not in volume control, close all popups
        if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) {
            closeAllPopups();
        }
    });
    // --- Popup Handling Logic END ---

});
