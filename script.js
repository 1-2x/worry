document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Setting up elements...");

    // --- Standard Elements ---
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const popupTriggers = document.querySelectorAll('.popup-trigger');
    const allPopups = document.querySelectorAll('.popup-menu');
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor');

    // --- Mini Candlestick Elements & State ---
    const miniCanvas = document.getElementById('mini-chart-canvas');
    const miniCtx = miniCanvas ? miniCanvas.getContext('2d') : null;
    let candleInterval = null;
    const candleConfig = {
        updateInterval: 1500, // Update every 1.5 seconds
        priceMin: 10, priceMax: 90, volatility: 15, // Range and change amount
        wickVolatility: 5,
        bodyWidth: 10, // Width of the candle body
        neonRed: '#ff0033',
        neonPurple: '#9d00ff',
        glowBlur: 6,
    };
    let lastCandleData = { // Store the last candle's data
        open: (candleConfig.priceMin + candleConfig.priceMax) / 2,
        high: (candleConfig.priceMin + candleConfig.priceMax) / 2 + 5,
        low: (candleConfig.priceMin + candleConfig.priceMax) / 2 - 5,
        close: (candleConfig.priceMin + candleConfig.priceMax) / 2,
    };

    // --- Global State ---
    let visiblePopupForTilt = null; let lastTrailTime = 0; const trailInterval = 50;

    // --- Initial Setup ---
    if (customCursor) { customCursor.textContent = '𖹭'; }
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Mini Candlestick Logic START ---

    // Resize canvas to fit container - run once initially and on window resize
    function resizeMiniCanvas() {
        if (!miniCanvas) return;
        // Get dimensions from CSS or set defaults
        miniCanvas.width = miniCanvas.clientWidth || 80;
        miniCanvas.height = miniCanvas.clientHeight || 50;
        console.log(`Mini canvas resized to ${miniCanvas.width}x${miniCanvas.height}`);
        // Redraw immediately after resize
        drawCandlestick(lastCandleData);
    }

    function generateNextCandleData(previousCandle) {
        const randFactor = (max, min = 0) => Math.random() * (max - min) + min;
        const prevClose = previousCandle.close;

        let open = prevClose + randFactor(2, -2); // Open near previous close
        let close = open + randFactor(candleConfig.volatility, -candleConfig.volatility);

        // Clamp open/close
        open = Math.max(candleConfig.priceMin, Math.min(candleConfig.priceMax, open));
        close = Math.max(candleConfig.priceMin, Math.min(candleConfig.priceMax, close));

        let high = Math.max(open, close) + randFactor(candleConfig.wickVolatility);
        let low = Math.min(open, close) - randFactor(candleConfig.wickVolatility);

        // Clamp high/low
        high = Math.min(candleConfig.priceMax + candleConfig.wickVolatility, high); // Allow wick slightly outside main range
        low = Math.max(candleConfig.priceMin - candleConfig.wickVolatility, low);

        return { open, high, low, close };
    }

    // Function to map price value to Y coordinate on canvas
    function mapY(value, canvasHeight) {
        const range = candleConfig.priceMax - candleConfig.priceMin;
        if (range <= 0) return canvasHeight / 2; // Avoid division by zero
        // Scale value within the range to canvas height (inverted Y)
        const scaledValue = ((value - candleConfig.priceMin) / range);
        return canvasHeight - (scaledValue * canvasHeight); // Y=0 is top
    }

    // Function to draw a single candlestick
    function drawCandlestick(data) {
        if (!miniCtx || !miniCanvas) return;

        const { open, high, low, close } = data;
        const width = miniCanvas.width;
        const height = miniCanvas.height;
        const bodyWidth = candleConfig.bodyWidth;
        const centerX = width / 2;

        // Clear canvas
        miniCtx.clearRect(0, 0, width, height);

        // Map prices to Y coordinates
        const openY = mapY(open, height);
        const highY = mapY(high, height);
        const lowY = mapY(low, height);
        const closeY = mapY(close, height);

        const isUp = close >= open;
        const color = isUp ? candleConfig.neonPurple : candleConfig.neonRed;

        // Set styles
        miniCtx.strokeStyle = color;
        miniCtx.fillStyle = color;
        miniCtx.lineWidth = 1; // Thin wick
        miniCtx.shadowColor = color;
        miniCtx.shadowBlur = candleConfig.glowBlur;

        // Draw Wick (High to Low line)
        miniCtx.beginPath();
        miniCtx.moveTo(centerX, highY);
        miniCtx.lineTo(centerX, lowY);
        miniCtx.stroke();

        // Draw Body (Rectangle)
        miniCtx.beginPath();
        const bodyHeight = Math.abs(openY - closeY);
        const bodyY = Math.min(openY, closeY);
        miniCtx.rect(centerX - bodyWidth / 2, bodyY, bodyWidth, bodyHeight <= 0 ? 1 : bodyHeight); // Ensure min 1px height
        miniCtx.fill();

         // Reset shadow for next draw cycle if needed elsewhere
         miniCtx.shadowColor = 'transparent';
         miniCtx.shadowBlur = 0;

        // console.log("Drew candle:", data, color); // Debug log
    }

    // Function to update and redraw the candle
    function simulateAndUpdateCandle() {
        lastCandleData = generateNextCandleData(lastCandleData);
        drawCandlestick(lastCandleData);
    }

    // Start the simulation loop
    function startCandleAnimation() {
        console.log("Starting candlestick simulation...");
        if (candleInterval) clearInterval(candleInterval);

        // Initial draw
         if (miniCtx && miniCanvas) {
             resizeMiniCanvas(); // Set initial size
             drawCandlestick(lastCandleData); // Draw initial state
             candleInterval = setInterval(simulateAndUpdateCandle, candleConfig.updateInterval);
             console.log("Candlestick interval started.");
         } else {
             console.error("Cannot start candle animation - canvas or context missing.");
         }
         // Add resize listener
         window.addEventListener('resize', resizeMiniCanvas);
    }
    // --- Mini Candlestick Logic END ---


    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        console.log("Entry screen clicked!");
        entryScreen.classList.add('hidden'); setTimeout(() => {
            entryScreen.style.display = 'none'; mainContent.classList.add('visible');
            if (volumeContainer) { volumeContainer.classList.add('visible'); }
            backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); });
            updateVolumeUI();
            if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); }
            startCandleAnimation(); // <<< Start Candlestick Simulation
        }, 500);
    }, { once: true });


    // --- Cursor Tracking, Popup Tilt, Falling Trail ---
    document.addEventListener('mousemove', (e) => { if (customCursor) { customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`; } if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); } const now = Date.now(); if (now - lastTrailTime > trailInterval) { createFallingTrailChar(e.clientX, e.clientY); lastTrailTime = now; } });
    function createFallingTrailChar(x, y) { const trailEl = document.createElement('div'); trailEl.classList.add('trail-cursor-char'); trailEl.textContent = '𖹭'; trailEl.style.left = `${x}px`; trailEl.style.top = `${y}px`; document.body.appendChild(trailEl); setTimeout(() => { trailEl.remove(); }, 1000); }
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
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; // Added check for canvas const miniChart = document.getElementById('mini-chart-canvas'); const isClickInsideMiniChart = miniChart ? miniChart.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume && !isClickInsideMiniChart) { closeAllPopups(); } });

}); // End of DOMContentLoaded listener
