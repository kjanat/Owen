#!/usr/bin/env node

/**
 * Animation Processing Validation Script
 *
 * Validates animations processed from Blender or other sources to ensure:
 * - Proper naming scheme compliance
 * - File integrity and format validation
 * - Asset optimization and size requirements
 * - Integration with existing animation system
 *
 * Used by GitHub Actions animation-processing workflow
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  animationsDir: path.join(__dirname, '..', 'assets', 'animations'),
  reportsDir: path.join(__dirname, '..', 'reports'),
  maxFileSize: 5 * 1024 * 1024, // 5MB max per animation file
  supportedFormats: ['.gltf', '.glb', '.fbx', '.json'],
  requiredMetadata: ['name', 'duration', 'frameRate'],
  namingSchemes: ['legacy', 'artist', 'hierarchical', 'semantic']
}

/**
 * Validation result structure
 */
class ValidationResult {
  constructor () {
    this.passed = []
    this.failed = []
    this.warnings = []
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      totalSize: 0,
      averageSize: 0
    }
  }

  addPass (file, message) {
    this.passed.push({ file, message, timestamp: new Date().toISOString() })
    this.stats.validFiles++
  }

  addFail (file, message, error = null) {
    this.failed.push({
      file,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    })
    this.stats.invalidFiles++
  }

  addWarning (file, message) {
    this.warnings.push({ file, message, timestamp: new Date().toISOString() })
  }

  updateStats (size) {
    this.stats.totalFiles++
    this.stats.totalSize += size
    this.stats.averageSize = this.stats.totalSize / this.stats.totalFiles
  }

  isValid () {
    return this.failed.length === 0
  }

  getSummary () {
    return {
      success: this.isValid(),
      summary: {
        passed: this.passed.length,
        failed: this.failed.length,
        warnings: this.warnings.length,
        ...this.stats
      },
      details: {
        passed: this.passed,
        failed: this.failed,
        warnings: this.warnings
      }
    }
  }
}

/**
 * File format validators
 */
