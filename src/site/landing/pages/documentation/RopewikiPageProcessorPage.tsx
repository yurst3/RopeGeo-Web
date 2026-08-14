import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MermaidDiagram } from '../../components/MermaidDiagram';
import { darkTheme as colors } from '../../constants/darkTheme';
import { MermaidNode, AwsService } from './types/mermaidNode';
import { openDocumentation } from '../../utils/routing';
import { DocumentationToc } from './components/DocumentationToc';
import {
    RichTextParagraph,
    type RichParagraph,
} from './components/RichTextParagraph';

const WEBSCRAPER_GITHUB_URL = 'https://github.com/yurst3/RopeGeo-WebScraper';
const WEBSCRAPER_DEFAULT_BRANCH = 'master';

/**
 * Resolves a Metro/Expo `require(...)` image module to a URL string suitable
 * for CSS `background-image` / Mermaid HTML labels. On web, `require` is often
 * already a string URL and `Image.resolveAssetSource` may return null.
 */
function assetUri(module: unknown): string {
    if (typeof module === 'string') {
        return module;
    }
    if (
        module != null &&
        typeof module === 'object' &&
        'uri' in module &&
        typeof (module as { uri: unknown }).uri === 'string'
    ) {
        return (module as { uri: string }).uri;
    }
    if (typeof module === 'number') {
        const resolved = Image.resolveAssetSource(module);
        if (resolved?.uri) {
            return resolved.uri;
        }
    }
    throw new Error('Could not resolve image asset URI for Mermaid node icon');
}

const IP_ROYAL_ICON_SRC = assetUri(require('../../assets/logos/ipRoyal.png'));
const ROPEWIKI_ICON_SRC = assetUri(require('../../assets/logos/ropewiki.png'));

const ROPEWIKI_API_NODE = new MermaidNode({
    id: 'ropewikiApi',
    label: 'Ropewiki APIs',
    iconSrc: ROPEWIKI_ICON_SRC,
    nodeShape: 'cloud',
});
const PROXY_NODE = new MermaidNode({
    id: 'proxy',
    label: 'IP Royal Proxy',
    iconSrc: IP_ROYAL_ICON_SRC,
    nodeShape: 'fr-rect',
});
const SCRAPER_NODE = MermaidNode.awsService({
    id: 'scraper',
    service: AwsService.Lambda,
    label: 'RopewikiScraper',
    nodeShape: 'rounded',
    pageLink: '/documentation/ropewikiscraper.html',
});
const REPROCESSOR_NODE = MermaidNode.awsService({
    id: 'reprocessor',
    service: AwsService.Lambda,
    label: 'RopewikiPageReprocessor',
    nodeShape: 'rounded',
});
const PAGE_QUEUE_NODE = MermaidNode.awsService({
    id: 'pageQueue',
    service: AwsService.Sqs,
    label: 'RopewikiPageProcessingQueue',
});
const PAGE_PROCESSOR_NODE = MermaidNode.awsService({
    id: 'pageProcessor',
    service: AwsService.Lambda,
    label: 'RopewikiPageProcessor',
    backgroundColor: 'green',
    nodeShape: 'st-rect',
});
const DATABASE_NODE = MermaidNode.awsService({
    id: 'database',
    service: AwsService.Rds,
    label: 'Production database',
});
const IMAGE_QUEUE_NODE = MermaidNode.awsService({
    id: 'imageQueue',
    service: AwsService.Sqs,
    label: 'ImageProcessorQueue',
});
const IMAGE_PROCESSOR_NODE = MermaidNode.awsService({
    id: 'imageProcessor',
    service: AwsService.Lambda,
    label: 'ImageProcessor',
    nodeShape: 'st-rect',
});

