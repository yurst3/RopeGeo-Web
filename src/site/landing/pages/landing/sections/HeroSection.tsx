import { Image, StyleSheet, Text, View } from 'react-native';

import { StoreLink } from '../../../components/StoreLink';
import { darkTheme as colors } from '../../../constants/darkTheme';

const APP_NAME = 'RopeGeo';

const APP_STORE_URL = 'https://apps.apple.com/app/ropegeo/id6774801105';
const PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=com.yurst3.RopeGeo';
const DISCORD_URL = 'https://discord.gg/hqKB3RWEaP';

const DESCRIPTION =
    'RopeGeo is an app that aggregates publicly available routes for canyoneering and technical hiking. Most of these routes require technical rope work and are somewhat (or very) dangerous. Please be responsible and exercise caution if you follow any of these routes!';

export function HeroSection() {
    return (
        <View style={styles.hero}>
            <Image
                source={require('../../../assets/logos/ropeGeo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel={`${APP_NAME} logo`}
            />
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.description}>{DESCRIPTION}</Text>
            <View style={styles.storeLinks}>
                <StoreLink
                    label="App Store"
                    source={require('../../../assets/logos/appStore.png')}
                    url={APP_STORE_URL}
                    accessibilityLabel="Download on the App Store"
                />
                <StoreLink
                    label="Google Play"
                    source={require('../../../assets/logos/googlePlay.png')}
                    url={PLAY_STORE_URL}
                    accessibilityLabel="Get it on Google Play"
                />
                <StoreLink
                    label="Discord"
                    source={require('../../../assets/logos/discord.jpg')}
                    url={DISCORD_URL}
                    accessibilityLabel="Join the RopeGeo Discord server"
                    roundIcon
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
