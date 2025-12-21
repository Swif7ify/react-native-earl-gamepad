import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import useGamepad from "./useGamepad";
import type { GamepadButtonName, StickAxisName } from "./types";

type Props = {
	enabled?: boolean;
	axisThreshold?: number;
};

const trackedAxes: StickAxisName[] = ["leftX", "leftY", "rightX", "rightY"];

const format = (value?: number) => (value ?? 0).toFixed(2);

export default function GamepadDebug({
	enabled = true,
	axisThreshold = 0.15,
}: Props) {
	const { bridge, pressedButtons, axes, buttonValues } = useGamepad({
		enabled,
		axisThreshold,
	});

	const pressedList = useMemo(
		() => Array.from(pressedButtons).sort(),
		[pressedButtons]
	);
	const pressed = (key: GamepadButtonName) => pressedButtons.has(key);
	const axis = (key: StickAxisName) => axes[key] ?? 0;
	const trigger = (key: GamepadButtonName) => buttonValues[key] ?? 0;

	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{bridge}

				<View style={styles.headerRow}>
					<Text style={styles.title}>Gamepad Debug</Text>
					<View style={styles.tag}>
						<Text style={styles.tagText}>
							Enabled {enabled ? "On" : "Off"}
						</Text>
					</View>
				</View>

				<View style={styles.body}>
					<View style={[styles.card, styles.controllerCard]}>
						<Text style={styles.cardTitle}>Controller</Text>

						<View style={styles.controller}>
							<View style={styles.shoulders}>
								<View
									style={[
										styles.bumper,
										pressed("lb") && styles.active,
									]}
								>
									<Text style={styles.label}>LB</Text>
								</View>
								<View
									style={[
										styles.bumper,
										pressed("rb") && styles.active,
									]}
								>
									<Text style={styles.label}>RB</Text>
								</View>
							</View>
							<View style={styles.triggers}>
								<View
									style={[
										styles.trigger,
										pressed("lt") && styles.active,
									]}
								>
									<Text style={styles.label}>LT</Text>
									<View style={styles.triggerBar}>
										<View
											style={{
												...styles.triggerFill,
												width: `${Math.round(
													trigger("lt") * 100
												)}%`,
											}}
										/>
									</View>
									<Text style={styles.smallLabel}>
										{(trigger("lt") ?? 0).toFixed(2)}
									</Text>
								</View>
								<View
									style={[
										styles.trigger,
										pressed("rt") && styles.active,
									]}
								>
									<Text style={styles.label}>RT</Text>
									<View style={styles.triggerBar}>
										<View
											style={{
												...styles.triggerFill,
												width: `${Math.round(
													trigger("rt") * 100
												)}%`,
											}}
										/>
									</View>
									<Text style={styles.smallLabel}>
										{(trigger("rt") ?? 0).toFixed(2)}
									</Text>
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
														{
															translateX:
																axis("leftX") *
																20,
														},
														{
															translateY:
																axis("leftY") *
																-20,
														},
													],
												},
												pressed("ls") && styles.active,
											]}
										/>
									</View>
									<Text style={styles.smallLabel}>LS</Text>
								</View>

								<View style={styles.centerCluster}>
									<View
										style={[
											styles.smallKey,
											pressed("back") && styles.active,
										]}
									>
										<Text style={styles.label}>Back</Text>
									</View>
									<View
										style={[
											styles.smallKey,
											pressed("start") && styles.active,
										]}
									>
										<Text style={styles.label}>Start</Text>
									</View>
									<View
										style={[
											styles.smallKey,
											pressed("home") && styles.active,
										]}
									>
										<Text style={styles.label}>Home</Text>
									</View>
								</View>

								<View style={styles.faceCluster}>
									<View style={styles.faceRow}>
										<View
											style={[
												styles.faceButton,
												pressed("y") &&
													styles.faceActive,
											]}
										>
											<Text style={styles.faceText}>
												Y
											</Text>
										</View>
									</View>
									<View style={styles.faceRow}>
										<View
											style={[
												styles.faceButton,
												pressed("x") &&
													styles.faceActive,
											]}
										>
											<Text style={styles.faceText}>
												X
											</Text>
										</View>
										<View
											style={[
												styles.faceButton,
												pressed("b") &&
													styles.faceActive,
											]}
										>
											<Text style={styles.faceText}>
												B
											</Text>
										</View>
									</View>
									<View style={styles.faceRow}>
										<View
											style={[
												styles.faceButton,
												pressed("a") &&
													styles.faceActive,
											]}
										>
											<Text style={styles.faceText}>
												A
											</Text>
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
											pressed("dpadUp") && styles.active,
										]}
									/>
									<View
										style={[
											styles.dpadKey,
											styles.dpadVertical,
											styles.dpadDown,
											pressed("dpadDown") &&
												styles.active,
										]}
									/>
									<View
										style={[
											styles.dpadKey,
											styles.dpadHorizontal,
											styles.dpadLeft,
											pressed("dpadLeft") &&
												styles.active,
										]}
									/>
									<View
										style={[
											styles.dpadKey,
											styles.dpadHorizontal,
											styles.dpadRight,
											pressed("dpadRight") &&
												styles.active,
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
														{
															translateX:
																axis("rightX") *
																20,
														},
														{
															translateY:
																axis("rightY") *
																-20,
														},
													],
												},
												pressed("rs") && styles.active,
											]}
										/>
									</View>
									<Text style={styles.smallLabel}>RS</Text>
								</View>
							</View>
						</View>
					</View>

					<View style={[styles.card, styles.stateCard]}>
						<Text style={styles.cardTitle}>State</Text>

						<Text style={styles.sectionTitle}>Pressed</Text>
						<View style={styles.badgeRow}>
							{pressedList.length === 0 ? (
								<Text style={styles.muted}>None</Text>
							) : (
								pressedList.map((name) => (
									<View key={name} style={styles.badge}>
										<Text style={styles.badgeText}>
											{name}
										</Text>
									</View>
								))
							)}
						</View>

						<Text style={styles.sectionTitle}>Axes</Text>
						<View style={styles.axesGrid}>
							{trackedAxes.map((axisName) => (
								<View key={axisName} style={styles.axisItem}>
									<Text style={styles.axisLabel}>
										{axisName}
									</Text>
									<Text style={styles.axisValue}>
										{format(axes[axisName])}
									</Text>
								</View>
							))}
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		padding: 12,
		backgroundColor: "#f5f7fb",
	},
	scrollContent: {
		paddingBottom: 24,
		gap: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "#0f172a",
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 12,
	},
	tag: {
		backgroundColor: "#e2e8f0",
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#cbd5e1",
	},
	tagText: {
		color: "#0f172a",
		fontWeight: "700",
		fontSize: 12,
	},
	subtitle: {
		marginTop: 4,
		fontSize: 14,
		fontWeight: "600",
		color: "#475569",
	},
	muted: {
		color: "#64748b",
		fontSize: 13,
	},
	badgeRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
	},
	badge: {
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 12,
		backgroundColor: "#e2e8f0",
		borderWidth: 1,
		borderColor: "#cbd5e1",
	},
	badgeText: {
		color: "#0f172a",
		fontSize: 12,
		fontWeight: "600",
	},
	sectionTitle: {
		marginTop: 12,
		marginBottom: 6,
		color: "#0f172a",
		fontSize: 13,
		fontWeight: "700",
	},
	axisItem: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: "#f8fafc",
		borderWidth: 1,
		borderColor: "#cbd5e1",
		minWidth: 90,
	},
	axisLabel: {
		color: "#0f172a",
		fontSize: 12,
		fontWeight: "600",
	},
	axisValue: {
		color: "#0f172a",
		fontSize: 16,
		fontVariant: ["tabular-nums"],
	},
	body: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		alignSelf: "stretch",
	},
	card: {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: "100%",
		backgroundColor: "#ffffff",
		borderRadius: 14,
		borderWidth: 1,
		borderColor: "#e2e8f0",
		padding: 12,
		gap: 12,
	},
	controllerCard: {
		minWidth: 320,
	},
	stateCard: {
		minWidth: 260,
	},
	cardTitle: {
		color: "#0f172a",
		fontWeight: "700",
		fontSize: 16,
	},
	controller: {
		backgroundColor: "#f8fafc",
		borderRadius: 14,
		borderWidth: 1,
		borderColor: "#e2e8f0",
		padding: 12,
		gap: 12,
	},
	shoulders: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	triggers: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 8,
	},
	bumper: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: "#e2e8f0",
		borderWidth: 1,
		borderColor: "#cbd5e1",
		alignItems: "center",
	},
	trigger: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: "#e2e8f0",
		borderWidth: 1,
		borderColor: "#cbd5e1",
		alignItems: "center",
	},
	triggerBar: {
		marginTop: 6,
		width: "100%",
		height: 10,
		borderRadius: 6,
		backgroundColor: "#f1f5f9",
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "#cbd5e1",
	},
	triggerFill: {
		height: "100%",
		backgroundColor: "#2563eb",
	},
	label: {
		color: "#0f172a",
		fontSize: 12,
		fontWeight: "700",
	},
	smallLabel: {
		color: "#475569",
		fontSize: 11,
		marginTop: 4,
		textAlign: "center",
	},
	midRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	centerCluster: {
		alignItems: "center",
		gap: 6,
	},
	smallKey: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 8,
		backgroundColor: "#e2e8f0",
		borderWidth: 1,
		borderColor: "#cbd5e1",
	},
	faceCluster: {
		alignItems: "center",
		gap: 4,
	},
	faceRow: {
		flexDirection: "row",
		gap: 8,
		justifyContent: "center",
	},
	faceButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "#e0f2fe",
		borderWidth: 1,
		borderColor: "#bae6fd",
		alignItems: "center",
		justifyContent: "center",
	},
	faceText: {
		color: "#0f172a",
		fontWeight: "800",
	},
	faceActive: {
		backgroundColor: "#2563eb",
		borderColor: "#1d4ed8",
		shadowColor: "#2563eb",
		shadowOpacity: 0.6,
		shadowRadius: 6,
	},
	stickZone: {
		width: 96,
		alignItems: "center",
		gap: 6,
	},
	stickRing: {
		width: 84,
		height: 84,
		borderRadius: 42,
		borderWidth: 1,
		borderColor: "#cbd5e1",
		backgroundColor: "#f8fafc",
		alignItems: "center",
		justifyContent: "center",
	},
	stick: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: "#e2e8f0",
		borderWidth: 2,
		borderColor: "#cbd5e1",
	},
	bottomRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 12,
	},
	dpad: {
		width: 120,
		height: 120,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
	},
	dpadKey: {
		position: "absolute",
		backgroundColor: "#e2e8f0",
		borderColor: "#cbd5e1",
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
		borderColor: "#2563eb",
		backgroundColor: "#2563eb",
		shadowColor: "#2563eb",
		shadowOpacity: 0.5,
		shadowRadius: 4,
	},
	dpadUp: { top: 6, left: 46 },
	dpadDown: { bottom: 6, left: 46 },
	dpadLeft: { left: 6, top: 46 },
	dpadRight: { right: 6, top: 46 },
	axesGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
});
