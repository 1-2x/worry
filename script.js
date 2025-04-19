// Simplified script.js for debugging

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Trying to select elements..."); // Debug message

    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    // const backgroundMusic = document.getElementById('background-music'); // Temporarily comment out music
    const customCursor = document.getElementById('custom-cursor');
    const allIconLinks = document.querySelectorAll('.icon-link');
    const footerLink = document.querySelector('.footer-credit');
    // const visitCountSpan = document.getElementById('visit-count'); // Temporarily comment out counter display
    // const discordTrigger = document.getElementById('discord-pop-trigger'); // Temporarily comment out popup trigger
    // const discordPopup = document.getElementById('discord-popup'); // Temporarily comment out popup

    // Check if elements were selected
    if (!entryScreen) console.error("Entry Screen not found!");
    if (!mainContent) console.error("Main Content not found!");
    if (!customCursor) console.error("Custom Cursor not found!");

    // Set the initial content for the custom cursor
    if (customCursor) {
        customCursor.textContent = '𖹭';
        console.log("Custom cursor text set."); // Debug message
    }

    // --- Fake View Counter Logic DISABLED ---

    // --- Browser Tab Title Animation DISABLED ---

    // --- Entry Screen Logic (Simplified) ---
    if (entryScreen) {
        entryScreen.addEventListener('click', () => {
            console.log("Entry screen clicked!"); // Debug message
            entryScreen.classList.add('hidden');
            setTimeout(() => {
                entryScreen.style.display = 'none';
                if (mainContent) {
                    mainContent.classList.add('visible');
                    console.log("Main content should be visible."); // Debug message
                } else {
                    console.error("Main Content element missing inside click handler!");
                }
                // Temporarily disable music play on entry
                // backgroundMusic.play().catch(error => {
                //     console.warn("Background music autoplay failed.", error);
                // });
            }, 500);
        }, { once: true });
        console.log("Entry screen listener added."); // Debug message
    } else {
         console.error("Could not add listener to entry screen because it wasn't found.");
    }


    // --- Custom Cursor Tracking and Trail ---
    if (customCursor) {
        document.addEventListener('mousemove', (e) => {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
            createTrailDot(e.clientX, e.clientY);
        });
        console.log("Mousemove listener added for cursor."); // Debug message
    }

    function createTrailDot(x, y) {
        const dot = document.createElement('div');
        dot.classList.add('trail-dot');
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        document.body.appendChild(dot);
        setTimeout(() => {
            dot.remove();
        }, 800);
    }

    // --- Basic Icon/Footer Link Double-Click Logic ---
    // (Excludes Discord popup logic for now)
    allIconLinks.forEach(link => {
        if (link.id !== 'discord-pop-trigger') { // Apply only to non-discord icons for now
             link.addEventListener('click', (event) => { event.preventDefault(); });
             link.addEventListener('dblclick', (event) => {
                 const targetLink = event.currentTarget.href;
                 if (targetLink && targetLink !== '#') { // Check href exists and is not just #
                     window.open(targetLink, '_blank');
                 }
             });
        } else {
             // Prevent default for discord icon too, but don't add dblclick yet
             link.addEventListener('click', (event) => { event.preventDefault(); });
        }
    });
    if (footerLink) {
        footerLink.addEventListener('click', (event) => { event.preventDefault(); });
        footerLink.addEventListener('dblclick', (event) => {
            const targetLink = event.currentTarget.href;
            if (targetLink) { window.open(targetLink, '_blank'); }
        });
    }
     console.log("Basic link listeners added."); // Debug message

    // --- Close Popup Logic DISABLED ---

});

console.log("script.js loaded."); // Debug message at end of file
