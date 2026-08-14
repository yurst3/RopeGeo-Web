import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { darkTheme as colors } from '../../constants/darkTheme';
import { openUrl } from '../../utils/openUrl';
import {
    openHome,
    openRopewikiPageProcessorDocumentation,
    openRopewikiScraperDocumentation,
    scrollToSection,
} from '../../utils/routing';
import { DocumentationToc } from './components/DocumentationToc';
import {
    folder,
    link,
    RichTextParagraph,
    type RichParagraph,
} from './components/RichTextParagraph';

type RelatedPage = { name: string; openPage: () => void };

type IntroSection = {
    id: string;
    name: string;
    paragraphs: RichParagraph[];
};

type RepoSection = {
    id: string;
    name: string;
    githubUrl: string;
    defaultBranch: string;
    summary: string;
    organization: RichParagraph[];
    deploy: RichParagraph[];
    stack: RichParagraph[];
    relatedPages?: RelatedPage[];
};

const DISCORD_URL = 'https://discord.gg/hqKB3RWEaP';
const CONTACT_EMAIL = '4lrce4@gmail.com';

const INTRO_SECTIONS: IntroSection[] = [
    {
        id: 'overview',
        name: 'Overview',
        paragraphs: [
            [
                'RopeGeo is a free, open source platform for exploring canyoneering and technical hiking routes: a mobile app backed by route data that is scraped, processed, and served from AWS. The codebase is split across four repositories, each with a single responsibility. Mobile is the iOS and Android client. WebScraper ingests route data from public sources and serves the HTTP API. Common is a shared npm package that keeps the other repositories aligned on domain models and wire formats. Web hosts the ropegeo.com marketing site and the deep-link infrastructure on mobile.ropegeo.com. The project is owned and maintained by Ethan Hurst, but ideas and contributions from the community are welcomed.',
            ],
        ],
    },
    {
        id: 'how-to-contribute',
        name: 'How To Contribute',
        paragraphs: [
            [
                'Every contribution — ideas, art, or code — starts with a conversation. Prospective contributors should contact Ethan Hurst either through the ',
                link('RopeGeo Discord', DISCORD_URL),
                ' (username idreamofcorn, also known as "RopeGeo guy") or by email at ',
                link(CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`),
                '.',
            ],
            [
                'Code submissions require collaborator access. After making contact, Ethan invites the contributor as a collaborator on the relevant repository, which grants permission to push new code to it.',
            ],
            [
                'Getting submitted code into production follows a standard review flow. The contributor creates a new pull request and thoroughly tests the added code — with unit and database tests, and against live data dumps (testing instructions are in each repository\u2019s README). Ethan reviews the pull request, and with his approval the contributor may merge the code to the main/master branch, which deploys it to production.',
            ],
            [
                'AI-generated code is accepted, so long as it is up to the same standards as any other submission.',
            ],
        ],
    },
];

const REPOS: RepoSection[] = [
    {
        id: 'mobile',
        name: 'Mobile',
        githubUrl: 'https://github.com/yurst3/RopeGeo-Mobile',
        defaultBranch: 'main',
        summary:
            'Mobile is the RopeGeo iOS and Android client. Day-to-day work is TypeScript and React Native on top of Expo, with Expo Router providing file-based navigation. Because the app depends on native Mapbox code, it cannot run in Expo Go; contributors use development builds produced by prebuild.',
        organization: [
            [
                'The layout follows standard Expo project conventions: routes are defined by the file structure, UI code is separated from shared state and helpers, and the native projects are generated rather than hand-maintained. The most important distinction in the layout is between app source (safe to ship over the air) and native or build configuration (which forces a store release) — that distinction drives most of the workflows in this repo.',
            ],
            [
                'Navigation and screens live under ',
                folder('app/', 'app'),
                ', following Expo Router conventions where the folder structure is the route structure. The root layout redirects into a tab navigator with three tabs: explore, saved, and settings. Explore is the heart of the app — it owns the map experience and a set of nested routes for full-screen search, page and region detail, and informational screens explaining rating systems like risk, technical difficulty, water, time, permits, vehicles, and shuttle requirements.',
            ],
            [
                'Everything the screens are built from sits one level down. Reusable UI lives in ',
                folder('components/', 'components'),
                ', grouped by concern (search, badges, beta sections, minimap, settings, lists, and map chrome). Shared React context, theme tokens, and helper functions live in ',
                folder('context/', 'context'),
                ', ',
                folder('constants/', 'constants'),
                ', and ',
                folder('utils/', 'utils'),
                ', while Expo config plugins live in ',
                folder('plugins/', 'plugins'),
                ' and fonts and images live in ',
                folder('assets/', 'assets'),
                '.',
            ],
            [
                'Finally, the ',
                folder('android/', 'android'),
                ' and ',
                folder('ios/', 'ios'),
                ' trees are native projects generated by expo prebuild and are rarely edited directly. They matter because CI watches them: changes that touch these trees, app config files, package locks, plugins, or the native Mapbox marker assets are treated as native release triggers, meaning they cannot ship through an over-the-air update alone.',
            ],
        ],
        deploy: [
            [
                'Releases follow the standard Expo model of two distinct paths: fast over-the-air (OTA) JavaScript updates that users receive on their next app launch, and full store builds that go through App Store and Play review. Which path a given change takes is decided automatically — two GitHub Actions workflows watch pushes to main and use path filters to determine whether the commit is JS-only or touches native code.',
            ],
            [
                'The common case is the Update workflow. When a commit does not touch any native or build-config paths, it runs eas update and publishes an OTA bundle on the production channel. This covers most day-to-day work: TypeScript and React UI fixes, Metro-bundled assets, and logic changes that need no new native modules or permissions. Users on a compatible store build get the update on next launch with no review delay.',
            ],
            [
                'The heavier path is the Build and Submit workflow, which runs eas build and eas submit. It triggers when a push touches native or build configuration — app.json, package.json, eas.json, ',
                folder('plugins/', 'plugins'),
                ', or the native Mapbox marker images under ',
                folder('assets/', 'assets'),
                ' — as well as on v* tags or manual dispatch. This path covers version bumps that change runtimeVersion, dependencies with native code, new permissions, icons, splash screens, and first-time store releases. Android submission sits behind a workflow flag until Play credentials are configured in EAS.',
            ],
            [
                'Two edge cases are worth noting. If a single commit mixes app source with native config, only Build and Submit runs — the OTA workflow deliberately skips itself. And OTA updates only apply to store binaries compiled with expo-updates whose runtimeVersion matches expo.version in app.json, so after a new store build ships, JS-only work resumes flowing through the Update workflow for that version.',
            ],
        ],
        stack: [
            [
                'The stack is the mainstream Expo ecosystem, so most React Native experience transfers directly. The client is built with Expo and React Native, with Expo Router and React Navigation handling routing and tabs. The one significant native dependency is @rnmapbox/maps for the map experience — this is what rules out Expo Go and requires development builds. Around it sit the usual Expo modules (expo-location, expo-file-system, expo-font, expo-updates, and related device APIs). Cross-repo concerns come from ropegeo-common, which supplies shared domain types and the offline download orchestration; Mobile implements the platform-specific harness for filesystem paths. Releases run through EAS (build, submit, and OTA), and unit tests use Jest.',
            ],
        ],
    },
    {
        id: 'webscraper',
        name: 'WebScraper',
        githubUrl: 'https://github.com/yurst3/RopeGeo-WebScraper',
        defaultBranch: 'master',
        summary:
            'WebScraper is RopeGeo’s backend ingestion and API layer. It scrapes canyoneering sources (primarily Ropewiki), runs asynchronous pipelines that process pages, map data, images, and offline page zips, stores the results in PostgreSQL and S3, and serves the HTTP API that Mobile and Web consume.',
        organization: [
            [
                'This is the largest repo in the project, and it is best understood in terms of pipelines: data flows in from scrapers, through a series of SQS-driven processing stages, into PostgreSQL and S3, and back out through an HTTP API. The folder structure mirrors that flow — each pipeline stage is its own domain folder with a consistent internal shape, so familiarity with one domain transfers to the others.',
            ],
            [
                'The pipeline domains live under ',
                folder('src/', 'src'),
                '. ',
                folder('src/ropewiki/', 'src/ropewiki'),
                ' is the entry point of the data flow — it owns scraping and page processing against Ropewiki. Downstream of it, ',
                folder('src/map-data/', 'src/map-data'),
                ', ',
                folder('src/image-data/', 'src/image-data'),
                ', and ',
                folder('src/page-zipper/', 'src/page-zipper'),
                ' each own a processing stage (map data, images, and offline page bundles respectively), with their own SQS workers, Lambda handlers, and processors. Every domain follows the same internal pattern — types, database access, SQS helpers, and entrypoints — so jobs can be invoked from Lambda in production or run locally as plain scripts during development.',
            ],
            [
                'The serving side and the heavyweight jobs sit alongside the pipelines. HTTP API handlers live under ',
                folder('src/api/', 'src/api'),
                ', with the public contract defined in ',
                folder('openapi-docs/', 'openapi-docs'),
                '. Work too long for a 15-minute Lambda timeout lives under ',
                folder('src/fargate-tasks/', 'src/fargate-tasks'),
                ', where each task gets its own Dockerfile and main.ts and runs on ECS Fargate, either on a schedule or on demand. Shared helpers, converters, and the Zapatos-generated database types sit next to these domains.',
            ],
            [
                'Infrastructure lives in the repo too, as split CloudFormation under ',
                folder(
                    'cloudformation/stacks/main/',
                    'cloudformation/stacks/main'
                ),
                ' and ',
                folder(
                    'cloudformation/stacks/api/',
                    'cloudformation/stacks/api'
                ),
                '; the fragments are merged into generated templates before SAM validates or deploys anything. Database schema changes go through dbmate migrations, and the TypeScript layer over Postgres is regenerated with Zapatos.',
            ],
        ],
        deploy: [
            [
                'Deployment is fully automated through a GitHub Actions pipeline on master, and it is easiest to understand as one long ordered sequence: test, deploy infrastructure, then progressively wire the pieces together. A push runs the test suite first; from there the pipeline packages and deploys the main SAM stack to the testing environment automatically, with production gated behind a manual approval step.',
            ],
            [
                'After a successful main-stack deploy, the pipeline handles everything downstream: it builds and pushes the Fargate task images to ECR, deploys the API and CloudFront stack, writes the resulting CloudFront distribution ARNs back into the main stack (needed for origin access), and invalidates caches. The reason for the two-stack split is ordering — the main stack (Lambdas, queues, buckets, RDS-facing resources) has to exist first, then the resolved OpenAPI document is uploaded to the docs bucket, and only then can API Gateway and CloudFront be deployed against it.',
            ],
            [
                'One easily missed detail: the templates that actually deploy are generated. Everything under ',
                folder('cloudformation/stacks/', 'cloudformation/stacks'),
                ' is merged into gitignored mergedMainTemplate.yaml and mergedApiTemplate.yaml files before validation, so edits belong in the split fragments and never in the merged output.',
            ],
            [
                'Also note what the pipeline does not do: full historical scrapes. Ongoing Ropewiki sync fits inside Lambda timeouts because it only processes recently revised pages, but a complete scrape takes hours — far past the 15-minute Lambda limit — so repopulating a database from scratch is done locally, then dumped and restored into RDS by hand.',
            ],
        ],
        stack: [
            [
                'At its core this is a Node.js TypeScript serverless project on AWS: Lambda for compute, SQS for orchestration between pipeline stages, and AWS SAM with CloudFormation for infrastructure definition. Persistent data lives in PostgreSQL on RDS, with the schema evolved through dbmate migrations and typed access generated by Zapatos. The more specialized tools appear at the edges of the system — Puppeteer drives HTML extraction against Ropewiki, and Tippecanoe generates Mapbox vector tiles inside Fargate tasks where jobs outgrow Lambda. AWS SDK clients cover S3, SQS, CloudFront, and ECS; shared models and helpers come from ropegeo-common. Tests run with Jest, including optional database suites backed by a Docker Postgres container.',
            ],
        ],
        relatedPages: [
            {
                name: 'RopewikiScraper',
                openPage: openRopewikiScraperDocumentation,
            },
            {
                name: 'RopewikiPageProcessor',
                openPage: openRopewikiPageProcessorDocumentation,
            },
        ],
    },
    {
        id: 'common',
        name: 'Common',
        githubUrl: 'https://github.com/yurst3/RopeGeo-Common',
        defaultBranch: 'main',
        summary:
            'Common is the published npm package ropegeo-common. It holds shared domain models, API parameter and result types, AWS and HTTP helpers, offline download job orchestration, and React data-loader components so Mobile, WebScraper, and Web do not diverge on wire formats and cross-cutting utilities.',
        organization: [
            [
                'Common exists to solve one problem: three repos speaking the same wire format without copy-pasting types between them. Anything that both a producer (WebScraper) and a consumer (Mobile or Web) need to agree on lives here. The package is organized into a handful of subpath exports, and the choice of import subpath matters — some entries are safe everywhere while others pull in Node-only code.',
            ],
            [
                'The largest area is ',
                folder('src/models/', 'src/models'),
                ', imported as ropegeo-common/models. It holds the validated model classes, enums, difficulty rating systems, API query params and result wrappers, filters, previews, link-preview types, and the mobile/offline storage shapes. The package root re-exports models for convenience, and ropegeo-common/classes remains a temporary alias while older imports migrate.',
            ],
            [
                'Next to the models, ',
                folder('src/helpers/', 'src/helpers'),
                ' provides S3, SQS, CloudFront, HTTP, and offline page-bundle path helpers. This is where the import-path caveat applies: the full helpers barrel includes Node-only modules (S3 folder upload uses fs), so React Native and Metro consumers must import from ropegeo-common/helpers/network, which exposes only the request-timeout and abort helpers.',
            ],
            [
                'The remaining two areas are more specialized. ',
                folder('src/download/', 'src/download'),
                ' (imported as ropegeo-common/download) exports DownloadJobQueue and the task types behind offline downloads; the package defines the orchestration while Mobile implements the platform-specific DownloadPlatformHarness in its own tree. ',
                folder('src/components/', 'src/components'),
                ' exports the RopeGeoDataLoader family — RopeGeoDataLoader, RopeGeoPagedDataLoader, and RopeGeoProgressDataLoader — which give the client consistent online/offline fetching patterns.',
            ],
        ],
        deploy: [
            [
                'Because Common is a library rather than an application, its "deploy" is an npm release, and it is entirely automated: pushing to main runs the publish-npm workflow, which tests, builds with tsc into dist/, and publishes to the npm registry using trusted publishing over OIDC (no long-lived tokens). The one manual requirement is version discipline — CI verifies that the package.json version is strictly greater than what is currently published, and fails the release when the version has not been bumped. Nothing propagates automatically: Mobile, WebScraper, and Web pick up a new release by bumping their ropegeo-common dependency.',
            ],
        ],
        stack: [
            [
                'The stack is intentionally minimal for a shared library: TypeScript compiled to CommonJS under dist/, with subpath exports for models, helpers, helpers/network, download, and components. The main design decision is the peer dependencies — AWS SDK clients for S3, SQS, and CloudFront, plus React and undici, are peers rather than direct dependencies so that consuming repos control those versions and avoid duplicate installs. Tests use Jest, and the package publishes publicly as ropegeo-common.',
            ],
        ],
    },
    {
        id: 'web',
        name: 'Web',
        githubUrl: 'https://github.com/yurst3/RopeGeo-Web',
        defaultBranch: 'master',
        summary:
            'Web hosts RopeGeo’s public web surface: the marketing site on ropegeo.com and deep-link plus Open Graph HTML on mobile.ropegeo.com. This documentation page itself is part of the landing SPA in this repository.',
        organization: [
            [
                'Web is really two products in one repo — a marketing site and a deep-link service — plus the infrastructure that serves both. The two share conventions with the rest of the project (the same split-CloudFormation and OpenAPI patterns as WebScraper), so the infrastructure layout carries over directly between the two repos.',
            ],
            [
                'The marketing site lives under ',
                folder('src/site/landing/', 'src/site/landing'),
                ' as an Expo and React Native for Web app. There is no router library: App.tsx inspects the browser path and switches between home, privacy, and documentation, with the page components under ',
                folder('pages/', 'src/site/landing/pages'),
                ' and shared theme and routing helpers nearby.',
            ],
            [
                'The deep-link side has two halves. Static verification assets for Universal Links and App Links (Apple App Site Association, Digital Asset Links) live in ',
                folder(
                    'src/site/mobile-well-known/',
                    'src/site/mobile-well-known'
                ),
                ' and sync to the mobile S3 bucket. The dynamic half is ',
                folder('src/api/getExplorePage/', 'src/api/getExplorePage'),
                ', a Lambda that answers explore URLs by loading the landing index.html from S3, fetching link-preview JSON from WebScraper, injecting Open Graph meta tags, and returning the HTML directly — no redirect — so messengers and crawlers see correct previews.',
            ],
            [
                'Infrastructure mirrors WebScraper’s layout: ',
                folder(
                    'cloudformation/stacks/main/',
                    'cloudformation/stacks/main'
                ),
                ' defines buckets, the explore Lambda, and IAM, while ',
                folder(
                    'cloudformation/stacks/api/',
                    'cloudformation/stacks/api'
                ),
                ' defines the CloudFront distributions and an API Gateway that imports its resolved OpenAPI from the docs bucket. The API contract itself lives in ',
                folder('openapi-docs/', 'openapi-docs'),
                ', and ',
                folder('scripts/', 'scripts'),
                ' holds the glue — template merging, env placeholder resolution, the landing export, and copying extra SPA routes into dist/.',
            ],
        ],
        deploy: [
            [
                'Everything ships through a single GitHub Actions pipeline, and like WebScraper it is a strictly ordered sequence because later stages depend on outputs from earlier ones. The pipeline tests the repo, deploys the main stack, builds the landing site with expo export into dist/ and syncs it to the landing bucket, syncs the well-known assets to the mobile bucket, uploads resolved OpenAPI to the docs bucket, deploys the API and CloudFront stack, writes the CloudFront distribution ARNs back into the main stack so the buckets grant origin access, and finally invalidates the distributions.',
            ],
            [
                'The step most relevant to landing-page work is build:landing. Beyond the plain expo export it does two extra things: it injects the link-preview head placeholder that the getExplorePage Lambda later replaces with Open Graph tags, and it copies index.html to route-specific paths such as privacy and documentation. That copy step is what lets CloudFront and S3 serve those URLs as static entry points into the same single-page app — new routes must be registered there as well.',
            ],
        ],
        stack: [
            [
                'The stack splits cleanly along the two halves of the repo. The marketing UI uses Expo with React Native for Web — the same component model as Mobile, which keeps the visual language consistent across the project. The serving side is AWS SAM and CloudFormation with S3, CloudFront, and an API Gateway HTTP API in front of the getExplorePage Lambda, which uses @aws-sdk/client-s3 and plain fetch calls to WebScraper for preview JSON. Shared types come from ropegeo-common, the OpenAPI contract is linted with Redocly and Spectral, and unit tests use Jest.',
            ],
        ],
    },
];

export function DocumentationPage() {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const hash = window.location.hash.replace(/^#/, '');
        const sectionIds = [
            ...INTRO_SECTIONS.map((section) => section.id),
            ...REPOS.map((repo) => repo.id),
        ];
        if (hash && sectionIds.includes(hash)) {
            // Wait a tick so nativeID nodes are in the DOM.
            requestAnimationFrame(() => scrollToSection(hash));
        }
    }, []);

    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Back to RopeGeo home"
                    onPress={openHome}
                    style={({ pressed }) => [
                        styles.backLink,
                        pressed && styles.backLinkPressed,
                    ]}
                >
                    <Text style={styles.backLinkText}>← Back to RopeGeo</Text>
                </Pressable>

                <Text style={styles.title}>Documentation</Text>

                <DocumentationToc currentPageId="documentation" />

                {INTRO_SECTIONS.map((section) => (
                    <View
                        key={section.id}
                        nativeID={section.id}
                        style={[styles.section, styles.sectionDivider]}
                    >
                        <Text style={styles.sectionTitle}>{section.name}</Text>
                        {section.paragraphs.map((parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`${section.id}-${paragraphIndex}`}
                                parts={parts}
                            />
                        ))}
                    </View>
                ))}

                {REPOS.map((repo, index) => (
                    <View
                        key={repo.id}
                        nativeID={repo.id}
                        style={[
                            styles.section,
                            index < REPOS.length - 1 && styles.sectionDivider,
                        ]}
                    >
                        <Text style={styles.sectionTitle}>{repo.name}</Text>
                        <Pressable
                            accessibilityRole="link"
                            accessibilityLabel={`Open ${repo.name} on GitHub`}
                            onPress={() => openUrl(repo.githubUrl)}
                            style={({ pressed }) => [
                                styles.repoLink,
                                pressed && styles.repoLinkPressed,
                            ]}
                        >
                            <Text style={styles.repoLinkText}>
                                {repo.githubUrl.replace(/^https:\/\//, '')}
                            </Text>
                        </Pressable>
                        <Text style={styles.paragraph}>{repo.summary}</Text>

                        <Text style={styles.subsectionTitle}>Organization</Text>
                        {repo.organization.map((parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`${repo.id}-org-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={repo.githubUrl}
                                defaultBranch={repo.defaultBranch}
                            />
                        ))}

                        <Text style={styles.subsectionTitle}>Deploy</Text>
                        {repo.deploy.map((parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`${repo.id}-deploy-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={repo.githubUrl}
                                defaultBranch={repo.defaultBranch}
                            />
                        ))}

                        <Text style={styles.subsectionTitle}>
                            Major libraries & frameworks
                        </Text>
                        {repo.stack.map((parts, paragraphIndex) => (
                            <RichTextParagraph
                                key={`${repo.id}-stack-${paragraphIndex}`}
                                parts={parts}
                                githubUrl={repo.githubUrl}
                                defaultBranch={repo.defaultBranch}
                            />
                        ))}

                        {repo.relatedPages && (
                            <>
                                <Text style={styles.subsectionTitle}>
                                    Related Pages
                                </Text>
                                {repo.relatedPages.map((page) => (
                                    <Pressable
                                        key={page.name}
                                        accessibilityRole="link"
                                        accessibilityLabel={`Open ${page.name} documentation`}
                                        onPress={page.openPage}
                                        style={({ pressed }) => [
                                            styles.relatedPageLink,
                                            pressed &&
                                                styles.relatedPageLinkPressed,
                                        ]}
                                    >
                                        <Text
                                            style={styles.relatedPageLinkText}
                                        >
                                            {page.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </>
                        )}
                    </View>
                ))}
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
    sectionDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.separator,
    },
    sectionTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.text.link,
        marginTop: 8,
    },
    repoLink: {
        alignSelf: 'flex-start',
        marginTop: -4,
    },
    repoLinkPressed: {
        opacity: 0.75,
    },
    repoLinkText: {
        fontSize: 14,
        lineHeight: 22,
        color: colors.text.link,
        textDecorationLine: 'underline',
    },
    subsectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: 8,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
    },
    relatedPageLink: {
        alignSelf: 'flex-start',
        paddingVertical: 2,
    },
    relatedPageLinkPressed: {
        opacity: 0.75,
    },
    relatedPageLinkText: {
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '600',
        color: colors.text.link,
        textDecorationLine: 'underline',
    },
});
