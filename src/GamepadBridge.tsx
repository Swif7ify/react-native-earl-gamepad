import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import type {
	AxisEvent,
	ButtonEvent,
	DpadEvent,
	InfoEvent,
	StateEvent,
	GamepadMessage,
	StatusEvent,
} from "./types";

type VibrationRequest =
	| {
			type: "once";
			duration: number;
			strong: number;
			weak: number;
			nonce: number;
	  }
	| {
			type: "stop";
			nonce: number;
	  };

type Props = {
	enabled?: boolean;
	axisThreshold?: number; // deadzone for stick movement
	onDpad?: (event: DpadEvent) => void; // backward compat convenience
	onButton?: (event: ButtonEvent) => void;
	onAxis?: (event: AxisEvent) => void;
	onStatus?: (event: StatusEvent) => void;
	onInfo?: (event: InfoEvent) => void;
	onState?: (event: StateEvent) => void;
	vibrationRequest?: VibrationRequest;
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
  const buttonNames = ['a','b','x','y','lb','rb','lt','rt','back','start','ls','rs','dpadUp','dpadDown','dpadLeft','dpadRight','home','touchpad'];
  const axisNames = ['leftX','leftY','rightX','rightY'];
  let prevButtons = [];
  let prevAxes = [];
  let prevInfoJson = '';

  function parseVendorProduct(id){
    const vendorMatch = /Vendor:\s?([0-9a-fA-F]+)/i.exec(id || '') || /VID_([0-9a-fA-F]+)/i.exec(id || '');
    const productMatch = /Product:\s?([0-9a-fA-F]+)/i.exec(id || '') || /PID_([0-9a-fA-F]+)/i.exec(id || '');
    return {
      vendor: vendorMatch ? vendorMatch[1] : null,
      product: productMatch ? productMatch[1] : null,
    };
  }

  function sendInfo(gp){
    const connected = !!gp;
    const { vendor, product } = parseVendorProduct(gp?.id || '');
    const info = {
      type: 'info',
      connected,
      index: gp?.index ?? null,
      id: gp?.id ?? null,
      mapping: gp?.mapping ?? null,
      timestamp: gp?.timestamp ?? null,
      canVibrate: !!gp?.vibrationActuator,
      vendor,
      product,
      axes: gp?.axes?.length ?? 0,
      buttons: gp?.buttons?.length ?? 0,
    };
    const nextJson = JSON.stringify(info);
    if (nextJson !== prevInfoJson) {
      prevInfoJson = nextJson;
      send(info);
    }
  }

  function vibrateOnce(duration, strong, weak){
    const pad = (navigator.getGamepads && navigator.getGamepads()[0]) || null;
    if (!pad || !pad.vibrationActuator || !pad.vibrationActuator.playEffect) return;
    try {
      pad.vibrationActuator.playEffect('dual-rumble', {
        duration: duration || 500,
        strongMagnitude: strong ?? 1,
        weakMagnitude: weak ?? 1,
      }).catch(() => {});
    } catch (err) {
      // ignore
    }
  }

  function stopVibration(){
    const pad = (navigator.getGamepads && navigator.getGamepads()[0]) || null;
    if (!pad || !pad.vibrationActuator) return;
    if (typeof pad.vibrationActuator.reset === 'function') {
      try { pad.vibrationActuator.reset(); } catch (err) {}
    }
  }

  window.__earlVibrateOnce = vibrateOnce;
  window.__earlStopVibration = stopVibration;

  const nameForIndex = (index) => {
    if (buttonNames[index]) return buttonNames[index];
    if (index === 16) return 'home';
    if (index === 17) return 'touchpad';
    return 'button-' + index;
  };

  function poll(){
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    const gp = pads[0];
    sendInfo(gp);
    if (gp) {
      const pressedNow = [];
      const valueMap = {};
      const axesState = {};
      // Buttons
      gp.buttons?.forEach((btn, index) => {
        const name = nameForIndex(index);
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
        if (btn?.pressed) pressedNow.push(name);
        valueMap[name] = btn?.value ?? 0;
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
        axesState[name] = value;
        prevAxes[index] = value;
      });

      send({ type:'state', pressed: pressedNow, values: valueMap, axes: axesState });
    } else {
      // If no pad, send a single disconnected info payload
      sendInfo(null);
      if (prevButtons.length) {
        prevButtons.forEach((btn, index) => {
          if (btn?.pressed) {
            const name = nameForIndex(index);
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
      send({ type:'state', pressed: [], values: {}, axes: {} });
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
	onInfo,
	onState,
	vibrationRequest,
	style,
}: Props) {
	const webviewRef = useRef<WebView>(null);
	const html = useMemo(() => buildBridgeHtml(axisThreshold), [axisThreshold]);

	const focusBridge = useCallback(() => {
		// On Android controllers, ensure the WebView is focusable so DPAD events feed navigator.getGamepads
		const node = webviewRef.current as unknown as {
			setNativeProps?: (props: Record<string, unknown>) => void;
			requestFocus?: () => void;
		} | null;
		node?.setNativeProps?.({ focusable: true, focusableInTouchMode: true });
		node?.requestFocus?.();
	}, []);

	useEffect(() => {
		if (enabled) focusBridge();
	}, [enabled, focusBridge]);

	useEffect(() => {
		if (!enabled || !vibrationRequest) return;
		const node = webviewRef.current;
		if (!node) return;
		if (vibrationRequest.type === "once") {
			node.injectJavaScript(
				`window.__earlVibrateOnce(${Math.max(
					vibrationRequest.duration,
					0
				)}, ${Math.max(
					Math.min(vibrationRequest.strong, 1),
					0
				)}, ${Math.max(Math.min(vibrationRequest.weak, 1), 0)}); true;`
			);
		} else {
			node.injectJavaScript(`window.__earlStopVibration(); true;`);
		}
	}, [enabled, vibrationRequest]);

	if (!enabled) return null;

	const handleMessage = (event: WebViewMessageEvent) => {
		try {
			const data: GamepadMessage = JSON.parse(event.nativeEvent.data);
			if (data.type === "dpad") {
				onDpad?.(data);
			} else if (data.type === "button") {
				onButton?.(data);
			} else if (data.type === "axis") {
				onAxis?.(data);
			} else if (data.type === "status") {
				onStatus?.(data);
			} else if (data.type === "info") {
				onInfo?.(data);
			} else if (data.type === "state") {
				onState?.(data);
			}
		} catch {
			// ignore malformed messages
		}
	};

	return (
		<WebView
			ref={webviewRef}
			source={{ html }}
			originWhitelist={["*"]}
			onMessage={handleMessage}
			javaScriptEnabled
			onLoad={focusBridge}
			onLayout={focusBridge}
			onTouchStart={focusBridge}
			style={
				style ?? {
					width: 1,
					height: 1,
					position: "absolute",
					opacity: 0,
				}
			}
		/>
	);
}
