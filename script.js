document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Setting up baseline + cursor/trail...");

    // --- Standard Elements ---
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor'); // <<< SELECT CURSOR
    // const popupTriggers = document.querySelectorAll('.popup-trigger'); // Disabled
    // const allPopups = document.querySelectorAll('.popup-menu'); // Disabled
    // const visitCountSpan = document.getElementById('visit-count'); // Disabled
    // const volumeContainer = document.getElementById('volume-control-container'); // Disabled
    // const muteButton = document.getElementById('mute-button'); // Disabled
    // const volumeIcon = document.getElementById('volume-icon'); // Disabled
    // const volumeSlider = document.getElementById('volume-slider'); // Disabled
    // const locationTextElement = document.getElementById('location-text'); // Disabled
    // const typingCursorElement = document.getElementById('typing-cursor'); // Disabled

    // --- Global State ---
    // let visiblePopupForTilt = null; // Disabled
    let lastTrailTime = 0; // <<< FOR TRAIL
    const trailInterval = 50; // <<< FOR TRAIL

    // --- Initial Setup ---
    if (customCursor) {
        customCursor.textContent = '𖹭'; // <<< SET CURSOR CHAR
        console.log("Custom cursor text set.");
    } else {
         console.error("Custom cursor element not found!");
    }
    // --- Fake View Counter Logic DISABLED ---
    // --- Browser Tab Title Animation DISABLED ---
    // --- Location Typing Effect DISABLED ---

    // --- Entry Screen Logic ---
    if (!entryScreen) { console.error("FATAL: Entry Screen element not found!"); return; }
    entryScreen.addEventListener('click', () => {
        console.log("Entry screen clicked!");
        entryScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.style.display = 'none';
            if (mainContent) { mainContent.classList.add('visible'); console.log("Main content should be visible."); }
            else { console.error("Main Content element missing!"); }

            // --- Simple Canvas Draw Test START ---
            console.log("Attempting static canvas draw...");
            const chartCanvas = document.getElementById('scrolling-chart-canvas');
            if (chartCanvas) {
                 console.log("Canvas element found:", chartCanvas);
                 chartCanvas.width = chartCanvas.clientWidth || 350; chartCanvas.height = chartCanvas.clientHeight || 80;
                 console.log(`Canvas size set to ${chartCanvas.width}x${chartCanvas.height}`);
                 const ctx = chartCanvas.getContext('2d');
                 if (ctx) {
                     console.log("Canvas context obtained.");
                     ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
                     ctx.fillStyle = 'lime';
                     ctx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
                     console.log(">>> Static LIME rectangle drawn. Check visually! <<<");
                 } else { console.error("!!! Failed to get 2D context for canvas. !!!"); }
            } else { console.error("!!! Canvas element #scrolling-chart-canvas not found! Check HTML. !!!"); }
            // --- Simple Canvas Draw Test END ---

            // Play music (optional)
            // if(backgroundMusic) { backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); }

        }, 500);
    }, { once: true });
    console.log("Entry screen listener added.");

    // --- Cursor Tracking & Falling Trail Logic START ---
    document.addEventListener('mousemove', (e) => {
        // Move main custom cursor (𖹭)
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
        // Throttled falling character trail creation
        const now = Date.now();
        if (now - lastTrailTime > trailInterval) {
            createFallingTrailChar(e.clientX, e.clientY);
            lastTrailTime = now;
        }
        // Tilt logic removed
    });

    function createFallingTrailChar(x, y) {
        const trailEl = document.createElement('div');
        trailEl.classList.add('trail-cursor-char'); // Use the CSS class
        trailEl.textContent = '𖹭'; // The cursor character
        trailEl.style.left = `${x}px`; // Position at cursor
        trailEl.style.top = `${y}px`;
        document.body.appendChild(trailEl);
        // Remove the element after animation duration (match CSS fall-fade-char)
        setTimeout(() => { trailEl.remove(); }, 1000); // 1.0 second fall
    }
    // --- Cursor Tracking & Falling Trail Logic END ---


    // --- Volume Control Logic DISABLED ---
    // --- Popup Handling Logic DISABLED ---
    // --- Right-Click Disable DISABLED (allow for debug) ---
    // document.addEventListener('contextmenu', event => event.preventDefault());

}); // End of DOMContentLoaded listener
