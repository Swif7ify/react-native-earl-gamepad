export type DpadKey = "up" | "down" | "left" | "right";

export type GamepadButtonName =
	| "a"
	| "b"
	| "x"
	| "y"
	| "lb"
	| "rb"
	| "lt"
	| "rt"
	| "back"
	| "start"
	| "ls"
	| "rs"
	| "dpadUp"
	| "dpadDown"
	| "dpadLeft"
	| "dpadRight"
	| "home"
	| `button-${number}`;

export type StickAxisName =
	| "leftX"
	| "leftY"
	| "rightX"
	| "rightY"
	| `axis-${number}`;

export type DpadEvent = {
	type: "dpad";
	key: DpadKey;
	pressed: boolean;
};

export type ButtonEvent = {
	type: "button";
	button: GamepadButtonName;
	index: number;
	pressed: boolean;
	value: number;
};

export type AxisEvent = {
	type: "axis";
	axis: StickAxisName;
	index: number;
	value: number;
};

export type GamepadInfo = {
	connected: boolean;
	index: number | null;
	id: string | null;
	mapping: string | null;
	timestamp: number | null;
	canVibrate: boolean;
	vendor: string | null;
	product: string | null;
	axes: number;
	buttons: number;
};

export type InfoEvent = GamepadInfo & {
	type: "info";
};

export type StatusEvent = {
	type: "status";
	state: "connected" | "disconnected";
};

export type GamepadMessage =
	| DpadEvent
	| ButtonEvent
	| AxisEvent
	| StatusEvent
	| InfoEvent;
