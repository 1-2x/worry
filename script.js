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
    const volumeContainer = document.getElementById('volume-control-container'); // Select volume container
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
            // Make volume control visible AFTER main content starts showing
            if (volumeContainer) {
                 volumeContainer.classList.add('visible');
            }
            // Attempt to play music immediately
            backgroundMusic.play().catch(error => {
                console.warn("Background music autoplay failed initially.", error);
            });
            // Set initial volume UI state
             updateVolumeUI();
        }, 500); // Timeout matches entry screen fade
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
        if (!backgroundMusic || !volumeIcon || !volumeSlider) return;

        // Update slider value first (reflects current volume unless muted)
        volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume;

        // Update icon based on mute status and volume level
        if (backgroundMusic.muted) {
            volumeIcon.className = 'fa-solid fa-volume-xmark'; // Set class directly
        } else if (backgroundMusic.volume === 0) {
             volumeIcon.className = 'fa-solid fa-volume-off';
        } else if (backgroundMusic.volume <= 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
             volumeIcon.className = 'fa-solid fa-volume-high';
        }
        // Add back base class if removed by className assignment
        volumeIcon.classList.add('fa-solid');
    }


    // Mute Button Click
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            if (!backgroundMusic) return;
            backgroundMusic.muted = !backgroundMusic.muted;
             // If unmuting and volume was 0, set volume slightly above 0
             if (!backgroundMusic.muted && backgroundMusic.volume === 0) {
                 backgroundMusic.volume = 0.1; // Set to a low volume instead of 0
             }
            updateVolumeUI();
        });
    }

    // Volume Slider Input Change
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            if (!backgroundMusic) return;
            backgroundMusic.volume = parseFloat(this.value); // Ensure value is float
            // If user interacts with slider, always unmute unless they slide to 0
            backgroundMusic.muted = (backgroundMusic.volume === 0);
            updateVolumeUI();
        });
    }

     // Initial UI setup needs audio metadata loaded potentially, but we can try early
     updateVolumeUI(); // Set initial state based on defaults
     // Event listener in case properties change later (e.g. ended, or external control)
     if (backgroundMusic) {
        backgroundMusic.addEventListener('volumechange', updateVolumeUI);
     }
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
            const volumeControl = document.getElementById('volume-control-container');
            const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false;

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