const FLOWCHART_NODES = {
    ropewikiApi: ROPEWIKI_API_NODE,
    proxy: PROXY_NODE,
    scraper: SCRAPER_NODE,
    reprocessor: REPROCESSOR_NODE,
    pageQueue: PAGE_QUEUE_NODE,
    pageProcessor: PAGE_PROCESSOR_NODE,
    database: DATABASE_NODE,
    imageQueue: IMAGE_QUEUE_NODE,
    imageProcessor: IMAGE_PROCESSOR_NODE,
};

/** Build after {@link MermaidNode.resetStyleRegistry} so green fill applies only to this chart. */
function buildFlowchart(): string {
    MermaidNode.resetStyleRegistry();
    const {
        ropewikiApi,
        proxy,
        scraper,
        reprocessor,
        pageQueue,
        pageProcessor,
        database,
        imageQueue,
        imageProcessor,
    } = FLOWCHART_NODES;
    const chart = `
flowchart TB
    ${ropewikiApi} <--> ${proxy}
    ${proxy} <----> ${pageProcessor}

    subgraph webScraper["WebScraper"]
        ${scraper} --> ${pageQueue}
        ${reprocessor} --> ${pageQueue}
        ${pageProcessor} <---> ${database}

        subgraph pageProcessing["Page Processing"]
            ${pageQueue} --> ${pageProcessor}
        end

        subgraph imageProcessing["Image Processing"]
            ${pageProcessor} --> ${imageQueue}
            ${imageQueue} --> ${imageProcessor}
        end
    end

    style webScraper fill:transparent,stroke:#ffffff,color:#ffffff
    style pageProcessing fill:transparent,stroke:#ffffff,color:#ffffff
    style imageProcessing fill:transparent,stroke:#ffffff,color:#ffffff
`;
    const styleAppendix = MermaidNode.formatStyleAppendix();
    return styleAppendix ? `${chart}\n${styleAppendix}` : chart;
}

const OVERVIEW_PARAGRAPHS: RichParagraph[] = [
    [
        'RopewikiPageProcessor is the WebScraper stage that turns upserted canyon pages into parsed beta content and image work. RopewikiScraper (for pages revised since the last sync) and RopewikiPageReprocessor (for on-demand or full reprocessing) both enqueue page payloads on the RopewikiPageProcessingQueue. The processor Lambda drains that queue, reaches Ropewiki through the IP Royal proxy to fetch page HTML and media, writes beta sections and image records to the production database, and forwards heavier image jobs to the ImageProcessorQueue for ImageProcessor. Page-level detail in RopeGeo — narrative beta, photos, and the assets that feed offline bundles — depends on this stage running after the scraper\u2019s page upsert.',
    ],
];

const PARSING_BETA_PARAGRAPHS: RichParagraph[] = [
    [
        'In RopeGeo, a beta section is a titled block of canyon narrative stored as HTML: title, ordered body text, and revision metadata that the page-view API returns for online and offline clients. A beta section image is a photo (or similar media) tied to a page — and usually to one of those sections — with link and file URLs, optional caption, order, and later processed asset fields. The app renders sections as the readable trip beta and attaches images to the section (or page banner) they came from, rather than treating the whole Ropewiki article as one blob.',
    ],
    [
        'Ropewiki serves each canyon as a single MediaWiki HTML document. Splitting that document into sections lets RopeGeo show beta in the same heading structure editors use on the wiki, keep images scoped to the right part of the write-up, power relevance excerpts against a section\u2019s text, and ship offline bundles that still make sense without the live page. Without that split, the mobile client would only have an opaque HTML dump with no stable section identity to upsert against.',
    ],
    [
        'After the processor fetches the page HTML through the proxy, it parses with Puppeteer and a headless Chromium browser (the same Chromium layer the Lambda ships). The HTML is loaded into a page, then an in-browser evaluate walks the live DOM — not a fragile regex over the raw string — so MediaWiki\u2019s nested markup, galleries, and embeds resolve the way a real browser would. The walk is time-bounded so one pathological page cannot hang the processor.',
    ],
    [
        'Before writing the new parse, the processor soft-deletes every existing beta section (and image and page-site link) for that page by setting deletedAt. It then upserts the parsed sections on the unique (ropewikiPage, title) key: matching titles are updated in place (text, order, revision dates) and deletedAt is cleared when allowUpdates is true, so a renamed-away or removed section stays soft-deleted while a returning title is revived. Images are upserted next and linked to section UUIDs via those titles. Soft-delete-first avoids unique-constraint fights and makes the stored set match the latest HTML without leaving orphan live rows.',
    ],
];

