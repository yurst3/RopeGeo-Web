import { icons as logosIcons } from '@iconify-json/logos';
import type { CSSProperties } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * AWS services that can appear in Mermaid flowcharts. The service picks both
 * the Iconify logos icon and the default Mermaid node shape.
 */
export enum AwsService {
    EventBridge = 'EventBridge',
    Lambda = 'Lambda',
    Sqs = 'Sqs',
    Rds = 'Rds',
}

type AwsServiceStyle = {
    /** Iconify logos icon id (without the "logos:" prefix). */
    iconName: string;
    /** Default Mermaid shape id for this service. */
    nodeShape: string;
};

/**
 * Params for the {@link MermaidNode} constructor.
 *
 * When `maxWidth` is set, the label is clamped to that width and `maxLines`.
 * When omitted, the label sizes to its text (single-line by default).
 * When `backgroundColor` is set, a Mermaid `style` fill is emitted for the node.
 * When `pageLink` is set, the label is rendered as an underlined link in the
 * docs highlight color.
 */
export type MermaidNodeParams = {
    id: string;
    label: string;
    /** Image URL or data-URI shown to the left of the label. */
    iconSrc: string;
    /** Mermaid shape id (e.g. `stadium`, `das`, `st-rect`). */
    nodeShape: string;
    maxLines?: number;
    maxWidth?: number;
    /** CSS/SVG fill color for the Mermaid node background. */
    backgroundColor?: string;
    /** Docs (or other) href; when set, the label is an underlined highlight link. */
    pageLink?: string;
};

/**
 * Params for {@link MermaidNode.awsService}.
 *
 * `nodeShape` is optional here and falls back to the default for {@link service}.
 */
export type MermaidAwsServiceParams = Omit<
    MermaidNodeParams,
    'iconSrc' | 'nodeShape'
> & {
    service: AwsService;
    /** Mermaid shape id; overrides the default for {@link service}. */
    nodeShape?: string;
};

/**
 * Mermaid flowchart node. Build via the constructor or factory methods such as
 * {@link MermaidNode.awsService}, then interpolate into a chart string
 * (`${node}`) to use {@link toString}.
 *
 * HTML icon labels require Mermaid `securityLevel: 'loose'`.
 */
export class MermaidNode {
    private static readonly ICON_SIZE_PX = 36;
    private static readonly LABEL_GAP_PX = 10;
    private static readonly LABEL_FONT_SIZE_PX = 14;
    /** Matches landing `darkTheme.text.link` for in-diagram doc links. */
    private static readonly LINK_COLOR = '#dc732b';

    private static readonly SERVICE_STYLES: Record<
        AwsService,
        AwsServiceStyle
    > = {
        [AwsService.EventBridge]: {
            iconName: 'aws-eventbridge',
            nodeShape: 'subproc',
        },
        [AwsService.Lambda]: {
            iconName: 'aws-lambda',
            nodeShape: 'stadium',
        },
        [AwsService.Sqs]: {
            iconName: 'aws-sqs',
            nodeShape: 'das',
        },
        [AwsService.Rds]: {
            iconName: 'aws-rds',
            nodeShape: 'cyl',
        },
    };

    private readonly id: string;
    private readonly label: string;
    private readonly iconSrc: string;
    private readonly nodeShape: string;
    private readonly maxLines: number;
    private readonly maxWidth?: number;
    private readonly backgroundColor?: string;
    private readonly pageLink?: string;

    constructor({
        id,
        label,
        iconSrc,
        nodeShape,
        maxLines = 1,
        maxWidth,
        backgroundColor,
        pageLink,
    }: MermaidNodeParams) {
        this.id = id;
        this.label = label;
        this.iconSrc = iconSrc;
        this.nodeShape = nodeShape;
        this.maxLines = maxLines;
        this.maxWidth = maxWidth;
        this.backgroundColor = backgroundColor;
        this.pageLink = pageLink;
    }

    /**
     * classDef name → style props, filled when a node with backgroundColor is
     * stringified. Flushed into the chart by {@link formatStyleAppendix}.
     */
    private static readonly classDefs = new Map<string, string>();

    /**
     * node id → classDef name for background fills (applied via `class` lines
     * so `toString()` can stay a single edge-safe token).
     */
    private static readonly nodeClasses = new Map<string, string>();

    /**
     * Clears pending `classDef` / `class` registrations. Call before building a
     * chart string so styles from another page (same node ids) do not leak.
     */
    static resetStyleRegistry(): void {
        MermaidNode.classDefs.clear();
        MermaidNode.nodeClasses.clear();
    }

