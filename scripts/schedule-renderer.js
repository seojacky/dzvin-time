// schedule-renderer.js - Основний клас для рендерингу розкладу занять

import { config } from './config-loader.js';
import { scheduleAPI } from './schedule-api.js';
import { ScheduleViewRenderer } from './schedule-renderer-view.js';
import { ScheduleUIManager } from './schedule-ui-manager.js';

export class ScheduleRenderer {
    constructor(containerSelector = '#schedule-content') {
        this.container = null;
        this.containerSelector = containerSelector;
        this.currentView = 'day'; // day | week
        this.currentDate = new Date();
        this.currentSettings = null;
        this.currentData = null;
        this.isInitialized = false;
        
        // DOM елементи
        this.elements = {};
        
        // Компоненти
        this.viewRenderer = null;
        this.uiManager = null;
        
        // Конфігурація
        this.uiConfig = null;
        this.periods = null;
        this.messages = null;
        
        // Responsive breakpoint
        this.mobileBreakpoint = 768;
    }

    // Ініціалізація рендерера
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Завантажуємо конфігурацію
            this.uiConfig = await config.getUIConfig();
            this.periods = await config.getClassSchedulePeriods();
            this.messages = await config.getMessages();
            this.mobileBreakpoint = this.uiConfig.responsive?.mobileBreakpoint || 768;
            
            // Знаходимо контейнер
            this.container = document.querySelector(this.containerSelector);
            if (!this.container) {
                throw new Error(`Контейнер ${this.containerSelector} не знайдено`);
            }

            // Створюємо компоненти
            this.viewRenderer = new ScheduleViewRenderer();
            this.uiManager = new ScheduleUIManager({
                onViewSwitch: (view) => this.switchView(view),
                onDateChange: (date) => this.setDate(date),
                onNavigatePeriod: (direction) => this.navigatePeriod(direction),
                onRefresh: () => this.loadAndRenderSchedule(),
                onSettingsOpen: () => this.uiManager.openSettingsModal(),
                onSettingsChange: (settings) => {
                    this.currentSettings = settings;
                    this.loadAndRenderSchedule();
                },
                onDateFocus: () => this.elements.dateInput?.focus()
            });

            // Створюємо базову структуру UI
            this.createBaseUI();
            this.cacheElements();
            this.applyStyles();
            this.setupEventListeners();
            this.uiManager.setupResponsiveHandler();
            
