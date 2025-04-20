document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const allIconLinks = document.querySelectorAll('.icon-link');
    const footerLink = document.querySelector('.footer-credit');
    const visitCountSpan = document.getElementById('visit-count');
    const discordTrigger = document.getElementById('discord-pop-trigger');
    const discordPopup = document.getElementById('discord-popup');

    // Volume Control Elements
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');

    // Set the initial content for the custom cursor
    if (customCursor) {
        customCursor.textContent = '𖹭';
    }

    // --- Fake View Counter Logic ---
    if (visitCountSpan) {
        let currentCount = localStorage.getItem('pageVisits_worrySite');
        let visitNumber = 0;
        if (currentCount && !isNaN(parseInt(currentCount))) {
            visitNumber = parseInt(currentCount);
        }
        visitNumber += 1;
        visitCountSpan.textContent = visitNumber;
        localStorage.setItem('pageVisits_worrySite', visitNumber.toString());
    }

    // --- Browser Tab Title Animation ---
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .'];
    let titleIndex = 0;
    setInterval(() => {
        document.title = titles[titleIndex];
        titleIndex = (titleIndex + 1) % titles.length;
    }, 600);


    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        entryScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.style.display = 'none';
            mainContent.classList.add('visible');
            // Attempt to play music immediately
            backgroundMusic.play().catch(error => {
                console.warn("Background music autoplay failed initially.", error);
                // If autoplay fails, user interaction (like adjusting volume) might start it
            });
            // Set initial volume UI state AFTER trying to play
             updateVolumeUI();
        }, 500);
    }, { once: true });

    // --- Custom Cursor Tracking and Trail ---
    document.addEventListener('mousemove', (e) => {
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
        createTrailDot(e.clientX, e.clientY);
    });

    function createTrailDot(x, y) {
        const dot = document.createElement('div');
        dot.classList.add('trail-dot');
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        document.body.appendChild(dot);
        setTimeout(() => {
            dot.remove();
        }, 800);
    }

     // --- Volume Control Logic START ---
     function updateVolumeUI() {
        if (!backgroundMusic || !volumeIcon || !volumeSlider) return; // Ensure elements exist

        if (backgroundMusic.muted) {
            volumeIcon.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-off');
            volumeIcon.classList.add('fa-volume-xmark'); // Mute icon
            volumeSlider.value = 0; // Show slider at zero when muted
        } else {
            volumeIcon.classList.remove('fa-volume-xmark'); // Remove mute icon class
            if (backgroundMusic.volume === 0) {
                volumeIcon.classList.remove('fa-volume-high', 'fa-volume-low');
                volumeIcon.classList.add('fa-volume-off');
            } else if (backgroundMusic.volume <= 0.5) {
                volumeIcon.classList.remove('fa-volume-high', 'fa-volume-off');
                volumeIcon.classList.add('fa-volume-low');
            } else {
                volumeIcon.classList.remove('fa-volume-low', 'fa-volume-off');
                volumeIcon.classList.add('fa-volume-high');
            }
            volumeSlider.value = backgroundMusic.volume; // Reflect actual volume
        }
    }

    // Mute Button Click
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            if (!backgroundMusic) return;
            backgroundMusic.muted = !backgroundMusic.muted;
            updateVolumeUI();
        });
    }

    // Volume Slider Input Change
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() { // Use 'input' for real-time update
            if (!backgroundMusic) return;
            backgroundMusic.volume = this.value;
            // Unmute if user manually adjusts volume slider away from 0
             if (this.value > 0) {
                 backgroundMusic.muted = false;
             } else {
                 // Optional: you might want mute to persist even if slider is at 0
                 // If slider hits 0, set volume but don't necessarily mute? Or do mute?
                 // Let's set muted if volume is 0 via slider.
                 backgroundMusic.muted = (this.value == 0);
             }
            updateVolumeUI();
        });
    }

     // Initial UI setup (call after a short delay to ensure audio properties are readable)
     setTimeout(updateVolumeUI, 100);
    // --- Volume Control Logic END ---


    // --- Icon Link Click Logic ---
    allIconLinks.forEach(link => {
        if (link.id === 'discord-pop-trigger') {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                if(discordPopup) {
                    discordPopup.classList.toggle('visible');
                }
            });
        } else if (link.classList.contains('double-clickable')) {
            link.addEventListener('click', (event) => { event.preventDefault(); });
            link.addEventListener('dblclick', (event) => {
                const targetLink = event.currentTarget.href;
                if (targetLink) { window.open(targetLink, '_blank'); }
            });
        } else {
              link.addEventListener('click', (event) => { event.preventDefault(); });
        }
    });

    // --- Close Popup when Clicking Outside ---
    document.addEventListener('click', function(event) {
        if (discordPopup && discordTrigger) {
            const isClickInsidePopup = discordPopup.contains(event.target);
            const isClickOnTrigger = discordTrigger.contains(event.target);
            // Also check if click is inside the volume control
            const volumeControl = document.getElementById('volume-control-container');
            const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false;


            // Close popup if click is outside popup AND outside trigger
            // Let clicks inside volume control pass through without closing popup
            if (discordPopup.classList.contains('visible') && !isClickInsidePopup && !isClickOnTrigger && !isClickInsideVolume) {
                 discordPopup.classList.remove('visible');
            }
        }
    });

    // --- Footer Link Double-Click Logic ---
    if (footerLink) {
        footerLink.addEventListener('click', (event) => { event.preventDefault(); });
        footerLink.addEventListener('dblclick', (event) => {
            const targetLink = event.currentTarget.href;
            if (targetLink) { window.open(targetLink, '_blank'); }
        });
    }

});
