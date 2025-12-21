import React, { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import type { AxisEvent, ButtonEvent, DpadEvent, GamepadMessage, StatusEvent } from './types';

type Props = {
    enabled?: boolean;
    axisThreshold?: number; // deadzone for stick movement
    onDpad?: (event: DpadEvent) => void; // backward compat convenience
    onButton?: (event: ButtonEvent) => void;
    onAxis?: (event: AxisEvent) => void;
    onStatus?: (event: StatusEvent) => void;
    style?: StyleProp<ViewStyle>;
};

// Minimal HTML bridge that polls navigator.getGamepads and posts button/axis changes.
const buildBridgeHtml = (axisThreshold: number) => `
<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#000">
<script>
(function(){
  const deadzone = ${axisThreshold.toFixed(2)};
  const send = (data) => window.ReactNativeWebView.postMessage(JSON.stringify(data));
  const buttonNames = ['a','b','x','y','lb','rb','lt','rt','back','start','ls','rs','dpadUp','dpadDown','dpadLeft','dpadRight','home'];
  const axisNames = ['leftX','leftY','rightX','rightY'];
  let prevButtons = [];
  let prevAxes = [];

  function poll(){
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    const gp = pads[0];
    if (gp) {
      // Buttons
      gp.buttons?.forEach((btn, index) => {
        const name = buttonNames[index] || ('button-' + index);
        const prevBtn = prevButtons[index] || { pressed:false, value:0 };
        const changed = prevBtn.pressed !== btn.pressed || Math.abs(prevBtn.value - btn.value) > 0.01;
        if (changed) {
          send({ type:'button', button:name, index, pressed: !!btn.pressed, value: btn.value ?? 0 });
          // Also surface d-pad convenience events for the standard indices
          if (index === 12) send({ type:'dpad', key:'up', pressed: !!btn.pressed });
          if (index === 13) send({ type:'dpad', key:'down', pressed: !!btn.pressed });
          if (index === 14) send({ type:'dpad', key:'left', pressed: !!btn.pressed });
          if (index === 15) send({ type:'dpad', key:'right', pressed: !!btn.pressed });
        }
        prevButtons[index] = { pressed: !!btn.pressed, value: btn.value ?? 0 };
      });

      // Axes
      gp.axes?.forEach((raw, index) => {
        const name = axisNames[index] || ('axis-' + index);
        const value = Math.abs(raw) < deadzone ? 0 : raw;
        const prevVal = prevAxes[index] ?? 0;
        if (Math.abs(prevVal - value) > 0.01) {
          send({ type:'axis', axis:name, index, value });
        }
        prevAxes[index] = value;
      });
    } else {
      if (prevButtons.length) {
        prevButtons.forEach((btn, index) => {
          if (btn?.pressed) {
            const name = buttonNames[index] || ('button-' + index);
            send({ type:'button', button:name, index, pressed:false, value:0 });
            if (index === 12) send({ type:'dpad', key:'up', pressed:false });
            if (index === 13) send({ type:'dpad', key:'down', pressed:false });
            if (index === 14) send({ type:'dpad', key:'left', pressed:false });
            if (index === 15) send({ type:'dpad', key:'right', pressed:false });
          }
        });
        prevButtons = [];
      }
      if (prevAxes.length) {
        prevAxes.forEach((prevVal, index) => {
          if (prevVal !== 0) {
            const name = axisNames[index] || ('axis-' + index);
            send({ type:'axis', axis:name, index, value:0 });
          }
        });
        prevAxes = [];
      }
    }
    requestAnimationFrame(poll);
  }

  window.addEventListener('gamepadconnected', () => send({ type:'status', state:'connected' }));
  window.addEventListener('gamepaddisconnected', () => {
    // Clear previously pressed states so consumers do not get stuck buttons.
    prevButtons.forEach((btn, index) => {
      if (btn?.pressed) {
        const name = buttonNames[index] || ('button-' + index);
        send({ type:'button', button:name, index, pressed:false, value:0 });
        if (index === 12) send({ type:'dpad', key:'up', pressed:false });
        if (index === 13) send({ type:'dpad', key:'down', pressed:false });
        if (index === 14) send({ type:'dpad', key:'left', pressed:false });
        if (index === 15) send({ type:'dpad', key:'right', pressed:false });
      }
    });
    prevButtons = [];
    prevAxes = [];
    send({ type:'status', state:'disconnected' });
  });
  poll();
})();
</script>
</body></html>`;

export default function GamepadBridge({
    enabled = true,
    axisThreshold = 0.15,
    onDpad,
    onButton,
    onAxis,
    onStatus,
    style,
}: Props) {
    const html = useMemo(() => buildBridgeHtml(axisThreshold), [axisThreshold]);

    if (!enabled) return null;

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data: GamepadMessage = JSON.parse(event.nativeEvent.data);
            if (data.type === 'dpad') {
                onDpad?.(data);
            } else if (data.type === 'button') {
                onButton?.(data);
            } else if (data.type === 'axis') {
                onAxis?.(data);
            } else if (data.type === 'status') {
                onStatus?.(data);
            }
        } catch {
            // ignore malformed messages
        }
    };

    return (
        <WebView
            source={{ html }}
            originWhitelist={['*']}
            onMessage={handleMessage}
            javaScriptEnabled
            style={style ?? { width: 1, height: 1, position: 'absolute', opacity: 0 }}
        />
    );
}
