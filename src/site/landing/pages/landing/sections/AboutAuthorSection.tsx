import { StyleSheet, Text, View } from 'react-native';

import { ContributorCard } from '../../../components/ContributorCard';
import { darkTheme as colors } from '../../../constants/darkTheme';

const ABOUT_AUTHOR = `
    My name is Ethan Hurst, I'm a software engineer from Utah who enjoys technical hiking and canyoneering. In October of 2025 I quit my job to begin working on an idea I had: What if there was an app like AllTrails but for canyoneering? That idea turned into RopeGeo. 
    
    RopeGeo is my passion project - it will always be free and open source, I will never include any payed features or advertisements. If you are interested in contributing please join the RopeGeo discord server and message me! You don't need to be a software engineer, I'm happy to mentor you on any topics you're interested in.
    `;

const SOCIAL_LINKS = [
    {
        id: 'linkedin',
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/ethan-hurst/',
        logo: require('../../../assets/logos/linkedin.png'),
    },
    {
        id: 'github',
        label: 'GitHub',
        url: 'https://github.com/yurst3',
        logo: require('../../../assets/logos/github.png'),
        logoTintColor: colors.text.primary,
    },
] as const;

export function AboutAuthorSection() {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Author</Text>
            <ContributorCard
                name="Ethan Hurst"
                title="Software Engineer"
                photo={require('../../../assets/profilePics/ethanHurst.png')}
                description={ABOUT_AUTHOR}
                socialLinks={SOCIAL_LINKS}
                centerDescriptionWithPhoto={false}
            />
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
});
