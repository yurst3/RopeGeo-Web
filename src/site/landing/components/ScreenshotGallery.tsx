import { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    type ImageSourcePropType,
    Platform,
    StyleSheet,
    useWindowDimensions,
    View,
    type ViewStyle,
} from 'react-native';

import { darkTheme as colors } from '../constants/darkTheme';

const GALLERY_PAN_KEYFRAMES_NAME = 'ropegeo-gallery-pan';
const GALLERY_PAN_KEYFRAMES_STYLE_ID = 'ropegeo-gallery-pan-keyframes';

const VISIBLE_SLIDE_COUNT = 3;
const CARD_PADDING = 8;
const GAP = 12;
const REFERENCE_SCREENSHOT_WIDTH = 220;
const REFERENCE_SCREENSHOT_HEIGHT = 476;
/** Constant scroll speed for a smooth, continuous pan */
const PIXELS_PER_SECOND = 32;
const MAX_VIEWPORT_WIDTH = 960;
const HORIZONTAL_PAGE_PADDING = 48;
const MIN_EDGE_FADE_WIDTH = 40;
const MAX_EDGE_FADE_WIDTH = 80;
const EDGE_FADE_WIDTH_RATIO = 0.08;

export type ScreenshotItem = {
    source: ImageSourcePropType;
    label: string;
};

type ScreenshotGalleryProps = {
    shots: readonly ScreenshotItem[];
};

type GalleryMetrics = {
    viewportWidth: number;
    slideWidth: number;
    screenshotWidth: number;
    screenshotHeight: number;
    slideStride: number;
    lapDurationSec: number;
};

function useGalleryPanKeyframes() {
    useEffect(() => {
        if (Platform.OS !== 'web' || typeof document === 'undefined') {
            return;
        }

        if (document.getElementById(GALLERY_PAN_KEYFRAMES_STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = GALLERY_PAN_KEYFRAMES_STYLE_ID;
        style.textContent = `
@keyframes ${GALLERY_PAN_KEYFRAMES_NAME} {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
`;
        document.head.appendChild(style);
    }, []);
}

function useGalleryMetrics(slideCount: number): GalleryMetrics {
    const { width: windowWidth } = useWindowDimensions();

    return useMemo(() => {
        const viewportWidth = Math.min(
            windowWidth - HORIZONTAL_PAGE_PADDING,
            MAX_VIEWPORT_WIDTH,
        );
        const slideWidth =
            (viewportWidth - GAP * (VISIBLE_SLIDE_COUNT - 1)) /
            VISIBLE_SLIDE_COUNT;
        const screenshotWidth = slideWidth - CARD_PADDING * 2;
        const screenshotHeight =
            REFERENCE_SCREENSHOT_HEIGHT *
            (screenshotWidth / REFERENCE_SCREENSHOT_WIDTH);
        const slideStride = slideWidth + GAP;
        const lapDistance = slideStride * Math.max(slideCount, 1);
        const lapDurationSec = lapDistance / PIXELS_PER_SECOND;

        return {
            viewportWidth,
            slideWidth,
            screenshotWidth,
            screenshotHeight,
            slideStride,
            lapDurationSec,
        };
    }, [windowWidth, slideCount]);
}

function edgeFadeStyle(
    side: 'left' | 'right',
    width: number,
): ViewStyle | undefined {
    if (Platform.OS !== 'web') {
        return undefined;
    }

    const gradient =
        side === 'left'
            ? `linear-gradient(to right, ${colors.background}, transparent)`
            : `linear-gradient(to left, ${colors.background}, transparent)`;

    return {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width,
        pointerEvents: 'none',
        backgroundImage: gradient,
        ...(side === 'left' ? { left: 0 } : { right: 0 }),
    } as unknown as ViewStyle;
}

function webTrackPanStyle(durationSec: number): ViewStyle {
    return {
        animationName: GALLERY_PAN_KEYFRAMES_NAME,
        animationDuration: `${durationSec}s`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        willChange: 'transform',
    } as unknown as ViewStyle;
}

/** Native fallback when the landing bundle is not served on web. */
function NativePanningTrack({
    shots,
    metrics,
    loopedShots,
}: {
    shots: readonly ScreenshotItem[];
    metrics: GalleryMetrics;
    loopedShots: { key: string; source: ImageSourcePropType; label: string }[];
}) {
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (shots.length === 0) {
            return;
        }

        let cancelled = false;
        const lapDistance = metrics.slideStride * shots.length;
        const durationMs = metrics.lapDurationSec * 1000;

        const runLap = () => {
            if (cancelled) {
                return;
            }

            translateX.setValue(0);
            Animated.timing(translateX, {
                toValue: -lapDistance,
                duration: durationMs,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished && !cancelled) {
                    runLap();
                }
            });
        };

        runLap();

        return () => {
            cancelled = true;
            translateX.stopAnimation();
        };
    }, [translateX, shots.length, metrics.slideStride, metrics.lapDurationSec]);

    return (
        <Animated.View
            style={[
                styles.track,
                { gap: GAP, transform: [{ translateX }] },
            ]}
        >
            {loopedShots.map((shot) => (
                <SlideCard key={shot.key} shot={shot} metrics={metrics} />
            ))}
        </Animated.View>
    );
}

