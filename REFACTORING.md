# Refactoring Recommendations for espELSfrontend

## Priority 1: Code Quality & Bugs

### 1. Fix Equality Operators (== to ===, != to !==)
**Status:** ✅ COMPLETE
**Impact:** High - Prevents type coercion bugs
**Effort:** Low - Find/replace with verification

**Files fixed:**
- ✅ `src/MoveSyncUI.js` - FIXED (7 instances)
- ✅ `src/App.js` - FIXED (24 instances)
- ✅ `src/feed.js` - FIXED (1 instance)
- ✅ `src/Bounce.js` - FIXED (3 instances)
- ✅ `src/configUI.js` - FIXED (2 instances)
- ✅ `src/espWS.js` - FIXED (3 instances)
- ✅ `src/info.js` - FIXED (2 instances)
- ✅ `src/ModalMove.js` - FIXED (1 instance)
- ✅ `src/Moving.js` - FIXED (1 instance)
- ✅ `src/ShowMoveOptions.js` - FIXED (3 instances)
- ✅ `src/ThreadView.js` - FIXED (1 instance)
- ✅ `src/util.js` - FIXED (5 instances)

**Total instances fixed:** 53 across 12 files

**Quick Fix Script:**
```bash
# For each file, carefully review and replace:
# data == 5  →  data === 5
# state.metric != true  →  state.metric !== true
# machineConfig.m == 0  →  machineConfig.m === 0
# sse_source.OPEN == 1  →  sse_source.OPEN === 1
```

### 2. Remove console.log Statements
**Impact:** Medium - Cleaner code, better performance
**Effort:** Low

**Instances found:**
- `MoveSyncUI.js`: Lines 133, 174, 183, 189, 191, 196-200, 207
- Replace with proper logging library or remove for production

**Recommendation:**
```javascript
// Create a logger utility
const logger = {
  debug: (msg, ...args) => process.env.NODE_ENV === 'development' && console.log(msg, ...args),
  error: (msg, ...args) => console.error(msg, ...args)
};
```

### 3. Fix Magic Numbers & Strings
**Impact:** Medium - Better maintainability
**Effort:** Medium

**Constants to extract:**
```javascript
// In a new file: src/constants.js
export const PITCH_DEFAULTS = {
  ROUGHING: 0.2,  // mm
  FINISHING: 0.08  // mm
};

export const MACHINE_MODES = {
  STARTUP: 0,
  MOVE_SYNC: 2,
  HOBBING: 4,
  FEED: 5,
  THREAD: 14,
  FREE_JOG: 15
};

export const TAB_KEYS = {
  MOVE_SYNC: 'syncMove',
  BOUNCE: 'bounce',
  FREE_JOG: 'FreeJog'
};

export const CONVERSION_FACTOR = 25.4; // mm per inch
```

## Priority 2: Component Architecture

### 4. Extract MoveSyncUI Sub-Components
**Impact:** High - Better code organization and reusability
**Effort:** High

**Current size:** ~450 lines (too large!)

**Recommended extraction:**
```
MoveSyncUI/
├── index.js (main component, ~100 lines)
├── MoveControls.js (distance input, move buttons, ~150 lines)
├── PresetSection.js (dropdown + manage button, ~50 lines)
├── PitchSettings.js (accordion with pitch inputs, ~100 lines)
└── hooks/
    ├── usePresetManagement.js (preset state & handlers)
    └── useMoveConfig.js (moveConfig state & send logic)
```

**Benefits:**
- Easier to test individual components
- Better code organization
- Reduced cognitive load
- Easier to maintain

### 5. Replace Refs with State for Form Values
**Impact:** Medium - More React-idiomatic
**Effort:** Medium

**Current problem:**
- Using both `refs` AND `state` for movePitch/rapidPitch
- `distanceRef`, `movePitchRef`, `rapidPitchRef` alongside state values
- Confusing dual source of truth

**Recommendation:**
```javascript
// Replace refs with controlled components
const [distance, setDistance] = useState(0);
const [movePitchInput, setMovePitchInput] = useState('');
const [rapidPitchInput, setRapidPitchInput] = useState('');

// In JSX:
<FormControl
  value={distance}
  onChange={(e) => setDistance(e.target.value)}
  // ... other props
/>
```

### 6. Create Custom Hooks for Reusable Logic
**Impact:** High - Code reuse and cleaner components
**Effort:** Medium

**Hooks to create:**

