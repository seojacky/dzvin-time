// schedule-ui-manager.js - Управління UI та взаємодією користувача

import { scheduleAPI } from './schedule-api.js';

export class ScheduleUIManager {
    constructor(callbacks = {}) {
        this.callbacks = {
            onViewSwitch: callbacks.onViewSwitch || (() => {}),
            onDateChange: callbacks.onDateChange || (() => {}),
            onNavigatePeriod: callbacks.onNavigatePeriod || (() => {}),
            onRefresh: callbacks.onRefresh || (() => {}),
            onSettingsOpen: callbacks.onSettingsOpen || (() => {})
        };
        
        this.mobileBreakpoint = 768;
    }

    /**
     * Налаштування обробників подій
     * @param {Object} elements - DOM елементи
     */
    setupEventListeners(elements) {
        // Перемикач вигляду
        elements.viewButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.callbacks.onViewSwitch(e.target.dataset.view);
            });
        });

        // Кнопка налаштувань
        elements.settingsBtn?.addEventListener('click', () => {
            this.callbacks.onSettingsOpen();
        });

        // Контроли дати
        elements.dateInput?.addEventListener('change', (e) => {
            this.callbacks.onDateChange(new Date(e.target.value));
        });

        elements.prevBtn?.addEventListener('click', () => {
            this.callbacks.onNavigatePeriod(-1);
        });

        elements.nextBtn?.addEventListener('click', () => {
            this.callbacks.onNavigatePeriod(1);
        });

        elements.todayBtn?.addEventListener('click', () => {
            this.callbacks.onDateChange(new Date());
        });
    }

    /**
     * Налаштування responsive обробника
     */
    setupResponsiveHandler() {
        const mediaQuery = window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`);
        
        const handleResponsiveChange = () => {
            this.callbacks.onRefresh();
        };

        mediaQuery.addListener(handleResponsiveChange);
    }

    /**
     * Перемикання вигляду
     * @param {string} newView - новий вигляд
     * @param {NodeList} viewButtons - кнопки вигляду
     */
    switchView(newView, viewButtons) {
        // Оновлюємо кнопки
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === newView);
        });
    }

    /**
     * Оновлення контролів UI
     * @param {Date} currentDate - поточна дата
     * @param {string} currentView - поточний вигляд  
     * @param {Object} elements - DOM елементи
     */
    updateControls(currentDate, currentView, elements) {
        this.updateDateInput(currentDate, elements.dateInput);
        this.updateViewButtons(currentView, elements.viewButtons);
    }

    /**
     * Оновлення поля дати
     * @param {Date} date - дата для встановлення
     * @param {HTMLInputElement} dateInput - поле вводу дати
     */
    updateDateInput(date, dateInput) {
        if (dateInput) {
            const dateStr = date.toISOString().split('T')[0];
            dateInput.value = dateStr;
        }
    }

    /**
     * Оновлення кнопок вигляду
     * @param {string} currentView - поточний вигляд
     * @param {NodeList} viewButtons - кнопки вигляду
     */
    updateViewButtons(currentView, viewButtons) {
        viewButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === currentView);
        });
    }

    /**
     * Відображення стану завантаження
     * @param {HTMLElement} container - контейнер для відображення
     * @param {boolean} show - показати/приховати
     */
    renderLoadingState(container, show = true) {
        if (!container) {
            console.warn('Контейнер для відображення стану завантаження не знайдено');
            return;
        }
        
        if (show) {
            container.innerHTML = `
                <div class="p-4 text-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Завантаження розкладу...
                </div>
            `;
        }
    }

    /**
     * Відображення стану помилки
     * @param {HTMLElement} container - контейнер для відображення
     * @param {Error|string} error - помилка для відображення
     */
    renderErrorState(container, error) {
        if (!container) {
            console.warn('Контейнер для відображення помилки не знайдено');
            return;
        }

        const errorMessage = error?.message || error || 'Помилка завантаження';
        const showDetails = error?.details && error.showDetails;
        
        container.innerHTML = `
            <div class="error-state">
                <div class="flex items-center mb-3">
                    <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    <h4 class="font-semibold">Помилка завантаження розкладу</h4>
                </div>
                <p class="mb-3">${errorMessage}</p>
                
                ${showDetails ? `<details class="text-sm mb-3">
                    <summary class="cursor-pointer">Технічні деталі</summary>
                    <p class="mt-2 p-2 bg-red-50 rounded text-red-700">${error.details}</p>
                </details>` : ''}
                
                <!-- Основні дії -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <button class="retry-btn px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        <i class="fas fa-redo mr-2"></i>Спробувати знову
                    </button>
                    <button class="clear-cache-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        <i class="fas fa-database mr-2"></i>Очистити кеш даних
                    </button>
                </div>
                
                <!-- Додаткові дії -->
                <div class="border-t pt-4">
                    <p class="text-sm text-gray-600 mb-3">
                        <i class="fas fa-lightbulb mr-1 text-yellow-500"></i>
                        Якщо проблема повторюється:
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button class="reset-settings-btn px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm">
                            <i class="fas fa-cog mr-2"></i>Змінити налаштування
                        </button>
                        <button class="reset-all-btn px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm">
                            <i class="fas fa-trash-restore mr-2"></i>Скинути все
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupErrorStateHandlers(container);
    }

    /**
     * Налаштування обробників для стану помилки
     * @param {HTMLElement} container - контейнер з кнопками помилки
     */
    setupErrorStateHandlers(container) {
        const retryBtn = container.querySelector('.retry-btn');
        const clearCacheBtn = container.querySelector('.clear-cache-btn');
        const resetSettingsBtn = container.querySelector('.reset-settings-btn');
        const resetAllBtn = container.querySelector('.reset-all-btn');
        
        // Повторна спроба
        retryBtn?.addEventListener('click', () => {
            this.callbacks.onRefresh();
        });
        
        // Очистити тільки кеш даних (БЕЗ налаштувань)
        clearCacheBtn?.addEventListener('click', async () => {
            this.showToast('Очищення кешу даних...', 'info');
            await scheduleAPI.clearScheduleCache();
            this.showToast('Кеш даних очищено', 'success');
            this.callbacks.onRefresh();
        });
        
        // Змінити налаштування (відкрити модалку налаштувань)
        resetSettingsBtn?.addEventListener('click', () => {
            this.callbacks.onSettingsOpen();
        });
        
        // Скинути ВСЕ (і кеш, і налаштування)
        resetAllBtn?.addEventListener('click', () => {
            this.confirmResetAll();
        });
    }

    /**
     * Відображення порожнього стану
     * @param {HTMLElement} container - контейнер для відображення
     * @param {string} message - повідомлення для відображення
     * @param {string} currentView - поточний вигляд
     */
    renderEmptyState(container, message = null, currentView = 'day') {
        if (!container) {
            console.warn('Контейнер для відображення порожнього стану не знайдено');
            return;
        }

        const emptyMessage = message || 
                           (currentView === 'day' ? 'На цей день розклад відсутній' : 'На цей тиждень розклад відсутній');
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="text-6xl mb-4">📅</div>
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Дані відсутні
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">${emptyMessage}</p>
                
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button class="check-other-btn px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                        <i class="fas fa-calendar-alt mr-2"></i>Обрати іншу дату
                    </button>
                    <button class="today-btn px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        <i class="fas fa-calendar-day mr-2"></i>На сьогодні
                    </button>
                </div>
                
                <div class="mt-4 text-sm text-gray-500">
                    <p>💡 Порада: Розклад зазвичай доступний тільки на робочі дні (Пн-Пт)</p>
                </div>
            </div>
        `;

        // Обробники кнопок
        const checkOtherBtn = container.querySelector('.check-other-btn');
        const todayBtn = container.querySelector('.today-btn');
        
        checkOtherBtn?.addEventListener('click', () => {
            // Фокус на поле вибору дати (буде передано через callback)
            this.callbacks.onDateFocus?.();
        });
        
        todayBtn?.addEventListener('click', () => {
            this.callbacks.onDateChange(new Date());
        });
    }

    /**
     * Відкрити модалку налаштувань
     */
    async openSettingsModal() {
        try {
            // Імортуємо менеджер налаштувань
            const { SettingsScheduleManager } = await import('./settings-schedule-manager.js');
            
            const settingsManager = new SettingsScheduleManager();
            
            settingsManager.onSave(async (newSettings) => {
                this.callbacks.onSettingsChange?.(newSettings);
                this.showToast('Налаштування оновлено', 'success');
            });
            
            await settingsManager.show();
            
        } catch (error) {
            console.error('Помилка відкриття налаштувань:', error);
            this.showToast('Помилка відкриття налаштувань', 'error');
        }
    }

    /**
     * Підтвердження повного скидання
     */
    confirmResetAll() {
        const confirmed = confirm(
            '⚠️ УВАГА!\n\n' +
            'Ця дія:\n' +
            '• Видалить всі збережені налаштування\n' +
            '• Очистить весь кеш даних\n' +
            '• Поверне до початкового налаштування\n\n' +
            'Продовжити?'
        );
        
        if (confirmed) {
            this.resetEverything();
        }
    }

    /**
     * Повний скид (НОВИЙ МЕТОД)
     */
    async resetEverything() {
        try {
            this.showToast('Скидання всіх даних...', 'info');
            
            // 1. Очищуємо налаштування користувача
            await scheduleAPI.clearUserSettings();
            
            // 2. Очищуємо весь кеш
            await scheduleAPI.clearScheduleCache();
            
            this.showToast('Все скинуто! Налаштуйте розклад заново', 'success');
            
            // 4. Показуємо модалку налаштувань заново
            setTimeout(() => {
                this.callbacks.onSettingsOpen();
            }, 1000);
            
        } catch (error) {
            console.error('Помилка скидання:', error);
            this.showToast('Помилка скидання даних', 'error');
        }
    }

    /**
     * Показ toast повідомлення
     * @param {string} message - повідомлення
     * @param {string} type - тип повідомлення (info, success, warning, error)
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white text-sm font-medium transition-all duration-300 transform translate-x-full`;
        
        const bgColors = {
            info: 'bg-blue-500',
            success: 'bg-green-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500'
        };
        
        toast.classList.add(bgColors[type] || bgColors.info);
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Анімація появи
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Автоматичне приховування
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}