import { ScrollView, StyleSheet, View } from 'react-native';

import { darkTheme as colors } from '../../constants/darkTheme';
import { AboutAuthorSection } from './sections/AboutAuthorSection';
import { ContributorsSection } from './sections/ContributorsSection';
import { DataSourcesSection } from './sections/DataSourcesSection';
import { FooterSection } from './sections/FooterSection';
import { HeroSection } from './sections/HeroSection';
import { ScreenshotsSection } from './sections/ScreenshotsSection';

export function LandingPage() {
    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                <HeroSection />
                <DataSourcesSection />
                <ScreenshotsSection />
                <AboutAuthorSection />
                <ContributorsSection />
                <FooterSection />
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
        maxWidth: 960,
        alignSelf: 'center',
        paddingHorizontal: 24,
        gap: 48,
    },
});