```javascript
// src/hooks/usePresets.js
export function usePresets() {
  const [cookies, setCookie] = useCookies(['moveSyncPresets']);
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [defaultPresetId, setDefaultPresetId] = useState(null);

  // ... all preset logic

  return {
    presets,
    selectedPresetId,
    defaultPresetId,
    handlePresetSelect,
    handlePresetSave,
    // ...
  };
}

// src/hooks/useCookieState.js
export function useCookieState(cookieName, defaultValue, options = {}) {
  const [cookies, setCookie] = useCookies([cookieName]);

  const value = cookies[cookieName] || defaultValue;

  const setValue = (newValue) => {
    setCookie(cookieName, newValue, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'strict',
      ...options
    });
  };

  return [value, setValue];
}

// src/hooks/useUnitConversion.js
export function useUnitConversion(state) {
  const toDisplay = (value) => viewPitch(state, value);
  const toMM = (value) => state.metric ? value : inToMM(value);
  const isMetric = state.metric === true;

  return { toDisplay, toMM, isMetric };
}
```

## Priority 3: Error Handling & Validation

### 7. Add Proper Error Boundaries
**Impact:** High - Better UX when errors occur
**Effort:** Low

**Recommendation:**
```javascript
// src/components/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// In App.js:
<ErrorBoundary>
  <MoveSyncUI ... />
</ErrorBoundary>
```

### 8. Add Input Validation
**Impact:** Medium - Prevent invalid states
**Effort:** Low

**Current issues:**
- No validation that distance is positive
- No validation that pitch values are reasonable
- No validation of preset names (empty, duplicates handled but could be better)

**Recommendation:**
```javascript
// src/utils/validators.js
export const validateDistance = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: 'Must be a number' };
  if (num <= 0) return { valid: false, error: 'Must be positive' };
  if (num > 1000) return { valid: false, error: 'Too large (max 1000mm)' };
  return { valid: true };
};

export const validatePitch = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: 'Must be a number' };
  if (num <= 0) return { valid: false, error: 'Must be positive' };
  if (num > 10) return { valid: false, error: 'Pitch too large' };
  return { valid: true };
};
```

## Priority 4: Testing

### 9. Add Unit Tests
**Impact:** High - Catch bugs early, enable confident refactoring
**Effort:** High

**Test files to create:**
```
src/
├── utils/
│   ├── presetUtils.test.js
│   ├── validators.test.js
│   └── conversion.test.js
├── hooks/
│   ├── usePresets.test.js
│   └── useUnitConversion.test.js
└── components/
    ├── PresetSelector.test.js
    ├── PresetManagerModal.test.js
    └── MoveSyncUI.test.js
```

**Example test:**
```javascript
// src/utils/presetUtils.test.js
import { validatePreset, generatePresetId } from './presetUtils';

describe('validatePreset', () => {
  it('should validate a correct preset', () => {
    const preset = {
      id: 'test',
      label: 'Test',
      movePitch: 0.2,
      rapidPitch: 0.2
    };
    expect(validatePreset(preset)).toBeNull();
  });

  it('should reject negative pitch values', () => {
    const preset = {
      id: 'test',
      label: 'Test',
      movePitch: -0.2,
      rapidPitch: 0.2
    };
    expect(validatePreset(preset)).toContain('positive');
  });
});
```

### 10. Add Integration Tests
**Impact:** Medium - Ensure components work together
**Effort:** Medium

**Key scenarios to test:**
- Preset selection updates move/rapid pitch
- Switching between metric/imperial updates display
- Saving presets persists to cookie
- Default preset loads on startup

## Priority 5: Accessibility

### 11. Improve ARIA Labels and Keyboard Navigation
**Impact:** Medium - Better accessibility
**Effort:** Low

**Issues:**
- Some buttons lack descriptive labels
- Dropdown might not be fully keyboard accessible
- Modal focus management could be better

**Recommendations:**
```javascript
// Better ARIA labels
<Button
  aria-label="Move spindle left (rapid)"
  onClick={...}
>
  <ArrowBarLeft />Rapid Z-
</Button>

// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleJogClick('rjog'); // Ctrl+Enter for right jog
    }
  };
  window.addEventListener('keypress', handleKeyPress);
  return () => window.removeEventListener('keypress', handleKeyPress);
}, []);
```

### 12. Add Focus Management in Modals
**Impact:** Low - Better UX
**Effort:** Low

```javascript
// In PresetManagerModal
useEffect(() => {
  if (show) {
    // Focus first input when modal opens
    const firstInput = document.querySelector('#preset-name-input');
    firstInput?.focus();
  }
}, [show]);
```

## Priority 6: TypeScript Migration

### 13. Gradual TypeScript Adoption
**Impact:** High - Better type safety and developer experience
**Effort:** Very High

