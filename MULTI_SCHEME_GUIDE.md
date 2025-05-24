# Multi-Scheme Animation Naming Guide

The Owen Animation System supports four different naming schemes to accommodate different workflows and preferences. This guide explains each scheme and how to use them effectively.

## 🎯 Overview

The multi-scheme animation naming system provides backward compatibility while making the Owen Animation System more accessible to different types of users:

-   **Legacy Scheme**: Original technical format for backward compatibility
-   **Artist Scheme**: Blender-friendly names for 3D artists
-   **Hierarchical Scheme**: Organized dot-notation for structured projects
-   **Semantic Scheme**: Readable camelCase for developers

## 📝 Naming Schemes

### 1. Legacy Scheme (Technical/Backward Compatible)

**Format**: `{state}_{emotion}_{type}`
**Examples**:

-   `wait_idle_L` - Wait state, idle animation, Loop
-   `react_an2type_T` - React state, angry to type, Transition
-   `type_idle_L` - Type state, idle animation, Loop
-   `sleep_2wait_T` - Sleep state, to wait transition, Transition

**Use Cases**:

-   Existing Owen implementations
-   Technical documentation
-   Legacy animation files

### 2. Artist Scheme (Blender-Friendly)

**Format**: `Owen_{Action}` or `Owen_{StateAction}`
**Examples**:

-   `Owen_WaitIdle` - Wait idle animation
-   `Owen_ReactAngryToType` - React angry to type transition
-   `Owen_TypeIdle` - Type idle animation
-   `Owen_SleepToWait` - Sleep to wait transition

**Use Cases**:

-   3D artists working in Blender
-   Animation asset naming
-   Non-technical team members
-   Clear, human-readable names

### 3. Hierarchical Scheme (Structured/Organized)

**Format**: `owen.{category}.{state}.{detail}.{type}`
**Examples**:

-   `owen.state.wait.idle.loop` - Wait state idle loop
-   `owen.state.react.angry.totype.transition` - React angry to type transition
-   `owen.state.type.idle.loop` - Type state idle loop
-   `owen.state.sleep.towait.transition` - Sleep to wait transition

**Use Cases**:

-   Large projects with many animations
-   Structured asset organization
-   Configuration files
-   Automated tooling

### 4. Semantic Scheme (Developer-Friendly)

**Format**: `Owen{StateAction}{Type}` (PascalCase)
**Examples**:

-   `OwenWaitIdleLoop` - Wait idle loop animation
-   `OwenReactAngryToTypeTransition` - React angry to type transition
-   `OwenTypeIdleLoop` - Type idle loop animation
-   `OwenSleepToWaitTransition` - Sleep to wait transition

**Use Cases**:

-   JavaScript/TypeScript code
-   API integration
-   Developer constants
-   Type-safe programming

## 🔧 Usage Examples

### Basic Usage

```javascript
import { OwenAnimationContext, convertAnimationName } from './owen-animation-system';

// Get animation using any naming scheme
const clip1 = owenContext.getClip('wait_idle_L');           // Legacy
const clip2 = owenContext.getClip('Owen_WaitIdle');         // Artist
const clip3 = owenContext.getClip('owen.state.wait.idle.loop'); // Hierarchical
const clip4 = owenContext.getClip('OwenWaitIdleLoop');      // Semantic

// All return the same animation clip!
```

### Name Conversion

```javascript
import { convertAnimationName, getAllAnimationNames } from './owen-animation-system';

// Convert between schemes
const artistName = convertAnimationName('wait_idle_L', 'artist');
// Returns: 'Owen_WaitIdle'

const semanticName = convertAnimationName('Owen_ReactAngry', 'semantic');
// Returns: 'OwenReactAngryLoop'

// Get all variants
const allNames = getAllAnimationNames('react_an2type_T');
/* Returns:
{
  legacy: 'react_an2type_T',
  artist: 'Owen_ReactAngryToType',
  hierarchical: 'owen.state.react.angry.totype.transition',
  semantic: 'OwenReactAngryToTypeTransition'
}
*/
```

### Validation

```javascript
import { validateAnimationName } from './owen-animation-system';

const validation = validateAnimationName('Owen_WaitIdle');
/* Returns:
{
  isValid: true,
  scheme: 'artist',
  error: null,
  suggestions: []
}
*/

const invalidValidation = validateAnimationName('invalid_name');
/* Returns:
{
  isValid: false,
  scheme: 'unknown',
  error: 'Animation "invalid_name" not found',
  suggestions: ['OwenWaitIdleLoop', 'OwenReactIdleLoop', ...]
}
*/
```

### Using Constants

```javascript
import { 
  LegacyAnimations, 
  ArtistAnimations, 
  SemanticAnimations 
} from './owen-animation-system';

// Type-safe animation references
const legacyAnim = LegacyAnimations.WAIT_IDLE_LOOP;        // 'wait_idle_L'
const artistAnim = ArtistAnimations.WAIT_IDLE;             // 'Owen_WaitIdle'
const semanticAnim = SemanticAnimations.WAIT_IDLE_LOOP;    // 'OwenWaitIdleLoop'
```

