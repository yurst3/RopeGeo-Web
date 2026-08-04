import {
    Image,
    type ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { darkTheme as colors } from '../constants/darkTheme';
import { openUrl } from '../utils/openUrl';

export function SocialLinkPill({
    label,
    url,
    logo,
}: {
    label: string;
    url: string;
    logo: ImageSourcePropType;
}) {
    const hasUrl = url.trim().length > 0;

    return (
        <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${label}${hasUrl ? '' : ' (link coming soon)'}`}
            disabled={!hasUrl}
            onPress={() => {
                if (hasUrl) {
                    openUrl(url);
                }
            }}
            style={({ pressed }) => [
                styles.socialPill,
                pressed && hasUrl && styles.socialPillPressed,
                !hasUrl && styles.socialPillDisabled,
            ]}
        >
            <Text style={styles.socialPillText}>{label}</Text>
            <Image
                source={logo}
                style={styles.socialPillLogo}
                resizeMode="contain"
                accessibilityElementsHidden
                importantForAccessibility="no"
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    socialPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
        gap: 8,
        backgroundColor: colors.tabBar.background,
        borderWidth: 1,
        borderColor: colors.separator,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    socialPillPressed: {
        backgroundColor: colors.cardHighlight,
    },
    socialPillDisabled: {
        opacity: 0.65,
    },
    socialPillLogo: {
        width: 18,
        height: 18,
        borderRadius: 4,
        overflow: 'hidden',
    },
    socialPillText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text.link,
    },
});
