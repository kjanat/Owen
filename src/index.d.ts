// Type definitions for Owen Animation System
// Project: Owen Animation System
// Definitions by: Owen Animation System

export as namespace Owen;

// Constants
export const ClipTypes: {
  readonly LOOP: 'L';
  readonly QUIRK: 'Q';
  readonly NESTED_LOOP: 'NL';
  readonly NESTED_QUIRK: 'NQ';
  readonly NESTED_IN: 'IN_NT';
  readonly NESTED_OUT: 'OUT_NT';
  readonly TRANSITION: 'T';
};

export const States: {
    readonly WAITING: 'wait';
    readonly REACTING: 'react';
    readonly TYPING: 'type';
    readonly SLEEPING: 'sleep';
};

export const Emotions: {
  readonly NEUTRAL: '';
  readonly ANGRY: 'an';
  readonly SHOCKED: 'sh';
  readonly HAPPY: 'ha';
  readonly SAD: 'sa';
};

export const Config: {
  DEFAULT_FADE_IN: number;
  DEFAULT_FADE_OUT: number;
  QUIRK_INTERVAL: number;
  INACTIVITY_TIMEOUT: number;
  QUIRK_PROBABILITY: number;
};

// Interfaces
export interface AnimationMetadata {
  state: string;
  action: string;
  type: string;
  toState?: string;
  emotion?: string;
  isTransition?: boolean;
  hasEmotion?: boolean;
  isNested?: boolean;
  isStandard?: boolean;
  subAction?: string;
  nestedType?: string;
}

// Classes
export class AnimationClip {
  constructor(name: string, threeAnimation: any, metadata: AnimationMetadata);

  readonly name: string;
  readonly animation: any;
  readonly metadata: AnimationMetadata;
  action: any | null;
  mixer: any | null;

  createAction(mixer: any): any;
  play(fadeInDuration?: number): Promise<void>;
  stop(fadeOutDuration?: number): Promise<void>;
  isPlaying(): boolean;
}

export class AnimationClipFactory {
  constructor(animationLoader: AnimationLoader);

  parseAnimationName(name: string): AnimationMetadata;
  createClip(name: string, model: any): Promise<AnimationClip>;
  createClipsFromModel(model: any): Promise<Map<string, AnimationClip>>;
  clearCache(): void;
  getCachedClip(name: string): AnimationClip | undefined;
}

export abstract class AnimationLoader {
  abstract loadAnimation(name: string): Promise<any>;
}

export class GLTFAnimationLoader extends AnimationLoader {
  constructor(gltfLoader: any);

  loadAnimation(name: string): Promise<any>;
  preloadAnimations(gltfModel: any): Promise<void>;
  clearCache(): void;
  getCachedAnimationNames(): string[];
}

export abstract class StateHandler {
  constructor(stateName: string, context: OwenAnimationContext);

  readonly stateName: string;
  readonly context: OwenAnimationContext;
  currentClip: AnimationClip | null;
  nestedState: any | null;

  abstract enter(fromState?: string | null, emotion?: string): Promise<void>;
  abstract exit(toState?: string | null, emotion?: string): Promise<void>;
  update(deltaTime: number): void;
  handleMessage(message: string): Promise<void>;
  getAvailableTransitions(): string[];
  protected waitForClipEnd(clip: AnimationClip): Promise<void>;
  protected stopCurrentClip(fadeOutDuration?: number): Promise<void>;
}

export class WaitStateHandler extends StateHandler {
  constructor(context: OwenAnimationContext);

  enter(fromState?: string | null, emotion?: string): Promise<void>;
  exit(toState?: string | null, emotion?: string): Promise<void>;
  update(deltaTime: number): void;
  getAvailableTransitions(): string[];
}

export class ReactStateHandler extends StateHandler {
  constructor(context: OwenAnimationContext);

  enter(fromState?: string | null, emotion?: string): Promise<void>;
  exit(toState?: string | null, emotion?: string): Promise<void>;
  handleMessage(message: string): Promise<void>;
  getAvailableTransitions(): string[];
}

export class TypeStateHandler extends StateHandler {
  constructor(context: OwenAnimationContext);

  enter(fromState?: string | null, emotion?: string): Promise<void>;
  exit(toState?: string | null, emotion?: string): Promise<void>;
  finishTyping(): Promise<void>;
  getAvailableTransitions(): string[];
  getIsTyping(): boolean;
  setTyping(typing: boolean): void;
}

export class SleepStateHandler extends StateHandler {
  constructor(context: OwenAnimationContext);

  enter(fromState?: string | null, emotion?: string): Promise<void>;
  exit(toState?: string | null, emotion?: string): Promise<void>;
  update(deltaTime: number): void;
  handleMessage(message: string): Promise<void>;
  getAvailableTransitions(): string[];
  isInDeepSleep(): boolean;
  wakeUp(): Promise<void>;
}

export class StateFactory {
  constructor();

  registerStateHandler(stateName: string, handlerClass: new (context: OwenAnimationContext) => StateHandler): void;
  createStateHandler(stateName: string, context: OwenAnimationContext): StateHandler;
  getAvailableStates(): string[];
  isStateRegistered(stateName: string): boolean;
  unregisterStateHandler(stateName: string): boolean;
}

export class OwenAnimationContext {
  constructor(
    model: any,
    mixer: any,
    animationClipFactory: AnimationClipFactory,
    stateFactory: StateFactory
  );

  readonly model: any;
  readonly mixer: any;
  readonly animationClipFactory: AnimationClipFactory;
  readonly stateFactory: StateFactory;
  readonly clips: Map<string, AnimationClip>;
  readonly states: Map<string, StateHandler>;
  currentState: string;
  currentStateHandler: StateHandler | null;
  initialized: boolean;

  initialize(): Promise<void>;
  transitionTo(newStateName: string, emotion?: string): Promise<void>;
  handleUserMessage(message: string): Promise<void>;
  onUserActivity(): void;
  update(deltaTime: number): void;
  getClip(name: string): AnimationClip | undefined;
  getClipsByPattern(pattern: string): AnimationClip[];
  getCurrentState(): string;
  getCurrentStateHandler(): StateHandler | null;
  getAvailableTransitions(): string[];
  getAvailableClips(): string[];
  getAvailableStates(): string[];
  dispose(): void;
}

export class OwenSystemFactory {
  static createOwenSystem(
    gltfModel: any,
    scene: any,
    options?: { gltfLoader?: any; }
  ): Promise<OwenAnimationContext>;

  static createBasicOwenSystem(model: any): Promise<OwenAnimationContext>;

  static createCustomOwenSystem(
    gltfModel: any,
    scene: any,
    customStates: Map<string, new (context: OwenAnimationContext) => StateHandler>
  ): Promise<OwenAnimationContext>;
}

// Default export
declare const Owen: {
  OwenSystemFactory: typeof OwenSystemFactory;
  OwenAnimationContext: typeof OwenAnimationContext;
  States: typeof States;
  Emotions: typeof Emotions;
  ClipTypes: typeof ClipTypes;
  Config: typeof Config;
};

export default Owen;