## 🎨 Workflow Integration

### For 3D Artists (Blender)

1.  Use **Artist Scheme** names when creating animations in Blender
2.  Name animations like `Owen_WaitIdle`, `Owen_ReactHappy`, etc.
3.  Export animations with these names
4.  The system automatically handles conversion to other schemes

### For Developers

1.  Use **Semantic Scheme** constants in code for type safety
2.  Import animation constants: `import { SemanticAnimations } from './owen-animation-system'`
3.  Reference animations: `SemanticAnimations.WAIT_IDLE_LOOP`
4.  Let the system handle backward compatibility

### For Project Management

1.  Use **Hierarchical Scheme** for asset organization
2.  Structure animation files: `owen.state.{stateName}.{details}.{type}`
3.  Easy filtering and categorization
4.  Clear project structure

## 🔄 Migration Guide

### From Legacy to Multi-Scheme

```javascript
// Before (Legacy only)
const clip = owenContext.getClip('wait_idle_L');

// After (Multi-scheme compatible)
const clip = owenContext.getClip('wait_idle_L');           // Still works!
// OR use any other scheme:
const clip = owenContext.getClip('Owen_WaitIdle');         // Artist-friendly
const clip = owenContext.getClip('OwenWaitIdleLoop');      // Developer-friendly
```

### Updating Animation Assets

1.  **No changes required** - existing legacy names continue to work
2.  **Gradual migration** - add new scheme names alongside legacy names
3.  **Full migration** - replace legacy names with preferred scheme

## 📚 Available Animations

### Wait State

| Legacy            | Artist          | Semantic            |
| ----------------- | --------------- | ------------------- |
| `wait_idle_L`     | `Owen_WaitIdle` | `OwenWaitIdleLoop`  |
| `wait_pickNose_Q` | `Owen_PickNose` | `OwenQuirkPickNose` |
| `wait_stretch_Q`  | `Owen_Stretch`  | `OwenQuirkStretch`  |
| `wait_yawn_Q`     | `Owen_Yawn`     | `OwenQuirkYawn`     |

### React State

| Legacy         | Artist              | Semantic               |
| -------------- | ------------------- | ---------------------- |
| `react_idle_L` | `Owen_ReactIdle`    | `OwenReactIdleLoop`    |
| `react_an_L`   | `Owen_ReactAngry`   | `OwenReactAngryLoop`   |
| `react_sh_L`   | `Owen_ReactShocked` | `OwenReactShockedLoop` |
| `react_ha_L`   | `Owen_ReactHappy`   | `OwenReactHappyLoop`   |
| `react_sd_L`   | `Owen_ReactSad`     | `OwenReactSadLoop`     |

### Type State

| Legacy        | Artist          | Semantic           |
| ------------- | --------------- | ------------------ |
| `type_idle_L` | `Owen_TypeIdle` | `OwenTypeIdleLoop` |
| `type_fast_L` | `Owen_TypeFast` | `OwenTypeFastLoop` |
| `type_slow_L` | `Owen_TypeSlow` | `OwenTypeSlowLoop` |

### Sleep State

| Legacy          | Artist             | Semantic                    |
| --------------- | ------------------ | --------------------------- |
| `sleep_idle_L`  | `Owen_SleepIdle`   | `OwenSleepIdleLoop`         |
| `sleep_2wait_T` | `Owen_SleepToWait` | `OwenSleepToWaitTransition` |

## 🛠️ API Reference

### Core Methods

#### `getClip(name: string)`

Get animation clip by name (supports all schemes)

#### `getClipByScheme(name: string, targetScheme: string)`

Get animation clip with specific scheme conversion

#### `convertAnimationName(name: string, targetScheme: string)`

Convert animation name between schemes

#### `getAllAnimationNames(name: string)`

Get all scheme variants for an animation

#### `validateAnimationName(name: string)`

Validate animation name and get suggestions

### Constants

#### `NamingSchemes`

-   `LEGACY`: 'legacy'
-   `ARTIST`: 'artist'
-   `HIERARCHICAL`: 'hierarchical'
-   `SEMANTIC`: 'semantic'

#### Animation Constants

-   `LegacyAnimations`: Legacy scheme constants
-   `ArtistAnimations`: Artist scheme constants
-   `HierarchicalAnimations`: Hierarchical scheme constants
-   `SemanticAnimations`: Semantic scheme constants

## 🎯 Best Practices

1.  **Consistency**: Choose one primary scheme for your team and stick to it
2.  **Type Safety**: Use constants instead of raw strings when possible
3.  **Documentation**: Document which scheme you're using in your project
4.  **Validation**: Use `validateAnimationName()` to catch typos early
5.  **Migration**: Plan gradual migration for existing projects

## 🚀 Examples

Check out the [Mock Demo](./examples/mock-demo/owen_test_demo.html) for interactive examples of:

-   Name conversion between schemes
-   Animation validation
-   Real-time scheme testing
-   Integration patterns

---

For more information, see the [main README](./README.md) or check the [API documentation](./docs/).
