export function getWebRoute(): 'home' | 'privacy' {
    if (typeof window === 'undefined') {
        return 'home';
    }

    const path = window.location.pathname.toLowerCase();
    if (
        path === '/privacy' ||
        path === '/privacy/' ||
        path === '/privacy.html' ||
        path.endsWith('/privacy/index.html')
    ) {
        return 'privacy';
    }

    return 'home';
}

export function openPrivacyPolicy() {
    if (typeof window !== 'undefined') {
        window.location.href = '/privacy.html';
    }
}

export function openHome() {
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
}
