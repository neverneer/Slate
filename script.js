document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js');
        });
    }

    const navHome = document.getElementById('nav-home');
    const navDashboard = document.getElementById('nav-dashboard');
    const authBtn = document.getElementById('auth-btn');
    const landingPage = document.getElementById('landing-page');
    const dashboard = document.getElementById('dashboard');
    const feedItems = document.getElementById('feed-items');
    const notificationItems = document.getElementById('notification-items');
    const userTier = document.getElementById('user-tier');

    let isLoggedIn = false;

    const toggleView = (view) => {
        if (view === 'dashboard') {
            landingPage.classList.add('hidden');
            dashboard.classList.remove('hidden');
        } else {
            landingPage.classList.remove('hidden');
            dashboard.classList.add('hidden');
        }
    };

    const fetchFeed = async () => {
        // Mocking API call for feed
        const mockFeed = [
            { title: 'Slate Live: New Event!', content: 'Join us for the Slate global launch event.', type: 'announcement' },
            { title: 'Product Update', content: 'Slate ID now supports biometric authentication.', type: 'update' },
            { title: 'Community Post', content: 'How I use Slate Vault to organize my life.', type: 'post' }
        ];

        feedItems.innerHTML = mockFeed.map(item => `
            <div class="feed-item">
                <span class="badge">${item.type}</span>
                <h4>${item.title}</h4>
                <p>${item.content}</p>
            </div>
        `).join('');
    };

    const fetchNotifications = async () => {
        // Mocking API call for notifications
        const mockNotifications = [
            { title: 'Welcome', message: 'Your Slate ID is ready.', type: 'info' },
            { title: 'Subscription', message: 'Your Free trial is active.', type: 'success' }
        ];

        notificationItems.innerHTML = mockNotifications.map(item => `
            <div class="notification-item">
                <strong>${item.title}</strong>: ${item.message}
            </div>
        `).join('');
    };

    authBtn.addEventListener('click', () => {
        isLoggedIn = !isLoggedIn;
        if (isLoggedIn) {
            authBtn.textContent = 'Sign Out';
            navDashboard.classList.remove('hidden');
            toggleView('dashboard');
            fetchFeed();
            fetchNotifications();
        } else {
            authBtn.textContent = 'Sign In';
            navDashboard.classList.add('hidden');
            toggleView('home');
        }
    });

    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        toggleView('home');
    });

    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn) {
            toggleView('dashboard');
        }
    });
});
