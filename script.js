document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Checking for LightweightCharts library...");
    if (typeof LightweightCharts === 'undefined') {
        console.error("CRITICAL: LightweightCharts object is UNDEFINED on DOMContentLoaded!");
    } else {
        console.log("LightweightCharts object found:", LightweightCharts);
    }

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
    console.log("Chart Containers Selected:", chartContainerLeft, chartContainerRight);

    let chartLeft = null; let candleSeriesLeft = null; let chartRight = null; let candleSeriesRight = null;
    let stockIntervalLeft = null; let stockIntervalRight = null;
    let currentDataLeft = []; let currentDataRight = [];
    const chartConfig = { candlesToShow: 30, updateInterval: 300, priceMin: 40, priceMax: 100, neonViolet: '#ee82ee', neonPurple: '#9d00ff', chartBackgroundColor: 'rgba(0, 0, 0, 0)', textColor: 'rgba(200, 200, 200, 0.1)' };

    // --- Global State ---
    let visiblePopupForTilt = null; let lastTrailTime = 0; const trailInterval = 50;

    // --- Initial Setup ---
    if (customCursor) { customCursor.textContent = '𖹭'; }
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }

    // --- Stock Chart Logic START ---
    // Moved function definitions BEFORE they are called
    function generateRandomCandleData(previousClose) { const randFactor = (max, min = 0) => Math.random() * (max - min) + min; const validPrevClose = (typeof previousClose === 'number' && !isNaN(previousClose)) ? previousClose : (chartConfig.priceMin + chartConfig.priceMax) / 2; let open = validPrevClose + randFactor(2, -2); let close = open + randFactor(8, -8); open = Math.max(chartConfig.priceMin * 0.8, Math.min(chartConfig.priceMax * 1.2, open)); close = Math.max(chartConfig.priceMin * 0.8, Math.min(chartConfig.priceMax * 1.2, close)); const high = Math.max(open, close) + randFactor(3); const low = Math.min(open, close) - randFactor(3); const time = Math.floor(Date.now() / 1000); return { time, open, high, low, close }; }

    function initializeChart(container, dataArrayRef) {
        if (typeof LightweightCharts === 'undefined' || !container) { console.error("ERROR: LightweightCharts library or container not ready!", container?.id); return null; }
        const containerWidth = container.clientWidth; const containerHeight = container.clientHeight;
        console.log(`Container ${container.id} dimensions: ${containerWidth}x${containerHeight}`);
        if (containerWidth === 0 || containerHeight === 0) { console.warn(`Container ${container.id} has zero dimensions. Chart may not initialize correctly.`); }
        container.innerHTML = '';
        console.log(`Attempting to create chart in: ${container.id}`);
        const chartOptions = { width: containerWidth || 220, height: containerHeight || 140, layout: { background: { color: chartConfig.chartBackgroundColor }, textColor: chartConfig.textColor, }, grid: { vertLines: { visible: false }, horzLines: { visible: false }, }, crosshair: { mode: LightweightCharts.CrosshairMode.Hidden }, timeScale: { visible: false, fixLeftEdge: true, fixRightEdge: true, lockVisibleTimeRangeOnResize: true, borderVisible: false }, priceScale: { visible: false, borderVisible: false }, handleScroll: false, handleScale: false, };
        try {
            const chart = LightweightCharts.createChart(container, chartOptions);
            console.log(`Chart object created for ${container.id}:`); console.dir(chart); // Log the object itself
            if (!chart || typeof chart.addCandlestickSeries !== 'function') { console.error("CRITICAL ERROR: chart.addCandlestickSeries is NOT a function!", chart); return null; } // Check added previously
            const candleSeries = chart.addCandlestickSeries({ upColor: chartConfig.neonViolet, downColor: chartConfig.neonPurple, borderVisible: false, wickUpColor: chartConfig.neonViolet, wickDownColor: chartConfig.neonPurple, });
            let lastClose = chartConfig.priceMin + Math.random() * (chartConfig.priceMax - chartConfig.priceMin); let currentTime = Math.floor(Date.now() / 1000) - (chartConfig.candlesToShow * 300); dataArrayRef.length = 0;
            for (let i = 0; i < chartConfig.candlesToShow; i++) { const candle = generateRandomCandleData(lastClose); candle.time = currentTime; dataArrayRef.push(candle); lastClose = candle.close; currentTime += 300; }
            candleSeries.setData(dataArrayRef);
            console.log(`Chart initialized successfully for ${container.id}`);
            return { chart, candleSeries };
        } catch (error) { console.error(`Error during chart initialization for ${container.id}:`, error); return null; }
    }

    function updateChart(chartInfo, dataArray) { if (!chartInfo || !chartInfo.candleSeries || dataArray.length === 0) return; const lastCandle = dataArray[dataArray.length - 1]; const nextCandle = generateRandomCandleData(lastCandle.close); nextCandle.time = lastCandle.time + 300; try { chartInfo.candleSeries.update(nextCandle); dataArray.push(nextCandle); if (dataArray.length > chartConfig.candlesToShow * 2) { dataArray.shift(); } chartInfo.chart.timeScale().scrollToPosition(-1, false); } catch(error) { console.error("Error updating chart:", error); } }

    function startStockChartAnimation() {
        console.log("Attempting to start stock chart animations...");
        if (stockIntervalLeft) clearInterval(stockIntervalLeft); if (stockIntervalRight) clearInterval(stockIntervalRight); currentDataLeft = []; currentDataRight = [];
        const initLeft = initializeChart(chartContainerLeft, currentDataLeft); if (initLeft) { chartLeft = initLeft.chart; candleSeriesLeft = initLeft.candleSeries; stockIntervalLeft = setInterval(() => updateChart(initLeft, currentDataLeft), chartConfig.updateInterval); } else { console.error("Failed to initialize left chart."); }
        const initRight = initializeChart(chartContainerRight, currentDataRight); if (initRight) { chartRight = initRight.chart; candleSeriesRight = initRight.candleSeries; setTimeout(() => { stockIntervalRight = setInterval(() => updateChart(initRight, currentDataRight), chartConfig.updateInterval + 30); }, 500); } else { console.error("Failed to initialize right chart."); }
        window.addEventListener('resize', () => { if(chartLeft && chartContainerLeft) chartLeft.resize(chartContainerLeft.clientWidth, chartContainerLeft.clientHeight); if(chartRight && chartContainerRight) chartRight.resize(chartContainerRight.clientWidth, chartContainerRight.clientHeight); });
        console.log("Stock chart animation setup complete (check console for errors).");
    }
    // --- Stock Chart Logic END ---


    // --- Entry Screen Logic ---
    // Calls startStockChartAnimation which is now defined above
    entryScreen.addEventListener('click', () => {
        console.log("Entry screen clicked!");
        entryScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.style.display = 'none';
            mainContent.classList.add('visible');
            if (volumeContainer) { volumeContainer.classList.add('visible'); }
            backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); });
            updateVolumeUI();
            if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); }
            console.log("Queueing stock chart initialization...");
            setTimeout(() => { startStockChartAnimation(); }, 200); // Delay initialization slightly
        }, 500);
    }, { once: true });


    // --- Cursor Tracking, Popup Tilt, Falling Trail ---
    document.addEventListener('mousemove', (e) => { if (customCursor) { customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`; } if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); } const now = Date.now(); if (now - lastTrailTime > trailInterval) { createFallingTrailChar(e.clientX, e.clientY); lastTrailTime = now; } });
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

}); // <<< Ensure this final brace closes the DOMContentLoaded listener
