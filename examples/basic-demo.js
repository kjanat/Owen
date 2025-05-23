/**
 * @fileoverview Basic example of using the Owen Animation System
 * @author Owen Animation System
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OwenSystemFactory, States } from '../src/index.js'

/**
 * Basic Owen Animation System demo
 * @class
 */
class OwenDemo {
  /**
   * Create the demo
   */
  constructor () {
    /**
     * The Three.js scene
     * @type {THREE.Scene}
     */
    this.scene = new THREE.Scene()

    /**
     * The Three.js camera
     * @type {THREE.PerspectiveCamera}
     */
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    /**
     * The Three.js renderer
     * @type {THREE.WebGLRenderer}
     */
    this.renderer = new THREE.WebGLRenderer({ antialias: true })

    /**
     * The Owen animation system
     * @type {OwenAnimationContext|null}
     */
    this.owenSystem = null

    /**
     * Clock for tracking time
     * @type {THREE.Clock}
     */
    this.clock = new THREE.Clock()
  }

  /**
   * Initialize the demo
   * @returns {Promise<void>}
   */
  async init () {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x1a1a1a)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(this.renderer.domElement)

    // Setup camera
    this.camera.position.set(0, 1.6, 3)
    this.camera.lookAt(0, 1, 0)

    // Add lighting
    this.setupLighting()

    // Load Owen model (replace with your model path)
    await this.loadOwenModel()

    // Setup event listeners
    this.setupEventListeners()

    // Start render loop
    this.animate()

    console.log('Owen Demo initialized')
  }

  /**
   * Setup scene lighting
   * @private
   * @returns {void}
   */
  setupLighting () {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(ambientLight)

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8bb7f0, 0.3)
    fillLight.position.set(-5, 5, -5)
    this.scene.add(fillLight)
  }

  /**
   * Load the Owen character model
   * @private
   * @returns {Promise<void>}
   */
  async loadOwenModel () {
    try {
      const loader = new GLTFLoader()

      // Replace 'path/to/owen.gltf' with your actual model path
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          'path/to/owen.gltf', // Update this path
          resolve,
          (progress) => console.log('Loading progress:', progress.loaded / progress.total * 100 + '%'),
          reject
        )
      })

      const model = gltf.scene
      model.position.set(0, 0, 0)
      model.scale.setScalar(1)

      // Enable shadows
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      this.scene.add(model)

      // Create Owen animation system
      this.owenSystem = await OwenSystemFactory.createOwenSystem(gltf, this.scene)

      console.log('Owen model loaded and animation system created')
      this.logSystemInfo()
    } catch (error) {
      console.error('Error loading Owen model:', error)

      // Create a placeholder cube for demo purposes
      this.createPlaceholderModel()
    }
  }

  /**
   * Create a placeholder model for demo purposes
   * @private
   * @returns {void}
   */
  createPlaceholderModel () {
    const geometry = new THREE.BoxGeometry(1, 2, 1)
    const material = new THREE.MeshPhongMaterial({ color: 0x6699ff })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(0, 1, 0)
    cube.castShadow = true
    cube.receiveShadow = true
    this.scene.add(cube)

    console.log('Created placeholder model (cube)')
  }

  /**
   * Setup event listeners for user interaction
   * @private
   * @returns {void}
   */
  setupEventListeners () {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      if (!this.owenSystem) return

      switch (event.key) {
        case '1':
          this.owenSystem.transitionTo(States.WAIT)
          break
        case '2':
          this.owenSystem.transitionTo(States.REACT)
          break
        case '3':
          this.owenSystem.transitionTo(States.TYPE)
          break
        case '4':
          this.owenSystem.transitionTo(States.SLEEP)
          break
        case ' ':
          this.sendTestMessage()
          break
      }
    })

    // Mouse interaction
    document.addEventListener('click', () => {
      if (this.owenSystem) {
        this.owenSystem.onUserActivity()
      }
    })

    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    })

    // Add instructions to the page
    this.addInstructions()
  }

  /**
   * Add on-screen instructions
   * @private
   * @returns {void}
   */
  addInstructions () {
    const instructions = document.createElement('div')
    instructions.innerHTML = `
      <div style="position: absolute; top: 10px; left: 10px; color: white; ` +
        `font-family: monospace; font-size: 14px; line-height: 1.4;">
        <h3>Owen Animation System Demo</h3>
        <p><strong>Controls:</strong></p>
        <p>1 - Wait State</p>
        <p>2 - React State</p>
        <p>3 - Type State</p>
        <p>4 - Sleep State</p>
        <p>Space - Send Test Message</p>
        <p>Click - User Activity</p>
        <br>
        <p><strong>Current State:</strong> <span id="current-state">-</span></p>
        <p><strong>Available Transitions:</strong> <span id="transitions">-</span></p>
      </div>
    `
    document.body.appendChild(instructions)
  }

  /**
   * Send a test message to Owen
   * @private
   * @returns {void}
   */
  sendTestMessage () {
    if (!this.owenSystem) return

    const testMessages = [
      'Hello Owen!',
      'How are you doing?',
      'This is urgent!',
      'Great work!',
      'Error in the system!',
      'I\'m feeling sad today'
    ]

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)]
    console.log(`Sending message: "${randomMessage}"`)
    this.owenSystem.handleUserMessage(randomMessage)
  }

  /**
   * Log system information
   * @private
   * @returns {void}
   */
  logSystemInfo () {
    if (!this.owenSystem) return

    console.log('=== Owen System Info ===')
    console.log('Available States:', this.owenSystem.getAvailableStates())
    console.log('Available Clips:', this.owenSystem.getAvailableClips())
    console.log('Current State:', this.owenSystem.getCurrentState())
    console.log('========================')
  }

  /**
   * Update UI with current system state
   * @private
   * @returns {void}
   */
  updateUI () {
    if (!this.owenSystem) return

    const currentStateElement = document.getElementById('current-state')
    const transitionsElement = document.getElementById('transitions')

    if (currentStateElement) {
      currentStateElement.textContent = this.owenSystem.getCurrentState()
    }

    if (transitionsElement) {
      transitionsElement.textContent = this.owenSystem.getAvailableTransitions().join(', ')
    }
  }

  /**
   * Main animation loop
   * @private
   * @returns {void}
   */
  animate () {
    requestAnimationFrame(() => this.animate())

    const deltaTime = this.clock.getDelta() * 1000 // Convert to milliseconds

    // Update Owen system
    if (this.owenSystem) {
      this.owenSystem.update(deltaTime)
    }

    // Update UI
    this.updateUI()

    // Render scene
    this.renderer.render(this.scene, this.camera)
  }
}

// Initialize the demo when the page loads
window.addEventListener('load', async () => {
  const demo = new OwenDemo()
  try {
    await demo.init()
  } catch (error) {
    console.error('Failed to initialize Owen demo:', error)
  }
})

export default OwenDemo
