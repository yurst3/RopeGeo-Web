import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MermaidDiagram } from '../../components/MermaidDiagram';
import { darkTheme as colors } from '../../constants/darkTheme';
import { MermaidNode, AwsService } from './types/mermaidNode';
import { openDocumentation } from '../../utils/routing';
import { DocumentationToc } from './components/DocumentationToc';
import {
    RichTextParagraph,
    type RichParagraph,
    folder,
    link,
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
    label: 'MapDataReprocessor',
    nodeShape: 'rounded',
});
const MAP_QUEUE_NODE = MermaidNode.awsService({
    id: 'mapQueue',
    service: AwsService.Sqs,
    label: 'MapDataProcessingQueue',
});
const MAP_PROCESSOR_NODE = MermaidNode.awsService({
    id: 'mapProcessor',
    service: AwsService.Lambda,
    label: 'MapDataProcessor',
    backgroundColor: 'green',
    nodeShape: 'st-rect',
});
const DATABASE_NODE = MermaidNode.awsService({
    id: 'database',
    service: AwsService.Rds,
    label: 'Production database',
});
const MAP_DATA_BUCKET_NODE = MermaidNode.awsService({
    id: 'mapDataBucket',
    service: AwsService.S3,
    label: 'production-map-data-bucket',
});
const RELEVANCE_JOB_NODE = MermaidNode.awsService({
    id: 'relevanceJob',
    service: AwsService.Rds,
    label: 'New MapDataRelevantContextJob',
});
const RELEVANCE_QUEUE_NODE = MermaidNode.awsService({
    id: 'relevanceQueue',
    service: AwsService.Sqs,
    label: 'MapDataRelevanceProcessingQueue',
});
const RELEVANCE_PROCESSOR_NODE = MermaidNode.awsService({
    id: 'relevanceProcessor',
    service: AwsService.Lambda,
    label: 'MapDataRelevanceProcessor',
    nodeShape: 'st-rect',
});

const DECISION_QUEUE_NODE = MermaidNode.awsService({
    id: 'dtQueue',
    service: AwsService.Sqs,
    label: 'MapDataProcessingQueue',
});
const DECISION_BUCKET_NODE = MermaidNode.awsService({
    id: 'dtBucket',
    service: AwsService.S3,
    label: 'production-map-data-bucket',
    maxWidth: 160,
    maxLines: 2,
});
const DECISION_DATABASE_NODE = MermaidNode.awsService({
    id: 'dtDatabase',
    service: AwsService.Rds,
    label: 'Production database',
});
const DECISION_RELEVANCE_JOB_NODE = MermaidNode.awsService({
    id: 'dtRelevanceJob',
    service: AwsService.Rds,
    label: 'New MapDataRelevantContextJob',
    maxWidth: 180,
    maxLines: 2,
});
const DECISION_RELEVANCE_QUEUE_NODE = MermaidNode.awsService({
    id: 'dtRelevanceQueue',
    service: AwsService.Sqs,
    label: 'MapDataRelevanceProcessingQueue',
    maxWidth: 180,
    maxLines: 2,
});
const DECISION_DLQ_NODE = MermaidNode.awsService({
    id: 'dtDlq',
    service: AwsService.Sqs,
    label: 'MapDataProcessingDLQ',
});

/** Build after {@link MermaidNode.resetStyleRegistry} so green fill applies only to this chart. */
function buildFlowchart(): string {
    MermaidNode.resetStyleRegistry();
    const chart = `
flowchart TB
    ${ROPEWIKI_API_NODE} <--> ${PROXY_NODE}
    ${PROXY_NODE} <----> ${MAP_PROCESSOR_NODE}

    subgraph webScraper["WebScraper"]
        ${SCRAPER_NODE} --> ${MAP_QUEUE_NODE}
        ${REPROCESSOR_NODE} --> ${MAP_QUEUE_NODE}
        ${MAP_PROCESSOR_NODE} <--> ${DATABASE_NODE}
        ${MAP_PROCESSOR_NODE} ---> ${MAP_DATA_BUCKET_NODE}

        subgraph mapProcessing["Map Data Processing"]
            ${MAP_QUEUE_NODE} --> ${MAP_PROCESSOR_NODE}
        end

        subgraph relevanceProcessing["Map Data Relevance"]
            ${MAP_PROCESSOR_NODE} --> ${RELEVANCE_JOB_NODE}
            ${RELEVANCE_JOB_NODE} --> ${RELEVANCE_QUEUE_NODE}
            ${RELEVANCE_QUEUE_NODE} --> ${RELEVANCE_PROCESSOR_NODE}
        end
    end

    style webScraper fill:transparent,stroke:#ffffff,color:#ffffff
    style mapProcessing fill:transparent,stroke:#ffffff,color:#ffffff
    style relevanceProcessing fill:transparent,stroke:#ffffff,color:#ffffff
`;
    const styleAppendix = MermaidNode.formatStyleAppendix();
    return styleAppendix ? `${chart}\n${styleAppendix}` : chart;
}

