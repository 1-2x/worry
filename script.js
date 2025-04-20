document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Checking for LightweightCharts library..."); // This check is no longer relevant as we removed the library
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

    // --- Graph Simulation Elements & State ---
    const canvasLeft = document.getElementById('graph-canvas-left');
    const ctxLeft = canvasLeft ? canvasLeft.getContext('2d') : null;
    const canvasRight = document.getElementById('graph-canvas-right');
    const ctxRight = canvasRight ? canvasRight.getContext('2d') : null;
    console.log("Canvas Contexts:", ctxLeft ? 'Found' : 'NULL', ctxRight ? 'Found' : 'NULL'); // Check contexts

    let graphIntervalLeft = null;
    let graphIntervalRight = null;
    let graphDataLeft = [];
    let graphDataRight = [];
    const graphConfig = {
        pointsToShow: 50, updateInterval: 150, yMin: 10, yMax: 90, volatility: 5,
        // Using temporary debug colors
        // neonViolet: '#ee82ee', neonPurple: '#9d00ff',
        debugColor: 'lime', // Bright color for debugging lines
        glowBlur: 5, lineWidth: 2,
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

    // --- Graph Simulation Logic START ---
    function resizeGraphCanvas(canvas) { if (!canvas) return; const container = canvas.parentElement; canvas.width = container.clientWidth; canvas.height = container.clientHeight; console.log(`Canvas ${canvas.id} resized to ${canvas.width}x${canvas.height}`); }
    function generateNextValue(previousValue) { let change = (Math.random() - 0.48) * graphConfig.volatility; let newValue = previousValue + change; newValue = Math.max(graphConfig.yMin, Math.min(graphConfig.yMax, newValue)); return newValue; }
    // function getGraphColor() { ... } // Using fixed debug color for now

    function drawGraph(ctx, canvas, dataPoints) {
        if (!ctx || !canvas || dataPoints.length < 1) { // Need at least 1 point now
             console.warn(`Skipping drawGraph for ${canvas.id} - Ctx: ${!!ctx}, Canvas: ${!!canvas}, Points: ${dataPoints.length}`);
             return;
        }
        console.log(`Drawing graph ${canvas.id} with ${dataPoints.length} points.`); // Debug: Check if drawing starts

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
        const stepX = canvas.width / Math.max(1, (graphConfig.pointsToShow - 1)); // Prevent division by zero
        const rangeY = graphConfig.yMax - graphConfig.yMin;
        if (rangeY <= 0) { console.error("Invalid Y range for graph"); return; } // Prevent division by zero

        ctx.beginPath();
        let x = 0;
        let y = canvas.height - ((dataPoints[0] - graphConfig.yMin) / rangeY) * canvas.height;
        ctx.moveTo(x, Math.max(0, Math.min(canvas.height, y))); // Clamp initial y

        for (let i = 1; i < dataPoints.length; i++) {
            x = i * stepX;
            y = canvas.height - ((dataPoints[i] - graphConfig.yMin) / rangeY) * canvas.height;
            y = Math.max(0, Math.min(canvas.height, y)); // Clamp y coordinates
            ctx.lineTo(x, y);
            // console.log(` -> Point ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)} (Value: ${dataPoints[i].toFixed(1)})`); // Debug: Log points (can be noisy)
        }

        // Style and draw the line (DEBUG COLORS)
        ctx.strokeStyle = graphConfig.debugColor; // LIME GREEN
        ctx.lineWidth = graphConfig.lineWidth;
        ctx.shadowColor = graphConfig.debugColor; // LIME GREEN GLOW
        ctx.shadowBlur = graphConfig.glowBlur;
        ctx.stroke();
        console.log(`Graph ${canvas.id} stroke drawn.`); // Debug: Confirm drawing happened

        // Reset shadow
         ctx.shadowColor = 'transparent';
         ctx.shadowBlur = 0;
    }

    function updateGraphAndDraw(ctx, canvas, dataArray) {
        if (!ctx || !canvas || !dataArray) return;
        const lastValue = dataArray.length > 0 ? dataArray[dataArray.length - 1] : (graphConfig.yMin + graphConfig.yMax) / 2;
        const nextValue = generateNextValue(lastValue);
        console.log(`Updating graph ${canvas.id}, new value: ${nextValue.toFixed(2)}`); // Debug: Check value generation

        dataArray.push(nextValue);
        while (dataArray.length > graphConfig.pointsToShow) { dataArray.shift(); }
        if (dataArray.length < 2) { dataArray.push(generateNextValue(nextValue)); }

        drawGraph(ctx, canvas, dataArray);
    }

    function startGraphAnimation() {
        console.log("Starting graph simulation setup...");
        if (graphIntervalLeft) clearInterval(graphIntervalLeft); if (graphIntervalRight) clearInterval(graphIntervalRight);
        graphDataLeft = [(graphConfig.yMin + graphConfig.yMax) / 2]; graphDataRight = [(graphConfig.yMin + graphConfig.yMax) / 2];

        if (ctxLeft && canvasLeft) {
             resizeGraphCanvas(canvasLeft); // Initial size set
             drawGraph(ctxLeft, canvasLeft, graphDataLeft); // Initial draw
             graphIntervalLeft = setInterval(() => updateGraphAndDraw(ctxLeft, canvasLeft, graphDataLeft), graphConfig.updateInterval);
             console.log("Left graph interval started.");
        } else { console.error("Failed to start left graph animation - context or canvas missing."); }

        if (ctxRight && canvasRight) {
            resizeGraphCanvas(canvasRight); // Initial size set
            drawGraph(ctxRight, canvasRight, graphDataRight); // Initial draw
            setTimeout(() => { graphIntervalRight = setInterval(() => updateGraphAndDraw(ctxRight, canvasRight, graphDataRight), graphConfig.updateInterval + 10); console.log("Right graph interval started."); }, 150);
        } else { console.error("Failed to start right graph animation - context or canvas missing."); }

        window.addEventListener('resize', () => { if(canvasLeft){ resizeGraphCanvas(canvasLeft); drawGraph(ctxLeft, canvasLeft, graphDataLeft); } if(canvasRight){ resizeGraphCanvas(canvasRight); drawGraph(ctxRight, canvasRight, graphDataRight); } });
        console.log("Graph animation setup complete.");
    }
    // --- Graph Simulation Logic END ---


    // --- Entry Screen Logic ---
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
            // Start graphs slightly after visible transition starts
            setTimeout(() => { startGraphAnimation(); }, 100); // Start slightly sooner maybe
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
    document.addEventListener('click', function(event) { let clickedInsideAnyPopup = false; allPopups.forEach(p => { if (p.contains(event.target)) { clickedInsideAnyPopup = true; } }); let clickedOnAnyTrigger = false; popupTriggers.forEach(t => { if (t.contains(event.target)) { clickedOnAnyTrigger = true; } }); const volumeControl = document.getElementById('volume-control-container'); const isClickInsideVolume = volumeControl ? volumeControl.contains(event.target) : false; if (!clickedInsideAnyPopup && !clickedOnAnyTrigger && !isClickInsideVolume) { closeAllPopups(); } });

}); // End of DOMContentLoaded listener
