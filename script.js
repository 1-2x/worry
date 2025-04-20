document.addEventListener('DOMContentLoaded', () => {
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

    // --- Stock Chart Elements & State ---
    const chartContainerLeft = document.getElementById('chart-container-left');
    const chartContainerRight = document.getElementById('chart-container-right');
    let chartLeft = null;
    let candleSeriesLeft = null;
    let chartRight = null;
    let candleSeriesRight = null;
    let stockIntervalLeft = null;
    let stockIntervalRight = null;
    let currentDataLeft = [];
    let currentDataRight = [];
    const chartCandles = 25; // Number of candles visible

    // --- Global State ---
    let visiblePopupForTilt = null;
    let lastTrailTime = 0;
    const trailInterval = 50; // Trail throttle

    // --- Initial Setup ---
    if (customCursor) { customCursor.textContent = '𖹭'; }
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => { entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); } initializeStockCharts(); /* <<< Initialize Charts */ startStockChartAnimation(); /* <<< Start Chart Updates */ }, 500); }, { once: true });

    // --- Cursor Tracking, Popup Tilt, Falling Trail ---
    document.addEventListener('mousemove', (e) => {
        if (customCursor) { customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`; }
        if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); }
        const now = Date.now(); if (now - lastTrailTime > trailInterval) { createFallingTrailChar(e.clientX, e.clientY); lastTrailTime = now; }
    });
    function createFallingTrailChar(x, y) { const trailEl = document.createElement('div'); trailEl.classList.add('trail-cursor-char'); trailEl.textContent = '𖹭'; trailEl.style.left = `${x}px`; trailEl.style.top = `${y}px`; document.body.appendChild(trailEl); setTimeout(() => { trailEl.remove(); }, 1200); }
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
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); } });

    // --- Right-Click Disable ---
    document.addEventListener('contextmenu', event => event.preventDefault());

    // --- Stock Chart Logic START ---
    const neonPurple = '#9d00ff';
    const neonViolet = '#ee82ee';

    function generateRandomCandle(previousClose) {
        const open = previousClose + (Math.random() - 0.5) * 5; // Start near previous close
        const close = open + (Math.random() - 0.5) * 15; // Wider range for close
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        // Simple time increment - using seconds since epoch for Lightweight Charts
        const time = Math.floor(Date.now() / 1000);
        return { time, open, high, low, close };
    }

    function initializeChart(container, dataArrayRef) {
        if (!container || !LightweightCharts) return null; // Check if library loaded

        const chart = LightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight,
            layout: {
                background: { color: 'rgba(0, 0, 0, 0)' }, // Transparent background
                textColor: 'rgba(255, 255, 255, 0.7)', // Light text if needed
            },
            grid: { // Hide grid lines
                vertLines: { color: 'rgba(0, 0, 0, 0)' },
                horzLines: { color: 'rgba(0, 0, 0, 0)' },
            },
            crosshair: { mode: LightweightCharts.CrosshairMode.Hidden }, // Hide crosshair
            timeScale: { visible: false }, // Hide time axis
            priceScale: { visible: false }, // Hide price axis
            handleScroll: false, // Disable user scroll/zoom
            handleScale: false,
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: neonViolet, // Violet for up candles
            downColor: neonPurple, // Purple for down candles
            borderVisible: false,
            wickUpColor: neonViolet,
            wickDownColor: neonPurple,
            // Note: Direct neon glow is hard. Rely on CSS filter on container.
        });

        // Generate initial data
        let lastClose = 50 + Math.random() * 20;
        for (let i = 0; i < chartCandles; i++) {
            const candle = generateRandomCandle(lastClose);
            candle.time -= (chartCandles - 1 - i) * 3600; // Simulate past data points (1 hour apart)
            dataArrayRef.push(candle);
            lastClose = candle.close;
        }
        candleSeries.setData(dataArrayRef);
        chart.timeScale().fitContent(); // Fit initial data

        return { chart, candleSeries };
    }

    function updateChart(candleSeries, dataArray) {
        if (!candleSeries || dataArray.length === 0) return;

        const lastCandle = dataArray[dataArray.length - 1];
        const nextCandle = generateRandomCandle(lastCandle.close);
         // Ensure time progresses
         nextCandle.time = lastCandle.time + 3600; // Add an hour (or adjust for desired speed)

        dataArray.push(nextCandle);
        candleSeries.update(nextCandle); // Update with the new candle

        // Optional: remove oldest candle if array grows too large (library might handle visible range)
         if (dataArray.length > chartCandles + 50) { // Keep some buffer
             dataArray.shift();
             // Regenerate full data? Or library handles scroll? Let library handle for now.
             // candleSeries.setData(dataArray); // Might cause flicker
         }
    }

    function startStockChartAnimation() {
        // Initialize Left Chart
        const initLeft = initializeChart(chartContainerLeft, currentDataLeft);
        if (initLeft) {
            chartLeft = initLeft.chart;
            candleSeriesLeft = initLeft.candleSeries;
            stockIntervalLeft = setInterval(() => updateChart(candleSeriesLeft, currentDataLeft), 9000 / chartCandles); // ~9 sec loop / num candles
        }

        // Initialize Right Chart (with slight delay to appear different)
         const initRight = initializeChart(chartContainerRight, currentDataRight);
         if (initRight) {
             chartRight = initRight.chart;
             candleSeriesRight = initRight.candleSeries;
             setTimeout(() => {
                 stockIntervalRight = setInterval(() => updateChart(candleSeriesRight, currentDataRight), 9500 / chartCandles); // Slightly different timing
             }, 500); // Delay start
         }

         // Handle resize
         window.addEventListener('resize', () => {
             if(chartLeft) chartLeft.resize(chartContainerLeft.clientWidth, chartContainerLeft.clientHeight);
             if(chartRight) chartRight.resize(chartContainerRight.clientWidth, chartContainerRight.clientHeight);
         });
    }
    // --- Stock Chart Logic END ---

});