function SlideCard({
    shot,
    metrics,
}: {
    shot: { source: ImageSourcePropType; label: string };
    metrics: GalleryMetrics;
}) {
    return (
        <View
            style={[
                styles.card,
                {
                    width: metrics.slideWidth,
                    padding: CARD_PADDING,
                },
            ]}
        >
            <Image
                source={shot.source}
                style={{
                    width: metrics.screenshotWidth,
                    height: metrics.screenshotHeight,
                }}
                resizeMode="contain"
                accessibilityLabel={shot.label}
            />
        </View>
    );
}

export function ScreenshotGallery({ shots }: ScreenshotGalleryProps) {
    useGalleryPanKeyframes();
    const metrics = useGalleryMetrics(shots.length);
    const count = shots.length;

    if (count === 0) {
        return null;
    }

    const loopedShots = [...shots, ...shots].map((shot, index) => ({
        ...shot,
        key: `${shot.label}-${index}`,
    }));

    const viewportHeight = metrics.screenshotHeight + CARD_PADDING * 2;
    const edgeFadeWidth = Math.min(
        MAX_EDGE_FADE_WIDTH,
        Math.max(
            MIN_EDGE_FADE_WIDTH,
            metrics.viewportWidth * EDGE_FADE_WIDTH_RATIO,
        ),
    );

    const track =
        Platform.OS === 'web' ? (
            <View
                style={[
                    styles.track,
                    { gap: GAP },
                    webTrackPanStyle(metrics.lapDurationSec),
                ]}
            >
                {loopedShots.map((shot) => (
                    <SlideCard key={shot.key} shot={shot} metrics={metrics} />
                ))}
            </View>
        ) : (
            <NativePanningTrack
                shots={shots}
                metrics={metrics}
                loopedShots={loopedShots}
            />
        );

    return (
        <View
            style={[
                styles.galleryFrame,
                {
                    width: metrics.viewportWidth,
                    height: viewportHeight,
                },
            ]}
        >
            <View
                style={[
                    styles.viewport,
                    {
                        width: metrics.viewportWidth,
                        height: viewportHeight,
                    },
                ]}
            >
                {track}
            </View>
            <View style={edgeFadeStyle('left', edgeFadeWidth)} />
            <View style={edgeFadeStyle('right', edgeFadeWidth)} />
        </View>
    );
}

const styles = StyleSheet.create({
    galleryFrame: {
        alignSelf: 'center',
        position: 'relative',
    },
    viewport: {
        overflow: 'hidden',
    },
    track: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    card: {
        backgroundColor: colors.placeholder,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.separator,
        overflow: 'hidden',
    },
});
