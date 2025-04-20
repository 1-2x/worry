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
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const followerCat = document.getElementById('follower-cat'); // Select follower cat

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
            if (volumeContainer) {
                 volumeContainer.classList.add('visible');
            }
            backgroundMusic.play().catch(error => {
                console.warn("Background music autoplay failed initially.", error);
            });
             updateVolumeUI();
        }, 500);
    }, { once: true });

    // --- Custom Cursor Tracking ---
    // (Trail dot creation removed)
    document.addEventListener('mousemove', (e) => {
        if (customCursor) {
            // Move the main custom cursor directly
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;

            // Update target position for the follower cat (with offset)
            updateTargetPosition(e.clientX, e.clientY);
        }
        // createTrailDot(e.clientX, e.clientY); // REMOVED
    });

    // --- Follower Cat Logic START ---
    let followerX = 0, followerY = 0; // Follower's current position
    let targetX = 0, targetY = 0;     // Target position (cursor + offset)
    let prevTargetX = 0, prevTargetY = 0; // For calculating movement angle
    let easingFactor = 0.1; // How quickly the follower catches up (smaller = smoother/slower)
    const offsetPixels = 30; // Approx distance offset (~1-2cm depending on DPI)

    function updateTargetPosition(cursorX, cursorY) {
         targetX = cursorX + offsetPixels; // Offset down and right
         targetY = cursorY + offsetPixels;
    }

    function animateFollower() {
        if (!followerCat) return; // Exit if element not found

        // Calculate difference between follower and target
        let dx = targetX - followerX;
        let dy = targetY - followerY;

        // Calculate movement angle based on target change
        let moveX = targetX - prevTargetX;
        let moveY = targetY - prevTargetY;

        // Only rotate if the mouse actually moved significantly
        if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
             // Calculate angle in degrees (adjusting by +90 because atan2 assumes 0 degrees is right)
            let angle = Math.atan2(moveY, moveX) * (180 / Math.PI) + 90;
            // Apply rotation
            followerCat.style.transform = `rotate(${angle}deg)`;
        }

        // Update previous target position for next frame's angle calculation
        prevTargetX = targetX;
        prevTargetY = targetY;

        // Apply easing (lerp - linear interpolation)
        // Move the follower a fraction of the distance towards the target
        followerX += dx * easingFactor;
        followerY += dy * easingFactor;

        // Update follower position
        followerCat.style.left = `${followerX}px`;
        followerCat.style.top = `${followerY}px`;

        // Keep the animation loop going
        requestAnimationFrame(animateFollower);
    }

    // Initialize follower position (start near initial cursor off-screen) and start animation
    if (followerCat) {
        // Try to get initial mouse position if possible (might not be available yet)
        // Setting initial target slightly off-screen too
        targetX = -100 + offsetPixels;
        targetY = -100 + offsetPixels;
        followerX = -100;
        followerY = -100;
        prevTargetX = targetX;
        prevTargetY = targetY;
        requestAnimationFrame(animateFollower); // Start the animation loop
        console.log("Follower cat animation started."); // Debug message
    } else {
         console.error("Follower cat element not found!");
    }
    // --- Follower Cat Logic END ---

    // --- createTrailDot function REMOVED ---

     // --- Volume Control Logic ---
     function updateVolumeUI() {
        if (!backgroundMusic || !volumeIcon || !volumeSlider) return;
        volumeSlider.value = backgroundMusic.muted ? 0 : backgroundMusic.volume;
        if (backgroundMusic.muted) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (backgroundMusic.volume === 0) {
             volumeIcon.className = 'fa-solid fa-volume-off';
        } else if (backgroundMusic.volume <= 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
             volumeIcon.className = 'fa-solid fa-volume-high';
        }
        volumeIcon.classList.add('fa-solid'); // Ensure base class remains
    }
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            if (!backgroundMusic) return;
            backgroundMusic.muted = !backgroundMusic.muted;
             if (!backgroundMusic.muted && backgroundMusic.volume === 0) {
                 backgroundMusic.volume = 0.1;
             }
            updateVolumeUI();
        });
    }
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            if (!backgroundMusic) return;
            backgroundMusic.volume = parseFloat(this.value);
            backgroundMusic.muted = (backgroundMusic.volume === 0);
            updateVolumeUI();
        });
    }
     setTimeout(updateVolumeUI, 100);
     if (backgroundMusic) {
        backgroundMusic.addEventListener('volumechange', updateVolumeUI);
     }

    // --- Icon Link Click Logic ---
    allIconLinks.forEach(link => {
        if (link.id === 'discord-pop-trigger') {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                if(discordPopup) { discordPopup.classList.toggle('visible'); }
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
            const isClickInsideFollower = followerCat ? followerCat.contains(event.target) : false; // Check follower too

            // Close popup if click is outside popup AND outside trigger AND outside volume
            if (discordPopup.classList.contains('visible') && !isClickInsidePopup && !isClickOnTrigger && !isClickInsideVolume && !isClickInsideFollower) {
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
