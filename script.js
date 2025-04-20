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

    // --- Graph Simulation Elements & State ---
    const canvasLeft = document.getElementById('graph-canvas-left');
    const ctxLeft = canvasLeft ? canvasLeft.getContext('2d') : null;
    const canvasRight = document.getElementById('graph-canvas-right');
    const ctxRight = canvasRight ? canvasRight.getContext('2d') : null;
    let graphIntervalLeft = null;
    let graphIntervalRight = null;
    let graphDataLeft = [];
    let graphDataRight = [];
    const graphConfig = {
        pointsToShow: 50, // Number of points visible
        updateInterval: 150, // ms between new points (~7.5s cycle for 50 points)
        yMin: 10,
        yMax: 90,
        volatility: 5, // How much value can change each step
        neonViolet: '#ee82ee',
        neonPurple: '#9d00ff',
        glowBlur: 8,
        lineWidth: 2,
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

    // Resize canvas to fit container
    function resizeGraphCanvas(canvas) {
        if (!canvas) return;
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    // Generate the next value for the graph line
    function generateNextValue(previousValue) {
        let change = (Math.random() - 0.48) * graphConfig.volatility; // Slightly biased upwards?
        let newValue = previousValue + change;
        // Clamp value within min/max bounds
        newValue = Math.max(graphConfig.yMin, Math.min(graphConfig.yMax, newValue));
        return newValue;
    }

     // Calculate color based on time for smooth purple <-> violet transition
    function getGraphColor() {
        const hueSpeed = 0.0001; // Speed of color change
        const time = Date.now();
        // Oscillate between purple (270 deg) and violet (approx 300 deg in HSL, or use magenta 300)
        const purpleHue = 270;
        const violetHue = 300; // Magenta-ish violet
        const hueRange = violetHue - purpleHue;
        // Use sine wave for smooth oscillation between 0 and 1
        const oscillation = (Math.sin(time * hueSpeed * Math.PI * 2) + 1) / 2;
        const currentHue = purpleHue + oscillation * hueRange;
        return `hsl(${currentHue}, 100%, 65%)`; // Use HSL for easy hue animation, 65% lightness for neon feel
    }


    // Draw the line graph on the canvas
    function drawGraph(ctx, canvas, dataPoints) {
        if (!ctx || !canvas || dataPoints.length < 2) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

        const stepX = canvas.width / (graphConfig.pointsToShow - 1);
        const rangeY = graphConfig.yMax - graphConfig.yMin;
        const color = getGraphColor(); // Get current neon color

        ctx.beginPath();
        // Map first point to canvas coordinates
        let x = 0;
        let y = canvas.height - ((dataPoints[0] - graphConfig.yMin) / rangeY) * canvas.height;
        ctx.moveTo(x, y);

        // Draw lines to subsequent points
        for (let i = 1; i < dataPoints.length; i++) {
            x = i * stepX;
            y = canvas.height - ((dataPoints[i] - graphConfig.yMin) / rangeY) * canvas.height;
            ctx.lineTo(x, y);
        }

        // Style and draw the line
        ctx.strokeStyle = color;
        ctx.lineWidth = graphConfig.lineWidth;
        ctx.shadowColor = color;
        ctx.shadowBlur = graphConfig.glowBlur;
        ctx.stroke();

         // Optional: Reset shadow for other potential drawings
         ctx.shadowColor = 'transparent';
         ctx.shadowBlur = 0;
    }

    // Update data array and redraw
    function updateGraphAndDraw(ctx, canvas, dataArray) {
        if (!dataArray) return;
        const lastValue = dataArray.length > 0 ? dataArray[dataArray.length - 1] : (graphConfig.yMin + graphConfig.yMax) / 2;
        const nextValue = generateNextValue(lastValue);

        dataArray.push(nextValue);
        // Remove oldest point if array is too long
        while (dataArray.length > graphConfig.pointsToShow) {
            dataArray.shift();
        }
        // Ensure array has at least 2 points to draw a line
        if (dataArray.length < 2) {
             dataArray.push(generateNextValue(nextValue)); // Add another point if needed
        }

        drawGraph(ctx, canvas, dataArray);
    }

    // Initialize and start the animation loops
    function startGraphAnimation() {
        console.log("Starting graph simulation...");
        if (graphIntervalLeft) clearInterval(graphIntervalLeft);
        if (graphIntervalRight) clearInterval(graphIntervalRight);
        graphDataLeft = [(graphConfig.yMin + graphConfig.yMax) / 2]; // Start with a mid-value
        graphDataRight = [(graphConfig.yMin + graphConfig.yMax) / 2];

        // Initial resize and draw
        if (ctxLeft && canvasLeft) { resizeGraphCanvas(canvasLeft); drawGraph(ctxLeft, canvasLeft, graphDataLeft); }
        if (ctxRight && canvasRight) { resizeGraphCanvas(canvasRight); drawGraph(ctxRight, canvasRight, graphDataRight); }


        if (ctxLeft && canvasLeft) {
            graphIntervalLeft = setInterval(() => updateGraphAndDraw(ctxLeft, canvasLeft, graphDataLeft), graphConfig.updateInterval);
        }
        if (ctxRight && canvasRight) {
             // Slight delay for right side
            setTimeout(() => {
                 graphIntervalRight = setInterval(() => updateGraphAndDraw(ctxRight, canvasRight, graphDataRight), graphConfig.updateInterval + 10); // Slightly different interval
            }, 150);
        }

         // Handle resize
         window.addEventListener('resize', () => {
             if(canvasLeft){ resizeGraphCanvas(canvasLeft); drawGraph(ctxLeft, canvasLeft, graphDataLeft); } // Redraw on resize
             if(canvasRight){ resizeGraphCanvas(canvasRight); drawGraph(ctxRight, canvasRight, graphDataRight); }
         });
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
            startGraphAnimation(); // <<< Start Graph Simulation
        }, 500);
    }, { once: true });


    // --- Cursor Tracking, Popup Tilt, Falling Trail ---
    document.addEventListener('mousemove', (e) => { if (customCursor) { customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`; } if(visiblePopupForTilt) { tiltPopup(e, visiblePopupForTilt); } const now = Date.now(); if (now - lastTrailTime > trailInterval) { createFallingTrailChar(e.clientX, e.clientY); lastTrailTime = now; } });
    function createFallingTrailChar(x, y) { const trailEl = document.createElement('div'); trailEl.classList.add('trail-cursor-char'); trailEl.textContent = '𖹭'; trailEl.style.left = `${x}px`; trailEl.style.top = `${y}px`; document.body.appendChild(trailEl); setTimeout(() => { trailEl.remove(); }, 1000); } // Match fall animation
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
