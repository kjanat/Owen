// Animation Clip Types
const ClipTypes = {
  LOOP: 'L',
  QUIRK: 'Q',
  NESTED_LOOP: 'NL',
  NESTED_QUIRK: 'NQ',
  NESTED_IN: 'IN_NT',
  NESTED_OUT: 'OUT_NT',
  TRANSITION: 'T',
};

// Character States
const States = {
  WAIT: 'wait',
  REACT: 'react',
  TYPE: 'type',
  SLEEP: 'sleep',
};

// Emotions
const Emotions = {
  NEUTRAL: '',
  ANGRY: 'an',
  SHOCKED: 'sh',
  HAPPY: 'ha',
  SAD: 'sa',
};

/**
 * Animation Clip Factory - Creates animation clips based on naming convention
 */
class AnimationClipFactory {
  constructor(animationLoader) {
    this.animationLoader = animationLoader;
    this.clipCache = new Map();
  }

  /**
   * Parse animation name and create clip metadata
   * Format: [state]_[action]_[type] or [state]_[action]2[toState]_[emotion]_T
   */
  parseAnimationName(name) {
    const parts = name.split('_');
    const state = parts[0];
    const action = parts[1];

    // Handle transitions with emotions
    if (parts[2]?.includes('2') && parts[3] === ClipTypes.TRANSITION) {
      const [fromAction, toState] = parts[2].split('2');
      const emotion = parts[3] || Emotions.NEUTRAL;
      return {
        state,
        action: fromAction,
        toState,
        emotion,
        type: ClipTypes.TRANSITION,
        isEmotional: true,
      };
    }

    // Handle regular transitions
    if (parts[2] === ClipTypes.TRANSITION) {
      const [fromState, toState] = parts[1].split('2');
      return {
        state,
        action: fromState,
        toState,
        type: ClipTypes.TRANSITION,
        isEmotional: false,
      };
    }

    // Handle nested animations
    if (parts[2] === ClipTypes.NESTED_IN || parts[2] === ClipTypes.NESTED_OUT) {
      return {
        state,
        action,
        type: parts[2],
        isNested: true,
      };
    }

    // Handle nested loops and quirks
    if (
      parts[3] === ClipTypes.NESTED_LOOP ||
      parts[3] === ClipTypes.NESTED_QUIRK
    ) {
      return {
        state,
        action,
        nestedAction: parts[2],
        type: parts[3],
        isNested: true,
      };
    }

    // Handle standard loops and quirks
    return {
      state,
      action,
      type: parts[2],
      isStandard: true,
    };
  }

  async createClip(name, model) {
    if (this.clipCache.has(name)) {
      return this.clipCache.get(name);
    }

    const metadata = this.parseAnimationName(name);
    const animation = await this.animationLoader.loadAnimation(name);

    const clip = new AnimationClip(name, animation, metadata);
    this.clipCache.set(name, clip);

    return clip;
  }

  async createClipsFromModel(model) {
    const clips = new Map();
    const animations = model.animations || [];

    for (const animation of animations) {
      const clip = await this.createClip(animation.name, model);
      clips.set(animation.name, clip);
    }

    return clips;
  }
}

/**
 * Animation Clip - Represents a single animation with metadata
 */
class AnimationClip {
  constructor(name, threeAnimation, metadata) {
    this.name = name;
    this.animation = threeAnimation;
    this.metadata = metadata;
    this.action = null;
    this.mixer = null;
  }

  createAction(mixer) {
    this.mixer = mixer;
    this.action = mixer.clipAction(this.animation);

    // Configure based on type
    if (
      this.metadata.type === ClipTypes.LOOP ||
      this.metadata.type === ClipTypes.NESTED_LOOP
    ) {
      this.action.setLoop(THREE.LoopRepeat);
    } else {
      this.action.setLoop(THREE.LoopOnce);
      this.action.clampWhenFinished = true;
    }

    return this.action;
  }

  play(fadeInDuration = 0.3) {
    if (this.action) {
      this.action.reset();
      this.action.fadeIn(fadeInDuration);
      this.action.play();
    }
  }