const Validators = {
  async validateGLTF (filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const gltf = JSON.parse(content)

      // Basic GLTF structure validation
      if (!gltf.asset || !gltf.asset.version) {
        throw new Error('Invalid GLTF: Missing asset version')
      }

      if (!gltf.animations || !Array.isArray(gltf.animations)) {
        throw new Error('Invalid GLTF: Missing or invalid animations array')
      }

      return {
        valid: true,
        animations: gltf.animations.length,
        version: gltf.asset.version
      }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  },

  async validateGLB (filePath) {
    try {
      const stats = await fs.stat(filePath)
      const buffer = await fs.readFile(filePath)

      // Basic GLB header validation (magic number: 0x46546C67 = "glTF")
      if (buffer.length < 12) {
        throw new Error('Invalid GLB: File too small')
      }

      const magic = buffer.readUInt32LE(0)
      if (magic !== 0x46546C67) {
        throw new Error('Invalid GLB: Invalid magic number')
      }

      const version = buffer.readUInt32LE(4)
      if (version !== 2) {
        throw new Error(`Invalid GLB: Unsupported version ${version}`)
      }

      return {
        valid: true,
        size: stats.size,
        version
      }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  },

  async validateJSON (filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(content)

      // Check for required animation metadata
      if (!data.name || !data.duration) {
        throw new Error('Invalid animation JSON: Missing required metadata')
      }

      return {
        valid: true,
        metadata: data
      }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }
}

/**
 * Validates naming scheme compliance
 */
function validateNamingScheme (filename) {
  const baseName = path.parse(filename).name
  const schemes = {
    legacy: /^[a-z][a-z0-9_]*$/,
    artist: /^[A-Z][a-zA-Z0-9_]*$/,
    hierarchical: /^[a-z]+(\.[a-z]+)*$/,
    semantic: /^[a-z]+(_[a-z]+)*$/
  }

  const matchedSchemes = []
  for (const [scheme, pattern] of Object.entries(schemes)) {
    if (pattern.test(baseName)) {
      matchedSchemes.push(scheme)
    }
  }

  return {
    valid: matchedSchemes.length > 0,
    schemes: matchedSchemes,
    name: baseName
  }
}

/**
 * Validates individual animation file
 */
async function validateAnimationFile (filePath) {
  const result = new ValidationResult()
  const filename = path.basename(filePath)
  const ext = path.extname(filePath).toLowerCase()

  try {
    // Check file existence
    const stats = await fs.stat(filePath)
    result.updateStats(stats.size)

    // Check file size
    if (stats.size > CONFIG.maxFileSize) {
      result.addWarning(filename,
        `File size ${(stats.size / 1024 / 1024).toFixed(2)}MB exceeds recommended maximum ${CONFIG.maxFileSize / 1024 / 1024}MB`
      )
    }

    // Check supported format
    if (!CONFIG.supportedFormats.includes(ext)) {
      result.addFail(filename, `Unsupported file format: ${ext}`)
      return result
    }

    // Validate naming scheme
    const namingValidation = validateNamingScheme(filename)
    if (!namingValidation.valid) {
      result.addFail(filename, 'Filename does not match any supported naming scheme')
    } else {
      result.addPass(filename, `Naming scheme compliance: ${namingValidation.schemes.join(', ')}`)
    }

    // Format-specific validation
    let formatValidation = { valid: true }
    switch (ext) {
      case '.gltf':
        formatValidation = await Validators.validateGLTF(filePath)
        break
      case '.glb':
        formatValidation = await Validators.validateGLB(filePath)
        break
      case '.json':
        formatValidation = await Validators.validateJSON(filePath)
        break
    }

    if (formatValidation.valid) {
      result.addPass(filename, `Valid ${ext.toUpperCase()} format`)
    } else {
      result.addFail(filename, `Invalid ${ext.toUpperCase()} format: ${formatValidation.error}`)
    }
  } catch (error) {
    result.addFail(filename, `Validation error: ${error.message}`, error)
  }

  return result
}

/**
 * Scans directory for animation files
 */
async function scanAnimationFiles (directory) {
  const files = []

  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanAnimationFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (CONFIG.supportedFormats.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${directory}: ${error.message}`)
  }

  return files
}

/**
 * Generates validation report
 */
async function generateReport (result, outputPath) {
  const report = {
    timestamp: new Date().toISOString(),
    validation: result.getSummary(),
    recommendations: []
  }

  // Add recommendations based on results
  if (result.failed.length > 0) {
    report.recommendations.push('Fix failed validations before proceeding with deployment')
  }

  if (result.warnings.length > 0) {
    report.recommendations.push('Review warnings to optimize animation assets')
  }

  if (result.stats.averageSize > 1024 * 1024) {
    report.recommendations.push('Consider optimizing large animation files for better performance')
  }

  // Ensure reports directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  // Write report
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2))

  return report
}

/**
 * Main validation function
 */
async function validateProcessedAnimations () {
  console.log('🔍 Validating processed animation assets...')

  const overallResult = new ValidationResult()

  try {
    // Check if animations directory exists
    try {
      await fs.access(CONFIG.animationsDir)
    } catch {
      console.warn(`⚠️  Animations directory not found: ${CONFIG.animationsDir}`)
      console.log('✅ No processed animations to validate')
      return true
    }

    // Scan for animation files
    console.log(`📁 Scanning ${CONFIG.animationsDir}...`)
    const animationFiles = await scanAnimationFiles(CONFIG.animationsDir)

    if (animationFiles.length === 0) {
      console.log('✅ No animation files found to validate')
      return true
    }

    console.log(`📄 Found ${animationFiles.length} animation files`)

    // Validate each file
    for (let i = 0; i < animationFiles.length; i++) {
      const file = animationFiles[i]
      const relativePath = path.relative(CONFIG.animationsDir, file)

      console.log(`📝 Validating ${i + 1}/${animationFiles.length}: ${relativePath}`)

      const fileResult = await validateAnimationFile(file)

      // Merge results
      overallResult.passed.push(...fileResult.passed)
      overallResult.failed.push(...fileResult.failed)
      overallResult.warnings.push(...fileResult.warnings)
      overallResult.stats.totalFiles += fileResult.stats.totalFiles
      overallResult.stats.validFiles += fileResult.stats.validFiles
      overallResult.stats.invalidFiles += fileResult.stats.invalidFiles
      overallResult.stats.totalSize += fileResult.stats.totalSize
    }

    // Calculate average size
    if (overallResult.stats.totalFiles > 0) {
      overallResult.stats.averageSize = overallResult.stats.totalSize / overallResult.stats.totalFiles
    }

    // Generate report
    const reportPath = path.join(CONFIG.reportsDir, 'processed-animations-validation.json')
    await generateReport(overallResult, reportPath)

    // Print summary
    console.log('\n📊 Validation Summary:')
    console.log(`✅ Passed: ${overallResult.passed.length}`)
    console.log(`❌ Failed: ${overallResult.failed.length}`)
    console.log(`⚠️  Warnings: ${overallResult.warnings.length}`)
    console.log(`📁 Total files: ${overallResult.stats.totalFiles}`)
    console.log(`📦 Total size: ${(overallResult.stats.totalSize / 1024 / 1024).toFixed(2)}MB`)
    console.log(`📄 Average size: ${(overallResult.stats.averageSize / 1024).toFixed(2)}KB`)

    // Print failures in detail
    if (overallResult.failed.length > 0) {
      console.log('\n❌ Validation Failures:')
      overallResult.failed.forEach(failure => {
        console.log(`  • ${failure.file}: ${failure.message}`)
      })
    }

    // Print warnings
    if (overallResult.warnings.length > 0) {
      console.log('\n⚠️  Validation Warnings:')
      overallResult.warnings.forEach(warning => {
        console.log(`  • ${warning.file}: ${warning.message}`)
      })
    }

    console.log(`\n📋 Full report saved to: ${reportPath}`)

    const isValid = overallResult.isValid()
    console.log(isValid ? '\n✅ All validations passed!' : '\n❌ Validation failed!')

    return isValid
  } catch (error) {
    console.error('💥 Validation process failed:', error.message)

    // Generate error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message,
      stack: error.stack
    }

    const reportPath = path.join(CONFIG.reportsDir, 'processed-animations-validation.json')
    try {
      await fs.mkdir(path.dirname(reportPath), { recursive: true })
      await fs.writeFile(reportPath, JSON.stringify(errorReport, null, 2))
    } catch (reportError) {
      console.error('Failed to write error report:', reportError.message)
    }

    return false
  }
}

/**
 * CLI execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = await validateProcessedAnimations()
  process.exit(success ? 0 : 1)
}

export { validateProcessedAnimations, validateAnimationFile, ValidationResult }
