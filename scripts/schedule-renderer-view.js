// schedule-renderer-view.js - Рендеринг контенту розкладу

import { config } from './config-loader.js';

export class ScheduleViewRenderer {
    constructor() {
        // Конфігурація буде передаватися через параметри методів
    }

    /**
     * Рендеринг поточних даних (головний метод)
     * @param {Object} data - дані розкладу
     * @param {HTMLElement} container - контейнер для рендерингу
     * @param {string} view - тип вигляду ('day' | 'week')
     * @param {Object} config - конфігурація (periods, mobileBreakpoint, etc.)
     * @param {Object} scheduleAPI - API для роботи з розкладом
     */
    renderCurrentData(data, container, view, config, scheduleAPI) {
        if (!data) {
            this.renderEmptyScheduleMessage(container, 'Дані відсутні', view);
            return;
        }

        if (view === 'day') {
            this.renderDayView(data, container, config, scheduleAPI);
        } else if (view === 'week') {
            this.renderWeekView(data, container, config, scheduleAPI);
        }
    }

    /**
     * Рендеринг денного вигляду
     * @param {Object} data - дані розкладу на день
     * @param {HTMLElement} container - контейнер для рендерингу
     * @param {Object} config - конфігурація (periods, mobileBreakpoint)
     * @param {Object} scheduleAPI - API для перевірки наявності даних
     */
    renderDayView(data, container, config, scheduleAPI) {
        const isEmpty = !scheduleAPI.hasScheduleData(data);
        
        if (isEmpty) {
            this.renderEmptyScheduleMessage(container, 'На цей день розклад відсутній', 'day');
            return;
        }

        const isMobile = window.innerWidth <= config.mobileBreakpoint;
        
        if (isMobile) {
            this.renderDayViewMobile(data, container, config.periods);
        } else {
            this.renderDayViewDesktop(data, container, config.periods);
        }
    }

