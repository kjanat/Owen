# Owen

> Looking at this animation brief for Owen, I'll create a Three.js animation system that handles the state machine, animation clips, and transitions described in the document. This will use clean architecture principles with dependency injection and factory patterns.
>
> I've created a comprehensive Three.js animation system for Owen that implements the state machine and animation handling described in your brief. Here are the key architectural features:

## **Clean Architecture Principles:**

### **Dependency Injection:**

- `OwenAnimationContext` receives its dependencies (mixer, factory, etc.) through constructor injection
- State handlers are injected with the context they need
- Animation loaders are injected into factories

### **Factory Patterns:**

- `AnimationClipFactory` - Creates animation clips with proper metadata parsing
- `StateFactory` - Creates state handlers dynamically
- `OwenSystemFactory` - Main factory that assembles the entire system

### **State Machine Implementation:**

- Each state (`Wait`, `React`, `Type`, `Sleep`) has its own handler class
- States manage their own entry/exit logic and transitions
- Emotional transitions are handled with proper animation sequencing

## **Key Features:**

1. **Animation Naming Convention Parser** - Automatically parses the naming convention from your brief (e.g., `wait_idle_L`, `react_angry2type_an_T`)

2. **Emotional State Management** - Handles emotional transitions like angry typing or shocked reactions

3. **Nested Animation Support** - Supports the nested sequences described in your brief

4. **Activity Monitoring** - Automatically transitions to sleep after inactivity

5. **Message Analysis** - Analyzes user messages to determine appropriate emotional responses

6. **Clean Separation of Concerns:**
   - Animation loading is separate from clip management
   - State logic is isolated in individual handlers
   - The main context orchestrates everything without tight coupling

## **Usage:**

The system is designed to be easily extensible. You can:

- Add new states by creating new handler classes
- Modify emotional analysis logic
- Swap out animation loaders for different formats
- Add new animation types by extending the factory

The code follows the workflows described in your brief, handling the transitions between Wait → React → Type → Wait states, with proper emotional branching and nested animation support.
