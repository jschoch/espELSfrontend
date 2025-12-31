# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 18 frontend for ESPels, an Electronic Lead Screw (ELS) system for controlling CNC lathe operations. The frontend communicates with ESP32-based hardware via WebSockets and Server-Sent Events (SSE) for real-time control of lathe operations including threading, feeding, hobbing, and synchronized movements.

**Current Version:** v0.0.6
**Node Version:** v20.11.0
**Primary Browser Support:** Firefox (PC) / Firefox Beta (mobile)

## Development Commands

### Running the development server
```bash
npm start
```
The dev server runs on 0.0.0.0 (configured in .env).

### Building
```bash
# Development build
npm run build

# Production optimized build
npm run build -p

# Serve production build (requires 'serve' package)
serve ./build

# Bundle all files into single HTML (inlines CSS/JS)
npx gulp
```

The gulp build creates a self-contained HTML file with all assets inlined (except PNGs), useful for embedded deployment.

### Testing
```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm test -- --watch
```

Tests use Jest with jsdom environment. Coverage reports are generated in the `coverage/` directory.

## Architecture

### Communication Layer

The app uses a dual-channel communication pattern with the ESP32 hardware:

1. **WebSocket (bidirectional)** - For sending commands and receiving msgpack-encoded responses
   - Managed in `espWS.js` via `EspWS` component
   - Global `window.wsclient` reference for sending commands
   - Uses `@msgpack/msgpack` for binary message encoding/decoding
   - Utility function `send()` in `util.js` wraps WebSocket sends

2. **Server-Sent Events (unidirectional)** - For real-time status updates
   - Provides continuous stream of machine state (position, RPM, encoder position)
   - JSON-formatted messages
   - Falls back to WebSocket if SSE unavailable

### State Management

The app uses React hooks for state management with a single root `App.js` component that maintains global state and passes it down:

- **`machineConfig`** - Current machine mode (Startup=0, MoveSyncMode=2, FeedMode=14, HobbingMode=9/10, etc.)
- **`nvConfig`** - Non-volatile hardware configuration (motor steps, encoder resolution, lead screw pitch)
- **`moveConfig`** - Movement parameters (pitch, speed, acceleration, distance)
- **`state`** - Composite state object passed to child components containing stats, connection status, metric/imperial units
- **`connected`** - WebSocket connection status
- **`sse_events`** - Latest SSE event data

### Machine Modes

Machine modes map to firmware YASM states (see `modes` object in App.js:43):

- **0** - Startup (home screen)
- **2** - MoveSync (synchronized movements with spindle)
- **6** - Bounce (reciprocating movement)
- **9/10/11** - Hobbing (gear cutting: Ready/Running/Stop)
- **14** - Feed (continuous feed mode)

Mode selection triggers tab visibility changes and sends config to hardware via `sendConfig()`.

### Message Handling

All incoming messages from the ESP32 are processed in the `useEffect` at App.js:278 based on message type (`msg.t`):

- **`status`** - Updates DRO, RPM, and machine stats
- **`nvConfig`** - Hardware configuration data
- **`moveConfigDoc`** - Movement configuration from device
- **`log`** - Error/info messages (level 0 = error modal)
- **`dbg_st`** - Debug statistics

### Key Components

- **`App.js`** - Root component with main state, tabs, and mode selection
- **`espWS.js`** - WebSocket and SSE connection management
- **`MoveSyncUI.js`** - Spindle-synchronized movement controls (jog, rapid, bounce)
- **`feed.js`** - Continuous feed mode UI
- **`ThreadView.js`** - Threading operations
- **`hobbing.js`** - Gear hobbing operations
- **`ConfigUI.js`** - Machine configuration interface
- **`Network.js`** - Network connection settings
- **`Debug.js`** - Debug information display

### Utilities

**`util.js`** provides core conversion functions:

- `send(cmd)` - Send command via WebSocket
- `distanceToSteps()` / `stepsToDistance()` - Convert between mm/inches and motor steps
- `stepsPerMM()` / `stepsPerIn()` - Calculate steps per unit based on nvConfig
- `mmToIn()` / `inToMM()` - Unit conversions
- `mmOrImp(state)` - Returns "(mm)" or "(in)" based on metric setting
- `maxPitch()` - Calculate maximum pitch based on encoder resolution

### Internationalization

Translation system in `translation.js` supports English (default) and Portuguese:

- `setLang('pt')` - Set language (called in App.js:40)
- `t("string")` - Translate string, falls back to original if translation missing

**Note:** Language is currently hardcoded to Portuguese in App.js.

## Important Implementation Details

### Connection Setup

The app determines the ESP32 IP address from:
1. URL query parameter (`?ip=192.168.1.229`)
2. Cookie (`ip_or_hostname`)
3. Default fallback (`192.168.1.229`)

WebSocket URL format: `ws://<ip>/els`
SSE URL format: `http://<ip>/events`

### Cookie Usage

Cookies store user preferences (via `react-cookie`):
- `ip_or_hostname` - ESP32 IP address
- `metric` - Boolean for metric/imperial units (default: true)

### Metric/Imperial Handling

All distance values are stored in **millimeters** internally. When imperial mode is active:
- UI displays values converted to inches
- User inputs are converted from inches to mm before sending to hardware
- Conversion happens in `MoveSyncUI.js` before calling `distanceToSteps()`

### Reconnection Logic

WebSocket implements automatic reconnection (espWS.js:104-138):
- On close, waits 500ms before reconnecting
- SSE source is recreated on each WebSocket connection
- `waitingToReconnect` state prevents multiple simultaneous reconnection attempts

### CORS and Private Network Access

The app requires CORS headers for local network access. Headers include:
- `Access-Control-Request-Private-Network: true`
- Used when making requests to ESP32 on local network

### Production Build Optimization

Environment variables in `.env` optimize production builds:
- `INLINE_RUNTIME_CHUNK=false` - Prevents runtime chunk creation
- `GENERATE_SOURCEMAP=false` - Disables sourcemaps for smaller builds
- `SKIP_PREFLIGHT_CHECK=true` - Skips dependency version checks

Gulp task (`gulpfile.js`) further bundles by inlining all JS/CSS into a single HTML file for embedded deployment.

## Known Issues & Quirks

- StrictMode is disabled in `index.js` to prevent double rendering which creates duplicate event streams
- WebSocket URL defaults to "ws://undefined/els" until properly configured - code checks for this
- Language is hardcoded to Portuguese (App.js:40) despite being configurable
- Some modal state (showModalError) can append multiple error messages instead of replacing
- Tests are minimal (only one test file: `src/test/foo.test.js`)
