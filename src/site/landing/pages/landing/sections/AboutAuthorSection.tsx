import { Image, StyleSheet, Text, View } from 'react-native';

import { darkTheme as colors } from '../../../constants/darkTheme';

const ABOUT_AUTHOR = `
    My name is Ethan Hurst, I'm a software engineer from Utah who enjoys technical hiking and canyoneering. In October of 2025 I quit my job to begin working on an idea I had: What if there was an app like AllTrails but for canyoneering? That idea turned into RopeGeo. 
    
    RopeGeo is my passion project - it will always be free and open source, I will never include any payed features or advertisements. If you are interested in contributing please join the RopeGeo discord server and message me! You don't need to be a software engineer, I'm happy to mentor you on any topics you're interested in.
    `;

export function AboutAuthorSection() {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Author</Text>
            <View style={styles.authorRow}>
                <Image
                    source={require('../../../assets/profilePics/ethanHurst.png')}
                    style={styles.authorPhoto}
                    resizeMode="cover"
                    accessibilityLabel="Author photo"
                />
                <Text style={styles.aboutText}>{ABOUT_AUTHOR}</Text>
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
    },
    authorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        alignItems: 'flex-start',
    },
    authorPhoto: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.image.background,
        borderWidth: 2,
        borderColor: colors.separator,
    },
    aboutText: {
        flex: 1,
        minWidth: 260,
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
});
