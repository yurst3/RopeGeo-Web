/**
 * Landing page palette — values copied from Mobile `constants/colors/darkTheme`.
 * Subset of tokens used on the marketing site; keep in sync when the app theme changes.
 */
export const darkTheme = {
    background: '#111111',
    cardHighlight: '#333333',
    placeholder: '#262626',
    separator: '#404040',
    starRating: '#dc732b',
    loadingIndicator: '#ffffff',
    text: {
        primary: '#ffffff',
        secondary: '#d1d5db',
        tertiary: '#9ca3af',
        link: '#dc732b',
        error: '#dc2626',
    },
    image: {
        textBackground: 'rgba(0,0,0,0.55)',
        text: '#ffffff',
        missingIcon: '#ffffff',
        missingText: '#ffffff',
        background: '#262626',
        blurOverlay: 'rgba(0,0,0,0.38)',
    },
    tabBar: {
        background: '#000000',
        iconUnfocused: '#ffffff',
        iconFocused: '#dc732b',
        iconHighlight: '#4ade80',
    },
    searchBar: {
        background: '#000000',
        shadow: '#ffffff',
        icon: '#ffffff',
    },
    badge: {
        border: '#ffffff',
        relevanceStrength: {
            'Maybe Relevant': {
                background: '#b45309',
                icon: '#ffffff',
            },
            'Somewhat Relevant': {
                background: '#ca8a04',
                icon: '#ffffff',
            },
            'Definitely Relevant': {
                background: '#166534',
                icon: '#ffffff',
            },
        },
    },
} as const;
