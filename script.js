document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    const allIconLinks = document.querySelectorAll('.icon-link');
    const footerLink = document.querySelector('.footer-credit');
    const visitCountSpan = document.getElementById('visit-count');
    const discordTrigger = document.getElementById('discord-pop-trigger');
    const discordPopup = document.getElementById('discord-popup');

    // Set the initial content for the custom cursor
    if (customCursor) {
        customCursor.textContent = '𖹭';
    }

    // --- Fake View Counter Logic START ---
    if (visitCountSpan) {
        let currentCount = localStorage.getItem('pageVisits_worrySite');
        let visitNumber = 0;
        if (currentCount && !isNaN(parseInt(currentCount))) {
            visitNumber = parseInt(currentCount);
        }
        visitNumber += 1;
        visitCountSpan.textContent = visitNumber;
        localStorage.setItem('pageVisits_worrySite', visitNumber.toString());
    }
    // --- Fake View Counter Logic END ---


    // --- Browser Tab Title Animation ---
    const titles = ['m', 'me', 'mew', 'mewo', 'meow', 'meow .', 'meow ..', 'meow ...', 'meow ..', 'meow .'];
    let titleIndex = 0;
    setInterval(() => {
        document.title = titles[titleIndex];
        titleIndex = (titleIndex + 1) % titles.length;
    }, 600);


    // --- Entry Screen Logic ---
    entryScreen.addEventListener('click', () => {
        entryScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.style.display = 'none';
            mainContent.classList.add('visible');

            // Play music immediately after entry screen hides
            backgroundMusic.play().catch(error => {
                console.warn("Background music autoplay failed.", error);
            });

        }, 500);
    }, { once: true });


    // --- Custom Cursor Tracking and Trail ---
    document.addEventListener('mousemove', (e) => {
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
        createTrailDot(e.clientX, e.clientY);
    });

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

    // --- Icon Link Click Logic ---
    allIconLinks.forEach(link => {
        if (link.id === 'discord-pop-trigger') {
            // SINGLE Click for Discord Popup
            link.addEventListener('click', (event) => {
                event.preventDefault();
                if(discordPopup) {
                    discordPopup.classList.toggle('visible');
                }
            });
        } else if (link.classList.contains('double-clickable')) {
             // DOUBLE Click for other links
            link.addEventListener('click', (event) => {
                event.preventDefault();
            });
            link.addEventListener('dblclick', (event) => {
                const targetLink = event.currentTarget.href;
                if (targetLink) {
                    window.open(targetLink, '_blank');
                }
            });
        } else {
              link.addEventListener('click', (event) => {
                event.preventDefault();
             });
        }
    });

    // --- Close Popup when Clicking Outside ---
    document.addEventListener('click', function(event) {
        if (discordPopup && discordTrigger) {
            const isClickInsidePopup = discordPopup.contains(event.target);
            const isClickOnTrigger = discordTrigger.contains(event.target);

            if (discordPopup.classList.contains('visible') && !isClickInsidePopup && !isClickOnTrigger) {
                discordPopup.classList.remove('visible');
            }
        }
    });

    // --- Footer Link Double-Click Logic ---
    if (footerLink) {
        footerLink.addEventListener('click', (event) => {
            event.preventDefault();
        });
        footerLink.addEventListener('dblclick', (event) => {
            const targetLink = event.currentTarget.href;
            if (targetLink) {
                window.open(targetLink, '_blank');
            }
        });
    }

});
