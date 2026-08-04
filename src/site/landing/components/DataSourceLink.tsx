import {
    Image,
    type ImageSourcePropType,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

import { openUrl } from '../utils/openUrl';

export function DataSourceLink({
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

const styles = StyleSheet.create({
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
});
