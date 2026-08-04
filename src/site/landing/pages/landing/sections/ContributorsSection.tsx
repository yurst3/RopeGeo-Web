import { Image, StyleSheet, Text, View } from 'react-native';

import { RelevantInfoBadges } from '../../../components/badges/RelevantInfoBadges';
import { ContributorCard } from '../../../components/ContributorCard';
import { darkTheme as colors } from '../../../constants/darkTheme';

const DESIGNED_LOGO = require('../../../assets/logos/ropeGeo.png');

const CONTRIBUTORS = [
    {
        id: 'suzy-hludzinski',
        name: 'Suzy Hludzinski',
        title: 'Graphic Designer',
        photo: require('../../../assets/profilePics/suzyHludzinski.jpeg'),
        description: 'For designing the RopeGeo logo.',
        socialLinks: [],
        designedWork: 'logo' as const,
    },
    {
        id: 'mikell-johnson',
        name: 'Mikell Johnson',
        title: 'Graphic Designer',
        photo: require('../../../assets/profilePics/mikellJonson.jpeg'),
        description: 'For designing the Relevant Info icons.',
        socialLinks: [
            {
                id: 'linkedin',
                label: 'LinkedIn',
                url: 'https://www.linkedin.com/in/mikelljohnson/',
                logo: require('../../../assets/logos/linkedin.png'),
            },
            {
                id: 'flickr',
                label: 'flickr',
                url: 'https://flic.kr/s/aHsjyNfdEp',
                logo: require('../../../assets/logos/flickr.png'),
            },
        ],
        designedWork: 'relevantInfoBadges' as const,
    },
] as const;

function DesignedWork({ kind }: { kind: (typeof CONTRIBUTORS)[number]['designedWork'] }) {
    if (kind === 'logo') {
        return (
            <Image
                source={DESIGNED_LOGO}
                style={styles.designedLogo}
                resizeMode="contain"
                accessibilityLabel="RopeGeo logo"
            />
        );
    }

    return <RelevantInfoBadges />;
}

export function ContributorsSection() {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>
                Thank you to the following contributors
            </Text>
            <View style={styles.contributorList}>
                {CONTRIBUTORS.map((contributor) => (
                    <ContributorCard
                        key={contributor.id}
                        name={contributor.name}
                        title={contributor.title}
                        photo={contributor.photo}
                        description={contributor.description}
                        designedWork={
                            <DesignedWork kind={contributor.designedWork} />
                        }
                        socialLinks={contributor.socialLinks}
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
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.text.primary,
        textAlign: 'center',
    },
    contributorList: {
        gap: 32,
    },
    designedLogo: {
        width: 72,
        height: 72,
        borderRadius: 16,
        overflow: 'hidden',
    },
});
