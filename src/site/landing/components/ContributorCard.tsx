import type { ReactNode } from 'react';
import {
    Image,
    type ImageSourcePropType,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { darkTheme as colors } from '../constants/darkTheme';
import { SocialLinkPill } from './SocialLinkPill';

const PROFILE_PHOTO_SIZE = 140;

export type ContributorSocialLink = {
    id: string;
    label: string;
    url: string;
    logo: ImageSourcePropType;
};

export function ContributorCard({
    name,
    title,
    photo,
    description,
    designedWork,
    socialLinks,
}: {
    name: string;
    title: string;
    photo: ImageSourcePropType;
    description: string;
    designedWork?: ReactNode;
    socialLinks: readonly ContributorSocialLink[];
}) {
    return (
        <View style={styles.contributorCard}>
            <View style={styles.contributorTitleBlock}>
                <Text style={styles.contributorName}>{name}</Text>
                <Text style={styles.contributorRole}>{title}</Text>
            </View>

            <View style={styles.contributorPhotoRow}>
                <View style={styles.contributorPhotoColumn}>
                    <Image
                        source={photo}
                        style={styles.contributorPhoto}
                        resizeMode="cover"
                        accessibilityLabel={`${name} profile photo`}
                    />
                    {socialLinks.length > 0 ? (
                        <View style={styles.contributorSocialLinks}>
                            {socialLinks.map((link) => (
                                <SocialLinkPill
                                    key={link.id}
                                    label={link.label}
                                    url={link.url}
                                    logo={link.logo}
                                />
                            ))}
                        </View>
                    ) : null}
                </View>

                <View style={styles.contributorDescriptionColumn}>
                    <View style={styles.contributorDescriptionBody}>
                        <Text style={styles.contributorDescription}>
                            {description}
                        </Text>
                        {designedWork != null ? (
                            <View style={styles.designedWork}>
                                {designedWork}
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contributorCard: {
        gap: 12,
    },
    contributorTitleBlock: {
        alignItems: 'center',
        gap: 2,
        width: PROFILE_PHOTO_SIZE,
        alignSelf: 'flex-start',
    },
    contributorName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        textAlign: 'center',
    },
    contributorRole: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text.secondary,
        textAlign: 'center',
    },
    contributorPhotoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 24,
    },
    contributorPhotoColumn: {
        width: PROFILE_PHOTO_SIZE,
        alignItems: 'center',
        gap: 12,
    },
    contributorPhoto: {
        width: PROFILE_PHOTO_SIZE,
        height: PROFILE_PHOTO_SIZE,
        borderRadius: PROFILE_PHOTO_SIZE / 2,
        backgroundColor: colors.image.background,
        borderWidth: 2,
        borderColor: colors.separator,
    },
    contributorSocialLinks: {
        width: PROFILE_PHOTO_SIZE,
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
    },
    contributorDescriptionColumn: {
        flex: 1,
        minWidth: 260,
        height: PROFILE_PHOTO_SIZE,
        justifyContent: 'center',
    },
    contributorDescriptionBody: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 16,
    },
    contributorDescription: {
        flexShrink: 1,
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
    designedWork: {
        flexShrink: 0,
        alignItems: 'flex-start',
    },
});
