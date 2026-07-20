import {
    Image,
    type ImageSourcePropType,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { darkTheme as colors } from './constants/darkTheme';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { ScreenshotGallery } from './ScreenshotGallery';

function getWebRoute(): 'home' | 'privacy' {
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

function openPrivacyPolicy() {
    if (typeof window !== 'undefined') {
        window.location.href = '/privacy.html';
    }
}

const APP_NAME = 'RopeGeo';

const APP_STORE_URL = 'https://apps.apple.com/app/ropegeo/id6774801105';
const PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=com.yurst3.RopeGeo';
const DISCORD_URL = 'https://discord.gg/hqKB3RWEaP';

const PLACEHOLDER_DESCRIPTION =
    'RopeGeo is an app that aggregates publicly available routes for canyoneering and technical hiking. Most of these routes require technical rope work and are somewhat (or very) dangerous. Please be responsible and exercise caution if you follow any of these routes!'
const PLACEHOLDER_ABOUT_AUTHOR =`
    My name is Ethan Hurst, I\'m a software engineer from Utah who enjoys technical hiking and canyoneering. In October of 2025 I quit my job to begin working on an idea I had: What if there was an app like AllTrails but for canyoneering? That idea turned into RopeGeo. 
    
    RopeGeo is my passion project - it will always be free and open source, I will never include any payed features or advertisements. If you are interested in contributing please join the RopeGeo discord server and message me! You don't need to be a software engineer, I'm happy to mentor you on any topics you're interested in.
    `;

const SCREENSHOTS = [
    {
        source: require('./assets/RopegeoExplore.png'),
        label: 'Explore map with route markers',
    },
    {
        source: require('./assets/RopegeoSearch.png'),
        label: 'Search for routes and regions',
    },
    {
        source: require('./assets/RopegeoRegion.png'),
        label: 'Region overview',
    },
    {
        source: require('./assets/RopegeoPage.png'),
        label: 'Route page with map and details',
    },
    {
        source: require('./assets/RopegeoMinimap.png'),
        label: 'Minimap on a route page',
    },
] as const;

const DATA_SOURCES = [
    {
        id: 'ropewiki',
        name: 'RopeWiki',
        url: 'https://ropewiki.com',
        logo: require('./assets/ropewiki.png'),
        whiteCircleBackground: true,
    },
] as const;

function openUrl(url: string) {
    void Linking.openURL(url);
}

function StoreLink({
    label,
    source,
    url,
    accessibilityLabel,
    roundIcon = false,
}: {
    label: string;
    source: ImageSourcePropType;
    url: string;
    accessibilityLabel: string;
    roundIcon?: boolean;
}) {
    return (
        <Pressable
            accessibilityRole="link"
            accessibilityLabel={accessibilityLabel}
            onPress={() => openUrl(url)}
            style={({ pressed }) => [
                styles.storeLink,
                pressed && styles.storeLinkPressed,
            ]}
        >
            <View style={styles.storeLinkContent}>
                <Image
                    source={source}
                    style={[
                        styles.storeBadge,
                        roundIcon && styles.storeBadgeRounded,
                    ]}
                    resizeMode={roundIcon ? 'cover' : 'contain'}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                />
                <Text style={styles.storeLinkText}>{label}</Text>
            </View>
        </Pressable>
    );
}

function DataSourceLink({
    name,
    url,
    logo,
    whiteCircleBackground,
}: {
    name: string;
    url: string;
    logo: ImageSourcePropType;
    whiteCircleBackground?: boolean;
}) {
    return (
        <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Visit ${name}`}
            onPress={() => openUrl(url)}
            style={({ pressed }) => [
                styles.dataSourceLink,
                pressed && styles.dataSourceLinkPressed,
            ]}
        >
            <View
                style={[
                    styles.dataSourceLogoFrame,
                    whiteCircleBackground && styles.dataSourceLogoWhiteCircle,
                ]}
            >
                <Image
                    source={logo}
                    style={styles.dataSourceLogo}
                    resizeMode="contain"
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                />
            </View>
        </Pressable>
    );
}

function LandingHome() {
    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                <View style={styles.hero}>
                    <Image
                        source={require('./assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                        accessibilityLabel={`${APP_NAME} logo`}
                    />
                    <Text style={styles.appName}>{APP_NAME}</Text>
                    <Text style={styles.description}>
                        {PLACEHOLDER_DESCRIPTION}
                    </Text>
                    <View style={styles.storeLinks}>
                        <StoreLink
                            label="App Store"
                            source={require('./assets/appStore.png')}
                            url={APP_STORE_URL}
                            accessibilityLabel="Download on the App Store"
                        />
                        <StoreLink
                            label="Google Play"
                            source={require('./assets/googlePlay.png')}
                            url={PLAY_STORE_URL}
                            accessibilityLabel="Get it on Google Play"
                        />
                        <StoreLink
                            label="Discord"
                            source={require('./assets/discord.jpg')}
                            url={DISCORD_URL}
                            accessibilityLabel="Join the RopeGeo Discord server"
                            roundIcon
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.dataSourcesDescription}>
                        Thank you to the following websites for providing access to their data!
                    </Text>
                    <View style={styles.dataSourceList}>
                        {DATA_SOURCES.map((source) => (
                            <DataSourceLink
                                key={source.id}
                                name={source.name}
                                url={source.url}
                                logo={source.logo}
                                whiteCircleBackground={
                                    source.whiteCircleBackground
                                }
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Screenshots</Text>
                    <ScreenshotGallery shots={SCREENSHOTS} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About the Author</Text>
                    <View style={styles.authorRow}>
                        <Image
                            source={require('./assets/author.png')}
                            style={styles.authorPhoto}
                            resizeMode="cover"
                            accessibilityLabel="Author photo"
                        />
                        <Text style={styles.aboutText}>
                            {PLACEHOLDER_ABOUT_AUTHOR}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="link"
                        accessibilityLabel="Privacy Policy"
                        onPress={openPrivacyPolicy}
                        style={({ pressed }) => [
                            styles.footerLink,
                            pressed && styles.footerLinkPressed,
                        ]}
                    >
                        <Text style={styles.footerLinkText}>Privacy Policy</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

export default function App() {
    return getWebRoute() === 'privacy' ? (
        <PrivacyPolicyScreen />
    ) : (
        <LandingHome />
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 32,
        paddingBottom: 48,
    },
    content: {
        width: '100%',
        maxWidth: 960,
        alignSelf: 'center',
        paddingHorizontal: 24,
        gap: 48,
    },
    hero: {
        alignItems: 'center',
        gap: 16,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 28,
        overflow: 'hidden',
    },
    appName: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 18,
        lineHeight: 28,
        color: colors.text.secondary,
        textAlign: 'center',
        maxWidth: 640,
    },
    storeLinks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 8,
    },
    storeLink: {
        backgroundColor: colors.tabBar.background,
        borderWidth: 1,
        borderColor: colors.separator,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
        minWidth: 140,
        alignItems: 'center',
    },
    storeLinkPressed: {
        backgroundColor: colors.cardHighlight,
    },
    storeLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    storeBadge: {
        height: 24,
        width: 24,
    },
    storeBadgeRounded: {
        borderRadius: 6,
        overflow: 'hidden',
    },
    storeLinkText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.link,
    },
    section: {
        gap: 16,
    },
    dataSourcesDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    dataSourceList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
        marginTop: 4,
    },
    dataSourceLink: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dataSourceLinkPressed: {
        opacity: 0.75,
    },
    dataSourceLogoFrame: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dataSourceLogoWhiteCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ffffff',
        padding: 12,
    },
    dataSourceLogo: {
        width: 48,
        height: 48,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.text.primary,
    },
    authorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        alignItems: 'flex-start',
    },
    authorPhoto: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.image.background,
        borderWidth: 2,
        borderColor: colors.separator,
    },
    aboutText: {
        flex: 1,
        minWidth: 260,
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
    footer: {
        alignItems: 'center',
        marginTop: 8,
    },
    footerLink: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    footerLinkPressed: {
        opacity: 0.75,
    },
    footerLinkText: {
        fontSize: 14,
        color: colors.text.tertiary,
        textDecorationLine: 'underline',
    },
});