/**
 * Per-message decision tree for MapDataProcessor. Soft conversion/upload errors still
 * upsert and delete the SQS message; thrown errors leave the message for retry / DLQ.
 */
function buildDecisionFlowchart(): string {
    MermaidNode.resetStyleRegistry();
    const chart = `
flowchart TB
    ${DECISION_QUEUE_NODE} --> extendVis["Extend visibility to Lambda timeout"]
    extendVis --> parseOk{"Parse MapDataEvent?"}

    parseOk -->|No| delPoison["Delete message"]
    delPoison --> poisonEnd["Invalid body discarded"]

    parseOk -->|Yes| timeOk{"Enough Lambda time to start this message?"}
    timeOk -->|No| leaveBatch["Leave message on queue"]
    leaveBatch --> retryLater["Becomes visible again after timeout"]

    timeOk -->|Yes| loadUrl["Load source file URL from DB"]
    loadUrl --> hasUrl{"Source URL present?"}
    hasUrl -->|No| delNoUrl["Delete message"]
    delNoUrl --> skipEnd["Nothing to process"]

    hasUrl -->|Yes| parallel["Run in parallel"]

    parallel --> downloadSrc{"downloadSource?"}
    parallel --> fetchAuthors["Fetch authors from Ropewiki"]

    downloadSrc -->|Yes| downloadFile["Download KML/GPX via IP Royal proxy"]
    downloadSrc -->|No| readS3["Read source from S3"]
    downloadFile --> convertGeo["Convert to GeoJSON, clean, enrich legend"]
    readS3 --> convertGeo
    convertGeo --> convertTiles["Convert GeoJSON to vector tiles"]
    convertTiles --> uploadS3["Upload source / GeoJSON / tiles"]
    uploadS3 --> ${DECISION_BUCKET_NODE}
    fetchAuthors --> joinAuthors["Join with processed MapData"]
    ${DECISION_BUCKET_NODE} --> joinAuthors

    joinAuthors --> upsertDb["Upsert MapData + legend"]
    upsertDb --> ${DECISION_DATABASE_NODE}
    ${DECISION_DATABASE_NODE} --> relevanceOk{"processRelevantContext and upsert applied?"}
    relevanceOk -->|Yes| createJob["Create relevance job"]
    createJob --> ${DECISION_RELEVANCE_JOB_NODE}
    ${DECISION_RELEVANCE_JOB_NODE} --> ${DECISION_RELEVANCE_QUEUE_NODE}
    relevanceOk -->|No| delSuccess["Delete message"]
    ${DECISION_RELEVANCE_QUEUE_NODE} --> delSuccess
    delSuccess --> doneEnd["Done"]

    downloadFile -->|throws| leaveRetry["Leave message on queue"]
    uploadS3 -->|throws| leaveRetry
    upsertDb -->|throws| leaveRetry
    leaveRetry --> retryLater
    retryLater --> maxReceives{"Receive count ≥ 5?"}
    maxReceives -->|No| redelivered["Redelivered to MapDataProcessingQueue"]
    maxReceives -->|Yes| ${DECISION_DLQ_NODE}

    style poisonEnd fill:#5c2b2b,stroke:#ffffff,color:#ffffff
    style skipEnd fill:#5c2b2b,stroke:#ffffff,color:#ffffff
    style leaveBatch fill:#5c4a2b,stroke:#ffffff,color:#ffffff
    style leaveRetry fill:#5c4a2b,stroke:#ffffff,color:#ffffff
    style retryLater fill:#5c4a2b,stroke:#ffffff,color:#ffffff
    style redelivered fill:#5c4a2b,stroke:#ffffff,color:#ffffff
    style doneEnd fill:#2b5c3a,stroke:#ffffff,color:#ffffff
`;
    const styleAppendix = MermaidNode.formatStyleAppendix();
    return styleAppendix ? `${chart}\n${styleAppendix}` : chart;
}