    /**
     * Mermaid `classDef` / `class` statements for nodes that set
     * `backgroundColor`. Append after the main chart (see MermaidDiagram).
     * Clears the registry afterward so the next chart starts clean.
     */
    static formatStyleAppendix(): string {
        const lines: string[] = [];
        for (const [className, props] of MermaidNode.classDefs) {
            lines.push(`classDef ${className} ${props}`);
        }
        for (const [nodeId, className] of MermaidNode.nodeClasses) {
            lines.push(`class ${nodeId} ${className}`);
        }
        MermaidNode.resetStyleRegistry();
        return lines.join('\n');
    }

    /**
     * AWS service node: icon on the left, label on the right. Icon and default
     * box shape come from {@link AwsService}; `nodeShape` may override the
     * default.
     */
    static awsService({
        service,
        nodeShape,
        ...rest
    }: MermaidAwsServiceParams): MermaidNode {
        const serviceStyle = MermaidNode.SERVICE_STYLES[service];
        return new MermaidNode({
            ...rest,
            iconSrc: MermaidNode.logosIconDataUri(serviceStyle.iconName),
            nodeShape: nodeShape ?? serviceStyle.nodeShape,
        });
    }

    /**
     * Single-line Mermaid node token safe for use in edges
     * (`${a} --> ${b}`). Background fills are registered for
     * {@link formatStyleAppendix} instead of emitting a `style` line here.
     */
    toString(): string {
        const html = this.renderHtmlLabel();
        if (this.backgroundColor != null) {
            const className = `bg_${this.id}`;
            MermaidNode.classDefs.set(
                className,
                `fill:${this.backgroundColor}`
            );
            MermaidNode.nodeClasses.set(this.id, className);
        } else {
            MermaidNode.nodeClasses.delete(this.id);
        }
        return `${this.id}@{ shape: ${this.nodeShape}, label: "${html}" }`;
    }

    /**
     * Builds a data-URI for an Iconify logos icon so it can be used as a CSS
     * background in Mermaid HTML node labels. Prefer a sized div over `<img>` —
     * Mermaid rewrites label `<img>` elements to `width: 100%` when text is also
     * present (native icon shape only supports label above/below anyway).
     */
    private static logosIconDataUri(iconName: string): string {
        const icon = logosIcons.icons[iconName];
        if (!icon) {
            throw new Error(`Unknown logos icon: ${iconName}`);
        }

        const width = icon.width ?? logosIcons.width ?? 256;
        const height = icon.height ?? logosIcons.height ?? 256;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${icon.body}</svg>`;

        if (typeof btoa !== 'function') {
            throw new Error(
                'btoa is required to embed AWS icons in Mermaid labels'
            );
        }
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    private labelStyle(): CSSProperties {
        const base: CSSProperties = {
            color:
                this.pageLink != null
                    ? MermaidNode.LINK_COLOR
                    : '#ffffff',
            fontSize: MermaidNode.LABEL_FONT_SIZE_PX,
            lineHeight: 1.25,
            textAlign: 'left',
            // Override Mermaid's foreignObject wrapper `white-space: nowrap`.
            whiteSpace: this.maxWidth != null ? 'normal' : 'nowrap',
            ...(this.pageLink != null
                ? { textDecoration: 'underline' }
                : {}),
        };

        if (this.maxWidth == null) {
            return base;
        }

        return {
            ...base,
            width: this.maxWidth,
            maxWidth: this.maxWidth,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: this.maxLines,
            wordBreak: 'break-word',
        };
    }

    /**
     * Mermaid wraps labels in double quotes (`id("...")`), so attribute quotes
     * from renderToStaticMarkup must be single quotes.
     */
    private renderHtmlLabel(): string {
        const iconSize = MermaidNode.ICON_SIZE_PX;
        const labelGap = MermaidNode.LABEL_GAP_PX;
        const labelStyle = this.labelStyle();
        const label =
            this.pageLink != null ? (
                <a
                    href={this.pageLink}
                    style={{
                        ...labelStyle,
                        // Keep docs orange for :visited (browser default is purple).
                        color: MermaidNode.LINK_COLOR,
                    }}
                >
                    <span style={{ color: MermaidNode.LINK_COLOR }}>
                        {this.label}
                    </span>
                </a>
            ) : (
                <div style={labelStyle}>{this.label}</div>
            );

        return renderToStaticMarkup(
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: labelGap,
                    ...(this.maxWidth != null
                        ? {
                              minWidth: iconSize + labelGap + this.maxWidth,
                          }
                        : {}),
                }}
            >
                <div
                    aria-hidden
                    style={{
                        width: iconSize,
                        height: iconSize,
                        flexShrink: 0,
                        backgroundImage: `url(${this.iconSrc})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'contain',
                    }}
                />
                {label}
            </div>
        ).replaceAll('"', "'");
    }
}