  stop(fadeOutDuration = 0.3) {
    if (this.action) {
      this.action.fadeOut(fadeOutDuration);
    }
  }

  isPlaying() {
    return this.action?.isRunning() || false;
  }
}

/**
 * State Handler Interface
 */
class StateHandler {
  constructor(stateName, context) {
    this.stateName = stateName;
    this.context = context;
    this.currentClip = null;
    this.nestedState = null;
  }

  async enter(fromState = null, emotion = Emotions.NEUTRAL) {
    throw new Error('enter method must be implemented');
  }

  async exit(toState = null, emotion = Emotions.NEUTRAL) {
    throw new Error('exit method must be implemented');
  }

  update(deltaTime) {
    // Override in subclasses if needed
  }

  async handleMessage(message) {
    // Override in subclasses if needed
  }

  getAvailableTransitions() {
    return [];
  }
}

/**
 * Wait State Handler
 */
class WaitStateHandler extends StateHandler {
  constructor(context) {
    super(States.WAIT, context);
    this.idleClip = null;
    this.quirks = [];
    this.quirkTimer = 0;
    this.quirkInterval = 5000; // 5 seconds between quirks
  }

  async enter(fromState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Entering WAIT state from ${fromState}`);

    // Play idle loop
    this.idleClip = this.context.getClip('wait_idle_L');
    if (this.idleClip) {
      await this.idleClip.play();
    }

    // Collect available quirks
    this.quirks = this.context.getClipsByPattern('wait_*_Q');
    this.quirkTimer = 0;
  }

  async exit(toState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Exiting WAIT state to ${toState}`);

    if (this.currentClip) {
      this.currentClip.stop();
    }

    // Play transition if available
    const transitionName = `wait_2${toState}_T`;
    const transition = this.context.getClip(transitionName);
    if (transition) {
      await transition.play();
      await this.waitForClipEnd(transition);
    }
  }

  update(deltaTime) {
    this.quirkTimer += deltaTime;

    // Randomly play quirks
    if (this.quirkTimer > this.quirkInterval && Math.random() < 0.3) {
      this.playRandomQuirk();
      this.quirkTimer = 0;
    }
  }

  async playRandomQuirk() {
    if (this.quirks.length === 0) return;

    const quirk = this.quirks[Math.floor(Math.random() * this.quirks.length)];
    if (this.idleClip) {
      this.idleClip.stop(0.2);
    }

    await quirk.play();
    await this.waitForClipEnd(quirk);

    // Return to idle
    if (this.idleClip) {
      this.idleClip.play(0.2);
    }
  }

  getAvailableTransitions() {
    return [States.REACT, States.SLEEP];
  }

  async waitForClipEnd(clip) {
    return new Promise((resolve) => {
      const checkEnd = () => {
        if (!clip.isPlaying()) {
          resolve();
        } else {
          requestAnimationFrame(checkEnd);
        }
      };
      checkEnd();
    });
  }
}

/**
 * React State Handler
 */
class ReactStateHandler extends StateHandler {
  constructor(context) {
    super(States.REACT, context);
    this.emotion = Emotions.NEUTRAL;
  }

  async enter(fromState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Entering REACT state with emotion: ${emotion}`);
    this.emotion = emotion;

    // Play appropriate reaction
    const reactionClip = this.context.getClip('react_idle_L');
    if (reactionClip) {
      await reactionClip.play();
    }
  }

  async exit(toState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Exiting REACT state to ${toState} with emotion: ${emotion}`);

    if (this.currentClip) {
      this.currentClip.stop();
    }

    // Play emotional transition if available
    let transitionName;
    if (emotion !== Emotions.NEUTRAL) {
      transitionName = `react_${this.emotion}2${toState}_${emotion}_T`;
    } else {
      transitionName = `react_2${toState}_T`;
    }