const OVERVIEW_PARAGRAPHS: RichParagraph[] = [
    [
        'MapDataProcessor is the WebScraper stage that turns route KML/GPX sources into map assets RopeGeo can serve and display. RopewikiScraper (after creating or updating routes for revised pages) and MapDataReprocessor (for on-demand or bulk reprocessing) both enqueue work on the MapDataProcessingQueue. The processor Lambda drains that queue, reaches Ropewiki through the IP Royal proxy when it needs to download a source file, converts it to GeoJSON and vector tiles, upserts MapData in the production database (and related S3 objects), and when a relevance job is ready it enqueues MapDataRelevanceProcessingQueue for MapDataRelevanceProcessor. Minimap tracks, offline map bundles, and legend-aware relevance all depend on this stage completing after routes exist.',
    ],
];

const HOW_PROCESSED_PARAGRAPHS: RichParagraph[] = [
    [
        'When MapDataProcessor is invoked, it first stretches each SQS message\u2019s visibility timeout to the Lambda timeout so in-flight work is not redelivered mid-run. For every record it then parses a ',
        folder('MapDataEvent', 'src/map-data/types/mapDataEvent.ts'),
        ', loads the page\u2019s KML/GPX URL from the database, and runs ',
        folder('processMapData', 'src/map-data/processors/processMapData.ts'),
        ' in parallel with a Ropewiki author lookup. processMapData either downloads the source through the proxy or reuses the stored S3 object, converts to enriched GeoJSON and vector tiles, and uploads those artifacts to production-map-data-bucket. The resulting MapData row (plus legend) is upserted to RDS; when the upsert applies and processRelevantContext is set, a new MapDataRelevantContextJob is written and enqueued. A successful or soft-failed run deletes the SQS message; a thrown error leaves it on the queue to retry, and after five receives SQS moves it to MapDataProcessingDLQ.',
    ],
    [
        'Soft failures — unsupported file type, missing S3 source when downloadSource is false, GeoJSON/tile conversion problems, or partial S3 upload errors — are recorded on MapData.errorMessage. Those paths still finish the handler and delete the message so the same bad payload is not retried forever. Hard failures — unparsable bodies are deleted immediately as poison; download/timeout/unexpected throws leave the message invisible until the visibility window ends so another invoke can retry.',
    ],
];

const CONVERTING_SOURCE_PARAGRAPHS: RichParagraph[] = [
    [
        'Each MapDataProcessingQueue message carries a ',
        folder('downloadSource', 'src/map-data/types/mapDataEvent.ts'),
        ' flag. When it is true (the usual path for a new or revised Ropewiki route), MapDataProcessor downloads the KML or GPX from the route\u2019s source URL through the IP Royal proxy and writes it into a temp workspace. When the flag is false — typical of MapDataReprocessor runs that only need to rebuild tiles, re-enrich, or re-clean an existing map — the processor skips Ropewiki entirely and loads the previously stored bytes from production-map-data-bucket under source/{mapDataId}.kml (or .gpx) via ',
        folder('getSourceFile', 'src/map-data/s3/getSourceFile.ts'),
        '.',
    ],
    [
        'Persisting that source file on S3 is deliberate cost control. Reprocessing the same canyon is common: outlier cleaning, legend or tile pipeline changes, and on-demand rebuilds all need the original KML/GPX again. Fetching it from Ropewiki every time would burn proxy bandwidth and risk rate limits on a file that rarely changes; reading the cached object from S3 is cheaper and stable. The download path therefore uploads the source alongside the derived GeoJSON and tiles so later jobs can set downloadSource to false and still have everything they need.',
    ],
    [
        'With the source content in hand, ',
        folder('convertToGeoJson', 'src/map-data/util/convertToGeoJson.ts'),
        ' parses the KML or GPX XML and converts it to a GeoJSON FeatureCollection (via @tmcw/togeojson), writing {mapDataId}.geojson in the temp directory. Only .kml and .gpx URLs are accepted; anything else fails early with an unsupported-type error on the MapData record.',
    ],
    [
        'Before tiling, the GeoJSON is cleaned and enriched. If the event sets cleanOutlierPoints, ',
        folder(
            'identifyAndCleanOutlierPoints',
            'src/map-data/util/identifyAndCleanOutlierPoints.ts',
        ),
        ' looks for GPS track-sample noise and strips non-semantic points so a sparse outlier cloud does not inflate bounds or tiles. Then ',
        folder(
            'enrichGeoJsonWithLegendIds',
            'src/map-data/util/enrichGeoJsonWithLegendIds.ts',
        ),
        ' walks every feature: it assigns a stable legendId UUID on each geometry, builds the parallel legend map of Point, Line, and Polygon items (labels, stroke/fill colors, icons, and bounds taken from KML/GPX properties), and explodes MultiPoint / MultiLineString / MultiPolygon into simple geometries so each legend row matches one tile feature. The enriched FeatureCollection is what Tippecanoe and the MapData legend upsert consume next.',
    ],
];