const PARSER_TRANSFORMATIONS_INTRO: RichParagraph[] = [
    [
        'The parser does not aim to reproduce Ropewiki\u2019s page pixel-for-pixel. It keeps the readable beta structure while stripping or rewriting pieces that are expensive, redundant, or awkward in the app. Decorative icons and small images inside list items are dropped so beta lists stay text and links. Embedded players (YouTube, Vimeo, and similar) are replaced with ordinary hyperlinks to the video URL — downloading and storing video would be slow and storage-heavy for sync and offline bundles, and a link is enough for someone who wants to open the media elsewhere.',
    ],
];

const PARSER_TRANSFORMATIONS_GALLERY: RichParagraph[] = [
    [
        'Ropewiki gallery thumbnails that sit under a heading become RopeGeo beta section images linked to that same section — the same reason the HTML is split into titled beta sections in the first place, so photos stay with the Descent, Exit, or other narrative they illustrated on the wiki instead of floating as a page-wide dump. What is lost is fine-grained position inside the section: on Ropewiki an image may sit directly under a specific rappel line, while in RopeGeo the section\u2019s images are shown as an ordered set (for example a carousel) for that whole section. For most pages that trade-off is acceptable; the caption and section association still carry the useful context.',
    ],
];

const ROPEWIKI_BETA_SITES_SCREENSHOT = require('../../assets/screenshots/ropewiki/ropewikiBetaSites.png');
const ROPEGEO_BETA_SITES_SCREENSHOT = require('../../assets/screenshots/ropegeo/RopegeoBetaSites.png');
const ROPEWIKI_GALLERY_SCREENSHOT = require('../../assets/screenshots/ropewiki/ropewikiGalleryPics.png');
const ROPEGEO_BETA_IMAGE_SCREENSHOT = require('../../assets/screenshots/ropegeo/RopegeoBetaImage.png');

