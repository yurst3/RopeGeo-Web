import { StyleSheet, Text, View, Image } from 'react-native';

export default function App() {
    return (
        <View style={styles.root}>
            <Text style={styles.tagline}>Ur gay lol</Text>
            <View style={styles.imageContainer}>
                <Image
                    source={require('./assets/test.avif')}
                    style={styles.image}
                    resizeMode="contain"
                    accessibilityLabel="Person in a desert landscape holding a large circular bone in a playful pose."
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    tagline: {
        fontSize: 18,
        lineHeight: 26,
        color: '#e2e8f0',
        maxWidth: 520,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        minHeight: 0,
    },
    image: {
        flex: 1,
        width: '100%',
        minHeight: 0,
    },
});
