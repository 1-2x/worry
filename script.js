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
    // Chart config (adjust as needed)
    const chartConfig = {
        candlesToShow: 30, // More candles for smoother look
        updateInterval: 300, // Faster update (adjust with loopDuration ~9s)
        priceMin: 40,
        priceMax: 100,
        neonViolet: '#ee82ee',
        neonPurple: '#9d00ff',
        chartBackgroundColor: 'rgba(0, 0, 0, 0)', // Transparent chart bg
        textColor: 'rgba(200, 200, 200, 0.1)' // Very faint text if axis were visible
    };

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
    entryScreen.addEventListener('click', () => { entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); } initializeStockCharts(); startStockChartAnimation(); }, 500); }, { once: true });

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
    // Function definitions must come before they are called
    function generateRandomCandleData(previousClose) {
        const randFactor = (max, min = 0) => Math.random() * (max - min) + min;
        const open = previousClose + randFactor(5, -5);
        const close = open + randFactor(15, -15);
        const high = Math.max(open, close) + randFactor(5);
        const low = Math.min(open, close) - randFactor(5);
        const time = Math.floor(Date.now() / 1000); // Use current time (needs adjustment for sequence)
        return { time, open: Math.max(1, open), high: Math.max(1, high), low: Math.max(1, low), close: Math.max(1, close) }; // Ensure positive values
    }

    function initializeChart(container, dataArrayRef) {
        if (!container || !LightweightCharts) { console.error("Chart container or library not found"); return null; }

        // Ensure container has dimensions for the chart library
         if (container.clientHeight === 0 || container.clientWidth === 0) {
            console.warn("Chart container has no dimensions yet.", container.id);
             // You might need to explicitly set width/height via CSS or wait
         }

        const chartOptions = {
            width: container.clientWidth || 200, // Use container size or default
            height: container.clientHeight || 120,
            layout: { background: { color: chartConfig.chartBackgroundColor }, textColor: chartConfig.textColor, },
            grid: { vertLines: { visible: false }, horzLines: { visible: false }, },
            crosshair: { mode: LightweightCharts.CrosshairMode.Hidden },
            timeScale: { visible: false, fixLeftEdge: true, fixRightEdge: true, lockVisibleTimeRangeOnResize: true },
            priceScale: { visible: false },
            handleScroll: false, handleScale: false,
        };
        const chart = LightweightCharts.createChart(container, chartOptions);

        const candleSeries = chart.addCandlestickSeries({
            upColor: chartConfig.neonViolet, downColor: chartConfig.neonPurple,
            borderVisible: false,
            wickUpColor: chartConfig.neonViolet, wickDownColor: chartConfig.neonPurple,
        });

        // Generate initial smoothed historical data
        let lastClose = chartConfig.priceMin + Math.random() * (chartConfig.priceMax - chartConfig.priceMin);
        let currentTime = Math.floor(Date.now() / 1000) - (chartConfig.candlesToShow * 3600); // Start in the past
        dataArrayRef.length = 0; // Clear existing data reference
        for (let i = 0; i < chartConfig.candlesToShow; i++) {
            const candle = generateRandomCandleData(lastClose);
            candle.time = currentTime;
            dataArrayRef.push(candle);
            lastClose = candle.close;
            currentTime += 3600; // Increment time for next candle
        }
        candleSeries.setData(dataArrayRef);
        // chart.timeScale().fitContent(); // Fit initial data - might not be needed if fixed edges

        console.log(`Chart initialized for ${container.id}`);
        return { chart, candleSeries };
    }

    function updateChart(chartInfo, dataArray) {
        if (!chartInfo || !chartInfo.candleSeries || dataArray.length === 0) return;

        const lastCandle = dataArray[dataArray.length - 1];
        const nextCandle = generateRandomCandleData(lastCandle.close);
        nextCandle.time = lastCandle.time + 3600; // Ensure time moves forward

        // Add new candle data using update (more efficient than setData)
        chartInfo.candleSeries.update(nextCandle);
        dataArray.push(nextCandle); // Keep our array in sync

        // Remove oldest data point to maintain candle count
        if (dataArray.length > chartConfig.candlesToShow + 5) { // Keep a small buffer
             dataArray.shift();
             // setData might be needed if library doesn't auto-scroll/prune old data well with fixed edges
             // For now, assume update handles the visible range correctly
        }

        // Optional: Scroll to the newest candle if library doesn't do it automatically
         chartInfo.chart.timeScale().scrollToPosition(-5, false); // Scroll slightly past the last bar
    }

    function startStockChartAnimation() {
        // Stop existing intervals if re-initializing
        if(stockIntervalLeft) clearInterval(stockIntervalLeft);
        if(stockIntervalRight) clearInterval(stockIntervalRight);
        currentDataLeft = []; // Reset data
        currentDataRight = [];

        // Initialize Left Chart
        const initLeft = initializeChart(chartContainerLeft, currentDataLeft);
        if (initLeft) {
            chartLeft = initLeft.chart;
            candleSeriesLeft = initLeft.candleSeries;
            // Start update loop
            stockIntervalLeft = setInterval(() => updateChart(initLeft, currentDataLeft), chartConfig.updateInterval);
        }

        // Initialize Right Chart (with slight delay for visual difference)
         const initRight = initializeChart(chartContainerRight, currentDataRight);
         if (initRight) {
             chartRight = initRight.chart;
             candleSeriesRight = initRight.candleSeries;
             setTimeout(() => {
                 stockIntervalRight = setInterval(() => updateChart(initRight, currentDataRight), chartConfig.updateInterval + 50); // Slightly different interval
             }, 500); // Delay start
         }

         // Handle resize - crucial for charts
         window.addEventListener('resize', () => {
             if(chartLeft && chartContainerLeft) chartLeft.resize(chartContainerLeft.clientWidth, chartContainerLeft.clientHeight);
             if(chartRight && chartContainerRight) chartRight.resize(chartContainerRight.clientWidth, chartContainerRight.clientHeight);
         });
          console.log("Stock chart animations started.");
    }
    // --- Stock Chart Logic END ---

});
