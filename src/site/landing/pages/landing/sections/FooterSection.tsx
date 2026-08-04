import { Pressable, StyleSheet, Text, View } from 'react-native';

import { darkTheme as colors } from '../../../constants/darkTheme';
import { openPrivacyPolicy } from '../../../utils/routing';

export function FooterSection() {
    return (
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
            <Text style={styles.copyright}>© 2026 Ethan Hurst</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
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
    copyright: {
        fontSize: 13,
        color: colors.text.tertiary,
        paddingVertical: 4,
    },
});
