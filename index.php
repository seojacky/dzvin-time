<?php

// Метаінформація додатку
$appInfo = [
    'author' => 'Kalinsky Eugen',
    'description' => 'DzvinTime - PWA розкладу дзвінків та навчальних занять',
    'lastUpdated' => '2025-08-24'
];


function getVersionFromSW($filePath = 'sw.js') {
    if (!file_exists($filePath)) {
        return 'ERROR';
    }
    
    $content = file_get_contents($filePath);
    if (preg_match("/const VERSION = ['\"]([^'\"]+)['\"];/", $content, $matches)) {
        return $matches[1];
    }
    return 'ERROR';
}

function getUniversityFromConfig() {
    $configPath = 'settings/universities/kntu/config.js';
    if (!file_exists($configPath)) {
        return 'ERROR';
    }
    
    $content = file_get_contents($configPath);
    if (preg_match('/"shortName":\s*"([^"]+)"/', $content, $matches)) {
        return $matches[1];
    }
    return 'ERROR';
}

$version = getVersionFromSW();
$universityName = getUniversityFromConfig();
$title = ($universityName === 'ERROR') ? 'ERROR - DzvinTime' : "DzvinTime - {$universityName}";
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?></title>
    <meta name="theme-color" content="#4f46e5">
    <meta name="description" content="DzvinTime - додаток для відображення розкладу дзвінків з підсвіткою поточної пари">
    <link rel="manifest" href="/manifest.json?v=<?= $version ?>">
    <script src="https://cdn.tailwindcss.com?v=<?= $version ?>"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css?v=<?= $version ?>">
	<link rel="stylesheet" href="style.css?v=<?= $version ?>">
	<script defer src="https://cloud.umami.is/script.js" data-website-id="54ed36e3-6781-49f5-891f-d5588ffc6dda"></script>