const CONVERTING_TILES_PARAGRAPHS: RichParagraph[] = [
    [
        link('Tippecanoe', 'https://github.com/mapbox/tippecanoe'),
        ' is an open-source Mapbox tool that builds vector tilesets from GeoJSON (and related) feature collections. Instead of shipping one giant geometry file to every client, it cuts features into a zoomed pyramid of Mapbox Vector Tiles (MVT) — compact Protocol Buffer (.pbf) tiles keyed by z/x/y — so a map renderer only fetches the tiles that cover the current viewport.',
    ],
    [
        'MapDataProcessor runs Tippecanoe inside the Lambda via ',
        folder(
            'convertToTileDirectory',
            'src/map-data/util/convertToTileDirectory.ts',
        ),
        '. The enriched GeoJSON is split into points and everything else (lines and polygons); Tippecanoe builds separate MBTiles for the Points and PolyLines layers (zooms 0–20, with point-specific flags so markers stay dense and unclipped). tile-join then merges those MBTiles into a single directory of {z}/{x}/{y}.pbf files. That tree is uploaded under tiles/{mapDataId}/ on production-map-data-bucket, and MapData.tilesTemplate points clients at the {z}/{x}/{y}.pbf URL pattern.',
    ],
    [
        'Vector tiles are a binary geometry format, not pre-drawn images. Each .pbf carries styled-ready features (including the legendId properties Tippecanoe preserved from the GeoJSON) for one map tile; the app paints them with its own styles. That fits RopeGeo well: page minimaps and explore views can request only nearby tiles over the network, offline folder zips can store the same .pbf tree for local MapBox rendering, and legend-driven highlighting stays feature-level instead of baking colors into rasters. Compared with sending full GeoJSON for every canyon, the tile pyramid stays small per request, scales with zoom, and reuses the same assets online and offline.',
    ],
];

export function MapDataProcessorPage() {
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

                <Text style={styles.title}>MapDataProcessor</Text>

                <DocumentationToc currentPageId="mapdataprocessor" />

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
                        How Map Data Is Processed
                    </Text>
                    {HOW_PROCESSED_PARAGRAPHS.map((parts, paragraphIndex) => (
                        <RichTextParagraph
                            key={`how-processed-${paragraphIndex}`}
                            parts={parts}
                            githubUrl={WEBSCRAPER_GITHUB_URL}
                            defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                        />
                    ))}

                    <MermaidDiagram
                        chart={buildDecisionFlowchart()}
                        accessibilityLabel="MapDataProcessor per-message decision tree"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Converting The Source File To .geojson
                    </Text>
                    {CONVERTING_SOURCE_PARAGRAPHS.map(
                        (parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`converting-source-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={WEBSCRAPER_GITHUB_URL}
                                defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                            />
                        ),
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Converting .geojson to vector tiles
                    </Text>
                    {CONVERTING_TILES_PARAGRAPHS.map(
                        (parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`converting-tiles-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={WEBSCRAPER_GITHUB_URL}
                                defaultBranch={WEBSCRAPER_DEFAULT_BRANCH}
                            />
                        ),
                    )}
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
});
