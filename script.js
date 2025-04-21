document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Setting up static canvas test...");

    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    // Keep background music element selected if needed for other tests
    const backgroundMusic = document.getElementById('background-music');

    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        console.log("Entry screen clicked!");
        entryScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.style.display = 'none';
            mainContent.classList.add('visible');

            // --- Simple Canvas Draw Test START ---
            console.log("Attempting static canvas draw...");
            const chartCanvas = document.getElementById('scrolling-chart-canvas');
            if (chartCanvas) {
                 console.log("Canvas element found:", chartCanvas);
                 // Set canvas size explicitly based on CSS or default
                 chartCanvas.width = chartCanvas.clientWidth || 350;
                 chartCanvas.height = chartCanvas.clientHeight || 80;
                 console.log(`Canvas size set to ${chartCanvas.width}x${chartCanvas.height}`);

                 const ctx = chartCanvas.getContext('2d');
                 if (ctx) {
                     console.log("Canvas context obtained.");
                     // Clear first just in case
                     ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
                     // Draw solid lime rectangle
                     ctx.fillStyle = 'lime'; // Bright green
                     ctx.fillRect(0, 0, chartCanvas.width, chartCanvas.height); // Fill whole canvas
                     console.log(">>> Static LIME rectangle drawn to canvas context. Check visually! <<<");
                 } else {
                     console.error("!!! Failed to get 2D context for canvas. !!!");
                 }
            } else {
                 console.error("!!! Canvas element #scrolling-chart-canvas not found! Check HTML. !!!");
            }
            // --- Simple Canvas Draw Test END ---

            // Play music (optional for this test)
            // backgroundMusic.play().catch(error => { console.warn("Autoplay failed.", error); });

        }, 500);
    }, { once: true });

    // --- All other features TEMPORARILY DISABLED ---
    // (Cursor, Trail, Popups, Volume, Location Typing, Counter, Title Animation, Right Click Disable)

}); // End of DOMContentLoaded listener
