import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type JSX,
} from "react";
import GamepadBridge from "./GamepadBridge";
import type {
	AxisEvent,
	ButtonEvent,
	DpadEvent,
	GamepadButtonName,
	GamepadInfo,
	StickAxisName,
	InfoEvent,
	StatusEvent,
} from "./types";

type Options = {
	enabled?: boolean;
	axisThreshold?: number;
	onButton?: (event: ButtonEvent) => void;
	onAxis?: (event: AxisEvent) => void;
	onDpad?: (event: DpadEvent) => void; // backward compat convenience
	onStatus?: (event: StatusEvent) => void;
	onInfo?: (event: InfoEvent) => void;
};

type Return = {
	pressedButtons: Set<GamepadButtonName>;
	axes: Partial<Record<StickAxisName, number>>;
	buttonValues: Partial<Record<GamepadButtonName, number>>;
	isPressed: (key: GamepadButtonName) => boolean;
	bridge: JSX.Element | null;
	info: GamepadInfo;
	vibrate: (duration?: number, strength?: number) => void;
	stopVibration: () => void;
};

export default function useGamepad({
	enabled = true,
	axisThreshold = 0.15,
	onButton,
	onAxis,
	onDpad,
	onStatus,
	onInfo,
}: Options = {}): Return {
	const [pressedButtons, setPressedButtons] = useState<
		Set<GamepadButtonName>
	>(new Set());
	const [buttonValues, setButtonValues] = useState<
		Partial<Record<GamepadButtonName, number>>
	>({});
	const pressedRef = useRef<Set<GamepadButtonName>>(new Set());
	const [axes, setAxes] = useState<Partial<Record<StickAxisName, number>>>({
		leftX: 0,
		leftY: 0,
		rightX: 0,
		rightY: 0,
	});
	const [info, setInfo] = useState<GamepadInfo>({
		connected: false,
		index: null,
		id: null,
		mapping: null,
		timestamp: null,
		canVibrate: false,
		vendor: null,
		product: null,
		axes: 0,
		buttons: 0,
	});
	const [vibrationRequest, setVibrationRequest] = useState<
		| {
				type: "once";
				duration: number;
				strong: number;
				weak: number;
				nonce: number;
		  }
		| { type: "stop"; nonce: number }
		| null
	>(null);
	const vibrationNonce = useRef(0);

	useEffect(() => {
		pressedRef.current = pressedButtons;
	}, [pressedButtons]);

	const handleButton = useCallback(
		(event: ButtonEvent) => {
			const next = new Set(pressedRef.current);
			if (event.pressed) {
				next.add(event.button);
			} else {
				next.delete(event.button);
			}
			pressedRef.current = next;
			setPressedButtons(next);
			setButtonValues((prev) => ({
				...prev,
				[event.button]: event.value,
			}));
			onButton?.(event);
		},
		[onButton]
	);

	const handleAxis = useCallback(
		(event: AxisEvent) => {
			setAxes((prev) => ({ ...prev, [event.axis]: event.value }));
			onAxis?.(event);
		},
		[onAxis]
	);

	const handleDpad = useCallback(
		(event: DpadEvent) => {
			onDpad?.(event);
		},
		[onDpad]
	);

	const handleInfo = useCallback(
		(event: InfoEvent) => {
			setInfo(event);
			onInfo?.(event);
		},
		[onInfo]
	);

	const handleStatus = useCallback(
		(event: StatusEvent) => {
			if (event.state === "disconnected") {
				setInfo((prev) => ({
					...prev,
					connected: false,
				}));
			}
			onStatus?.(event);
		},
		[onStatus]
	);

	const vibrate = useCallback((duration = 800, strength = 1) => {
		vibrationNonce.current += 1;
		const safeStrength = Math.max(0, Math.min(strength, 1));
		setVibrationRequest({
			type: "once",
			duration,
			strong: safeStrength,
			weak: safeStrength,
			nonce: vibrationNonce.current,
		});
	}, []);

	const stopVibration = useCallback(() => {
		vibrationNonce.current += 1;
		setVibrationRequest({ type: "stop", nonce: vibrationNonce.current });
	}, []);

	useEffect(() => {
		if (!enabled && pressedRef.current.size) {
			pressedRef.current = new Set();
			setPressedButtons(new Set());
		}
		if (!enabled) {
			setAxes({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });
			setButtonValues({});
			setInfo((prev) => ({
				...prev,
				connected: false,
			}));
		}
	}, [enabled]);

	const bridge = useMemo(
		() => (
			<GamepadBridge
				enabled={enabled}
				axisThreshold={axisThreshold}
				onDpad={handleDpad}
				onButton={handleButton}
				onAxis={handleAxis}
				onStatus={handleStatus}
				onInfo={handleInfo}
				vibrationRequest={vibrationRequest ?? undefined}
			/>
		),
		[
			enabled,
			axisThreshold,
			handleAxis,
			handleButton,
			handleDpad,
			handleInfo,
			handleStatus,
			vibrationRequest,
		]
	);

	const isPressed = useCallback(
		(key: GamepadButtonName) => pressedRef.current.has(key),
		[]
	);

	return {
		pressedButtons,
		axes,
		buttonValues,
		isPressed,
		bridge,
		info,
		vibrate,
		stopVibration,
	};
}
