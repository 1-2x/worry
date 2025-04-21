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

    // --- Scrolling Chart Elements & State ---
    const chartCanvas = document.getElementById('scrolling-chart-canvas'); // Get the single canvas
    const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;
    console.log("Scrolling Chart Canvas Selected:", chartCanvas);

    let chartInterval = null;
    let chartData = [];
    const chartConfig = {
        pointsToShow: 70, // Number of points visible across canvas width (adjust for new width 350px)
        updateInterval: 250, // Slower update interval (e.g., 70 * 250ms = 17.5s cycle)
        yMin: 10, yMax: 90,
        volatility: 10, // Keep volatility reasonable
        wickVolatility: 15, // Increased wick volatility for longer lines
        candleBodyWidthRatio: 0.3, // Smaller body width relative to step
        wickWidth: 1.5,
        upColor: '#9d00ff', // Neon Purple UP
        downColor: '#ff0033', // Neon Red DOWN
        glowBlur: 5,
    };
    let lastClose = (chartConfig.yMin + chartConfig.yMax) / 2;


    // --- Global State ---
    let visiblePopupForTilt = null; let lastTrailTime = 0; const trailInterval = 50;

    // --- Initial Setup ---
    if (customCursor) { customCursor.textContent = '𖹭'; }
    if (visitCountSpan) { let count = localStorage.getItem('pageVisits_worrySite') || 0; visitCountSpan.textContent = ++count; localStorage.setItem('pageVisits_worrySite', count); }
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .']; let titleIndex = 0; setInterval(() => { document.title = titles[titleIndex]; titleIndex = (titleIndex + 1) % titles.length; }, 600);

    // --- Location Typing Effect ---
    const locationString = "London, UK"; const typeSpeed = 180; const deleteSpeed = 120; const pauseDuration = 2500; let locationCharIndex = 0; let locationIsDeleting = false; let locationLoopTimeout;
    function typeDeleteLoop() { clearTimeout(locationLoopTimeout); const cursor = typingCursorElement; if (!locationTextElement || !cursor) return; if (!locationIsDeleting) { if (locationCharIndex < locationString.length) { const letterSpan = document.createElement('span'); letterSpan.textContent = locationString.charAt(locationCharIndex); locationTextElement.insertBefore(letterSpan, cursor); locationCharIndex++; locationLoopTimeout = setTimeout(typeDeleteLoop, typeSpeed); } else { locationIsDeleting = true; if (cursor) cursor.style.animationPlayState = 'paused'; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration); } } else { const letterSpans = locationTextElement.querySelectorAll('span:not(#typing-cursor)'); if (letterSpans.length > 0) { if (cursor) cursor.style.animationPlayState = 'running'; locationTextElement.removeChild(letterSpans[letterSpans.length - 1]); locationLoopTimeout = setTimeout(typeDeleteLoop, deleteSpeed); } else { locationIsDeleting = false; locationCharIndex = 0; locationLoopTimeout = setTimeout(typeDeleteLoop, pauseDuration / 2); } } }


    // --- Scrolling Chart Simulation Logic START ---
    function resizeChartCanvas() { // Renamed
        if (!chartCanvas) return;
        chartCanvas.width = chartCanvas.clientWidth || 350; // Match CSS width
        chartCanvas.height = chartCanvas.clientHeight || 80; // Match CSS height
        console.log(`Scrolling chart canvas resized to ${chartCanvas.width}x${chartCanvas.height}`);
        drawScrollingChart(); // Redraw after resize
    }

    function generateCandleDataSingle(previousClose) { // Renamed
        const randFactor = (max, min = 0) => Math.random() * (max - min) + min;
        let open = previousClose + randFactor(2, -2);
        let close = open + randFactor(chartConfig.volatility, -chartConfig.volatility);
        open = Math.max(chartConfig.yMin, Math.min(chartConfig.yMax, open));
        close = Math.max(chartConfig.yMin, Math.min(chartConfig.yMax, close));
        // Increase wick randomness
        let high = Math.max(open, close) + randFactor(chartConfig.wickVolatility);
        let low = Math.min(open, close) - randFactor(chartConfig.wickVolatility);
        // Adjust clamping for longer wicks possible
        high = Math.min(chartConfig.yMax + chartConfig.wickVolatility, high);
        low = Math.max(chartConfig.yMin - chartConfig.wickVolatility, low);
        return { open, high, low, close };
    }

    function mapYChart(value, canvasHeight) { // Renamed
        const range = chartConfig.yMax - chartConfig.yMin; if (range <= 0) return canvasHeight / 2;
        const scaledValue = ((value - chartConfig.yMin) / range); return canvasHeight - (scaledValue * canvasHeight);
    }

    function drawScrollingChart() { // Renamed
        if (!chartCtx || !chartCanvas || chartData.length === 0) return;
        chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        const stepX = chartCanvas.width / chartConfig.pointsToShow;
        const bodyWidth = Math.max(1, stepX * chartConfig.candleBodyWidthRatio);

        for (let i = 0; i < chartData.length; i++) {
            const data = chartData[i];
            const xPos = (i * stepX) + (stepX / 2);
            const openY = mapYChart(data.open, chartCanvas.height);
            const highY = mapYChart(data.high, chartCanvas.height);
            const lowY = mapYChart(data.low, chartCanvas.height);
            const closeY = mapYChart(data.close, chartCanvas.height);
            const isUp = data.close >= data.open;
            const color = isUp ? chartConfig.upColor : chartConfig.downColor;

            chartCtx.strokeStyle = color; chartCtx.fillStyle = color;
            chartCtx.shadowColor = color; chartCtx.shadowBlur = chartConfig.glowBlur;
            chartCtx.lineWidth = chartConfig.wickWidth;
            // Draw Wick
            chartCtx.beginPath(); chartCtx.moveTo(xPos, highY); chartCtx.lineTo(xPos, lowY); chartCtx.stroke();
            // Draw Body
            chartCtx.beginPath(); const bodyHeight = Math.max(1, Math.abs(openY - closeY)); const bodyY = Math.min(openY, closeY);
            chartCtx.rect(xPos - bodyWidth / 2, bodyY, bodyWidth, bodyHeight); chartCtx.fill();
        }
        chartCtx.shadowColor = 'transparent'; chartCtx.shadowBlur = 0;
    }

    function updateAndDrawScrollingChart() { // Renamed
        if (!chartCtx || !chartCanvas) return;
        const newCandleData = generateCandleDataSingle(lastClose);
        lastClose = newCandleData.close;
        chartData.push(newCandleData);
        while (chartData.length > chartConfig.pointsToShow) { chartData.shift(); }
        drawScrollingChart();
    }

    function startScrollingChartAnimation() { // Renamed
        console.log("Starting scrolling chart simulation...");
        if (chartInterval) clearInterval(chartInterval);
        chartData = []; // Reset data array
        let initialClose = (chartConfig.yMin + chartConfig.yMax) / 2;
        for(let i=0; i<chartConfig.pointsToShow; i++){ const candle = generateCandleDataSingle(initialClose); chartData.push(candle); initialClose = candle.close; }
        lastClose = chartData[chartData.length - 1]?.close || initialClose;

        if (chartCtx && chartCanvas) {
            resizeChartCanvas(); // Initial size set & draw
            // Use slower interval
            chartInterval = setInterval(updateAndDrawScrollingChart, chartConfig.updateInterval);
            console.log("Scrolling chart interval started.");
        } else { console.error("Cannot start chart animation - canvas or context missing."); }
        window.addEventListener('resize', resizeChartCanvas);
    }
    // --- Scrolling Chart Simulation Logic END ---


    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        console.log("Entry screen clicked!");
        entryScreen.classList.add('hidden'); setTimeout(() => { entryScreen.style.display = 'none'; mainContent.classList.add('visible'); if (volumeContainer) { volumeContainer.classList.add('visible'); } backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); }); updateVolumeUI(); if (locationTextElement && typingCursorElement) { setTimeout(typeDeleteLoop, 800); }
        startScrollingChartAnimation(); // Start Single Scrolling Chart
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
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; const scrollingChart = document.getElementById('scrolling-chart-canvas'); const isClickInsideChart = scrollingChart ? scrollingChart.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume && !isClickInsideChart) { closeAllPopups(); } });

}); // End of DOMContentLoaded listener
