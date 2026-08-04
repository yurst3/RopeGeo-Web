import {
    Image,
    type ImageSourcePropType,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { darkTheme as colors } from '../../constants/darkTheme';

export const DEFAULT_BADGE_SIZE = 56;

const ICON_SCALE_FACTOR = 0.6 * 1.25;

export function Badge({
    icon,
    backgroundColor,
    size = DEFAULT_BADGE_SIZE,
    iconScale = 1,
    label,
    iconColor,
    borderColor = colors.badge.border,
    outline = true,
}: {
    icon: ImageSourcePropType;
    backgroundColor: string;
    size?: number;
    iconScale?: number;
    label?: string;
    iconColor?: string;
    borderColor?: string;
    outline?: boolean;
}) {
    const iconSize = Math.round(size * ICON_SCALE_FACTOR * iconScale);

    const circle = (
        <View
            style={[
                styles.mainCircle,
                outline ? [styles.mainCircleOutline, { borderColor }] : null,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                },
            ]}
        >
            <Image
                source={icon}
                style={{ width: iconSize, height: iconSize, tintColor: iconColor }}
                resizeMode="contain"
                accessibilityElementsHidden
                importantForAccessibility="no"
            />
        </View>
    );

    if (label == null || label === '') {
        return circle;
    }

    return (
        <View style={[styles.withLabel, { width: size + 16 }]}>
            {circle}
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    withLabel: {
        alignItems: 'center',
        alignSelf: 'center',
        maxWidth: '100%',
    },
    label: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 16,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    mainCircle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCircleOutline: {
        borderWidth: 1.5,
    },
});
