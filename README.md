# react-native-earl-gamepad

WebView-based gamepad bridge for React Native. Polls `navigator.getGamepads()` in a hidden WebView and surfaces buttons, sticks, d-pad, and connection events to JS.

-   Components: `GamepadBridge`, `useGamepad`, and `GamepadDebug`.
-   Deadzone handling (default `0.15`) with auto-clear on disconnect.
-   Typed events for buttons, axes, d-pad, and status.

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

Drop-in component to see a controller diagram that lights up buttons, shows stick offsets, and lists state.

```tsx
import { GamepadDebug } from "react-native-earl-gamepad";

export function DebugScreen() {
	return <GamepadDebug axisThreshold={0.2} />;
}
```

![Gamepad visual idle](https://github.com/user-attachments/assets/dfebd8c5-7d9a-42c7-802b-2773ec8c8ae9)

![Gamepad visual pressed](https://github.com/user-attachments/assets/7b37d76a-7695-4be9-bda4-7e3d1e6adf41)

## API

### `GamepadBridge` props

-   `enabled?: boolean` — mount/unmount the hidden WebView. Default `true`.
-   `axisThreshold?: number` — deadzone applied to axes. Default `0.15`.
-   `onButton?: (event: ButtonEvent) => void` — fired on button press/release/value change.
-   `onAxis?: (event: AxisEvent) => void` — fired when an axis changes beyond threshold.
-   `onDpad?: (event: DpadEvent) => void` — convenience mapping of button indices 12–15.
-   `onStatus?: (event: StatusEvent) => void` — `connected` / `disconnected` events.
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

### `GamepadDebug`

-   `enabled?: boolean` — defaults to `true`.
-   `axisThreshold?: number` — defaults to `0.15`.

## Events and types

-   `ButtonEvent`: `{ type: 'button'; button: GamepadButtonName; index: number; pressed: boolean; value: number }`
-   `AxisEvent`: `{ type: 'axis'; axis: StickAxisName; index: number; value: number }`
-   `DpadEvent`: `{ type: 'dpad'; key: 'up' | 'down' | 'left' | 'right'; pressed: boolean }`
-   `StatusEvent`: `{ type: 'status'; state: 'connected' | 'disconnected' }`

Button names map to the standard gamepad layout (`a`, `b`, `x`, `y`, `lb`, `rb`, `lt`, `rt`, `back`, `start`, `ls`, `rs`, `dpadUp`, `dpadDown`, `dpadLeft`, `dpadRight`, `home`). Unknown indices fall back to `button-N`. Axes map to `leftX`, `leftY`, `rightX`, `rightY` with fallbacks `axis-N`.

## Behavior notes

-   Reads only the first controller (`navigator.getGamepads()[0]`).
-   D-pad events mirror buttons 12–15; they emit separate `dpad` messages in addition to the raw button events.
-   On disconnect, pressed state is cleared and release events are emitted so you do not get stuck buttons.
-   Keep the bridge mounted; remounting clears internal state and can drop transient events.
-   Axis values below the deadzone are coerced to `0`. Adjust `axisThreshold` if you need more sensitivity.
-   LT/RT expose analog values via `buttonValues.lt` and `buttonValues.rt`.

## Patterns

-   **Single place to render**: put the bridge near the root (e.g., inside your `App` provider layer) and consume state anywhere via `useGamepad`.
-   **Status-aware UI**: use `onStatus` to disable controls until `connected` and to reset UI on `disconnected`.
-   **Custom deadzone per screen**: pass `axisThreshold` to either the bridge or the hook depending on which you render.

## Development

```sh
npm install
npm run build
```

## Troubleshooting

-   **[Invariant Violation: Tried to register two views with the same name RNCWebView]**: Check your `package.json` for multiple instances of `react-native-webview` and uninstall any duplicates.
    When you install `react-native-earl-gamepad`, `react-native-webview` is already included, so you should not install it separately. or you can check it by running `npm ls react-native-webview`.

Build outputs to `dist/` with type declarations.

## License

MIT
