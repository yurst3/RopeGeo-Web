export type WebRoute =
    | 'home'
    | 'privacy'
    | 'documentation'
    | 'documentation-ropewikiscraper'
    | 'documentation-ropewikipageprocessor'
    | 'documentation-mapdataprocessor';

export function getWebRoute(): WebRoute {
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

    if (
        path === '/documentation/ropewikiscraper' ||
        path === '/documentation/ropewikiscraper/' ||
        path === '/documentation/ropewikiscraper.html' ||
        path.endsWith('/documentation/ropewikiscraper/index.html')
    ) {
        return 'documentation-ropewikiscraper';
    }

    if (
        path === '/documentation/ropewikipageprocessor' ||
        path === '/documentation/ropewikipageprocessor/' ||
        path === '/documentation/ropewikipageprocessor.html' ||
        path.endsWith('/documentation/ropewikipageprocessor/index.html')
    ) {
        return 'documentation-ropewikipageprocessor';
    }

    if (
        path === '/documentation/mapdataprocessor' ||
        path === '/documentation/mapdataprocessor/' ||
        path === '/documentation/mapdataprocessor.html' ||
        path.endsWith('/documentation/mapdataprocessor/index.html')
    ) {
        return 'documentation-mapdataprocessor';
    }

    if (
        path === '/documentation' ||
        path === '/documentation/' ||
        path === '/documentation.html' ||
        path.endsWith('/documentation/index.html')
    ) {
        return 'documentation';
    }

    return 'home';
}

export function openPrivacyPolicy() {
    if (typeof window !== 'undefined') {
        window.location.href = '/privacy.html';
    }
}

export function openDocumentation() {
    if (typeof window !== 'undefined') {
        window.location.href = '/documentation.html';
    }
}

export function openDocumentationSection(sectionId: string) {
    if (typeof window !== 'undefined') {
        window.location.href = `/documentation.html#${sectionId}`;
    }
}

export function openRopewikiScraperDocumentation() {
    if (typeof window !== 'undefined') {
        window.location.href = '/documentation/ropewikiscraper.html';
    }
}

export function openRopewikiPageProcessorDocumentation() {
    if (typeof window !== 'undefined') {
        window.location.href = '/documentation/ropewikipageprocessor.html';
    }
}

export function openMapDataProcessorDocumentation() {
    if (typeof window !== 'undefined') {
        window.location.href = '/documentation/mapdataprocessor.html';
    }
}

export function openHome() {
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
}

export function scrollToSection(sectionId: string) {
    if (typeof document === 'undefined') {
        return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (typeof window !== 'undefined' && window.history?.replaceState) {
            window.history.replaceState(null, '', `#${sectionId}`);
        }
    }
}
