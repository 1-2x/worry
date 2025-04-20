document.addEventListener('DOMContentLoaded', () => {
    // Select necessary elements
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');
    const customCursor = document.getElementById('custom-cursor');
    // Select only remaining icons
    const popupTriggers = document.querySelectorAll('.popup-trigger'); // TikTok, Discord
    // Double clickable links REMOVED as elements are gone
    const allPopups = document.querySelectorAll('.popup-menu');
    // Footer link REMOVED
    const visitCountSpan = document.getElementById('visit-count');
    const volumeContainer = document.getElementById('volume-control-container');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const locationTextElement = document.getElementById('location-text');
    const typingCursorElement = document.getElementById('typing-cursor');

    // Set the initial content for the custom cursor
    if (customCursor) { customCursor.textContent = '𖹭'; }

    // --- Fake View Counter Logic ---
    if (visitCountSpan) { let currentCount = localStorage
