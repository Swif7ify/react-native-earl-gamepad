# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.6] - 2026-08-03

### Changed

- Updated documentation in `README.md` to specify compatibility with the entire **8BitDo** controller lineup (SN30 Pro, Pro 2, Ultimate, Lite, Zero 2, Micro, etc.).
- Added explicit notices in `README.md` clarifying that touchpad click and touch/gesture position coordinates may not work or be detected on all devices due to platform-specific OS and WebView Gamepad API limitations.
- Modernized devDependencies and build scripts (`react` 19, `@types/react` 19, `typescript` 5.7+, `rimraf` clean script).

## [0.7.5] - 2026-01-18

### Added

- Added CHANGELOG.md file

## [0.7.4] - 2026-01-03

### Fixed

- Fixed joystick inversion and keys stuck issue where buttons would remain in a stuck state ([#11](https://github.com/Swif7ify/react-native-earl-gamepad/pull/11), [#12](https://github.com/Swif7ify/react-native-earl-gamepad/pull/12))

## [0.6.0] - 2025-12-23

### Fixed

- Resolved joystick inversion causing keys to get stuck after controller disconnect

## [0.5.2] - 2025-12-22

### Changed

- Improved visual debugger design with enhanced UI/UX ([#10](https://github.com/Swif7ify/react-native-earl-gamepad/pull/10))
- Updated README.md with comprehensive documentation ([#9](https://github.com/Swif7ify/react-native-earl-gamepad/pull/9))

### Added

- Added version bump workflow for automated releases ([#8](https://github.com/Swif7ify/react-native-earl-gamepad/pull/8))
- Auto focus on app feature to ensure gamepad input is properly captured ([#7](https://github.com/Swif7ify/react-native-earl-gamepad/pull/7))
- Added troubleshooting documentation for `[Invariant Violation: Tried to register two views with the same name RNCWebView]` error ([#6](https://github.com/Swif7ify/react-native-earl-gamepad/pull/6))

## [0.4.0] - 2025-12-21

### Added

- Added real controller design visualization in `GamepadDebug` component ([#4](https://github.com/Swif7ify/react-native-earl-gamepad/pull/4))
- Added images folder for documentation assets ([#5](https://github.com/Swif7ify/react-native-earl-gamepad/pull/5))
- Added trigger threshold support for analog triggers ([#3](https://github.com/Swif7ify/react-native-earl-gamepad/pull/3))
- Added comprehensive gamepad metadata support: vendor/product info, vibration capability, timestamps ([#2](https://github.com/Swif7ify/react-native-earl-gamepad/pull/2))
- Added GamepadDebug visual component with:
    - Controller diagram with button highlight states
    - Per-stick plots with axis values and crosshairs
    - Touchpad click indicator
    - Vibration test buttons

### Changed

- Updated README with comprehensive API documentation, usage examples, and video demos

## [0.1.0] - 2025-12-21

### Added

- Initial release of `react-native-earl-gamepad`
- `GamepadBridge` component for hidden WebView gamepad polling
- `useGamepad` hook for stateful gamepad consumption
- `GamepadDebug` drop-in debug component
- Button, axis, d-pad, and status event support
- Deadzone handling with configurable `axisThreshold` (default: 0.15)
- Auto-clear on disconnect to prevent stuck buttons
- Support for standard gamepad mapping (PS4, generic Bluetooth controllers)
- Typed events: `ButtonEvent`, `AxisEvent`, `DpadEvent`, `StatusEvent`, `StateEvent`
- Vibration support via `vibrate()` and `stopVibration()` methods
- MIT License
