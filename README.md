# Owen Animation System

A comprehensive Three.js animation system for character state management with clean architecture principles, dependency injection, and factory patterns.

[![Gitea Issues](https://img.shields.io/gitea/issues/all/kjanat/Owen?gitea_url=https%3A%2F%2Fgitea.kajkowalski.nl%2F)](https://gitea.kajkowalski.nl/kjanat/Owen/issues)
[![Gitea Pull Requests](https://img.shields.io/gitea/pull-requests/all/kjanat/Owen?gitea_url=https%3A%2F%2Fgitea.kajkowalski.nl%2F)](https://gitea.kajkowalski.nl/kjanat/Owen/pulls)
[![Gitea Release](https://img.shields.io/gitea/v/release/kjanat/Owen?gitea_url=https%3A%2F%2Fgitea.kajkowalski.nl&include_prereleases&sort=semver)](https://gitea.kajkowalski.nl/kjanat/Owen/tags)

## 🎯 Overview

The Owen Animation System is a sophisticated character animation framework built for Three.js that manages complex state machines, emotional responses, and animation transitions. It's designed with clean architecture principles to be maintainable, extensible, and testable.

## ✨ Key Features

-   **🤖 State Machine Implementation** - Complete state management system with `Wait`, `React`, `Type`, and `Sleep` states
-   **😊 Emotional Response System** - Analyzes user input to determine appropriate emotional animations
-   **🔄 Animation Transition Management** - Smooth transitions between states with fade in/out support
-   **📝 Animation Naming Convention Parser** - Automatically parses animation metadata from naming conventions
-   **🏗️ Clean Architecture** - Uses dependency injection, factory patterns, and separation of concerns
-   **⚡ Performance Optimized** - Efficient animation caching and resource management
-   **🧩 Extensible Design** - Easy to add new states, emotions, and animation types

## 🚀 Installation

### Prerequisites

-   Node.js 16.0.0 or higher
-   Three.js compatible 3D model with animations (GLTF/GLB format recommended)

### Install Dependencies

```bash
# Clone the repository
git clone https://gitea.kajkowalski.nl/kjanat/Owen.git
cd Owen

# Install dependencies
npm install

# Install dev dependencies
npm install --include dev
```

## 📖 Usage

### Basic Usage

```javascript
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OwenSystemFactory } from "owen";

// Load your 3D model
const loader = new GLTFLoader();
const gltf = await loader.loadAsync("path/to/your-model.gltf");

// Create a Three.js scene
const scene = new THREE.Scene();
scene.add(gltf.scene);

// Create the Owen animation system
const owenSystem = await OwenSystemFactory.createOwenSystem(gltf, scene);

// Handle user messages
await owenSystem.handleUserMessage("Hello Owen!");

// Update in your render loop
function animate() {
  const deltaTime = clock.getDelta() * 1000; // Convert to milliseconds
  owenSystem.update(deltaTime);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

> [!NOTE]
> Replace `path/to/your-model.gltf` with the actual path to your 3D character model. The system is designed to work with any GLTF model that follows the animation naming convention.

### Advanced Usage

```javascript
import { OwenSystemFactory, States, Emotions, StateHandler } from "owen";

// Create custom state handler
class CustomStateHandler extends StateHandler {
  async enter(fromState, emotion) {
    console.log(`Entering custom state from ${fromState}`);
    // Your custom logic here
  }

  async exit(toState, emotion) {
    console.log(`Exiting custom state to ${toState}`);
    // Your custom logic here
  }
}

// Register custom states
const customStates = new Map();
customStates.set("custom", CustomStateHandler);

// Create system with custom states
const owenSystem = await OwenSystemFactory.createCustomOwenSystem(gltfModel, scene, customStates);

// Manual state transitions
await owenSystem.transitionTo(States.REACT, Emotions.HAPPY);
```

## 🎮 Animation Naming Convention

The system expects animations to follow this naming convention:

```txt
[state]_[action]_[type]
[state]_[action]2[toState]_[emotion]_T
```

### Examples

-   `wait_idle_L` - Wait state idle loop
-   `wait_quirk1_Q` - Wait state quirk animation
-   `react_angry2type_an_T` - Transition from react to type with angry emotion
-   `type_happy_L` - Type state with happy emotion loop
-   `sleep_wakeup_T` - Sleep wake up transition

### Animation Types

-   `L` - Loop animation
-   `Q` - Quirk animation
-   `T` - Transition animation
-   `NL` - Nested loop
-   `NQ` - Nested quirk

### Emotions

-   `an` - Angry
-   `sh` - Shocked
-   `ha` - Happy
-   `sa` - Sad

## 🏗️ Architecture

### **Dependency Injection**

-   `OwenAnimationContext` receives dependencies through constructor injection
-   State handlers are injected with required context
-   Animation loaders are injected into factories

### **Factory Patterns**

-   `AnimationClipFactory` - Creates animation clips with metadata parsing
-   `StateFactory` - Creates state handlers dynamically
-   `OwenSystemFactory` - Main factory that assembles the complete system

### **State Machine**

-   Each state has its own handler class with entry/exit logic
-   States manage their own transitions and behaviors
-   Emotional transitions are handled with proper animation sequencing

## 📁 Project Structure

```sh
Owen/
├── src/
│   ├── constants.js              # Animation types, states, emotions
│   ├── index.js                  # Main entry point
│   ├── animation/
│   │   └── AnimationClip.js      # Core animation classes
│   ├── core/
│   │   └── OwenAnimationContext.js # Main system controller
│   ├── factories/
│   │   └── OwenSystemFactory.js  # System factory
│   ├── loaders/
│   │   └── AnimationLoader.js    # Animation loading interfaces
│   └── states/
│       ├── StateHandler.js       # Base state handler
│       ├── StateFactory.js       # State factory
│       ├── WaitStateHandler.js   # Wait state implementation
│       ├── ReactStateHandler.js  # React state implementation
│       ├── TypeStateHandler.js   # Type state implementation
│       └── SleepStateHandler.js  # Sleep state implementation
├── examples/
│   ├── index.html        # Demo HTML page
│   └── basic-demo.js     # Basic usage example
├── package.json
├── vite.config.js
├── jsdoc.config.json
└── README.md
```

## 🛠️ Development

### Running the Development Server

```bash
# Start the development server
npm run dev
```

This will start a Vite development server and open the basic demo at `http://localhost:3000`.

### Building for Production

```bash
# Build the project
npm run build
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Generating Documentation

```bash
# Generate JSDoc documentation
npm run docs
```

Documentation will be generated in the `docs/` directory.

### Project Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run StandardJS linting
-   `npm run lint:fix` - Fix StandardJS issues
-   `npm run docs` - Generate JSDoc documentation

## 🎮 Demo Controls

The basic demo includes these keyboard controls:

-   **1** - Transition to Wait state
-   **2** - Transition to React state
-   **3** - Transition to Type state
-   **4** - Transition to Sleep state
-   **Space** - Send random test message
-   **Click** - Register user activity

## 🔧 Configuration

### Customizing Emotions

You can extend the emotion system by modifying the message analysis:

```javascript
import { ReactStateHandler } from "owen";

class CustomReactHandler extends ReactStateHandler {
  analyzeMessageEmotion(message) {
    // Your custom emotion analysis logic
    if (message.includes("excited")) {
      return Emotions.HAPPY;
    }
    return super.analyzeMessageEmotion(message);
  }
}
```

### Adjusting Timing

Configure timing values in your application:

```javascript
import { Config } from "owen";

// Modify default values
Config.QUIRK_INTERVAL = 8000; // 8 seconds between quirks
Config.INACTIVITY_TIMEOUT = 120000; // 2 minutes until sleep
```

## 🐛 Troubleshooting

### Common Issues

1.  **"Animation not found" errors**

-   Ensure your 3D model contains animations with the correct naming convention
-   Check that animations are properly exported in your GLTF file

2.  **State transitions not working**

-   Verify that transition animations exist in your model
-   Check console for error messages about missing clips

3.  **Performance issues**

-   Ensure you're calling `owenSystem.update()` in your render loop
-   Check that unused animations are properly disposed

### Debug Mode

Enable debug logging by opening browser console. The system logs state transitions and important events.

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch: `git checkout -b feature/new-feature`
3.  Commit your changes: `git commit -am 'Add new feature'`
4.  Push to the branch: `git push origin feature/new-feature`
5.  Submit a pull request

### Code Style

-   Follow the existing ESLint configuration
-   Add JSDoc comments for all public methods
-   Write unit tests for new features
-   Maintain the existing architecture patterns

## 📄 License

This project is dual-licensed under your choice of:

-   **Open Source/Non-Commercial Use**: AGPL-3.0 - see the [LICENSE.AGPL](LICENSE.AGPL) file for details.
-   **Commercial/Enterprise Use**: Commercial License - see the [LICENSE.COMMERCIAL](LICENSE.COMMERCIAL) file for details. Requires a paid commercial license. Please contact us at [email] for pricing and terms.

### Quick Guide

-   ✅ Personal/educational use → Use under AGPL-3.0
-   ✅ Open source projects → Use under AGPL-3.0  
-   ✅ Commercial/proprietary use → Purchase commercial license
-   ❌ SaaS without source disclosure → Purchase commercial license

## 🙏 Acknowledgments

-   Built with [Three.js][Three.js]
-   Inspired by modern character animation systems
-   Uses clean architecture principles from Robert C. Martin

<!-- LINK DEFINITIONS -->
[Three.js]: https://threejs.org/ "Three.js - JavaScript 3D Library"