**Recommended approach:**
1. Add `tsconfig.json` with `allowJs: true`
2. Rename `.js` files to `.tsx` gradually
3. Start with utilities (highest ROI):
   - `presetUtils.ts`
   - `util.ts`
   - `validators.ts`
4. Add types for props and state
5. Eventually convert all files

**Example:**
```typescript
// src/utils/presetUtils.ts
export interface Preset {
  id: string;
  label: string;
  movePitch: number;  // mm
  rapidPitch: number; // mm
}

export interface PresetCollection {
  presets: Preset[];
  selectedPresetId: string;
  defaultPresetId: string;
}

export const validatePreset = (preset: Preset): string | null => {
  // ...
};
```

## Priority 7: Performance

### 14. Add React.memo for Heavy Components
**Impact:** Low - Better performance on re-renders
**Effort:** Low

```javascript
// Wrap expensive components
export default React.memo(PresetManagerModal, (prevProps, nextProps) => {
  return prevProps.show === nextProps.show &&
         prevProps.presets === nextProps.presets;
});
```

### 15. Debounce Input Handlers
**Impact:** Low - Reduce unnecessary updates
**Effort:** Low

```javascript
import { debounce } from 'lodash';

const debouncedPitchChange = useMemo(
  () => debounce((value) => {
    setMovePitch(value);
  }, 300),
  []
);
```

## Priority 8: Code Organization

### 16. Better File Structure
**Impact:** Medium - Easier navigation
**Effort:** Medium

**Current structure:** Flat
**Recommended structure:**
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── ErrorBoundary.js
│   │   └── LoadingSpinner.js
│   ├── presets/         # Preset-related components
│   │   ├── PresetSelector.js
│   │   ├── PresetManagerModal.js
│   │   └── PresetList.js
│   └── movesync/        # MoveSyncUI components
│       ├── MoveSyncUI.js
│       ├── MoveControls.js
│       └── PitchSettings.js
├── hooks/               # Custom hooks
│   ├── usePresets.js
│   ├── useCookieState.js
│   └── useUnitConversion.js
├── utils/               # Utility functions
│   ├── presetUtils.js
│   ├── conversion.js
│   ├── validators.js
│   └── constants.js
├── types/               # TypeScript types (future)
│   └── presets.d.ts
└── __tests__/          # Test files
    └── ...
```

### 17. Environment Configuration
**Impact:** Low - Better deployment flexibility
**Effort:** Low

**Create `.env` files:**
```bash
# .env.development
REACT_APP_DEFAULT_WS_URL=ws://localhost:8080
REACT_APP_LOG_LEVEL=debug

# .env.production
REACT_APP_DEFAULT_WS_URL=ws://192.168.1.100:8080
REACT_APP_LOG_LEVEL=error
```

## Priority 9: Documentation

### 18. Add JSDoc Comments
**Impact:** Medium - Better developer experience
**Effort:** Low

```javascript
/**
 * Validates a preset object
 * @param {Object} preset - The preset to validate
 * @param {string} preset.id - Unique preset identifier
 * @param {string} preset.label - Display label for the preset
 * @param {number} preset.movePitch - Move pitch in mm
 * @param {number} preset.rapidPitch - Rapid pitch in mm
 * @returns {string|null} Error message or null if valid
 */
export const validatePreset = (preset) => {
  // ...
};
```

### 19. Create Component Documentation
**Impact:** Low - Easier onboarding
**Effort:** Low

Create `COMPONENTS.md` documenting:
- Component hierarchy
- Props for each component
- State management approach
- Event flow

## Summary: Quick Wins

**Do these first for maximum impact with minimal effort:**

1. ✅ Fix == to === in MoveSyncUI.js (DONE)
2. ✅ Fix == to === in remaining files (DONE - 53 instances across 12 files)
3. Extract constants for magic numbers/strings (1 hour)
4. Remove/replace console.log statements (30 minutes)
5. Add input validation (2 hours)
6. Create `usePresets` custom hook (2 hours)
7. Add basic unit tests for utilities (4 hours)
8. Add JSDoc comments to key functions (2 hours)

**Total time for quick wins:** ~12-15 hours
**Impact:** Significantly better code quality and maintainability

## Long-term Improvements

**Over the next few months:**

1. Extract MoveSyncUI into smaller components (1 week)
2. Migrate to TypeScript gradually (2-3 weeks)
3. Add comprehensive test coverage (2-3 weeks)
4. Implement proper error boundaries (2 days)
5. Improve accessibility (1 week)
6. Performance optimization (3-5 days)

---

**Last Updated:** 2025-12-31
**Status:** In Progress - All equality operators fixed (53 instances across 12 files)