</head>
<body class="min-h-screen flex flex-col">
    <header class="bg-indigo-600 text-white p-4 shadow-md">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold flex items-center">
                <i class="fas fa-bell mr-2"></i>
                DzvinTime
                <span id="app-version" class="version-display">v<?= $version ?></span>
            </h1>
            <div id="current-time" class="text-lg font-mono bg-indigo-700 px-3 py-1 rounded-md"></div>
        </div>
    </header>

    <main class="flex-grow container mx-auto p-4 max-w-4xl">
        <!-- Install buttons section -->
        <div class="mb-4 flex justify-center space-x-3">
            <button id="install-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition hidden">
                <i class="fas fa-download mr-2"></i>Встановити додаток
            </button>
            <button id="ios-install-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition hidden">
                <i class="fab fa-apple mr-2"></i>Встановити на iPhone
            </button>
        </div>

        <div class="mb-6">
            <div class="mb-4">
                <div class="week-info-container">
                    <div id="week-info"></div>
                    <div class="tab-switcher">
                        <button class="tab-btn active" data-tab="bells">дзвінки</button>
                        <button class="tab-btn" data-tab="schedule">розклад</button>
                    </div>
                </div>                
            </div>
        </div>

        <!-- Контент для розкладу дзвінків -->
        <div id="bells-content" class="tab-content">
            <div class="grid gap-4">
                <div class="card rounded-lg shadow-md overflow-hidden">
                    <div class="bg-indigo-100 dark:bg-indigo-900 p-3">
                        <h3 class="text-lg font-semibold text-indigo-800 dark:text-indigo-200" id="selected-date">Сьогодні</h3>
                    </div>
                    <div class="divide-y divide-gray-200 dark:divide-gray-700">
                        <div id="schedule-container"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Контент для розкладу занять (поки порожній) -->
        <div id="schedule-content" class="tab-content hidden">
            <div class="grid gap-4">
                <div class="card rounded-lg shadow-md overflow-hidden">
                    <div class="bg-indigo-100 dark:bg-indigo-900 p-3">
                        <h3 class="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Розклад навчальних занять</h3>
                    </div>
                    <div class="p-4">
                        <p class="text-center text-gray-600 dark:text-gray-400">
                            Розклад занять буде тут...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Соціальні посилання -->
    <div id="social-links-container" class="social-links-section">
        <!-- Тут будуть відрендерені соціальні посилання -->
    </div>

    
    <footer class="bg-gray-100 dark:bg-gray-800 p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
		<p>© 2025 DzvinTime • <?= $universityName ?> • Developed by Kalinsky Eugen</p>
	</footer>
    

    <!-- iOS Install Modal -->
    <div id="ios-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div class="text-center">
                <div class="text-4xl mb-4">📱</div>
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Встановити на iPhone</h3>
                <div class="text-left space-y-3 text-gray-700 dark:text-gray-300">
                    <div class="flex items-start space-x-3">
                        <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                        <p>Натисніть кнопку <strong>"Поділитися"</strong> <i class="icons-share-ios"></i> внизу екрана Safari</p>
                    </div>
                    <div class="flex items-start space-x-3">
                        <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                        <p>Прокрутіть вниз і виберіть <strong>"На Домашній екран"</strong> <i class="fas fa-plus-square text-gray-600"></i></p>
                    </div>
                    <div class="flex items-start space-x-3">
                        <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                        <p>Натисніть <strong>"Додати"</strong> для завершення встановлення</p>
                    </div>
                </div>
                <div class="mt-6 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                        <i class="fas fa-info-circle mr-1"></i>
                        Після встановлення додаток з'явиться на домашньому екрані як звичайний додаток!
                    </p>
                </div>
                <button id="close-ios-modal" class="mt-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-md transition">
                    Зрозуміло
                </button>
            </div>
        </div>
    </div>

    <script>
        // Service Worker реєстрація
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful');
                }).catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }

        // PWA Install промпт
        let deferredPrompt;
        const installBtn = document.getElementById('install-btn');
        const iosInstallBtn = document.getElementById('ios-install-btn');
        const iosModal = document.getElementById('ios-modal');
        const closeIosModal = document.getElementById('close-ios-modal');

        // Перевірка iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;

        if (isIOS && !isStandalone) {
            iosInstallBtn.classList.remove('hidden');
        }

        // PWA install event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (!isIOS) {
                installBtn.classList.remove('hidden');
            }
        });

        // Install button click
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.classList.add('hidden');
                }
                deferredPrompt = null;
            }
        });

        // iOS install button
        iosInstallBtn.addEventListener('click', () => {
            iosModal.classList.remove('hidden');
        });

        // Close iOS modal
        closeIosModal.addEventListener('click', () => {
            iosModal.classList.add('hidden');
        });

        iosModal.addEventListener('click', (e) => {
            if (e.target === iosModal) {
                iosModal.classList.add('hidden');
            }
        });

        // Hide buttons after install
        window.addEventListener('appinstalled', () => {
            installBtn.classList.add('hidden');
            iosInstallBtn.classList.add('hidden');
        });

        // Обробка перемикання вкладок
        document.addEventListener('DOMContentLoaded', () => {
            const tabButtons = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.dataset.tab;
                    
                    // Оновлення активної кнопки
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Перемикання контенту
                    tabContents.forEach(content => {
                        content.classList.add('hidden');
                    });
                    
                    const targetContent = document.getElementById(`${targetTab}-content`);
                    if (targetContent) {
                        targetContent.classList.remove('hidden');
                    }
                    
                    // Якщо натиснуто на "розклад" - тут буде логіка ініціалізації
                    if (targetTab === 'schedule') {
                        // TODO: Ініціалізація розкладу занять
                        //console.log('Ініціалізація розкладу занять');
                    }
                });
            });
        });
    </script>

    <script src="scripts/main.js?v=<?= $version ?>" type="module"></script>
</body>
</html>