// umami-events.js - оновлена версія
function track(event, data = {}) {
    if (typeof umami !== 'undefined') {
        umami.track(event, data);
        console.log(`Umami tracked: ${event}`, data);
    } else {
        console.warn('Umami not loaded yet');
    }
}

// Чекаємо завантаження Umami
function waitForUmami() {
    if (typeof umami !== 'undefined') {
        initTracking();
    } else {
        setTimeout(waitForUmami, 100);
    }
}

function initTracking() {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const platform = isInstalled ? 'PWA' : 'Web';
    
    // Відстеження запуску
    track('App Launch', { platform });
    
    // PWA події
    window.addEventListener('beforeinstallprompt', () => {
        track('Install Prompt');
    });
    
    window.addEventListener('appinstalled', () => {
        track('PWA Installed');
    });
}

// Запускаємо після завантаження DOM
document.addEventListener('DOMContentLoaded', waitForUmami);

// Експорт для використання в інших файлах
window.trackEvent = track;