    const transition = this.context.getClip(transitionName);
    if (transition) {
      await transition.play();
      await this.waitForClipEnd(transition);
    }
  }

  async handleMessage(message) {
    // Analyze message sentiment to determine emotion
    const emotion = this.analyzeMessageEmotion(message);
    this.emotion = emotion;

    // Play emotional reaction if needed
    if (emotion !== Emotions.NEUTRAL) {
      const emotionalClip = this.context.getClip(`react_${emotion}_L`);
      if (emotionalClip) {
        await emotionalClip.play();
      }
    }
  }

  analyzeMessageEmotion(message) {
    const text = message.toLowerCase();

    if (
      text.includes('!') ||
      text.includes('urgent') ||
      text.includes('asap')
    ) {
      return Emotions.SHOCKED;
    }
    if (
      text.includes('error') ||
      text.includes('problem') ||
      text.includes('issue')
    ) {
      return Emotions.ANGRY;
    }
    if (
      text.includes('great') ||
      text.includes('awesome') ||
      text.includes('good')
    ) {
      return Emotions.HAPPY;
    }

    return Emotions.NEUTRAL;
  }

  getAvailableTransitions() {
    return [States.TYPE, States.WAIT];
  }

  async waitForClipEnd(clip) {
    return new Promise((resolve) => {
      const checkEnd = () => {
        if (!clip.isPlaying()) {
          resolve();
        } else {
          requestAnimationFrame(checkEnd);
        }
      };
      checkEnd();
    });
  }
}

/**
 * Type State Handler
 */
class TypeStateHandler extends StateHandler {
  constructor(context) {
    super(States.TYPE, context);
    this.emotion = Emotions.NEUTRAL;
    this.isTyping = false;
  }

  async enter(fromState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Entering TYPE state with emotion: ${emotion}`);
    this.emotion = emotion;
    this.isTyping = true;

    // Play appropriate typing animation
    let typingClipName = 'type_idle_L';
    if (emotion !== Emotions.NEUTRAL) {
      typingClipName = `type_${emotion}_L`;
    }

    const typingClip = this.context.getClip(typingClipName);
    if (typingClip) {
      this.currentClip = typingClip;
      await typingClip.play();
    }
  }

  async exit(toState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Exiting TYPE state to ${toState}`);
    this.isTyping = false;

    if (this.currentClip) {
      this.currentClip.stop();
    }

    // Play appropriate exit transition
    let transitionName;
    if (this.emotion !== Emotions.NEUTRAL) {
      transitionName = `type_${this.emotion}2${toState}_T`;
    } else {
      transitionName = `type_2${toState}_T`;
    }

    const transition = this.context.getClip(transitionName);
    if (transition) {
      await transition.play();
      await this.waitForClipEnd(transition);
    }
  }

  async finishTyping() {
    this.isTyping = false;

    // Transition back to wait state
    return this.context.transitionTo(States.WAIT, this.emotion);
  }

  getAvailableTransitions() {
    return [States.WAIT];
  }

  async waitForClipEnd(clip) {
    return new Promise((resolve) => {
      const checkEnd = () => {
        if (!clip.isPlaying()) {
          resolve();
        } else {
          requestAnimationFrame(checkEnd);
        }
      };
      checkEnd();
    });
  }
}

/**
 * Sleep State Handler
 */
class SleepStateHandler extends StateHandler {
  constructor(context) {
    super(States.SLEEP, context);
    this.sleepDuration = 0;
    this.maxSleepDuration = 30000; // 30 seconds max sleep
  }