    /**
     * Денний вигляд на desktop
     * @param {Object} data - дані розкладу
     * @param {HTMLElement} container - контейнер
     * @param {Array} periods - періоди занять
     */
    renderDayViewDesktop(data, container, periods) {
        const scheduleEntries = Object.entries(data.schedule);
        
        let tableHTML = `
            <div class="day-view-desktop">
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        ${data.displayTitle} | ${data.formattedDate}
                    </h3>
                </div>
                
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th style="width: 100px;">Пара</th>
                            <th style="width: 100px;">Час</th>
                            <th>Предмет</th>
                            <th>Тип</th>
                            <th>Викладач/Група</th>
                            <th>Аудиторія</th>
                            <th>Тижні</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        scheduleEntries.forEach(([lessonNumber, lesson]) => {
            const period = periods.find(p => p.number == lessonNumber);
            const timeStr = period ? `${period.start} - ${period.end}` : '';
            
            tableHTML += `
                <tr>
                    <td>
                        <div class="flex items-center">
                            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-semibold text-sm">
                                ${lessonNumber}
                            </span>
                        </div>
                    </td>
                    <td class="text-sm text-gray-600 dark:text-gray-400">
                        ${timeStr}
                    </td>
                    <td>
                        <div class="font-medium text-gray-900 dark:text-white">
                            ${lesson.title}
                        </div>
                    </td>
                    <td>
                        ${this.renderLessonTypeBadge(lesson)}
                    </td>
                    <td class="text-sm text-gray-600 dark:text-gray-400">
                        ${lesson.instructorName || lesson.group || '-'}
                    </td>
                    <td class="text-sm text-gray-600 dark:text-gray-400">
                        ${lesson.room || '-'}
                    </td>
                    <td class="text-sm text-gray-600 dark:text-gray-400">
                        ${lesson.weeks || '-'}
                        ${lesson.evenOrOdd ? `<br><span class="text-xs">(${lesson.evenOrOdd})</span>` : ''}
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    /**
     * Денний вигляд на mobile
     * @param {Object} data - дані розкладу
     * @param {HTMLElement} container - контейнер
     * @param {Array} periods - періоди занять
     */
    renderDayViewMobile(data, container, periods) {
        const scheduleEntries = Object.entries(data.schedule);
        
        let cardsHTML = `
            <div class="day-view-mobile">
                <div class="mb-4 text-center">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        ${data.displayTitle}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${data.formattedDate}</p>
                </div>
                
                <div class="lessons-cards">
        `;

        scheduleEntries.forEach(([lessonNumber, lesson]) => {
            const period = periods.find(p => p.number == lessonNumber);
            const timeStr = period ? `${period.start} - ${period.end}` : '';
            
            cardsHTML += `
                <div class="lesson-card">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center">
                            <span class="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-bold mr-3">
                                ${lessonNumber}
                            </span>
                            <div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">${timeStr}</div>
                            </div>
                        </div>
                        ${this.renderLessonTypeBadge(lesson)}
                    </div>
                    
                    <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                        ${lesson.title}
                    </h4>
                    
                    <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        ${lesson.instructorName ? `<div><i class="fas fa-user mr-2"></i>${lesson.instructorName}</div>` : ''}
                        ${lesson.group ? `<div><i class="fas fa-users mr-2"></i>${lesson.group}</div>` : ''}
                        ${lesson.room ? `<div><i class="fas fa-map-marker-alt mr-2"></i>${lesson.room}</div>` : ''}
                        ${lesson.weeks ? `<div><i class="fas fa-calendar mr-2"></i>${lesson.weeks}${lesson.evenOrOdd ? ` (${lesson.evenOrOdd})` : ''}</div>` : ''}
                    </div>
                </div>
            `;
        });

        cardsHTML += `
                </div>
            </div>
        `;

        container.innerHTML = cardsHTML;
    }

    /**
     * Рендеринг тижневого вигляду
     * @param {Object} weekData - дані тижневого розкладу
     * @param {HTMLElement} container - контейнер для рендерингу
     * @param {Object} config - конфігурація
     * @param {Object} scheduleAPI - API для роботи з розкладом
     */
    renderWeekView(weekData, container, config, scheduleAPI) {
        const isMobile = window.innerWidth <= config.mobileBreakpoint;
        
        if (isMobile) {
            this.renderWeekViewMobile(weekData, container, config.periods, scheduleAPI);
        } else {
            this.renderWeekViewDesktop(weekData, container, config.periods, scheduleAPI);
        }
    }

    /**
     * Тижневий вигляд на desktop
     * @param {Object} weekData - дані тижня
     * @param {HTMLElement} container - контейнер
     * @param {Array} periods - періоди занять
     * @param {Object} scheduleAPI - API для роботи з розкладом
     */
    async renderWeekViewDesktop(weekData, container, periods, scheduleAPI) {
        const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця"];
        const allLessons = this.getAllLessonsFromWeek(weekData, scheduleAPI);
        
        let tableHTML = `
            <div class="week-view-desktop">
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        ${weekData.settings.displayName}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        ${await config.formatDateForDisplay(weekData.startDate)} - ${await config.formatDateForDisplay(weekData.endDate)}
                    </p>
                    ${weekData.successfulDays < 5 ? `<p class="text-xs text-yellow-600">Завантажено ${weekData.successfulDays}/5 днів</p>` : ''}
                </div>
                
                <div class="overflow-x-auto">
                    <table class="schedule-table" style="min-width: 800px;">
                        <thead>
                            <tr>
                                <th style="width: 100px;">Час</th>
                                ${dayNames.map(day => `<th>${day}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Рендеримо кожну пару (1-7)
        for (let lessonNum = 1; lessonNum <= 7; lessonNum++) {
            const period = periods.find(p => p.number == lessonNum);
            const timeStr = period ? `${period.start}<br>${period.end}` : `${lessonNum} пара`;
            
            tableHTML += `
                <tr>
                    <td class="text-sm text-center font-medium">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-semibold text-xs mx-auto mb-1">
                            ${lessonNum}
                        </div>
                        <div class="text-xs text-gray-600">${timeStr}</div>
                    </td>
            `;

            // Кожен день тижня
            for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
                const daySchedule = weekData.schedules[dayIndex];
                const lesson = daySchedule?.schedule?.[lessonNum];
                
                if (lesson) {
                    tableHTML += `
                        <td class="p-2">
                            <div class="text-xs font-medium mb-1">${lesson.title}</div>
                            ${this.renderLessonTypeBadge(lesson, 'xs')}
                            <div class="text-xs text-gray-500 mt-1">
                                ${lesson.instructorName || lesson.group || ''}
                            </div>
                            ${lesson.room ? `<div class="text-xs text-gray-500">${lesson.room}</div>` : ''}
                        </td>
                    `;
                } else {
                    tableHTML += `<td class="p-2 text-center text-gray-300">-</td>`;
                }
            }

            tableHTML += `</tr>`;
        }

        tableHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    /**
     * Тижневий вигляд на mobile
     * @param {Object} weekData - дані тижня
     * @param {HTMLElement} container - контейнер
     * @param {Array} periods - періоди занять
     * @param {Object} scheduleAPI - API для роботи з розкладом
     */
    renderWeekViewMobile(weekData, container, periods, scheduleAPI) {
        const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця"];
        
        let cardsHTML = `
            <div class="week-view-mobile">
                <div class="mb-4 text-center">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        ${weekData.settings.displayName}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Тижневий розклад</p>
                    ${weekData.successfulDays < 5 ? `<p class="text-xs text-yellow-600">Завантажено ${weekData.successfulDays}/5 днів</p>` : ''}
                </div>
        `;

        weekData.schedules.forEach((daySchedule, dayIndex) => {
            if (!daySchedule) {
                cardsHTML += `
                    <div class="day-card mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
                            📅 ${dayNames[dayIndex]}
                        </h4>
                        <p class="text-sm text-gray-500">Не вдалось завантажити розклад</p>
                    </div>
                `;
                return;
            }

            const hasLessons = scheduleAPI.hasScheduleData(daySchedule);
            
            cardsHTML += `
                <div class="day-card mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">
                        📅 ${dayNames[dayIndex]}
                    </h4>
            `;

            if (hasLessons) {
                const scheduleEntries = Object.entries(daySchedule.schedule);
                
                scheduleEntries.forEach(([lessonNumber, lesson]) => {
                    const period = periods.find(p => p.number == lessonNumber);
                    const timeStr = period ? `${period.start}-${period.end}` : '';
                    
                    cardsHTML += `
                        <div class="lesson-item mb-3 pb-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center">
                                    <span class="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs mr-2">
                                        ${lessonNumber}
                                    </span>
                                    <span class="text-xs text-gray-500">${timeStr}</span>
                                </div>
                                ${this.renderLessonTypeBadge(lesson, 'xs')}
                            </div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                ${lesson.title}
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                                ${lesson.instructorName || lesson.group || ''}
                                ${lesson.room ? ` • ${lesson.room}` : ''}
                            </div>
                        </div>
                    `;
                });
            } else {
                cardsHTML += `
                    <p class="text-sm text-gray-500 text-center py-4">
                        Занять немає
                    </p>
                `;
            }

            cardsHTML += `</div>`;
        });

        cardsHTML += `</div>`;
        container.innerHTML = cardsHTML;
    }

    /**
     * Рендеринг бейджа типу заняття
     * @param {Object} lesson - об'єкт заняття
     * @param {string} size - розмір бейджа ('xs', 'sm', 'md')
     * @return {string} HTML бейджа
     */
    renderLessonTypeBadge(lesson, size = 'sm') {
        const typeInfo = lesson.typeInfo;
        
        if (!typeInfo) {
            return `<span class="lesson-type-badge" style="background-color: #6b7280;">${lesson.type}</span>`;
        }

        const sizeClasses = {
            xs: 'text-xs px-1 py-0.5',
            sm: 'text-xs px-2 py-1',
            md: 'text-sm px-2 py-1'
        };  
			
        return `
            <span class="lesson-type-badge ${sizeClasses[size]}" style="background-color: ${typeInfo.color};">
                <i class="${typeInfo.icon} mr-1"></i>${typeInfo.shortName}
            </span>
        `;
    }

    /**
     * Повідомлення про порожній розклад
     * @param {HTMLElement} container - контейнер
     * @param {string} message - повідомлення
     * @param {string} view - тип вигляду
     */
    renderEmptyScheduleMessage(container, message, view) {
        container.innerHTML = `
            <div class="empty-schedule text-center p-8">
                <div class="text-6xl mb-4">📅</div>
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Розклад відсутній
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    ${message}
                </p>
            </div>
        `;
    }

    /**
     * Отримання всіх пар з тижневого розкладу
     * @param {Object} weekData - дані тижня
     * @param {Object} scheduleAPI - API для роботи з розкладом
     * @return {Object} об'єкт з усіма парами
     */
    getAllLessonsFromWeek(weekData, scheduleAPI) {
        const allLessons = {};
        
        if (!weekData.schedules) return allLessons;
        
        weekData.schedules.forEach((daySchedule, dayIndex) => {
            if (daySchedule && daySchedule.schedule) {
                Object.keys(daySchedule.schedule).forEach(lessonNumber => {
                    if (!allLessons[lessonNumber]) {
                        allLessons[lessonNumber] = {};
                    }
                    allLessons[lessonNumber][dayIndex] = daySchedule.schedule[lessonNumber];
                });
            }
        });
        
        return allLessons;
    }

    /**
     * Генерація текстового розкладу для копіювання
     * @param {Object} data - дані розкладу
     * @param {string} view - тип вигляду
     * @param {Array} periods - періоди занять
     * @return {string} текстовий розклад
     */
    generateScheduleText(data, view, periods) {
        if (!data) return '';
        
        let text = '';
        
        if (view === 'day' && data.schedule) {
            text += `📅 ${data.displayTitle}\n`;
            text += `📆 ${data.formattedDate}\n\n`;
            
            Object.entries(data.schedule).forEach(([lessonNumber, lesson]) => {
                const period = periods.find(p => p.number == lessonNumber);
                const timeStr = period ? `${period.start}-${period.end}` : '';
                
                text += `${lessonNumber}. ${timeStr}\n`;
                text += `   📚 ${lesson.title}\n`;
                text += `   📝 ${lesson.type}\n`;
                if (lesson.instructorName) text += `   👨‍🏫 ${lesson.instructorName}\n`;
                if (lesson.room) text += `   📍 ${lesson.room}\n`;
                text += '\n';
            });
        } else if (view === 'week' && data.schedules) {
            const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця"];
            
            text += `📅 ${data.settings.displayName}\n`;
            text += `📆 Тижневий розклад\n\n`;
            
            data.schedules.forEach((daySchedule, dayIndex) => {
                text += `=== ${dayNames[dayIndex]} ===\n`;
                
                if (daySchedule && Object.keys(daySchedule.schedule || {}).length > 0) {
                    Object.entries(daySchedule.schedule).forEach(([lessonNumber, lesson]) => {
                        const period = periods.find(p => p.number == lessonNumber);
                        const timeStr = period ? `${period.start}-${period.end}` : '';
                        
                        text += `${lessonNumber}. ${timeStr} - ${lesson.title} (${lesson.type})\n`;
                    });
                } else {
                    text += 'Занять немає\n';
                }
                
                text += '\n';
            });
        }
        
        return text;
    }

    /**
     * Експорт поточного розкладу в JSON
     * @param {Object} data - дані розкладу
     * @param {Object} settings - налаштування
     * @param {string} view - тип вигляду
     * @param {Date} date - поточна дата
     * @return {Object|null} об'єкт для експорту
     */
    exportScheduleData(data, settings, view, date) {
        if (!data) return null;
        
        return {
            settings: settings,
            view: view,
            date: date.toISOString(),
            data: data,
            exportedAt: new Date().toISOString()
        };
    }
}