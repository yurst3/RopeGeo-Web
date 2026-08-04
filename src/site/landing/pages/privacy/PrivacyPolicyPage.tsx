import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { darkTheme as colors } from '../../constants/darkTheme';
import { openHome } from '../../utils/routing';

const CONTACT_EMAIL = '4lrce4@gmail.com';
const LAST_UPDATED = 'May 31, 2026';

type Section = {
    title: string;
    paragraphs: string[];
    bullets?: string[];
};

const SECTIONS: Section[] = [
    {
        title: 'Introduction',
        paragraphs: [
            'RopeGeo ("we," "our," or "us") is a free mobile app for exploring canyoneering and technical hiking routes. This Privacy Policy explains how the RopeGeo app and the ropegeo.com website handle information when you use our services.',
            'RopeGeo is developed by Ethan Hurst. The app is free, open source, and does not include advertisements or paid features.',
        ],
    },
    {
        title: 'Information We Collect',
        paragraphs: [
            'RopeGeo does not require an account. We do not ask for your name, email address, or other contact information inside the app.',
            'Depending on how you use the app, the following information may be processed:',
        ],
        bullets: [
            'Precise location (optional): If you grant permission, the app uses your device location to show your position on the map and to center map views. If you choose distance-based search sorting, your latitude and longitude may be sent to RopeGeo servers to rank search results by distance from you.',
            'App content requests: When you browse routes, regions, maps, or images, the app requests publicly available outdoor route data from RopeGeo servers. These requests may include search terms, filter settings, pagination cursors, and—when you use distance sorting—your current coordinates.',
            'Information stored on your device: The app may save your saved pages, saved search filters, and downloaded offline content locally on your device using on-device storage. This data stays on your device unless you remove it.',
        ],
    },
    {
        title: 'How We Use Information',
        paragraphs: [
            'We use information only to operate and improve RopeGeo, including to:',
        ],
        bullets: [
            'Display maps and route information',
            'Show your location on the map when you allow it',
            'Provide search and filtering, including optional distance-based ranking',
            'Download and store offline content you request',
            'Maintain and improve app reliability and performance',
        ],
    },
    {
        title: 'What We Do Not Do',
        paragraphs: ['RopeGeo is designed with privacy in mind. We do not:'],
        bullets: [
            'Sell your personal information',
            'Use your data for advertising or cross-app tracking',
            'Require you to create an account',
            'Collect payment information (the app is free)',
        ],
    },
    {
        title: 'Third-Party Services',
        paragraphs: [
            'RopeGeo uses Mapbox to display maps. When maps load, Mapbox may process device and usage information according to Mapbox’s privacy policy.',
            'Route and region information shown in the app may come from publicly available sources such as RopeWiki. When you view that content, your app requests it from RopeGeo servers, which in turn may retrieve publicly available data from those sources.',
            'If you follow external links from the app (for example, to a data source website, app store listing, or Discord), those third-party sites are governed by their own privacy policies.',
        ],
    },
    {
        title: 'Data Retention',
        paragraphs: [
            'Information stored locally on your device remains there until you delete the app or remove saved or downloaded content.',
            'Server-side logs and operational data, if any, are kept only as long as needed to operate, secure, and maintain the service.',
        ],
    },
    {
        title: 'Your Choices',
        paragraphs: [
            'You can deny or revoke location permission in your device settings. Without location access, you can still browse routes and regions, but map location features and distance-based search sorting will not be available.',
            'You can remove saved pages, filters, and offline downloads from within the app.',
        ],
    },
    {
        title: "Children's Privacy",
        paragraphs: [
            'RopeGeo is not directed at children under 13, and we do not knowingly collect personal information from children.',
        ],
    },
    {
        title: 'Changes to This Policy',
        paragraphs: [
            'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page.',
        ],
    },
    {
        title: 'Contact Us',
        paragraphs: [
            'If you have questions about this Privacy Policy or RopeGeo, contact us at:',
        ],
    },
];

function openEmail() {
    void Linking.openURL(`mailto:${CONTACT_EMAIL}`);
}

export function PrivacyPolicyPage() {
    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Back to RopeGeo home"
                    onPress={openHome}
                    style={({ pressed }) => [
                        styles.backLink,
                        pressed && styles.backLinkPressed,
                    ]}
                >
                    <Text style={styles.backLinkText}>← Back to RopeGeo</Text>
                </Pressable>

                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

                {SECTIONS.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.paragraphs.map((paragraph) => (
                            <Text key={paragraph} style={styles.paragraph}>
                                {paragraph}
                            </Text>
                        ))}
                        {section.bullets?.map((bullet) => (
                            <View key={bullet} style={styles.bulletRow}>
                                <Text style={styles.bulletMarker}>•</Text>
                                <Text style={styles.bulletText}>{bullet}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Email ${CONTACT_EMAIL}`}
                    onPress={openEmail}
                    style={({ pressed }) => [
                        styles.emailLink,
                        pressed && styles.emailLinkPressed,
                    ]}
                >
                    <Text style={styles.emailLinkText}>{CONTACT_EMAIL}</Text>
                </Pressable>
            </View>
        </ScrollView>
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
        maxWidth: 720,
        alignSelf: 'center',
        paddingHorizontal: 24,
        gap: 20,
    },
    backLink: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
    },
    backLinkPressed: {
        opacity: 0.75,
    },
    backLinkText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.link,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: colors.text.primary,
    },
    updated: {
        fontSize: 14,
        color: colors.text.tertiary,
        marginBottom: 8,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: 8,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
    bulletRow: {
        flexDirection: 'row',
        gap: 10,
        paddingLeft: 4,
    },
    bulletMarker: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
    bulletText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
    emailLink: {
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    emailLinkPressed: {
        opacity: 0.75,
    },
    emailLinkText: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.link,
        fontWeight: '600',
    },
});
