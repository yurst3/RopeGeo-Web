import { StyleSheet, View } from 'react-native';

import { darkTheme as colors } from '../../constants/darkTheme';
import { Badge } from './Badge';

const BADGES = [
    {
        id: 'maybe',
        label: 'Maybe relevant',
        icon: require('../../assets/badges/relevance/maybe.png'),
        colors: colors.badge.relevanceStrength['Maybe Relevant'],
    },
    {
        id: 'somewhat',
        label: 'Somewhat relevant',
        icon: require('../../assets/badges/relevance/somewhat.png'),
        colors: colors.badge.relevanceStrength['Somewhat Relevant'],
    },
    {
        id: 'definitely',
        label: 'Definitely relevant',
        icon: require('../../assets/badges/relevance/definitely.png'),
        colors: colors.badge.relevanceStrength['Definitely Relevant'],
    },
] as const;

export function RelevantInfoBadges({
    size = 48,
    showLabels = false,
}: {
    size?: number;
    showLabels?: boolean;
} = {}) {
    return (
        <View style={styles.row}>
            {BADGES.map((badge) => (
                <Badge
                    key={badge.id}
                    icon={badge.icon}
                    backgroundColor={badge.colors.background}
                    iconColor={badge.colors.icon}
                    size={size}
                    label={showLabels ? badge.label : undefined}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 16,
    },
});
