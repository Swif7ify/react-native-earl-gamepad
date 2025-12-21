import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useGamepad from './useGamepad';
import type { GamepadButtonName, StickAxisName } from './types';

type Props = {
    enabled?: boolean;
    axisThreshold?: number;
};

const trackedAxes: StickAxisName[] = ['leftX', 'leftY', 'rightX', 'rightY'];

const format = (value?: number) => (value ?? 0).toFixed(2);

export default function GamepadDebug({ enabled = true, axisThreshold = 0.15 }: Props) {
    const { bridge, pressedButtons, axes } = useGamepad({ enabled, axisThreshold });

    const pressedList = useMemo(() => Array.from(pressedButtons).sort(), [pressedButtons]);
    const pressed = (key: GamepadButtonName) => pressedButtons.has(key);
    const axis = (key: StickAxisName) => axes[key] ?? 0;

    return (
        <View style={styles.container}>
            {bridge}
            <Text style={styles.title}>Gamepad Debug</Text>

            <View style={styles.controller}>
                <View style={styles.shoulders}>
                    <View style={[styles.bumper, pressed('lb') && styles.active]}>
                        <Text style={styles.label}>LB</Text>
                    </View>
                    <View style={[styles.bumper, pressed('rb') && styles.active]}>
                        <Text style={styles.label}>RB</Text>
                    </View>
                </View>
                <View style={styles.triggers}>
                    <View style={[styles.trigger, pressed('lt') && styles.active]}>
                        <Text style={styles.label}>LT</Text>
                    </View>
                    <View style={[styles.trigger, pressed('rt') && styles.active]}>
                        <Text style={styles.label}>RT</Text>
                    </View>
                </View>

                <View style={styles.midRow}>
                    <View style={styles.stickZone}>
                        <View style={styles.stickRing}>
                            <View
                                style={[
                                    styles.stick,
                                    {
                                        transform: [
                                            { translateX: axis('leftX') * 20 },
                                            { translateY: axis('leftY') * -20 },
                                        ],
                                    },
                                    pressed('ls') && styles.active,
                                ]}
                            />
                        </View>
                        <Text style={styles.smallLabel}>LS</Text>
                    </View>

                    <View style={styles.centerCluster}>
                        <View style={[styles.smallKey, pressed('back') && styles.active]}>
                            <Text style={styles.label}>Back</Text>
                        </View>
                        <View style={[styles.smallKey, pressed('start') && styles.active]}>
                            <Text style={styles.label}>Start</Text>
                        </View>
                        <View style={[styles.smallKey, pressed('home') && styles.active]}>
                            <Text style={styles.label}>Home</Text>
                        </View>
                    </View>

                    <View style={styles.faceCluster}>
                        <View style={styles.faceRow}>
                            <View style={[styles.faceButton, pressed('y') && styles.faceActive]}>
                                <Text style={styles.faceText}>Y</Text>
                            </View>
                        </View>
                        <View style={styles.faceRow}>
                            <View style={[styles.faceButton, pressed('x') && styles.faceActive]}>
                                <Text style={styles.faceText}>X</Text>
                            </View>
                            <View style={[styles.faceButton, pressed('b') && styles.faceActive]}>
                                <Text style={styles.faceText}>B</Text>
                            </View>
                        </View>
                        <View style={styles.faceRow}>
                            <View style={[styles.faceButton, pressed('a') && styles.faceActive]}>
                                <Text style={styles.faceText}>A</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.dpad}>
                        <View
                            style={[
                                styles.dpadKey,
                                styles.dpadVertical,
                                styles.dpadUp,
                                pressed('dpadUp') && styles.active,
                            ]}
                        />
                        <View
                            style={[
                                styles.dpadKey,
                                styles.dpadVertical,
                                styles.dpadDown,
                                pressed('dpadDown') && styles.active,
                            ]}
                        />
                        <View
                            style={[
                                styles.dpadKey,
                                styles.dpadHorizontal,
                                styles.dpadLeft,
                                pressed('dpadLeft') && styles.active,
                            ]}
                        />
                        <View
                            style={[
                                styles.dpadKey,
                                styles.dpadHorizontal,
                                styles.dpadRight,
                                pressed('dpadRight') && styles.active,
                            ]}
                        />
                    </View>

                    <View style={styles.stickZone}>
                        <View style={styles.stickRing}>
                            <View
                                style={[
                                    styles.stick,
                                    {
                                        transform: [
                                            { translateX: axis('rightX') * 20 },
                                            { translateY: axis('rightY') * -20 },
                                        ],
                                    },
                                    pressed('rs') && styles.active,
                                ]}
                            />
                        </View>
                        <Text style={styles.smallLabel}>RS</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.subtitle}>Pressed ({pressedList.length})</Text>
            <View style={styles.badgeRow}>
                {pressedList.length === 0 ? (
                    <Text style={styles.muted}>None</Text>
                ) : (
                    pressedList.map((name) => (
                        <View key={name} style={styles.badge}>
                            <Text style={styles.badgeText}>{name}</Text>
                        </View>
                    ))
                )}
            </View>

            <Text style={styles.subtitle}>Axes</Text>
            <View style={styles.axesGrid}>
                {trackedAxes.map((axis) => (
                    <View key={axis} style={styles.axisItem}>
                        <Text style={styles.axisLabel}>{axis}</Text>
                        <Text style={styles.axisValue}>{format(axes[axis])}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        gap: 12,
        backgroundColor: '#0b1220',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1f2a3d',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e5e7eb',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '600',
        color: '#cbd5e1',
    },
    muted: {
        color: '#9ca3af',
        fontSize: 13,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#374151',
    },
    badgeText: {
        color: '#e5e7eb',
        fontSize: 12,
        fontWeight: '600',
    },
    axisItem: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
        minWidth: 90,
    },
    axisLabel: {
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '600',
    },
    axisValue: {
        color: '#f8fafc',
        fontSize: 16,
        fontVariant: ['tabular-nums'],
    },
    controller: {
        backgroundColor: '#0f172a',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1f2a3d',
        padding: 12,
        gap: 12,
    },
    shoulders: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    triggers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    bumper: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
        alignItems: 'center',
    },
    trigger: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
        alignItems: 'center',
    },
    label: {
        color: '#d1d5db',
        fontSize: 12,
        fontWeight: '700',
    },
    smallLabel: {
        color: '#9ca3af',
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },
    midRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    centerCluster: {
        alignItems: 'center',
        gap: 6,
    },
    smallKey: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    faceCluster: {
        alignItems: 'center',
        gap: 4,
    },
    faceRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    faceButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#162032',
        borderWidth: 1,
        borderColor: '#1f2a3d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    faceText: {
        color: '#e5e7eb',
        fontWeight: '800',
    },
    faceActive: {
        backgroundColor: '#0ea5e9',
        borderColor: '#38bdf8',
        shadowColor: '#38bdf8',
        shadowOpacity: 0.6,
        shadowRadius: 6,
    },
    stickZone: {
        width: 96,
        alignItems: 'center',
        gap: 6,
    },
    stickRing: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 1,
        borderColor: '#1f2937',
        backgroundColor: '#0c1426',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stick: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#1f2937',
        borderWidth: 2,
        borderColor: '#111827',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    dpad: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    dpadKey: {
        position: 'absolute',
        backgroundColor: '#111827',
        borderColor: '#1f2937',
        borderWidth: 1,
        borderRadius: 6,
    },
    dpadVertical: {
        width: 28,
        height: 46,
    },
    dpadHorizontal: {
        width: 46,
        height: 28,
    },
    active: {
        borderColor: '#22d3ee',
        backgroundColor: '#0ea5e9',
        shadowColor: '#22d3ee',
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    dpadUp: { top: 6, left: 46 },
    dpadDown: { bottom: 6, left: 46 },
    dpadLeft: { left: 6, top: 46 },
    dpadRight: { right: 6, top: 46 },
    axesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
});