  async enter(fromState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Entering SLEEP state`);
    this.sleepDuration = 0;

    const sleepClip = this.context.getClip('sleep_idle_L');
    if (sleepClip) {
      this.currentClip = sleepClip;
      await sleepClip.play();
    }
  }

  async exit(toState = null, emotion = Emotions.NEUTRAL) {
    console.log(`Exiting SLEEP state to ${toState}`);

    if (this.currentClip) {
      this.currentClip.stop();
    }

    const transition = this.context.getClip(`sleep_2${toState}_T`);
    if (transition) {
      await transition.play();
      await this.waitForClipEnd(transition);
    }
  }

  update(deltaTime) {
    this.sleepDuration += deltaTime;

    // Wake up after max duration or on user activity
    if (this.sleepDuration > this.maxSleepDuration) {
      this.context.transitionTo(States.WAIT);
    }
  }

  getAvailableTransitions() {
    return [States.WAIT];
  }

  async waitForClipEnd(clip) {
    return new Promise((resolve) => {
      const checkEnd = () => {
        if (!clip.isPlaying()) {
          resolve();
        } else {
          requestAnimationFrame(checkEnd);
        }
      };
      checkEnd();
    });
  }
}

/**
 * State Factory - Creates state handlers using dependency injection
 */
class StateFactory {
  constructor() {
    this.stateHandlers = new Map();
  }

  registerStateHandler(stateName, handlerClass) {
    this.stateHandlers.set(stateName, handlerClass);
  }

  createStateHandler(stateName, context) {
    const HandlerClass = this.stateHandlers.get(stateName);
    if (!HandlerClass) {
      throw new Error(`Unknown state: ${stateName}`);
    }

    return new HandlerClass(context);
  }

  getAvailableStates() {
    return Array.from(this.stateHandlers.keys());
  }
}

/**
 * Owen Animation Context - Main controller for the animation system
 */
class OwenAnimationContext {
  constructor(model, mixer, animationClipFactory, stateFactory) {
    this.model = model;
    this.mixer = mixer;
    this.animationClipFactory = animationClipFactory;
    this.stateFactory = stateFactory;

    this.clips = new Map();
    this.states = new Map();
    this.currentState = null;
    this.currentStateName = null;

    this.userActivityTimeout = null;
    this.lastActivityTime = Date.now();
    this.inactivityThreshold = 180000; // 3 minutes
  }

  async initialize() {
    // Load all animation clips
    this.clips = await this.animationClipFactory.createClipsFromModel(
      this.model
    );

    // Create actions for all clips
    for (const clip of this.clips.values()) {
      clip.createAction(this.mixer);
    }

    // Initialize state handlers
    this.initializeStates();

    // Start in wait state
    await this.transitionTo(States.WAIT);

    console.log('Owen Animation System initialized');
  }

  initializeStates() {
    // Register state handlers
    this.stateFactory.registerStateHandler(States.WAIT, WaitStateHandler);
    this.stateFactory.registerStateHandler(States.REACT, ReactStateHandler);
    this.stateFactory.registerStateHandler(States.TYPE, TypeStateHandler);
    this.stateFactory.registerStateHandler(States.SLEEP, SleepStateHandler);

    // Create state instances
    for (const stateName of this.stateFactory.getAvailableStates()) {
      const stateHandler = this.stateFactory.createStateHandler(
        stateName,
        this
      );
      this.states.set(stateName, stateHandler);
    }
  }

  async transitionTo(newStateName, emotion = Emotions.NEUTRAL) {
    const newState = this.states.get(newStateName);
    if (!newState) {
      throw new Error(`Unknown state: ${newStateName}`);
    }

    // Exit current state
    if (this.currentState) {
      await this.currentState.exit(newStateName, emotion);
    }

    // Enter new state
    const fromState = this.currentStateName;
    this.currentState = newState;
    this.currentStateName = newStateName;

    await this.currentState.enter(fromState, emotion);

    // Reset activity timer
    this.resetActivityTimer();
  }

  async handleUserMessage(message) {
    this.resetActivityTimer();

    // Always go to react state first
    if (this.currentStateName !== States.REACT) {
      await this.transitionTo(States.REACT);
    }

    // Let the react state handle the message
    await this.currentState.handleMessage(message);

    // Transition to type state after a brief delay
    setTimeout(async () => {
      const emotion = this.currentState.emotion || Emotions.NEUTRAL;
      await this.transitionTo(States.TYPE, emotion);

      // Simulate typing duration based on message length
      const typingDuration = Math.min(message.length * 100, 5000);
      setTimeout(async () => {
        await this.currentState.finishTyping();
      }, typingDuration);
    }, 1000);
  }

  onUserActivity() {
    this.resetActivityTimer();

    // Wake up if sleeping
    if (this.currentStateName === States.SLEEP) {
      this.transitionTo(States.WAIT);
    }
  }

  resetActivityTimer() {
    this.lastActivityTime = Date.now();

    if (this.userActivityTimeout) {
      clearTimeout(this.userActivityTimeout);
    }

    this.userActivityTimeout = setTimeout(() => {
      this.handleInactivity();
    }, this.inactivityThreshold);
  }

  handleInactivity() {
    if (this.currentStateName === States.WAIT) {
      this.transitionTo(States.SLEEP);
    }
  }

  update(deltaTime) {
    // Update mixer
    this.mixer.update(deltaTime);

    // Update current state
    if (this.currentState) {
      this.currentState.update(deltaTime);
    }
  }

  getClip(name) {
    return this.clips.get(name);
  }

  getClipsByPattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.clips.values()).filter((clip) =>
      regex.test(clip.name)
    );
  }

  getCurrentState() {
    return this.currentStateName;
  }

  getAvailableTransitions() {
    return this.currentState?.getAvailableTransitions() || [];
  }
}

/**
 * Animation Loader Interface - Loads animations from various sources
 */
class AnimationLoader {
  async loadAnimation(name) {
    throw new Error('loadAnimation method must be implemented');
  }
}

/**
 * GLTF Animation Loader - Loads animations from GLTF models
 */
class GLTFAnimationLoader extends AnimationLoader {
  constructor(gltfLoader) {
    super();
    this.gltfLoader = gltfLoader;
    this.animationCache = new Map();
  }

  async loadAnimation(name) {
    if (this.animationCache.has(name)) {
      return this.animationCache.get(name);
    }

    // In a real implementation, you would load the specific animation
    // For this mockup, we'll assume animations are already loaded in the model
    throw new Error(`Animation ${name} not found in model`);
  }
}

/**
 * Owen System Factory - Main factory for creating the complete Owen system
 */
class OwenSystemFactory {
  static async createOwenSystem(gltfModel, scene) {
    // Create Three.js mixer
    const mixer = new THREE.AnimationMixer(gltfModel);

    // Create dependencies
    const gltfLoader = new THREE.GLTFLoader();
    const animationLoader = new GLTFAnimationLoader(gltfLoader);
    const animationClipFactory = new AnimationClipFactory(animationLoader);
    const stateFactory = new StateFactory();

    // Create the main context
    const owenContext = new OwenAnimationContext(
      gltfModel,
      mixer,
      animationClipFactory,
      stateFactory
    );

    // Initialize the system
    await owenContext.initialize();

    // Add to scene
    scene.add(gltfModel);

    return owenContext;
  }
}

// Usage Example
class OwenDemo {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.owenSystem = null;
    this.clock = new THREE.Clock();
  }

  async init() {
    // Setup Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Load Owen model (mockup)
    const loader = new THREE.GLTFLoader();
    const gltf = await loader.loadAsync('path/to/owen-model.gltf');

    // Create Owen system
    this.owenSystem = await OwenSystemFactory.createOwenSystem(
      gltf.scene,
      this.scene
    );

    // Setup event listeners
    this.setupEventListeners();

    // Start render loop
    this.animate();
  }

  setupEventListeners() {
    // Mouse activity
    document.addEventListener('mousemove', () => {
      this.owenSystem.onUserActivity();
    });

    // Simulate user messages
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const message = prompt('Send message to Owen:');
        if (message) {
          this.owenSystem.handleUserMessage(message);
        }
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();

    // Update Owen system
    if (this.owenSystem) {
      this.owenSystem.update(deltaTime);
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the demo
const demo = new OwenDemo();
demo.init().catch(console.error);

export {
  OwenSystemFactory,
  OwenAnimationContext,
  StateFactory,
  AnimationClipFactory,
  States,
  Emotions,
  ClipTypes,
};
