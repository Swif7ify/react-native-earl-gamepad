# react-native-earl-gamepad

Lightweight, WebView-based Gamepad bridge for React Native that surfaces all common buttons, sticks, d-pad, and connect/disconnect events.

## Features

- Hidden WebView polling `navigator.getGamepads()` (index 0) and emitting button/axis/status events.
- `GamepadBridge` component, `useGamepad` hook, and `GamepadDebug` visual tester.
- Deadzone handling for sticks (default 0.15) and auto-clear on disconnect.

## Install

```sh
npm install react-native-earl-gamepad react-native-webview
# or
yarn add react-native-earl-gamepad react-native-webview
```

## Quick start

```tsx
import { GamepadBridge } from 'react-native-earl-gamepad';

export function Controls() {
    return (
        <GamepadBridge
            enabled
            onButton={(e) => console.log('button', e.button, e.pressed, e.value)}
            onAxis={(e) => console.log('axis', e.axis, e.value)}
            onDpad={(e) => console.log('dpad', e.key, e.pressed)}
            onStatus={(s) => console.log('status', s.state)}
        />
    );
}
```

### Using the hook

```tsx
import { useGamepad } from 'react-native-earl-gamepad';

export function HUD() {
    const { pressedButtons, axes, isPressed, bridge } = useGamepad({ enabled: true });

    return (
        <>
            {bridge}
            <Text>Pressed: {Array.from(pressedButtons).join(', ') || 'none'}</Text>
            <Text>
                Left stick: x {axes.leftX?.toFixed(2)} / y {axes.leftY?.toFixed(2)}
            </Text>
            <Text>A held? {isPressed('a') ? 'yes' : 'no'}</Text>
        </>
    );
}
```

### Visual debugger

```tsx
import { GamepadDebug } from 'react-native-earl-gamepad';

export function DebugScreen() {
    return <GamepadDebug />;
}
```

`GamepadDebug` renders a controller diagram that lights up buttons, shows stick offsets, and lists pressed/axes values.

## API

### `GamepadBridge` props

- `enabled?: boolean` — mount/unmount the hidden WebView. Default `true`.
- `axisThreshold?: number` — deadzone for axes. Default `0.15`.
- `onButton?: (event)` — `{ type:'button', button, index, pressed, value }`.
- `onAxis?: (event)` — `{ type:'axis', axis, index, value }`.
- `onDpad?: (event)` — `{ type:'dpad', key, pressed }` convenience mapped from buttons 12–15.
- `onStatus?: (event)` — `{ type:'status', state:'connected'|'disconnected' }`.
- `style?: StyleProp<ViewStyle>` — optional override; default is a 1×1 transparent view.

### `useGamepad` return

- `pressedButtons: Set<GamepadButtonName>` — current pressed buttons (named or `button-N`).
- `axes: Partial<Record<StickAxisName, number>>` — stick/axis values with deadzone applied.
- `isPressed(key)` — helper to query a button.
- `bridge: JSX.Element | null` — render once in your tree to enable polling.

### `GamepadDebug`

Drop-in component to visualize inputs. Accepts the same `enabled` and `axisThreshold` props as the hook/bridge.

### Types

- `GamepadButtonName`: `a | b | x | y | lb | rb | lt | rt | back | start | ls | rs | dpadUp | dpadDown | dpadLeft | dpadRight | home | button-N`
- `StickAxisName`: `leftX | leftY | rightX | rightY | axis-N`

## Notes

- Reads only the first connected pad (`navigator.getGamepads()[0]`).
- D-pad events are emitted from buttons 12–15; sticks pass through as axes with deadzone applied.
- On disconnect, all pressed states are cleared and release events are emitted.
- The WebView must stay mounted; avoid remounting each render to prevent losing state.

## Development

```sh
npm install
npm run build
```

Outputs to `dist/` with type declarations.

## License

MIT
