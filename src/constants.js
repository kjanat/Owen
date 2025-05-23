/**
 * @fileoverview Animation system constants and enumerations
 * @module constants
 */

/**
 * Animation clip types based on naming convention
 * @readonly
 * @enum {string}
 */
export const ClipTypes = {
    /** Loop animation */
    LOOP: 'L',
    /** Quirk animation */
    QUIRK: 'Q',
    /** Nested loop animation */
    NESTED_LOOP: 'NL',
    /** Nested quirk animation */
    NESTED_QUIRK: 'NQ',
    /** Nested in transition */
    NESTED_IN: 'IN_NT',
    /** Nested out transition */
    NESTED_OUT: 'OUT_NT',
    /** Transition animation */
    TRANSITION: 'T',
};

/**
 * Character animation states
 * @readonly
 * @enum {string}
 */
export const States = {
    /** Waiting/idle state */
    WAIT: 'wait',
    /** Reacting to input state */
    REACT: 'react',
    /** Typing response state */
    TYPE: 'type',
    /** Sleep/inactive state */
    SLEEP: 'sleep',
};

/**
 * Character emotional states
 * @readonly
 * @enum {string}
 */
export const Emotions = {
    /** Neutral emotion */
    NEUTRAL: '',
    /** Angry emotion */
    ANGRY: 'an',
    /** Shocked emotion */
    SHOCKED: 'sh',
    /** Happy emotion */
    HAPPY: 'ha',
    /** Sad emotion */
    SAD: 'sa',
};

/**
 * Default configuration values
 * @readonly
 * @type {Object}
 */
export const Config = {
    /** Default fade in duration for animations (ms) */
    DEFAULT_FADE_IN: 0.3,
    /** Default fade out duration for animations (ms) */
    DEFAULT_FADE_OUT: 0.3,
    /** Default quirk interval (ms) */
    QUIRK_INTERVAL: 5000,
    /** Default inactivity timeout (ms) */
    INACTIVITY_TIMEOUT: 60000,
    /** Quirk probability threshold */
    QUIRK_PROBABILITY: 0.3,
};
