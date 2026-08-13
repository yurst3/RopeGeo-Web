import { StyleSheet, Text, View } from 'react-native';

import { ScreenshotGallery } from '../../../components/ScreenshotGallery';
import { darkTheme as colors } from '../../../constants/darkTheme';

const SCREENSHOTS = [
    {
        source: require('../../../assets/screenshots/ropegeo/RopegeoExplore.png'),
        label: 'Explore map with route markers',
    },
    {
        source: require('../../../assets/screenshots/ropegeo/RopegeoSearch.png'),
        label: 'Search for routes and regions',
    },
    {
        source: require('../../../assets/screenshots/ropegeo/RopegeoRegion.png'),
        label: 'Region overview',
    },
    {
        source: require('../../../assets/screenshots/ropegeo/RopegeoPage.png'),
        label: 'Route page with map and details',
    },
    {
        source: require('../../../assets/screenshots/ropegeo/RopegeoMinimap.png'),
        label: 'Minimap on a route page',
    },
] as const;

export function ScreenshotsSection() {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screenshots</Text>
            <ScreenshotGallery shots={SCREENSHOTS} />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.text.primary,
    },
});
