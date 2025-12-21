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
	StickAxisName,
	StatusEvent,
} from "./types";

type Options = {
	enabled?: boolean;
	axisThreshold?: number;
	onButton?: (event: ButtonEvent) => void;
	onAxis?: (event: AxisEvent) => void;
	onDpad?: (event: DpadEvent) => void; // backward compat convenience
	onStatus?: (event: StatusEvent) => void;
};

type Return = {
	pressedButtons: Set<GamepadButtonName>;
	axes: Partial<Record<StickAxisName, number>>;
	buttonValues: Partial<Record<GamepadButtonName, number>>;
	isPressed: (key: GamepadButtonName) => boolean;
	bridge: JSX.Element | null;
};

export default function useGamepad({
	enabled = true,
	axisThreshold = 0.15,
	onButton,
	onAxis,
	onDpad,
	onStatus,
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

	useEffect(() => {
		if (!enabled && pressedRef.current.size) {
			pressedRef.current = new Set();
			setPressedButtons(new Set());
		}
		if (!enabled) {
			setAxes({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });
			setButtonValues({});
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
				onStatus={onStatus}
			/>
		),
		[enabled, axisThreshold, handleAxis, handleButton, handleDpad, onStatus]
	);

	const isPressed = useCallback(
		(key: GamepadButtonName) => pressedRef.current.has(key),
		[]
	);

	return { pressedButtons, axes, buttonValues, isPressed, bridge };
}
