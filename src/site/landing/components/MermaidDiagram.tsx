import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { MermaidNode } from '../pages/documentation/types/mermaidNode';

let mermaidReady: Promise<typeof import('mermaid').default> | null = null;
let renderCounter = 0;

/**
 * Loads mermaid once. HTML labels are enabled (securityLevel: 'loose') so
 * diagrams can place AWS icons beside text inside rounded nodes. The Iconify
 * "logos" pack remains registered for any diagrams that still use the native
 * icon shape syntax (logos:aws-*).
 */
function getMermaid() {
    if (!mermaidReady) {
        mermaidReady = (async () => {
            const mermaid = (await import('mermaid')).default;
            mermaid.registerIconPacks([
                {
                    name: 'logos',
                    loader: () =>
                        import('@iconify-json/logos').then(
                            (module) => module.icons
                        ),
                },
            ]);
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'loose',
                theme: 'dark',
                layout: 'elk',
                flowchart: {
                    // Give HTML service nodes room for icon + label.
                    wrappingWidth: 280,
                },
                themeVariables: {
                    darkMode: true,
                    background: '#111111',
                },
            });
            return mermaid;
        })();
    }
    return mermaidReady;
}

export function MermaidDiagram({
    chart,
    accessibilityLabel,
}: {
    chart: string;
    accessibilityLabel?: string;
}) {
    const containerRef = useRef<View>(null);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        let cancelled = false;
        const renderId = `mermaid-diagram-${renderCounter++}`;

        void (async () => {
            try {
                const mermaid = await getMermaid();
                const styleAppendix = MermaidNode.formatStyleAppendix();
                const fullChart = styleAppendix
                    ? `${chart}\n${styleAppendix}`
                    : chart;
                const { svg } = await mermaid.render(renderId, fullChart);
                const node = containerRef.current as unknown as HTMLElement;
                if (cancelled || !node) {
                    return;
                }
                node.innerHTML = svg;
                for (const cluster of node.querySelectorAll('g.cluster')) {
                    const rect = cluster.querySelector('rect');
                    const label = cluster.querySelector('g.cluster-label');
                    if (rect) {
                        rect.setAttribute('rx', '12');
                        rect.setAttribute('ry', '12');
                    }
                    if (rect && label) {
                        const rectX = Number(rect.getAttribute('x') ?? 0);
                        const transform = label.getAttribute('transform') ?? '';
                        const match = /translate\(\s*([^,]+),\s*([^)]+)\)/.exec(
                            transform
                        );
                        if (match) {
                            const labelY = match[2].trim();
                            const leftPadding = 12;
                            label.setAttribute(
                                'transform',
                                `translate(${rectX + leftPadding}, ${labelY})`
                            );
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to render mermaid diagram:', error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [chart]);

    return (
        <View
            ref={containerRef}
            style={styles.container}
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
});
