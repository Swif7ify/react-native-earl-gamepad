# react-native-earl-gamepad

![GitHub stars](https://img.shields.io/github/stars/Swif7ify/react-native-earl-gamepad?style=social)
![npm](https://img.shields.io/npm/v/react-native-earl-gamepad)
![downloads](https://img.shields.io/npm/dm/react-native-earl-gamepad)
![license](https://img.shields.io/npm/l/react-native-earl-gamepad)

WebView-based gamepad bridge for React Native. Polls `navigator.getGamepads()` in a hidden WebView and surfaces buttons, sticks, d-pad, touchpad click, and connection events to JS.

-   Components: `GamepadBridge`, `useGamepad`, and `GamepadDebug`.
-   Deadzone handling (default `0.15`) with auto-clear on disconnect and live state snapshots to avoid stuck buttons.
-   Typed events for buttons, axes, d-pad, touchpad click, status, and a full-state snapshot.

### Why this?

Native gamepad support in React Native can be flaky or hard to maintain. Instead of relying on old native modules, it uses a hidden WebView to bridge the HTML5 Gamepad API (navigator.getGamepads()) directly to React Native. This ensures much better compatibility across iOS and Android since it relies on the web standard.

### Controller Compatibility

-   Tested with: PS4, and generic Bluetooth controllers. Supports standard mapping.

## Requirements

-   React Native `>=0.72`
-   React `>=18`
-   `react-native-webview` `>=13`
-   Runs on iOS and Android (relies on WebView Gamepad API support).

## Install

```sh
npm install react-native-earl-gamepad
# or
yarn add react-native-earl-gamepad
```

## Usage

### Render the bridge (minimal)

Render the hidden WebView once in your tree to start polling the first connected pad (`navigator.getGamepads()[0]`).

```tsx
import { GamepadBridge } from "react-native-earl-gamepad";

export function Controls() {
	return (
		<GamepadBridge
			enabled
			onButton={(e) =>
				console.log("button", e.button, e.pressed, e.value)
			}
			onAxis={(e) => console.log("axis", e.axis, e.value)}
			onDpad={(e) => console.log("dpad", e.key, e.pressed)}
			onStatus={(e) => console.log("status", e.state)}
		/>
	);
}
```

### Control Logic Example

Here is an example of mapping D-pad events to movement vectors

```tsx
import { useState, useCallback } from "react";
import { GamepadBridge, type DpadEvent } from "react-native-earl-gamepad";
type MoveKey = keyof typeof MOVES;

const MOVES: Record<string, [number, number]> = {
	up: [1, 0],
	down: [-1, 0],
	right: [0, 1],
	left: [0, -1],
	stop: [0, 0],

	axis_left_x_neg: [0, -1],
	axis_left_x_pos: [0, 1],
	axis_left_y_pos: [1, 0],
	axis_left_y_neg: [-1, 0],

	// add more
}; // example only for the control logic

export function Controls() {
	const [active, setActive] = useState<string | null>(null);

	const handleDpad = useCallback(
		(event: DpadEvent) => {
			const key = event.key as MoveKey;
			if (event.pressed) {
				if (active !== key) {
					console.log("Dpad press", key);
				}
			} else if (active === key) {
				// do something
			}
		},
		[active]
	);
	return <GamepadBridge enabled onDpad={handleDpad} axisThreshold={0.15} />;
}
```

### Hook for stateful consumption

`useGamepad` keeps pressed state and axes for you. You still need to render the provided `bridge` element once.

```tsx
import { useGamepad } from "react-native-earl-gamepad";

export function HUD() {
	const { pressedButtons, axes, isPressed, bridge } = useGamepad({
		enabled: true,
	});

	return (
		<>
			{bridge}
			<Text>
				Pressed: {Array.from(pressedButtons).join(", ") || "none"}
			</Text>
			<Text>
				Left stick: x {axes.leftX?.toFixed(2)} / y{" "}
				{axes.leftY?.toFixed(2)}
			</Text>
			<Text>A held? {isPressed("a") ? "yes" : "no"}</Text>
		</>
	);
}
```

### Visual debugger

Drop-in component to see a controller diagram that lights up buttons, shows stick offsets, and lists state. Shows live metadata (name/vendor/product, mapping, axes/buttons count, vibration support) and includes vibration test buttons plus a loader prompt when no pad is connected.

The State panel includes:

-   Per-stick plots (left/right) with axis values, crosshairs, and a dashed trace from center to the current dot.
-   Touchpad click indicator (PS touchpad click is mapped to `touchpad`; position is not exposed by the Gamepad API).

```tsx
import { GamepadDebug } from "react-native-earl-gamepad";

export function DebugScreen() {
	return <GamepadDebug axisThreshold={0.2} />;
}
```

![Gamepad visual idle](https://github.com/user-attachments/assets/ae29d0a9-ded5-4b2d-96f8-f432f99cb54c)
![Gamepad visual pressed](https://github.com/user-attachments/assets/830323aa-0f6c-4ee4-a276-663a421b9697)
![Gamepad Idle](https://github.com/user-attachments/assets/206fe108-8ec3-40cb-a64b-de058d07672f)

## Demo

https://github.com/user-attachments/assets/6b073b65-9585-4168-8c2c-7ef06a7cf03a


https://github.com/user-attachments/assets/b5a9d422-b143-4887-9a64-fb41edee731f

## Example
### Basic Game Showcasing `react-native-earl-gamepad`
[Github Repository Basic Game](https://github.com/Swif7ify/react-native-earl-gamepad-example)
```sh
# external repo
git clone https://github.com/Swif7ify/react-native-earl-gamepad-example
cd react-native-earl-gamepad-example
npm install
npx expo start
```

## API

### `GamepadBridge` props

-   `enabled?: boolean` — mount/unmount the hidden WebView. Default `true`.
-   `axisThreshold?: number` — deadzone applied to axes. Default `0.15`.
-   `onButton?: (event: ButtonEvent) => void` — fired on button press/release/value change.
-   `onAxis?: (event: AxisEvent) => void` — fired when an axis changes beyond threshold.
-   `onDpad?: (event: DpadEvent) => void` — convenience mapping of button indices 12–15.
-   `onStatus?: (event: StatusEvent) => void` — `connected` / `disconnected` events.
-   `onState?: (event: StateEvent) => void` — full snapshot of pressed buttons, values, and axes each poll.
-   `style?: StyleProp<ViewStyle>` — override container; default is a 1×1 transparent view.

### `useGamepad` options and return

Options:

-   `enabled?: boolean` — defaults to `true`. When false, state resets and axes zero out.
-   `axisThreshold?: number` — deadzone for axes. Default `0.15`.
-   `onButton`, `onAxis`, `onDpad`, `onStatus` — same semantics as `GamepadBridge`.

Return shape:

-   `pressedButtons: Set<GamepadButtonName>` — current pressed buttons.
-   `axes: Partial<Record<StickAxisName, number>>` — axis values with deadzone applied.
-   `buttonValues: Partial<Record<GamepadButtonName, number>>` — last analog value per button (useful for LT/RT triggers).
-   `isPressed(key: GamepadButtonName): boolean` — helper to check a single button.
-   `bridge: JSX.Element | null` — render once to enable polling.
-   `info: GamepadInfo` — metadata for the first controller (id, vendor/product if exposed, mapping, counts, vibration support, timestamp, index).
-   `vibrate(duration?: number, strength?: number): void` — fire a short rumble when `vibrationActuator` is available.
-   `stopVibration(): void` — stop an in-flight vibration when supported.

### `GamepadDebug`

-   `enabled?: boolean` — defaults to `true`.
-   `axisThreshold?: number` — defaults to `0.15`.

## Events and types

-   `ButtonEvent`: `{ type: 'button'; button: GamepadButtonName; index: number; pressed: boolean; value: number }`
-   `AxisEvent`: `{ type: 'axis'; axis: StickAxisName; index: number; value: number }`
-   `DpadEvent`: `{ type: 'dpad'; key: 'up' | 'down' | 'left' | 'right'; pressed: boolean }`
-   `StatusEvent`: `{ type: 'status'; state: 'connected' | 'disconnected' }`
-   `InfoEvent`: controller metadata payload (name/vendor/product, mapping, counts, vibration capability, timestamp, index, etc.)
-   `StateEvent`: `{ type: 'state'; pressed: GamepadButtonName[]; values: Record<GamepadButtonName, number>; axes: Record<StickAxisName, number> }`

Button names map to the standard gamepad layout (`a`, `b`, `x`, `y`, `lb`, `rb`, `lt`, `rt`, `back`, `start`, `ls`, `rs`, `dpadUp`, `dpadDown`, `dpadLeft`, `dpadRight`, `home`). Unknown indices fall back to `button-N`. Axes map to `leftX`, `leftY`, `rightX`, `rightY` with fallbacks `axis-N`.

## Behavior notes

-   Reads only the first controller (`navigator.getGamepads()[0]`).
-   D-pad events mirror buttons 12–15; they emit separate `dpad` messages in addition to the raw button events.
-   On disconnect, pressed state is cleared and release events are emitted so you do not get stuck buttons.
-   Keep the bridge mounted; remounting clears internal state and can drop transient events.
-   Axis values below the deadzone are coerced to `0`. Adjust `axisThreshold` if you need more sensitivity.
-   LT/RT expose analog values via `buttonValues.lt` and `buttonValues.rt`.

## Performance tips

-   For movement/game loops in your app, prefer `requestAnimationFrame` over `setInterval` to avoid jitter from timer drift.
-   Skip game loop work when no controller is connected (use `onStatus` or the hook’s `info.connected`).
-   If you need to lower CPU/GPU cost, you can poll at a fixed interval inside your app logic (e.g., 45–60 fps) while the bridge keeps its internal rAF poll for accurate state.
-   Avoid remounting the bridge; mount once near the root and let `enabled` toggle collection if you must pause.

## Patterns

-   **Single place to render**: put the bridge near the root (e.g., inside your `App` provider layer) and consume state anywhere via `useGamepad`.
-   **Status-aware UI**: use `onStatus` to disable controls until `connected` and to reset UI on `disconnected`.
-   **Custom deadzone per screen**: pass `axisThreshold` to either the bridge or the hook depending on which you render.

## Development

```sh
npm install
npm run build
```

Build outputs to `dist/` with type declarations.

## Troubleshooting

-   **[Invariant Violation: Tried to register two views with the same name RNCWebView]**: Check your `package.json` for multiple instances of `react-native-webview` and uninstall any duplicates.
    When you install `react-native-earl-gamepad`, `react-native-webview` is already included, so you should not install it separately. or you can check it by running `npm ls react-native-webview`.

## License

MIT

## ❤️ Sponsor

If this project helps you, consider sponsoring its development:

👉 https://github.com/sponsors/Swif7ify
