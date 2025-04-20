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
    const chartConfig = {
        candlesToShow: 30, updateInterval: 300, // Approx 9 second visual loop (30 * 300ms)
        priceMin: 40, priceMax: 100,
        neonViolet: '#ee82ee', neonPurple: '#9d00ff',
        chartBackgroundColor: 'rgba(0, 0, 0, 0)', textColor: 'rgba(200, 200, 200, 0.1)'
    };

    // --- Global State ---
    let visiblePopupForTilt = null;
    let lastTrailTime = 0;
    const trailInterval = 50;

    // --- Initial Setup ---
    if (customCursor) { customCursor.textContent = '𖹭'; }
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Stock Chart Logic START ---
    // MOVED Function definitions BEFORE they are called in Entry Screen Logic

    function generateRandomCandleData(previousClose) {
        const randFactor = (max, min = 0) => Math.random() * (max - min) + min;
        // Ensure previousClose is a number, default to mid-range if not
        const validPrevClose = (typeof previousClose === 'number' && !isNaN(previousClose)) ? previousClose : (chartConfig.priceMin + chartConfig.priceMax) / 2;

        let open = validPrevClose + randFactor(2, -2); // Smaller change from previous close
        let close = open + randFactor(8, -8); // Volatility

        // Clamp open/close within reasonable bounds
        open = Math.max(chartConfig.priceMin * 0.8, Math.min(chartConfig.priceMax * 1.2, open));
        close = Math.max(chartConfig.priceMin * 0.8, Math.min(chartConfig.priceMax * 1.2, close));

        const high = Math.max(open, close) + randFactor(3); // Wick slightly above body
        const low = Math.min(open, close) - randFactor(3);  // Wick slightly below body
        const time = Math.floor(Date.now() / 1000);
        return { time, open, high, low, close };
    }

    function initializeChart(container, dataArrayRef) {
        if (!container || typeof LightweightCharts === 'undefined') {
             console.error("Chart container or LightweightCharts library not found for: ", container?.id);
             return null;
        }
        // Clear previous chart if any
        container.innerHTML = '';

        const chartOptions = {
            width: container.clientWidth || 220, height: container.clientHeight || 140,
            layout: { background: { color: chartConfig.chartBackgroundColor }, textColor: chartConfig.textColor, },
            grid: { vertLines: { visible: false }, horzLines: { visible: false }, },
            crosshair: { mode: LightweightCharts.CrosshairMode.Hidden },
            timeScale: { visible: false, fixLeftEdge: true, fixRightEdge: true, lockVisibleTimeRangeOnResize: true, borderVisible: false },
            priceScale: { visible: false, borderVisible: false },
            handleScroll: false, handleScale: false,
        };
        const chart = LightweightCharts.createChart(container, chartOptions);

        const candleSeries = chart.addCandlestickSeries({
            upColor: chartConfig.neonViolet, downColor: chartConfig.neonPurple,
            borderVisible: false, wickUpColor: chartConfig.neonViolet, wickDownColor: chartConfig.neonPurple,
        });

        // Generate initial smoothed historical data
        let lastClose = chartConfig.priceMin + Math.random() * (chartConfig.priceMax - chartConfig.priceMin);
        let currentTime = Math.floor(Date.now() / 1000) - (chartConfig.candlesToShow * 300); // Start in past (adjust time step if needed)
        dataArrayRef.length = 0;
        for (let i = 0; i < chartConfig.candlesToShow; i++) {
            const candle = generateRandomCandleData(lastClose);
            candle.time = currentTime;
            dataArrayRef.push(candle);
            lastClose = candle.close;
            currentTime += 300; // Increment time (5 min intervals?)
        }
        candleSeries.setData(dataArrayRef);
        //chart.timeScale().fitContent(); // May not be needed with fixed edges

        console.log(`Chart initialized for ${container.id}`);
        return { chart, candleSeries };
    }

    function updateChart(chartInfo, dataArray) {
        if (!chartInfo || !chartInfo.candleSeries || dataArray.length === 0) return;

        const lastCandle = dataArray[dataArray.length - 1];
        const nextCandle = generateRandomCandleData(lastCandle.close);
        nextCandle.time = lastCandle.time + 300; // Ensure time moves forward consistently

        chartInfo.candleSeries.update(nextCandle);
        dataArray.push(nextCandle);

        // Keep array size manageable (optional, library might handle visual range)
         if (dataArray.length > chartConfig.candlesToShow * 2) {
             dataArray.shift();
         }
         // No need to scroll with fixed edges usually
         // chartInfo.chart.timeScale().scrollToPosition(-1, false);
    }

    function startStockChartAnimation() {
        if (stockIntervalLeft) clearInterval(stockIntervalLeft);
        if (stockIntervalRight) clearInterval(stockIntervalRight);
        currentDataLeft = []; currentDataRight = [];

        const initLeft = initializeChart(chartContainerLeft, currentDataLeft);
        if (initLeft) {
            chartLeft = initLeft.chart; candleSeriesLeft = initLeft.candleSeries;
            stockIntervalLeft = setInterval(() => updateChart(initLeft, currentDataLeft), chartConfig.updateInterval);
        }

         const initRight = initializeChart(chartContainerRight, currentDataRight);
         if (initRight) {
             chartRight = initRight.chart; candleSeriesRight = initRight.candleSeries;
             setTimeout(() => { // Start right slightly later
                 stockIntervalRight = setInterval(() => updateChart(initRight, currentDataRight), chartConfig.updateInterval + 30);
             }, 450);
         }

         window.addEventListener('resize', () => {
             if(chartLeft && chartContainerLeft) chartLeft.resize(chartContainerLeft.clientWidth, chartContainerLeft.clientHeight);
             if(chartRight && chartContainerRight) chartRight.resize(chartContainerRight.clientWidth, chartContainerRight.clientHeight);
         });
          console.log("Stock chart animations started.");
    }
    // --- Stock Chart Logic END ---


    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => { entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); } startStockChartAnimation(); /* <<< Start Charts HERE */ }, 500); }, { once: true });


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

    // --- Right-Click Disable ---
    document.addEventListener('contextmenu', event => event.preventDefault());

    // --- Close Popups when Clicking Outside Logic ---
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); } });

});
