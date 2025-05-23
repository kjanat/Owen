# Changelog

All notable changes to the Owen Animation System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-05-24

### Changed

-   🎨 Standardized code style throughout the codebase
-   🔧 Converted semicolons to non-semicolons according to JavaScript Standard Style
-   📝 Improved code consistency and readability

## [1.0.0] - 2025-05-23

### Added

-   🎉 Initial release of Owen Animation System
-   ✨ Complete state machine implementation with Wait, React, Type, and Sleep states
-   🤖 Emotional response system for character animations
-   🏗️ Clean architecture with dependency injection and factory patterns
-   📝 Animation naming convention parser
-   🔄 Smooth animation transitions with fade in/out support
-   ⚡ Performance-optimized animation caching
-   🧩 Extensible design for custom states and emotions
-   📊 Comprehensive JSDoc documentation
-   🎮 Interactive demo with keyboard controls
-   📦 TypeScript type definitions
-   🛠️ Development tooling (ESLint, Vite, JSDoc)

[1.0.1]: https://gitea.kajkowalski.nl/kjanat/Owen/releases/tag/v1.0.1

### Architecture

-   **Core Classes:**
    -   `OwenAnimationContext` - Main system controller
    -   `AnimationClip` - Individual animation management
    -   `AnimationClipFactory` - Animation creation with metadata parsing
    -   `StateHandler` - Abstract base for state implementations
    -   `StateFactory` - Dynamic state handler creation

-   **State Handlers:**
    -   `WaitStateHandler` - Idle state with quirk animations
    -   `ReactStateHandler` - User input response with emotion analysis
    -   `TypeStateHandler` - Typing state with emotional variations
    -   `SleepStateHandler` - Inactive state management

-   **Animation Loaders:**
    -   `AnimationLoader` - Abstract animation loading interface
    -   `GLTFAnimationLoader` - GLTF/GLB model animation loader

-   **Factories:**
    -   `OwenSystemFactory` - Main system assembly factory

### Features

-   **Animation System:**
    -   Support for Loop (L), Quirk (Q), Transition (T), and Nested animations
    -   Automatic metadata parsing from animation names
    -   Efficient animation caching and resource management
    -   Smooth transitions between states and emotions

-   **State Machine:**
    -   Four core states: Wait, React, Type, Sleep
    -   Emotional state transitions (Neutral, Angry, Shocked, Happy, Sad)
    -   Automatic inactivity detection and sleep transitions
    -   Message analysis for emotional response determination

-   **Developer Experience:**
    -   Comprehensive TypeScript type definitions
    -   JSDoc documentation for all public APIs
    -   Example implementations and demos
    -   ESLint configuration for code quality
    -   Vite development server setup

### Documentation

-   Complete README with installation and usage instructions
-   API documentation via JSDoc
-   Code examples for basic and advanced usage
-   Animation naming convention guide
-   Troubleshooting section

### Examples

-   Basic browser demo with Three.js integration
-   Simple Node.js example for testing
-   Interactive controls for state transitions
-   Mock model implementation for development

[1.0.0]: https://gitea.kajkowalski.nl/kjanat/Owen/releases/tag/v1.0.0
