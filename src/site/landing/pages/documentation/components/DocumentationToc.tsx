import { Pressable, StyleSheet, Text, View } from 'react-native';

import { darkTheme as colors } from '../../../constants/darkTheme';
import {
    openDocumentationSection,
    openMapDataProcessorDocumentation,
    openRopewikiPageProcessorDocumentation,
    openRopewikiScraperDocumentation,
    scrollToSection,
} from '../../../utils/routing';

export type DocumentationTocPageId =
    | 'documentation'
    | 'ropewikiscraper'
    | 'ropewikipageprocessor'
    | 'mapdataprocessor';

type TocEntry = {
    id: string;
    name: string;
    kind: 'section' | 'page';
    indent?: boolean;
    openPage?: () => void;
};

const TOC_ENTRIES: TocEntry[] = [
    { id: 'overview', name: 'Overview', kind: 'section' },
    { id: 'how-to-contribute', name: 'How To Contribute', kind: 'section' },
    { id: 'mobile', name: 'Mobile', kind: 'section' },
    { id: 'webscraper', name: 'WebScraper', kind: 'section' },
    {
        id: 'ropewikiscraper',
        name: 'RopewikiScraper',
        kind: 'page',
        indent: true,
        openPage: openRopewikiScraperDocumentation,
    },
    {
        id: 'ropewikipageprocessor',
        name: 'RopewikiPageProcessor',
        kind: 'page',
        indent: true,
        openPage: openRopewikiPageProcessorDocumentation,
    },
    {
        id: 'mapdataprocessor',
        name: 'MapDataProcessor',
        kind: 'page',
        indent: true,
        openPage: openMapDataProcessorDocumentation,
    },
    { id: 'common', name: 'Common', kind: 'section' },
    { id: 'web', name: 'Web', kind: 'section' },
];

/**
 * Table of contents shared by the documentation page and its subpages.
 * Section entries scroll in place on the documentation page and navigate
 * back to it (with a hash) from subpages. The entry matching the current
 * subpage is underlined.
 */
export function DocumentationToc({
    currentPageId,
}: {
    currentPageId: DocumentationTocPageId;
}) {
    return (
        <View style={styles.toc}>
            <Text style={styles.tocTitle}>Contents</Text>
            {TOC_ENTRIES.map((entry) => {
                const isCurrentPage =
                    entry.kind === 'page' && entry.id === currentPageId;

                const onPress = () => {
                    if (entry.kind === 'section') {
                        if (currentPageId === 'documentation') {
                            scrollToSection(entry.id);
                        } else {
                            openDocumentationSection(entry.id);
                        }
                    } else if (!isCurrentPage) {
                        entry.openPage?.();
                    }
                };

                return (
                    <Pressable
                        key={entry.id}
                        accessibilityRole="link"
                        accessibilityLabel={`Jump to ${entry.name}`}
                        onPress={onPress}
                        style={({ pressed }) => [
                            styles.tocLink,
                            entry.indent && styles.tocLinkIndented,
                            pressed && styles.tocLinkPressed,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tocLinkText,
                                isCurrentPage && styles.tocLinkTextCurrent,
                            ]}
                        >
                            {entry.name}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    toc: {
        gap: 4,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.separator,
    },
    tocTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    tocLink: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
    },
    tocLinkIndented: {
        marginLeft: 20,
    },
    tocLinkPressed: {
        opacity: 0.75,
    },
    tocLinkText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.link,
    },
    tocLinkTextCurrent: {
        textDecorationLine: 'underline',
    },
});
