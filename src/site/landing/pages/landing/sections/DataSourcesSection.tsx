import { StyleSheet, Text, View } from 'react-native';

import { DataSourceLink } from '../../../components/DataSourceLink';
import { darkTheme as colors } from '../../../constants/darkTheme';

const DATA_SOURCES = [
    {
        id: 'ropewiki',
        name: 'RopeWiki',
        url: 'https://ropewiki.com',
        logo: require('../../../assets/logos/ropewiki.png'),
        whiteCircleBackground: true,
    },
] as const;

export function DataSourcesSection() {
    return (
        <View style={styles.section}>
            <Text style={styles.description}>
                Thank you to the following websites for providing access to
                their data!
            </Text>
            <View style={styles.list}>
                {DATA_SOURCES.map((source) => (
                    <DataSourceLink
                        key={source.id}
                        name={source.name}
                        url={source.url}
                        logo={source.logo}
                        whiteCircleBackground={source.whiteCircleBackground}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    list: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
        marginTop: 4,
    },
});
