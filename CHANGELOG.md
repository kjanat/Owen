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

-   🎯 Complete modular architecture with proper ES module structure
-   🧩 Extensible plugin system for custom states and emotions
-   📊 Comprehensive JSDoc documentation across all modules
-   🎮 Enhanced interactive demo with keyboard controls
-   📦 TypeScript type definitions for all components
-   🔧 Configuration system for fine-tuning behavior
-   🏗️ Examples directory with various implementation patterns
-   🚀 Vite-based development and build system

### Enhanced

-   ⚡ Optimized animation caching with intelligent preloading
-   🤖 Advanced emotional analysis with broader message understanding
-   🔄 Sophisticated animation transitions with nested state support
-   📝 Extended animation naming convention with nested animations
-   🎨 Refined state machine behavior and transitions
-   🛠️ Improved development tooling integration

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

## [0.1.0] - 2025-05-01

### Added

-   🎉 First implementation of Owen Animation System
-   ✨ Basic state machine implementation (Wait, React, Type, Sleep)
-   🤖 Simple emotional response system with basic message analysis
-   🏗️ Initial architecture with basic dependency injection pattern
-   📝 Basic animation naming parser for transitions and states
-   🔄 Basic animation transitions between states
-   ⚡ Simple animation clip caching
-   🎮 Basic Three.js integration with GLTFLoader
-   🎭 Core state handlers with basic functionality
-   🛠️ Development environment foundations

[1.0.1]: https://gitea.kajkowalski.nl/kjanat/Owen/releases/tag/v1.0.1
[1.0.0]: https://gitea.kajkowalski.nl/kjanat/Owen/releases/tag/v1.0.0
[0.1.0]: https://gitea.kajkowalski.nl/kjanat/Owen/releases/tag/v0.1.0
