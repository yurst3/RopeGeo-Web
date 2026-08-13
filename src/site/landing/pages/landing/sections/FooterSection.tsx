import { Pressable, StyleSheet, Text, View } from 'react-native';

import { darkTheme as colors } from '../../../constants/darkTheme';
import {
    openDocumentation,
    openPrivacyPolicy,
} from '../../../utils/routing';

export function FooterSection() {
    return (
        <View style={styles.footer}>
            <View style={styles.footerLinks}>
                <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Documentation"
                    onPress={openDocumentation}
                    style={({ pressed }) => [
                        styles.footerLink,
                        pressed && styles.footerLinkPressed,
                    ]}
                >
                    <Text style={styles.footerLinkText}>Documentation</Text>
                </Pressable>
                <Text style={styles.footerLinkSeparator} accessibilityElementsHidden>
                    ·
                </Text>
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
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    footerLink: {
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    footerLinkPressed: {
        opacity: 0.75,
    },
    footerLinkText: {
        fontSize: 14,
        color: colors.text.tertiary,
        textDecorationLine: 'underline',
    },
    footerLinkSeparator: {
        fontSize: 14,
        color: colors.text.tertiary,
        paddingHorizontal: 2,
    },
    copyright: {
        fontSize: 13,
        color: colors.text.tertiary,
        paddingVertical: 4,
    },
});