            this.isInitialized = true;
            //console.log('ScheduleRenderer ініціалізовано');
            
        } catch (error) {
            console.error('Помилка ініціалізації ScheduleRenderer:', error);
            throw error;
        }
    }

    // Створення базової структури UI
    createBaseUI() {
        this.container.innerHTML = `
            <div class="schedule-renderer">
                <!-- Контроли вгорі -->
                <div class="schedule-controls mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <!-- Перемикач вигляду та кнопка налаштувань -->
                        <div class="flex gap-3 items-center">
                            <div class="view-switcher flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button class="view-btn active" data-view="day">
                                    <i class="fas fa-calendar-day mr-2"></i>День
                                </button>
                                <button class="view-btn" data-view="week">
                                    <i class="fas fa-calendar-week mr-2"></i>Тиждень
                                </button>
                            </div>
                            
                            <!-- Кнопка налаштувань -->
                            <button id="schedule-settings-btn" class="btn-settings">
                                <i class="fas fa-cog mr-2"></i>Налаштування розкладу
                            </button>
                        </div>
                        
                        <!-- Контроли дати -->
                        <div class="date-controls flex items-center gap-2">
                            <button id="prev-period" class="btn-nav">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <input type="date" id="date-picker" class="date-input">
                            <button id="next-period" class="btn-nav">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button id="today-btn" class="btn-today">
                                <i class="fas fa-home mr-2"></i>Сьогодні
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Головний контент -->
                <div id="schedule-main-content" class="schedule-main-content">
                    <!-- Тут буде рендеритись розклад -->
                </div>
            </div>
        `;
    }

    // Кешування DOM елементів
    cacheElements() {
        this.elements = {
            controls: this.container.querySelector('.schedule-controls'),
            viewButtons: this.container.querySelectorAll('.view-btn'),
            settingsBtn: this.container.querySelector('#schedule-settings-btn'),
            dateInput: this.container.querySelector('#date-picker'),
            prevBtn: this.container.querySelector('#prev-period'),
            nextBtn: this.container.querySelector('#next-period'),
            todayBtn: this.container.querySelector('#today-btn'),
            mainContent: this.container.querySelector('#schedule-main-content')
        };
    }

    // Застосування стилів
    applyStyles() {
        const styles = `
            <style>
                .schedule-renderer {
                    min-height: 400px;
                }
                
                .view-switcher .view-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                    color: #6b7280;
                }
                
                .view-switcher .view-btn.active {
                    background: white;
                    color: #4f46e5;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .view-switcher .view-btn:hover:not(.active) {
                    color: #374151;
                }
                
                .btn-settings {
                    padding: 0.5rem 1rem;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                    color: #4f46e5;
                    font-weight: 500;
                }
                
                .btn-settings:hover {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                }
                
                .date-input {
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    min-width: 150px;
                }
                
                .date-input:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                
                .btn-nav, .btn-today {
                    padding: 0.5rem;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                
                .btn-nav:hover, .btn-today:hover {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                }
                
                .btn-today {
                    color: #4f46e5;
                    font-weight: 500;
                }
                
                .schedule-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .schedule-table th {
                    background: #f9fafb;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: #374151;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .schedule-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f3f4f6;
                    vertical-align: top;
                }
                
                .lesson-card {
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                
                .lesson-type-badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #6b7280;
                }
                
                .loading-state {
                    text-align: center;
                    padding: 3rem 1rem;
                }
                
                .error-state {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    color: #dc2626;
                    margin: 1rem 0;
                }
                
                @media (max-width: 768px) {
                    .schedule-controls .flex {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .date-controls {
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                    
                    .schedule-table {
                        font-size: 0.875rem;
                    }
                    
                    .schedule-table th,
                    .schedule-table td {
                        padding: 0.5rem;
                    }
                }
                
                /* Темна тема */
                @media (prefers-color-scheme: dark) {
                    .schedule-table {
                        background: #374151;
                        color: #f3f4f6;
                    }
                    
                    .schedule-table th {
                        background: #4b5563;
                        color: #e5e7eb;
                        border-color: #6b7280;
                    }
                    
                    .schedule-table td {
                        border-color: #4b5563;
                    }
                    
                    .lesson-card {
                        background: #374151;
                        color: #f3f4f6;
                    }
                    
                    .date-input, .btn-nav, .btn-today, .btn-settings {
                        background: #374151;
                        border-color: #4b5563;
                        color: #f3f4f6;
                    }
                    
                    .empty-state {
                        color: #9ca3af;
                    }
                }
            </style>
        `;

        // Додаємо стилі якщо їх ще немає
        if (!document.querySelector('#schedule-renderer-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'schedule-renderer-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
        }
    }

    // Налаштування обробників подій
    setupEventListeners() {
        this.uiManager.setupEventListeners(this.elements);
    }

    // === ОСНОВНІ МЕТОДИ РЕНДЕРИНГУ ===

    // Рендеринг розкладу з налаштуваннями
    async render(settings, date = null, view = null) {
        try {
            await this.ensureInitialized();
            
            this.currentSettings = settings;
            this.currentDate = date || new Date();
            
            if (view) {
                this.currentView = view;
            }

            this.updateControls();
            await this.loadAndRenderSchedule();
            
        } catch (error) {
            console.error('Помилка рендерингу розкладу:', error);
            this.uiManager.renderErrorState(this.elements.mainContent, error);
        }
    }

    // Завантаження та рендеринг даних
    async loadAndRenderSchedule() {
        try {
            this.uiManager.renderLoadingState(this.elements.mainContent);

            let scheduleData;
            
            if (this.currentView === 'day') {
                scheduleData = await scheduleAPI.getScheduleForDay(
                    this.currentSettings, 
                    config.formatDateForAPI(this.currentDate)
                );
            } else if (this.currentView === 'week') {
                scheduleData = await scheduleAPI.getScheduleForWeek(
                    this.currentSettings, 
                    config.formatDateForAPI(this.currentDate)
                );
            }

            this.currentData = scheduleData;
            this.renderCurrentData();

        } catch (error) {
            console.error('Помилка завантаження розкладу:', error);
            this.uiManager.renderErrorState(this.elements.mainContent, error);
        }
    }

    // Рендеринг поточних даних
    renderCurrentData() {
        if (!this.currentData) {
            this.uiManager.renderEmptyState(this.elements.mainContent, null, this.currentView);
            return;
        }

        const renderConfig = {
            periods: this.periods,
            mobileBreakpoint: this.mobileBreakpoint,
            messages: this.messages
        };

        this.viewRenderer.renderCurrentData(
            this.currentData,
            this.elements.mainContent,
            this.currentView,
            renderConfig,
            scheduleAPI
        );
    }

    // === МЕТОДИ НАВІГАЦІЇ ===

    // Перемикання вигляду
    switchView(newView) {
        if (newView === this.currentView) return;
        
        this.currentView = newView;
        this.uiManager.switchView(newView, this.elements.viewButtons);
        
        // Перезавантажуємо дані
        if (this.currentSettings) {
            this.loadAndRenderSchedule();
        }
    }

    // Встановлення дати
    setDate(date) {
        this.currentDate = new Date(date);
        this.updateControls();
        
        if (this.currentSettings) {
            this.loadAndRenderSchedule();
        }
    }

    // Навігація по періодам (день/тиждень)
    navigatePeriod(direction) {
        const newDate = new Date(this.currentDate);
        
        if (this.currentView === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        } else if (this.currentView === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        }
        
        this.setDate(newDate);
    }

    // Оновлення контролів UI
    updateControls() {
        this.uiManager.updateControls(this.currentDate, this.currentView, this.elements);
    }

    // === ПУБЛІЧНІ МЕТОДИ (ДЛЯ ЗВОРОТНОЇ СУМІСНОСТІ) ===

    // Оновлення розкладу
    async refresh() {
        if (this.currentSettings) {
            await this.loadAndRenderSchedule();
        }
    }

    // Встановлення налаштувань
    setSettings(settings) {
        this.currentSettings = settings;
    }

    // Отримання поточних налаштувань
    getSettings() {
        return this.currentSettings;
    }

    // Отримання поточної дати
    getCurrentDate() {
        return new Date(this.currentDate);
    }

    // Отримання поточного вигляду
    getCurrentView() {
        return this.currentView;
    }

    // Отримання поточних даних
    getCurrentData() {
        return this.currentData;
    }

    // Перевірка чи є дані
    hasData() {
        return this.currentData !== null;
    }

    // === МЕТОДИ ДЛЯ ЕКСПОРТУ/ІМПОРТУ ===

    // Експорт поточного розкладу в JSON
    exportScheduleData() {
        return this.viewRenderer.exportScheduleData(
            this.currentData, 
            this.currentSettings, 
            this.currentView, 
            this.currentDate
        );
    }

    // Генерація текстового розкладу для копіювання
    generateScheduleText() {
        return this.viewRenderer.generateScheduleText(
            this.currentData, 
            this.currentView, 
            this.periods
        );
    }

    // === СЛУЖБОВІ МЕТОДИ ===

    // Перевірка ініціалізації
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.init();
        }
    }

    // Отримання статистики кешу
    async getCacheStats() {
        const stats = {
            localStorage: 0,
            sessionStorage: 0,
            scheduleItems: 0,
            totalSize: 0
        };

        try {
            // Рахуємо елементи localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('kntu_')) {
                    stats.localStorage++;
                    if (key.includes('schedule')) {
                        stats.scheduleItems++;
                    }
                    const item = localStorage.getItem(key);
                    stats.totalSize += item ? item.length : 0;
                }
            }

            // Рахуємо елементи sessionStorage
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('kntu_')) {
                    stats.sessionStorage++;
                    if (key.includes('schedule')) {
                        stats.scheduleItems++;
                    }
                    const item = sessionStorage.getItem(key);
                    stats.totalSize += item ? item.length : 0;
                }
            }

            stats.totalSizeKB = Math.round(stats.totalSize / 1024);

        } catch (error) {
            console.warn('Помилка отримання статистики кешу:', error);
        }

        return stats;
    }

    // Очищення ресурсів
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Видаляємо стилі
        const styles = document.querySelector('#schedule-renderer-styles');
        if (styles) {
            styles.remove();
        }
        
        this.isInitialized = false;
        this.currentData = null;
        this.currentSettings = null;
        this.viewRenderer = null;
        this.uiManager = null;
    }
}

// Експортуємо єдиний екземпляр
export const scheduleRenderer = new ScheduleRenderer();