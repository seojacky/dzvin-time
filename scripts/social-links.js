// social-links.js - Компонент для відображення соціальних посилань

import { config } from './config-loader.js';

// Мапінг назв на FontAwesome іконки
const ICON_MAP = {
    'website': 'fas fa-globe',
    'moodle': 'fas fa-graduation-cap',
    'email': 'fas fa-envelope',
    'instagram': 'fab fa-instagram',
    'facebook': 'fab fa-facebook',
    'youtube': 'fab fa-youtube',
    'telegram': 'fab fa-telegram'
};

export class SocialLinksRenderer {
    constructor(containerSelector = '#social-links-container') {
        this.containerSelector = containerSelector;
        this.container = null;
        this.socialLinks = null;
    }

    // Ініціалізація компонента
    async init() {
        try {
            // Знаходимо контейнер
            this.container = document.querySelector(this.containerSelector);
            if (!this.container) {
                console.warn(`Контейнер для соціальних посилань ${this.containerSelector} не знайдено`);
                return false;
            }

            // Завантажуємо конфігурацію
            const configuration = await config.loadConfig();
            this.socialLinks = configuration.socialLinks;

            if (!this.socialLinks || !Array.isArray(this.socialLinks)) {
                console.warn('Соціальні посилання не знайдено в конфігурації');
                return false;
            }

            //console.log('SocialLinksRenderer ініціалізовано, знайдено посилань:', this.socialLinks.length);
            return true;

        } catch (error) {
            console.error('Помилка ініціалізації SocialLinksRenderer:', error);
            return false;
        }
    }

    // Рендеринг соціальних посилань
    render() {
        if (!this.container || !this.socialLinks) {
            console.warn('SocialLinksRenderer не ініціалізовано');
            return;
        }

        // Створюємо HTML для кожного посилання
        const linksHTML = this.socialLinks.map(link => {
            const icon = ICON_MAP[link.name] || 'fas fa-link';
            
            return `
                <a href="${link.url}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   title="${link.title}"
                   class="social-link"
                   data-social="${link.name}">
                    <i class="${icon}"></i>
                </a>
            `;
        }).join('');

        // Вставляємо HTML в контейнер
        this.container.innerHTML = `
            <div class="social-links-wrapper">
                ${linksHTML}
            </div>
        `;

        //console.log('Соціальні посилання відрендерено');
    }

    // Публічний метод для ініціалізації та рендерингу
    async initAndRender() {
        const initialized = await this.init();
        if (initialized) {
            this.render();
        }
        return initialized;
    }

    // Отримання кількості посилань (для тестування)
    getLinksCount() {
        return this.socialLinks ? this.socialLinks.length : 0;
    }

    // Перевірка чи ініціалізовано
    isInitialized() {
        return this.container !== null && this.socialLinks !== null;
    }
}

// Експортуємо єдиний екземпляр
export const socialLinksRenderer = new SocialLinksRenderer();