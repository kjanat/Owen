import { test, expect } from '@playwright/test'

test.describe('Examples Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples.html')
  })

  test('should load examples page', async ({ page }) => {
    await expect(page).toHaveTitle(/Examples/)
    await expect(page.locator('h1')).toContainText('Integration Examples')
  })

  test('should display framework examples', async ({ page }) => {
    // Check that example cards are present
    await expect(page.locator('.example-card')).toHaveCount.greaterThan(3)

    // Check specific framework examples
    await expect(page.locator('.example-card')).toContainText(['React', 'Vue', 'Node.js'])
  })

  test('should copy code examples', async ({ page }) => {
    // Click on a copy button
    await page.click('.copy-button').first()

    // Check that button text changes to "Copied!"
    await expect(page.locator('.copy-button').first()).toContainText('Copied!')
  })

  test('should filter examples', async ({ page }) => {
    // Click on React filter
    await page.click('[data-filter="react"]')

    // Check that only React examples are shown
    await expect(page.locator('.example-card:visible')).toHaveCount(1)
    await expect(page.locator('.example-card:visible')).toContainText('React')
  })
})

test.describe('Comparison Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comparison.html')
  })

  test('should load comparison page', async ({ page }) => {
    await expect(page).toHaveTitle(/Comparison/)
    await expect(page.locator('h1')).toContainText('Naming Scheme Comparison')
  })

  test('should display scheme cards', async ({ page }) => {
    await expect(page.locator('.scheme-card')).toHaveCount(4)

    // Check each scheme is present
    const schemes = ['Legacy', 'Artist', 'Hierarchical', 'Semantic']
    for (const scheme of schemes) {
      await expect(page.locator('.scheme-card')).toContainText(scheme)
    }
  })

  test('should show comparison table', async ({ page }) => {
    await expect(page.locator('.comparison-table')).toBeVisible()

    // Check table headers
    await expect(page.locator('.comparison-table th')).toContainText(['Animation Name', 'Legacy', 'Artist', 'Hierarchical', 'Semantic'])
  })

  test('should filter comparison table', async ({ page }) => {
    // Type in search box
    await page.fill('.search-input', 'walk')

    // Check that results are filtered
    await expect(page.locator('.comparison-table tbody tr:visible')).toHaveCount.greaterThan(0)
    await expect(page.locator('.comparison-table tbody tr:visible')).toContainText('walk')
  })

  test('should convert between schemes', async ({ page }) => {
    // Use the conversion demo
    await page.fill('.animation-input', 'char_walk_01')
    await page.selectOption('#sourceSchemeSelect', 'artist')
    await page.selectOption('#targetSchemeSelect', 'semantic')

    // Check conversion result
    await expect(page.locator('.conversion-result')).toBeVisible()
    await expect(page.locator('.result-value')).toContainText('character.movement.walk')
  })
})

test.describe('Interactive Playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/interactive.html')
  })

  test('should load interactive page', async ({ page }) => {
    await expect(page).toHaveTitle(/Interactive/)
    await expect(page.locator('h1')).toContainText('Interactive Playground')
  })

  test('should have functional controls', async ({ page }) => {
    // Check that control sections are present
    await expect(page.locator('.playground-controls')).toBeVisible()
    await expect(page.locator('.playground-main')).toBeVisible()
    await expect(page.locator('.performance-monitor')).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    // Click on different tabs
    await page.click('[data-tab="converter"]')
    await expect(page.locator('.tab-content[data-tab="converter"]')).toBeVisible()

    await page.click('[data-tab="validator"]')
    await expect(page.locator('.tab-content[data-tab="validator"]')).toBeVisible()

    await page.click('[data-tab="generator"]')
    await expect(page.locator('.tab-content[data-tab="generator"]')).toBeVisible()
  })

  test('should run code in playground', async ({ page }) => {
    // Switch to code editor tab
    await page.click('[data-tab="code"]')

    // Clear and enter new code
    await page.fill('.code-editor', `
const mapper = new AnimationNameMapper();
const result = mapper.convert('char_walk_01', 'artist', 'semantic');
console.log(result);
    `)

    // Run the code
    await page.click('#runCodeBtn')

    // Check output
    await expect(page.locator('.output-panel')).toContainText('character.movement.walk')
  })

  test('should validate animation names in real-time', async ({ page }) => {
    // Enter valid animation name
    await page.fill('#playgroundAnimationName', 'character.idle.basic')
    await page.selectOption('#playgroundScheme', 'semantic')

    // Check validation indicator
    await expect(page.locator('.validation-indicator')).toHaveClass(/success/)

    // Enter invalid animation name
    await page.fill('#playgroundAnimationName', 'invalid-name-123!')

    // Check validation indicator shows error
    await expect(page.locator('.validation-indicator')).toHaveClass(/error/)
  })

  test('should show performance metrics', async ({ page }) => {
    // Perform some conversions
    await page.fill('#playgroundAnimationName', 'char_walk_01')
    await page.selectOption('#playgroundSourceScheme', 'artist')
    await page.selectOption('#playgroundTargetScheme', 'semantic')
    await page.click('#convertPlaygroundBtn')

    // Check that performance metrics are updated
    await expect(page.locator('.monitor-value')).toHaveCount.greaterThan(0)
    await expect(page.locator('.conversion-time .monitor-value')).toContainText(/\d+/)
  })

  test('should save and load history', async ({ page }) => {
    // Perform a conversion
    await page.fill('#playgroundAnimationName', 'test_animation')
    await page.selectOption('#playgroundSourceScheme', 'legacy')
    await page.selectOption('#playgroundTargetScheme', 'semantic')
    await page.click('#convertPlaygroundBtn')

    // Check that history is updated
    await expect(page.locator('.history-item')).toHaveCount.greaterThan(0)

    // Click on history item to load it
    await page.click('.history-item').first()

    // Check that form is populated
    await expect(page.locator('#playgroundAnimationName')).toHaveValue('test_animation')
  })
})
