import {
    Image,
    type ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { darkTheme as colors } from '../constants/darkTheme';
import { openUrl } from '../utils/openUrl';

export function StoreLink({
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

const styles = StyleSheet.create({
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
});
