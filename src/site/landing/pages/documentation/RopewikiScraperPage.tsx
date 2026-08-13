import {
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from 'react-native';

import { MermaidDiagram } from '../../components/MermaidDiagram';
import { darkTheme as colors } from '../../constants/darkTheme';
import { MermaidNode, AwsService } from './types/mermaidNode';
import { openDocumentation } from '../../utils/routing';
import { DocumentationToc } from './components/DocumentationToc';
import {
    link,
    RichTextParagraph,
    type RichParagraph,
} from './components/RichTextParagraph';

const WEBSCRAPER_GITHUB_URL = 'https://github.com/yurst3/RopeGeo-WebScraper';
const WEBSCRAPER_DEFAULT_BRANCH = 'master';

const ROPEWIKI_REGIONS_SCREENSHOT = require('../../assets/screenshots/ropewiki/ropewikiRegions.png');
const ROPEWIKI_PAGE_INFO_SCREENSHOT = require('../../assets/screenshots/ropewiki/ropewikiPageInfo.png');
const ROPEWIKI_PAGE_PROPERTIES_SCREENSHOT = require('../../assets/screenshots/ropewiki/ropewikiPageProperties.png');
const ROPEGEO_ROUTES_SCREENSHOT = require('../../assets/screenshots/ropegeo/RopegeoRoutes.png');

/** Web-only CSS float so section body text wraps around a right-hand screenshot. */
const floatRightStyle =
    Platform.OS === 'web'
        ? ({ float: 'right' } as unknown as ViewStyle)
        : ({ alignSelf: 'flex-end' } as ViewStyle);

/** RN Web Views default to flex; block layout is required for CSS float wrapping. */
const pagesFlowWebStyle =
    Platform.OS === 'web'
        ? ({ display: 'block' } as unknown as ViewStyle)
        : null;

const pagesFlowClearStyle =
    Platform.OS === 'web'
        ? ({ clear: 'both' } as unknown as ViewStyle)
        : null;

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

const ROPEWIKI_API_NODE = new MermaidNode({ id: 'ropewikiApi', label: 'Ropewiki APIs', iconSrc: ROPEWIKI_ICON_SRC, nodeShape: 'cloud' });
const PROXY_NODE = new MermaidNode({ id: 'proxy', label: 'IP Royal Proxy', iconSrc: IP_ROYAL_ICON_SRC, nodeShape: 'fr-rect' });
const SCRAPER_NODE = MermaidNode.awsService({ id: 'scraper', service: AwsService.Lambda, label: 'RopewikiScraper', backgroundColor: 'green', nodeShape: 'rounded' });
const DATABASE_NODE = MermaidNode.awsService({ id: 'database', service: AwsService.Rds, label: 'Production database' });
const TRIGGER_NODE = MermaidNode.awsService({ id: 'schedule', service: AwsService.EventBridge, label: 'Scheduled Event Trigger', nodeShape: 'rounded' });
const PAGE_QUEUE_NODE = MermaidNode.awsService({ id: 'pageQueue', service: AwsService.Sqs, label: 'RopewikiPageProcessingQueue' });
const PAGE_PROCESSOR_NODE = MermaidNode.awsService({ id: 'pageProcessor', service: AwsService.Lambda, label: 'RopewikiPageProcessor', nodeShape: 'st-rect' });
const MAP_DATA_QUEUE_NODE = MermaidNode.awsService({ id: 'mapQueue', service: AwsService.Sqs, label: 'MapDataProcessingQueue' });
const MAP_DATA_PROCESSOR_NODE = MermaidNode.awsService({ id: 'mapProcessor', service: AwsService.Lambda, label: 'MapDataProcessor', nodeShape: 'st-rect' });

const FLOWCHART = `
flowchart TB
    ${ROPEWIKI_API_NODE} <--> ${PROXY_NODE}
    ${PROXY_NODE} <----> ${SCRAPER_NODE}

    subgraph webScraper["WebScraper"]
        ${TRIGGER_NODE} --> ${SCRAPER_NODE}
        ${SCRAPER_NODE} <---> ${DATABASE_NODE}
        ${SCRAPER_NODE} --> ${PAGE_QUEUE_NODE}
        ${SCRAPER_NODE} --> ${MAP_DATA_QUEUE_NODE}

        subgraph pageProcessing["Map Data Processing"]
            ${PAGE_QUEUE_NODE} --> ${PAGE_PROCESSOR_NODE}
        end

        subgraph mapProcessing["Page Processing"]
            ${MAP_DATA_QUEUE_NODE} --> ${MAP_DATA_PROCESSOR_NODE}
        end
    end

    style webScraper fill:transparent,stroke:#ffffff,color:#ffffff
    style pageProcessing fill:transparent,stroke:#ffffff,color:#ffffff
    style mapProcessing fill:transparent,stroke:#ffffff,color:#ffffff

    
`;

const OVERVIEW_PARAGRAPHS: RichParagraph[] = [
    [
        'RopewikiScraper is the entry point of the WebScraper data pipeline: the process that keeps the RopeGeo production database in sync with Ropewiki. A scheduled EventBridge trigger starts the RopewikiScraper Lambda, which reaches Ropewiki\u2019s MediaWiki and Semantic MediaWiki APIs through an IP Royal proxy, upserts regions and pages into RDS, and enqueues heavier follow-up work on the page-processing and map-data SQS queues for RopewikiPageProcessor and MapDataProcessor. Everything downstream — page parsing, image processing, map data, and offline bundles — begins with a RopewikiScraper run.',
    ],
];

const SYNCING_REGIONS_PARAGRAPHS: RichParagraph[] = [
    [
        'Ropewiki organizes canyon pages under regions, and those regions form a hierarchy with World at the root — continents and countries nest underneath, each carrying a count of pages in that branch (see ',
        link('Regions', 'https://ropewiki.com/Regions'),
        ' on Ropewiki). Early in a run, RopewikiScraper queries Ropewiki for the full region tree and upserts every region into the production database so RopeGeo\u2019s region records and page counts stay aligned with Ropewiki before page-level sync continues.',
    ],
];

const SYNCING_PAGES_PARAGRAPHS: RichParagraph[] = [
    [
        'After regions are stored, RopewikiScraper syncs canyon pages region by region. It cannot ask Ropewiki for every page under World in one pass: Ropewiki\u2019s Special:Ask API silently treats any offset above 5000 as 0 and caps each response at 2000 results, so a region with more than about 7000 pages cannot be fully enumerated. To stay inside those limits, the scraper starts at World and repeatedly replaces any region whose page count exceeds 6000 with that region\u2019s children until every remaining region is under the limit. The result is the highest-level set of regions that can still be fetched completely in 2000-page chunks.',
    ],
    [
        'For each of those regions, RopewikiScraper issues a Semantic MediaWiki Special:Ask query for pages in Category:Canyons that are located in the region (including nested regions under it), requesting JSON with a limit of 2000 and a paging offset. Chunks are pulled until the region\u2019s page count is covered, then valid pages are upserted into the production database. Regions are processed one after another so the scraper does not overload Ropewiki.',
    ],
    [
        'What comes back for each canyon is the structured infobox data Ropewiki already maintains as Semantic MediaWiki properties — quality and difficulty ratings, rappel count and longest rappel, approach/descent/exit and overall times, permits, shuttle and vehicle requirements, coordinates, best months, alternate names, KML links, external beta-site lists, vote counts, and the page\u2019s latest revision date. That is deliberately not the narrative beta text of the page body; beta sections and images are left to RopewikiPageProcessor for pages whose revision date is newer than the last sync.',
    ],
];

const PAGE_PROPERTIES_PARAGRAPHS: RichParagraph[] = [
    [
        'Those structured fields come from Semantic MediaWiki (SMW), an extension that lets Ropewiki attach typed properties to pages and query them. Instead of scraping HTML, RopewikiScraper asks SMW for named properties such as Has rating, Has number of rappels, or Located in region. Ropewiki publishes the full catalog on its ',
        link(
            'Special:Properties',
            'https://ropewiki.com/index.php?title=Special:Properties&limit=500&offset=0',
        ),
        ' page — each entry lists the property name, data type, and how often it is used across the wiki.',
    ],
    [
        'Most of those properties are usable as returned, but elevation gains are not. SMW strips the sign from elevation values, so a downhill approach and an uphill exit can look identical in the Ask response. When a page has length or elevation data, RopewikiScraper makes a follow-up MediaWiki API request for the raw canyon-template wikitext and reparses hike length, approach/exit lengths, and elevation gains (including negative signs) before upserting the page.',
    ],
];

const CREATING_ROUTES_PARAGRAPHS: RichParagraph[] = [
    [
        'In RopeGeo, a Route is the map-facing location record: a named point with coordinates that the API returns as GeoJSON for the explore map. A RopewikiPage is the synced wiki source behind that pin — ratings, times, beta later on, and so on. They stay separate because several canyon pages can describe the same physical spot, and the map should show one marker there rather than stacking duplicate pins. The RopewikiRoute join table links each page to its Route; only pages with coordinates participate.',
    ],
    [
        'After pages are upserted, RopewikiScraper runs route creation for the pages that were updated in that run. For each page it looks up an existing linked Route, then tries to reuse any other Route that already sits on the exact same coordinates (for example one created earlier for a different page). Pages that still have no Route get new ones inserted — one Route per unique coordinate pair. Newly created routes take their initial name from the page; when a page already has a Route and allowUpdates is true, the scraper refreshes that Route\u2019s name (and coordinates) from the linked pages so renames on Ropewiki propagate without inventing a second pin.',
    ],
    [
        'When multiple pages share the same coordinates, they share a single Route. The canonical name for that Route comes from the most popular linked page, scored as quality \u00d7 userVotes (missing values count as zero). On a tie when creating routes, the first page in the batch wins; when refreshing an existing Route, ties break by page id ascending so an updated page is not preferred only because it was just synced. The API display layer can still append a (+n) suffix when more than one page is linked, but the stored Route name itself is that single most-popular page name.',
    ],
];

export function RopewikiScraperPage() {
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

                <Text style={styles.title}>RopewikiScraper</Text>

                <DocumentationToc currentPageId="ropewikiscraper" />

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

                    <MermaidDiagram chart={FLOWCHART} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Syncing Ropewiki Regions
                    </Text>
                    {SYNCING_REGIONS_PARAGRAPHS.map((parts, paragraphIndex) => (
                        <RichTextParagraph
                            key={`syncing-regions-${paragraphIndex}`}
                            parts={parts}
                            githubUrl={WEBSCRAPER_GITHUB_URL}
                            defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                        />
                    ))}
                    <View style={styles.sectionImageFrame}>
                        <Image
                            source={ROPEWIKI_REGIONS_SCREENSHOT}
                            style={styles.sectionImage}
                            resizeMode="cover"
                            accessibilityLabel="Ropewiki Regions page showing the World region hierarchy"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Syncing Ropewiki Pages
                    </Text>
                    <View style={[styles.pagesFlow, pagesFlowWebStyle]}>
                        <View
                            style={[styles.pagesImageFrame, floatRightStyle]}
                        >
                            <View style={styles.pagesImage}>
                                <Image
                                    source={ROPEWIKI_PAGE_INFO_SCREENSHOT}
                                    style={styles.sectionImage}
                                    resizeMode="cover"
                                    accessibilityLabel="Ropewiki canyon page infobox showing generic page stats"
                                />
                            </View>
                            <Text style={styles.imageCaption}>
                                Structured page stats RopewikiScraper syncs for
                                each canyon (excluding the banner image and
                                condition reports) — not the narrative beta
                                text.
                            </Text>
                        </View>
                        {SYNCING_PAGES_PARAGRAPHS.map(
                            (parts, paragraphIndex) => (
                                <View
                                    key={`syncing-pages-${paragraphIndex}`}
                                    style={styles.pagesParagraphSpacer}
                                >
                                    <RichTextParagraph
                                        parts={parts}
                                        githubUrl={WEBSCRAPER_GITHUB_URL}
                                        defaultBranch={
                                            WEBSCRAPER_DEFAULT_BRANCH
                                        }
                                    />
                                </View>
                            ),
                        )}
                        <View style={pagesFlowClearStyle} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Ropewiki Page Properties
                    </Text>
                    {PAGE_PROPERTIES_PARAGRAPHS.map(
                        (parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`page-properties-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={WEBSCRAPER_GITHUB_URL}
                                defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                            />
                        ),
                    )}
                    <View style={styles.propertiesImageFrame}>
                        <Image
                            source={ROPEWIKI_PAGE_PROPERTIES_SCREENSHOT}
                            style={styles.sectionImage}
                            resizeMode="cover"
                            accessibilityLabel="Ropewiki Special:Properties page listing Semantic MediaWiki property names and types"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Creating Ropewiki Routes
                    </Text>
                    {CREATING_ROUTES_PARAGRAPHS.map(
                        (parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`creating-routes-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={WEBSCRAPER_GITHUB_URL}
                                defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                            />
                        ),
                    )}
                    <View style={styles.routesScreenshot}>
                        <View style={styles.routesImageFrame}>
                            <Image
                                source={ROPEGEO_ROUTES_SCREENSHOT}
                                style={styles.sectionImage}
                                resizeMode="cover"
                                accessibilityLabel="RopeGeo map showing route markers including Butler Canyon (+1)"
                            />
                        </View>
                        <Text style={[styles.imageCaption, styles.routesImageCaption]}>
                            Routes are the map-facing location of a page. A
                            name with (+1) means more than one page is linked
                            to that single route.
                        </Text>
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
    sectionImageFrame: {
        width: '50%',
        aspectRatio: 662 / 998,
        alignSelf: 'center',
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    propertiesImageFrame: {
        width: '100%',
        aspectRatio: 758 / 454,
        alignSelf: 'center',
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    routesScreenshot: {
        marginTop: 8,
        alignItems: 'center',
    },
    routesImageFrame: {
        width: '66.666%',
        aspectRatio: 1206 / 1600,
        borderRadius: 8,
        overflow: 'hidden',
    },
    pagesFlow: {
        gap: 10,
    },
    pagesImageFrame: {
        width: '42%',
        marginLeft: 20,
        marginBottom: 12,
    },
    pagesImage: {
        width: '100%',
        aspectRatio: 588 / 1728,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageCaption: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 18,
        fontStyle: 'italic',
        color: colors.text.secondary,
    },
    routesImageCaption: {
        textAlign: 'center',
        maxWidth: '90%',
    },
    pagesParagraphSpacer: {
        marginBottom: 10,
    },
    sectionImage: {
        width: '100%',
        height: '100%',
    },
});
