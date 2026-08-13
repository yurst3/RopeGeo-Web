import { StyleSheet, Text } from 'react-native';

import { darkTheme as colors } from '../../../constants/darkTheme';
import { openUrl } from '../../../utils/openUrl';

export type FolderLink = { text: string; path: string };
export type ExternalLink = { text: string; url: string };
export type RichPart = string | FolderLink | ExternalLink;
export type RichParagraph = RichPart[];

export function folder(text: string, path: string): FolderLink {
    return { text, path };
}

export function link(text: string, url: string): ExternalLink {
    return { text, url };
}

export function treeUrl(
    repoUrl: string,
    branch: string,
    path: string
): string {
    return `${repoUrl}/tree/${branch}/${path}`;
}

export function RichTextParagraph({
    parts,
    githubUrl,
    defaultBranch,
}: {
    parts: RichParagraph;
    githubUrl?: string;
    defaultBranch?: string;
}) {
    return (
        <Text style={styles.paragraph}>
            {parts.map((part, index) => {
                if (typeof part === 'string') {
                    return <Text key={index}>{part}</Text>;
                }

                const href =
                    'url' in part
                        ? part.url
                        : treeUrl(
                              githubUrl ?? '',
                              defaultBranch ?? '',
                              part.path
                          );
                return (
                    <Text
                        key={index}
                        accessibilityRole="link"
                        accessibilityLabel={`Open ${part.text}`}
                        style={styles.inlineLink}
                        onPress={() => openUrl(href)}
                    >
                        {part.text}
                    </Text>
                );
            })}
        </Text>
    );
}

const styles = StyleSheet.create({
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
    inlineLink: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.link,
        textDecorationLine: 'underline',
    },
});