export function RopewikiPageProcessorPage() {
    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Back to Documentation"
                    onPress={openDocumentation}
                    style={({ pressed }) => [
                        styles.backLink,
                        pressed && styles.backLinkPressed,
                    ]}
                >
                    <Text style={styles.backLinkText}>
                        ← Back to Documentation
                    </Text>
                </Pressable>

                <Text style={styles.title}>RopewikiPageProcessor</Text>

                <DocumentationToc currentPageId="ropewikipageprocessor" />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    {OVERVIEW_PARAGRAPHS.map((parts, paragraphIndex) => (
                        <RichTextParagraph
                            key={`overview-${paragraphIndex}`}
                            parts={parts}
                            githubUrl={WEBSCRAPER_GITHUB_URL}
                            defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                        />
                    ))}

                    <MermaidDiagram chart={buildFlowchart()} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Parsing Beta Sections and Images
                    </Text>
                    {PARSING_BETA_PARAGRAPHS.map((parts, paragraphIndex) => (
                        <RichTextParagraph
                            key={`parsing-beta-${paragraphIndex}`}
                            parts={parts}
                            githubUrl={WEBSCRAPER_GITHUB_URL}
                            defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                        />
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Parser Transformations
                    </Text>
                    {PARSER_TRANSFORMATIONS_INTRO.map(
                        (parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`parser-transforms-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={WEBSCRAPER_GITHUB_URL}
                                defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                            />
                        ),
                    )}
                    <View style={styles.comparisonRow}>
                        <View style={styles.comparisonColumn}>
                            <View style={styles.ropewikiBetaSitesImage}>
                                <Image
                                    source={ROPEWIKI_BETA_SITES_SCREENSHOT}
                                    style={styles.sectionImage}
                                    resizeMode="cover"
                                    accessibilityLabel="Ropewiki Beta sites and Trip reports sections with list icons and an embedded YouTube player"
                                />
                            </View>
                            <Text style={styles.imageCaption}>
                                Original Ropewiki HTML: list icons beside beta
                                sites and an embedded video player in Trip
                                reports and media.
                            </Text>
                        </View>
                        <View style={styles.comparisonColumn}>
                            <View style={styles.ropegeoBetaSitesImage}>
                                <Image
                                    source={ROPEGEO_BETA_SITES_SCREENSHOT}
                                    style={styles.sectionImage}
                                    resizeMode="cover"
                                    accessibilityLabel="RopeGeo app Beta sites and Trip reports sections as text links without icons or embedded video"
                                />
                            </View>
                            <Text style={styles.imageCaption}>
                                Transformed in RopeGeo: icon-free lists and the
                                embed replaced with a plain YouTube link.
                            </Text>
                        </View>
                    </View>
                    {PARSER_TRANSFORMATIONS_GALLERY.map(
                        (parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`parser-transforms-gallery-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={WEBSCRAPER_GITHUB_URL}
                                defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                            />
                        ),
                    )}
                    <View style={styles.comparisonRow}>
                        <View style={styles.comparisonColumn}>
                            <View style={styles.ropewikiGalleryImage}>
                                <Image
                                    source={ROPEWIKI_GALLERY_SCREENSHOT}
                                    style={styles.sectionImage}
                                    resizeMode="cover"
                                    accessibilityLabel="Ropewiki Descent beta with gallery thumbnails under rappel descriptions"
                                />
                            </View>
                            <Text style={styles.imageCaption}>
                                Original Ropewiki HTML: gallery thumbnails
                                placed under specific lines within a beta
                                section.
                            </Text>
                        </View>
                        <View style={styles.comparisonColumn}>
                            <View style={styles.ropegeoBetaImage}>
                                <Image
                                    source={ROPEGEO_BETA_IMAGE_SCREENSHOT}
                                    style={styles.sectionImage}
                                    resizeMode="cover"
                                    accessibilityLabel="RopeGeo Descent beta with section image carousel between Descent and Exit"
                                />
                            </View>
                            <Text style={styles.imageCaption}>
                                Transformed in RopeGeo: the same photos as beta
                                section images for Descent, without in-section
                                placement next to each rappel.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 32,
        paddingBottom: 48,
    },
    content: {
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
        paddingHorizontal: 24,
        gap: 20,
    },
    backLink: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
    },
    backLinkPressed: {
        opacity: 0.75,
    },
    backLinkText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.link,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: colors.text.primary,
    },
    section: {
        gap: 10,
        paddingTop: 16,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.text.link,
        marginTop: 8,
    },
    comparisonRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginTop: 8,
    },
    comparisonColumn: {
        flex: 1,
        minWidth: 0,
        gap: 8,
    },
    ropewikiBetaSitesImage: {
        width: '100%',
        aspectRatio: 1378 / 1698,
        borderRadius: 8,
        overflow: 'hidden',
    },
    ropegeoBetaSitesImage: {
        width: '100%',
        aspectRatio: 1206 / 1602,
        borderRadius: 8,
        overflow: 'hidden',
    },
    ropewikiGalleryImage: {
        width: '100%',
        aspectRatio: 1134 / 1782,
        borderRadius: 8,
        overflow: 'hidden',
    },
    ropegeoBetaImage: {
        width: '100%',
        aspectRatio: 1206 / 1654,
        borderRadius: 8,
        overflow: 'hidden',
    },
    sectionImage: {
        width: '100%',
        height: '100%',
    },
    imageCaption: {
        fontSize: 13,
        lineHeight: 18,
        fontStyle: 'italic',
        color: colors.text.secondary,
    },
});
