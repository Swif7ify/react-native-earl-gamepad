import React, { useMemo } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	Pressable,
	ActivityIndicator,
	View,
	useWindowDimensions,
} from "react-native";
import useGamepad from "./useGamepad";
import type { GamepadButtonName, StickAxisName } from "./types";

type Props = {
	enabled?: boolean;
	axisThreshold?: number;
};

const trackedAxes: StickAxisName[] = ["leftX", "leftY", "rightX", "rightY"];

const format = (value?: number) => (value ?? 0).toFixed(2);

type ControllerVisualProps = {
	pressed: (key: GamepadButtonName) => boolean;
	axis: (key: StickAxisName) => number;
	value: (key: GamepadButtonName) => number;
};

function ControllerVisual({ pressed, axis, value }: ControllerVisualProps) {
	const level = (name: GamepadButtonName) => {
		const v = value(name);
		return Math.max(v, pressed(name) ? 1 : 0);
	};

	const { width, height } = useWindowDimensions();
	const isPortrait = height >= width;
	const containerScaleStyle = isPortrait
		? { transform: [{ scale: 0.7 }] }
		: undefined;

	const mix = (a: number, b: number, t: number) =>
		Math.round(a + (b - a) * t);
	const stickColor = (mag: number) => {
		const clamped = Math.min(1, Math.max(0, mag));
		const r = mix(34, 37, clamped);
		const g = mix(34, 99, clamped);
		const b = mix(34, 235, clamped);
		return `rgb(${r}, ${g}, ${b})`;
	};
	const stickInner = (mag: number) => {
		const clamped = Math.min(1, Math.max(0, mag));
		const shade = mix(109, 200, clamped);
		return `rgb(${shade}, ${shade}, ${shade})`;
	};

	const leftMag = Math.min(1, Math.hypot(axis("leftX"), axis("leftY")));
	const rightMag = Math.min(1, Math.hypot(axis("rightX"), axis("rightY")));

	return (
		<View style={styles.psWrapper}>
			<View style={[styles.psContainer, containerScaleStyle]}>
				<View style={styles.psShoulderRow}>
					<View
						style={[
							styles.psShoulder,
							styles.psShoulderLeft,
							level("lb") > 0 && styles.psShoulderActive,
							{ opacity: 0.55 + 0.45 * level("lb") },
						]}
					>
						<Text
							style={[
								styles.psShoulderText,
								level("lb") > 0 && styles.psShoulderTextActive,
							]}
						>
							L1
						</Text>
					</View>
					<View
						style={[
							styles.psShoulder,
							styles.psShoulderLeft,
							level("lt") > 0 && styles.psShoulderActive,
							{ opacity: 0.55 + 0.45 * level("lt") },
						]}
					>
						<Text
							style={[
								styles.psShoulderText,
								level("lt") > 0 && styles.psShoulderTextActive,
							]}
						>
							L2
						</Text>
					</View>
					<View
						style={[
							styles.psShoulder,
							styles.psShoulderRight,
							level("rb") > 0 && styles.psShoulderActive,
							{ opacity: 0.55 + 0.45 * level("rb") },
						]}
					>
						<Text
							style={[
								styles.psShoulderText,
								level("rb") > 0 && styles.psShoulderTextActive,
							]}
						>
							R1
						</Text>
					</View>
					<View
						style={[
							styles.psShoulder,
							styles.psShoulderRight,
							level("rt") > 0 && styles.psShoulderActive,
							{ opacity: 0.55 + 0.45 * level("rt") },
						]}
					>
						<Text
							style={[
								styles.psShoulderText,
								level("rt") > 0 && styles.psShoulderTextActive,
							]}
						>
							R2
						</Text>
					</View>
				</View>

				<View style={styles.psMiddle} />
				<View
					style={[
						styles.psPaveTactile,
						pressed("touchpad") && styles.psPaveTactileActive,
					]}
				/>
				<View
					style={[
						styles.psShare,
						pressed("back") && styles.psActiveButton,
					]}
				/>
				<View
					style={[
						styles.psOptions,
						pressed("start") && styles.psActiveButton,
					]}
				/>

				<View style={styles.psLeftHand}>
					<View style={styles.psLeftPad}>
						<View
							style={[
								styles.psArrowUp,
								pressed("dpadUp") && styles.psActiveButton,
							]}
						/>
						<View
							style={[
								styles.psArrowDown,
								pressed("dpadDown") && styles.psActiveButton,
							]}
						/>
						<View
							style={[
								styles.psArrowRight,
								pressed("dpadRight") && styles.psActiveButton,
							]}
						/>
						<View
							style={[
								styles.psArrowLeft,
								pressed("dpadLeft") && styles.psActiveButton,
							]}
						/>
					</View>
				</View>

				<View style={styles.psRightHand}>
					<View style={styles.psRightPad}>
						<View
							style={[
								styles.psTriangle,
								pressed("y") && styles.psActiveButton,
							]}
						/>
						<View
							style={[
								styles.psTriangleBas,
								pressed("y") && styles.psTriangleLineActive,
							]}
						/>
						<View
							style={[
								styles.psTriangleGauche,
								pressed("y") && styles.psTriangleLineActive,
							]}
						/>
						<View
							style={[
								styles.psTriangleDroit,
								pressed("y") && styles.psTriangleLineActive,
							]}
						/>

						<View
							style={[
								styles.psCarre,
								pressed("x") && styles.psActiveButton,
							]}
						>
							<View
								style={[
									styles.psCarreRose,
									pressed("x") && styles.psPinkActive,
								]}
							/>
						</View>

						<View
							style={[
								styles.psRond,
								pressed("b") && styles.psActiveButton,
							]}
						>
							<View
								style={[
									styles.psRondRouge,
									pressed("b") && styles.psRedActive,
								]}
							/>
						</View>

						<View
							style={[
								styles.psCroix,
								pressed("a") && styles.psActiveButton,
							]}
						>
							<View
								style={[
									styles.psCroixBleue,
									pressed("a") && styles.psCrossLineActive,
								]}
							/>
							<View
								style={[
									styles.psCroixBleue2,
									pressed("a") && styles.psCrossLineActive,
								]}
							/>
						</View>
					</View>

					<View
						style={[
							styles.psRollLeft,
							pressed("ls") && styles.psStickPressed,
						]}
					>
						<View
							style={[
								styles.psRollIn,
								{
									transform: [
										{ translateX: axis("leftX") * 6 },
										{ translateY: axis("leftY") * 6 },
									],
									backgroundColor: stickColor(leftMag),
								},
								pressed("ls") && styles.psStickInnerPressed,
							]}
						>
							<View
								style={[
									styles.psRollInIn,
									{ backgroundColor: stickInner(leftMag) },
									pressed("ls") &&
										styles.psStickCenterPressed,
								]}
							/>
						</View>
					</View>

					<View
						style={[
							styles.psPsButton,
							pressed("home") && styles.psActiveButton,
						]}
					/>

					<View
						style={[
							styles.psRollRight,
							pressed("rs") && styles.psStickPressed,
						]}
					>
						<View
							style={[
								styles.psRollIn,
								{
									transform: [
										{ translateX: axis("rightX") * 6 },
										{ translateY: axis("rightY") * 6 },
									],
									backgroundColor: stickColor(rightMag),
								},
								pressed("rs") && styles.psStickInnerPressed,
							]}
						>
							<View
								style={[
									styles.psRollInIn,
									{ backgroundColor: stickInner(rightMag) },
									pressed("rs") &&
										styles.psStickCenterPressed,
								]}
							/>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}

export default function GamepadDebug({
	enabled = true,
	axisThreshold = 0.15,
}: Props) {
	const {
		bridge,
		pressedButtons,
		axes,
		buttonValues,
		info,
		vibrate,
		stopVibration,
	} = useGamepad({
		enabled,
		axisThreshold,
	});

	const pressedList = useMemo(
		() => Array.from(pressedButtons).sort(),
		[pressedButtons]
	);
	const pressed = (key: GamepadButtonName) => pressedButtons.has(key);
	const axisValue = (key: StickAxisName) => axes[key] ?? 0;
	const buttonValue = (key: GamepadButtonName) => buttonValues[key] ?? 0;

	const isConnected = info.connected;
	const controllerLabel = info.id ?? "No controller detected";
	const vendorLabel = info.vendor ?? "—";
	const productLabel = info.product ?? "—";
	const mappingLabel = info.mapping ?? "unknown";
	const timestampLabel =
		info.timestamp != null ? Math.round(info.timestamp).toString() : "—";
	const infoItems = [
		{ label: "Name", value: controllerLabel },
		{ label: "Vendor", value: vendorLabel },
		{ label: "Product", value: productLabel },
		{ label: "Mapping", value: mappingLabel },
		{ label: "Index", value: info.index != null ? `${info.index}` : "—" },
		{ label: "Axes", value: `${info.axes || 0}` },
		{ label: "Buttons", value: `${info.buttons || 0}` },
		{ label: "Vibration", value: info.canVibrate ? "Yes" : "No" },
		{ label: "Timestamp", value: timestampLabel },
	];

	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{bridge}
				<View style={styles.body}>
					<View style={[styles.card, styles.controllerCard]}>
						<View style={styles.statusRow}>
							<Text style={styles.cardTitle}>Controller</Text>
							<View
								style={[
									styles.statusPill,
									isConnected
										? styles.statusPillConnected
										: styles.statusPillWaiting,
								]}
							>
								<Text style={styles.statusPillText}>
									{isConnected ? "Connected" : "Waiting"}
								</Text>
							</View>
						</View>
						<Text style={styles.helperText}>
							Connect your gamepad and press a button to test.
						</Text>

						<View style={styles.infoGrid}>
							{infoItems.map(({ label, value }) => (
								<View key={label} style={styles.infoItem}>
									<Text style={styles.infoLabel}>
										{label}
									</Text>
									<Text style={styles.infoValue}>
										{value}
									</Text>
								</View>
							))}
						</View>

						<View style={styles.controller}>
							{!isConnected && (
								<View style={styles.loaderOverlay}>
									<ActivityIndicator
										color="#2563eb"
										size="small"
									/>
									<Text style={styles.loaderText}>
										Connect your gamepad and press a button
										to test...
									</Text>
								</View>
							)}
							<ControllerVisual
								pressed={pressed}
								axis={axisValue}
								value={buttonValue}
							/>
						</View>

						<View style={styles.testsRow}>
							<Pressable
								style={[
									styles.button,
									!info.canVibrate && styles.buttonDisabled,
								]}
								onPress={() =>
									info.canVibrate && vibrate(900, 1)
								}
								disabled={!info.canVibrate}
							>
								<Text
									style={[
										styles.buttonText,
										!info.canVibrate &&
											styles.buttonTextDisabled,
									]}
								>
									Vibration, 1 sec
								</Text>
							</Pressable>
							<Pressable
								style={[
									styles.button,
									!info.canVibrate && styles.buttonDisabled,
								]}
								onPress={() =>
									info.canVibrate && stopVibration()
								}
								disabled={!info.canVibrate}
							>
								<Text
									style={[
										styles.buttonText,
										!info.canVibrate &&
											styles.buttonTextDisabled,
									]}
								>
									Stop vibration
								</Text>
							</Pressable>
						</View>
						<Text style={styles.helperTextSmall}>
							{info.canVibrate
								? "Uses vibrationActuator when available."
								: "Vibration not reported by this controller."}
						</Text>
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
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8,
	},
	statusPill: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		borderWidth: 1,
	},
	statusPillConnected: {
		backgroundColor: "#dcfce7",
		borderColor: "#16a34a",
	},
	statusPillWaiting: {
		backgroundColor: "#fee2e2",
		borderColor: "#f97316",
	},
	statusPillText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#0f172a",
	},
	helperText: {
		color: "#475569",
		fontSize: 12,
	},
	helperTextSmall: {
		color: "#94a3b8",
		fontSize: 11,
	},
	infoGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	infoItem: {
		flexGrow: 1,
		flexBasis: "45%",
		minWidth: 140,
		backgroundColor: "#f8fafc",
		borderWidth: 1,
		borderColor: "#e2e8f0",
		borderRadius: 8,
		padding: 8,
		gap: 2,
	},
	infoLabel: {
		color: "#475569",
		fontSize: 11,
		fontWeight: "700",
	},
	infoValue: {
		color: "#0f172a",
		fontSize: 13,
		fontWeight: "600",
	},
	controller: {
		backgroundColor: "#f8fafc",
		borderWidth: 1,
		borderColor: "#e2e8f0",
		padding: 12,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		overflow: "hidden",
	},
	loaderOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(255,255,255,0.92)",
		alignItems: "center",
		justifyContent: "center",
		padding: 12,
		gap: 6,
		zIndex: 50,
	},
	loaderText: {
		color: "#0f172a",
		fontSize: 12,
		textAlign: "center",
	},
	testsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	button: {
		backgroundColor: "#2563eb",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonDisabled: {
		backgroundColor: "#cbd5e1",
	},
	buttonText: {
		color: "#f8fafc",
		fontWeight: "700",
		fontSize: 13,
	},
	buttonTextDisabled: {
		color: "#475569",
	},
	axesGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	psWrapper: {
		alignItems: "center",
		justifyContent: "center",
	},
	psShoulderRow: {
		position: "absolute",
		top: 10,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		zIndex: 25,
	},
	psShoulder: {
		minWidth: 62,
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 999,
		backgroundColor: "#e2e8f0",
		borderWidth: 1,
		borderColor: "#cbd5e1",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 4,
	},
	psShoulderLeft: {
		marginRight: 6,
	},
	psShoulderRight: {
		marginLeft: 6,
	},
	psShoulderActive: {
		backgroundColor: "#2563eb",
		borderColor: "#1e3a8a",
		shadowColor: "#2563eb",
		shadowOpacity: 0.5,
	},
	psShoulderText: {
		color: "#0f172a",
		fontWeight: "700",
	},
	psShoulderTextActive: {
		color: "#e0f2fe",
	},
	psContainer: {
		position: "relative",
		width: 500,
		height: 350,
	},
	psMiddle: {
		width: 395,
		height: 160,
		backgroundColor: "#e0e0e0",
		marginLeft: 50, // 27
		borderRadius: 25,
		position: "absolute",
		zIndex: 0,
		top: 80,
	},
	psPaveTactile: {
		width: 150,
		height: 80,
		backgroundColor: "#333",
		marginLeft: 170,
		borderRadius: 7,
		position: "absolute",
		zIndex: 10,
		top: 80,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 5,
	},
	psPaveTactileActive: {
		backgroundColor: "#2563eb",
		shadowColor: "#2563eb",
		shadowOpacity: 0.65,
		shadowRadius: 12,
	},
	psShare: {
		width: 12,
		height: 25,
		position: "absolute",
		backgroundColor: "#95a5a6",
		marginLeft: 148,
		marginTop: 85,
		borderRadius: 5,
		zIndex: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 3,
	},
	psOptions: {
		width: 12,
		height: 25,
		position: "absolute",
		backgroundColor: "#95a5a6",
		marginLeft: 327,
		marginTop: 85,
		borderRadius: 5,
		zIndex: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 3,
	},
	psLeftHand: {
		width: 120,
		height: 260,
		backgroundColor: "#e0e0e0",
		position: "absolute",
		left: 23,
		top: 95,
		transform: [{ rotate: "11deg" }],
		borderTopLeftRadius: 30,
		borderTopRightRadius: 50,
		borderBottomRightRadius: 50,
		borderBottomLeftRadius: 50,
		shadowColor: "#000",
		shadowOffset: { width: -5, height: 5 },
		shadowOpacity: 0.4,
		shadowRadius: 15,
		elevation: 10,
		zIndex: 1,
		paddingTop: 5,
		paddingLeft: 5,
	},
	psRightHand: {
		width: 120,
		height: 260,
		backgroundColor: "#e0e0e0",
		position: "absolute",
		left: 353,
		top: 95,
		transform: [{ rotate: "-11deg" }],
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		borderBottomRightRadius: 50,
		borderBottomLeftRadius: 50,
		shadowColor: "#000",
		shadowOffset: { width: 5, height: 5 },
		shadowOpacity: 0.4,
		shadowRadius: 15,
		elevation: 10,
		zIndex: 1,
		paddingTop: 2,
		alignItems: "center",
	},
	psLeftPad: {
		backgroundColor: "#c0c0c0",
		width: 112,
		height: 112,
		borderRadius: 56,
		marginTop: 5,
		marginLeft: 0,
		borderWidth: 1,
		borderColor: "#b0b0b0",
		position: "relative",
	},
	psArrowUp: {
		width: 22,
		height: 24,
		backgroundColor: "#333",
		position: "absolute",
		top: 18,
		left: 40,
		transform: [{ rotate: "-11deg" }],
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 5,
		elevation: 5,
	},
	psArrowDown: {
		width: 22,
		height: 24,
		backgroundColor: "#333",
		position: "absolute",
		top: 70,
		left: 50,
		transform: [{ rotate: "-11deg" }],
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 5,
		elevation: 5,
	},
	psArrowRight: {
		width: 24,
		height: 22,
		backgroundColor: "#333",
		position: "absolute",
		top: 40,
		left: 72,
		transform: [{ rotate: "-11deg" }],
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 5,
		elevation: 5,
	},
	psArrowLeft: {
		width: 24,
		height: 22,
		backgroundColor: "#333",
		position: "absolute",
		top: 50,
		left: 17,
		transform: [{ rotate: "-11deg" }],
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 5,
		elevation: 5,
	},
	psRightPad: {
		backgroundColor: "#c0c0c0",
		width: 112,
		height: 112,
		borderRadius: 56,
		marginTop: 4,
		borderWidth: 1,
		borderColor: "#b0b0b0",
		position: "relative",
	},
	psTriangle: {
		width: 30,
		height: 30,
		position: "absolute",
		borderRadius: 15,
		marginTop: 7,
		marginLeft: 49,
		backgroundColor: "#e0e0e0",
		shadowColor: "#000",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 3,
	},
	psTriangleBas: {
		width: 22,
		height: 22,
		position: "absolute",
		marginTop: 27,
		marginLeft: 50,
		transform: [{ rotate: "11deg" }],
		borderTopWidth: 3,
		borderTopColor: "#00c081",
	},
	psTriangleDroit: {
		width: 20,
		height: 20,
		position: "absolute",
		marginTop: 14,
		marginLeft: 51,
		transform: [{ rotate: "67deg" }],
		borderTopWidth: 3,
		borderTopColor: "#00c081",
	},
	psTriangleGauche: {
		width: 20,
		height: 20,
		position: "absolute",
		marginTop: 15,
		marginLeft: 56,
		transform: [{ rotate: "-46deg" }],
		borderTopWidth: 3,
		borderTopColor: "#00c081",
	},
	psCroix: {
		width: 30,
		height: 30,
		position: "absolute",
		borderRadius: 15,
		marginTop: 70,
		marginLeft: 36,
		backgroundColor: "#e0e0e0",
		shadowColor: "#000",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 3,
	},
	psCroixBleue: {
		width: 24,
		height: 24,
		transform: [{ rotate: "53deg" }],
		borderRightWidth: 3,
		borderRightColor: "#0a86e5",
		marginTop: -7,
		marginLeft: -4,
	},
	psCroixBleue2: {
		width: 24,
		height: 24,
		transform: [{ rotate: "-32deg" }],
		borderRightWidth: 3,
		borderRightColor: "#0a86e5",
		marginTop: -9,
		marginLeft: -6,
	},
	psCarre: {
		width: 30,
		height: 30,
		position: "absolute",
		borderRadius: 15,
		marginTop: 32,
		marginLeft: 10,
		backgroundColor: "#e0e0e0",
		shadowColor: "#000",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 3,
	},
	psCarreRose: {
		width: 17,
		height: 17,
		marginTop: 6,
		marginLeft: 6,
		transform: [{ rotate: "11deg" }],
		borderWidth: 3,
		borderColor: "#e95ce9",
	},
	psRond: {
		width: 30,
		height: 30,
		position: "absolute",
		borderRadius: 15,
		marginTop: 44,
		marginLeft: 74,
		backgroundColor: "#e0e0e0",
		shadowColor: "#000",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 3,
	},
	psRondRouge: {
		width: 16,
		height: 16,
		borderRadius: 8,
		transform: [{ rotate: "11deg" }],
		borderWidth: 3,
		borderColor: "#ff3746",
		marginTop: 7,
		marginLeft: 7,
	},
	psRollLeft: {
		width: 60,
		height: 60,
		backgroundColor: "#333",
		position: "absolute",
		borderRadius: 40,
		left: -180,
		top: 40,
		zIndex: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	psRollRight: {
		width: 60,
		height: 60,
		backgroundColor: "#333",
		position: "absolute",
		borderRadius: 40,
		left: -73,
		top: 62,
		zIndex: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	psRollIn: {
		width: 40,
		height: 40,
		backgroundColor: "#222",
		position: "absolute",
		borderRadius: 30,
		left: 10,
		top: 10,
		borderWidth: 1,
		borderColor: "#000",
		alignItems: "center",
		justifyContent: "center",
	},
	psRollInIn: {
		width: 22,
		height: 22,
		backgroundColor: "#6d6d6d",
		position: "absolute",
		borderRadius: 22.5,
		left: 8,
		top: 8,
	},
	psPsButton: {
		width: 23,
		height: 23,
		backgroundColor: "#333",
		position: "absolute",
		borderRadius: 11.5,
		left: -110,
		top: 85,
		zIndex: 10,
		borderWidth: 1,
		borderColor: "#555",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 7,
		elevation: 4,
	},
	psActiveButton: {
		backgroundColor: "#2563eb",
		borderColor: "#1e3a8a",
		shadowColor: "#2563eb",
		shadowOpacity: 0.4,
		shadowRadius: 6,
	},
	psTriangleLineActive: {
		borderTopColor: "#00f5a8",
	},
	psPinkActive: {
		borderColor: "#d946ef",
	},
	psRedActive: {
		borderColor: "#fb7185",
	},
	psCrossLineActive: {
		borderRightColor: "#2563eb",
	},
	psStickPressed: {
		shadowOpacity: 0.65,
		shadowRadius: 12,
	},
	psStickInnerPressed: {
		borderColor: "#1e3a8a",
		shadowColor: "#2563eb",
		shadowOpacity: 0.45,
		shadowRadius: 10,
	},
	psStickCenterPressed: {
		borderColor: "#93c5fd",
		backgroundColor: "#dbeafe",
	},
});
