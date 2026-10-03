/* eslint-env mocha */

const assert = require('assert')
const loader = require('..')
const createRegistry = require('prismarine-registry')

describe('interaction shapes', () => {
  it('keeps collision shapes as the fallback for existing registries', () => {
    for (const version of loader.testedVersions) {
      const registry = createRegistry(version)
      delete registry.blockSelectionShapes
      const Block = loader(registry)
      const block = Block.fromStateId(registry.blocksByName.stone.defaultState, 0)
      assert.strictEqual(block.interactionShapes, block.shapes)
    }
  })

  it('reads state-dependent selection geometry without changing collision shapes', () => {
    const registry = createRegistry('1.20.1')
    const heights = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
    registry.blockSelectionShapes = {
      blocks: { wheat: heights.map((_, index) => index) },
      shapes: Object.fromEntries(heights.map((height, index) => [index, [[0, 0, 0, 1, height, 1]]]))
    }
    const Block = loader(registry)
    for (let age = 0; age < heights.length; age++) {
      const block = Block.fromProperties('wheat', { age }, 0)
      assert.deepStrictEqual(block.shapes, [])
      assert.deepStrictEqual(block.interactionShapes, [[0, 0, 0, 1, heights[age], 1]])
      assert.deepStrictEqual(block.shapes, [])
    }
  })

  it('updates position-dependent outlines without modifying the data', () => {
    const registry = createRegistry('1.20.1')
    registry.blockSelectionShapes = {
      blocks: { dandelion: 0 },
      shapes: { 0: [[0.3125, 0, 0.3125, 0.6875, 0.625, 0.6875]] },
      offsets: { dandelion: [{ type: 'model', maxHorizontal: 0.25, verticalMultiplier: 0 }] }
    }
    const snapshot = JSON.stringify(registry.blockSelectionShapes)
    const Block = loader(registry)
    const block = Block.fromProperties('dandelion', {}, 0)
    assert.deepStrictEqual(block.interactionShapes, [[0.0625, 0, 0.0625, 0.4375, 0.625, 0.4375]])
    block.position = { x: 17, y: 100, z: -13 }
    assert.deepStrictEqual(block.interactionShapes, [[0.26250000298023224, 0, 0.16250000149011612, 0.6375000029802322, 0.625, 0.5375000014901161]])
    assert.strictEqual(JSON.stringify(registry.blockSelectionShapes), snapshot)
    assert.deepStrictEqual(block.shapes, [])
  })

  it('uses native IDs for renamed legacy blocks and explicit metadata indices', () => {
    const registry = createRegistry('1.12.2')
    const id = registry.blocksByName.light_gray_shulker_box.id
    registry.blockSelectionShapes = {
      blockIds: { silver_shulker_box: id },
      blocks: { silver_shulker_box: [0] },
      shapes: { 0: [[0, 0, 0, 1, 1, 1]] },
      stateMetadata: { silver_shulker_box: [2] },
      stateProperties: { silver_shulker_box: [{ facing: 'north' }] }
    }
    const Block = loader(registry)
    const block = new Block(id, 0, 2)
    assert.strictEqual(block.interactionShapes, registry.blockSelectionShapes.shapes[0])
  })

  it('does not guess between different shapes with unresolved computed properties', () => {
    const registry = createRegistry('1.12.2')
    registry.blockSelectionShapes = {
      blocks: { stone: [0, 1] },
      shapes: { 0: [[0, 0, 0, 1, 0.5, 1]], 1: [[0, 0.5, 0, 1, 1, 1]] },
      stateMetadata: { stone: [0, 0] },
      stateProperties: { stone: [{ context: 'a' }, { context: 'b' }] }
    }
    const Block = loader(registry)
    const block = new Block(registry.blocksByName.stone.id, 0, 0)
    assert.strictEqual(block.interactionShapes, block.shapes)
    block.computedStates.context = 'b'
    assert.strictEqual(block.interactionShapes, registry.blockSelectionShapes.shapes[1])
  })

  it('preserves explicitly empty selection shapes', () => {
    const registry = createRegistry('1.20.1')
    registry.blockSelectionShapes = { blocks: { water: 0 }, shapes: { 0: [] } }
    const Block = loader(registry)
    const block = Block.fromProperties('water', { level: 0 }, 0)
    assert.strictEqual(block.interactionShapes, registry.blockSelectionShapes.shapes[0])
  })

  it('does not leak computed properties into another legacy block', () => {
    const registry = createRegistry('1.12.2')
    registry.blockSelectionShapes = {
      blocks: { stone: [0, 1] },
      shapes: { 0: [[0, 0, 0, 1, 0.5, 1]], 1: [[0, 0.5, 0, 1, 1, 1]] },
      stateMetadata: { stone: [0, 0] },
      stateProperties: { stone: [{ neighbor: 'a' }, { neighbor: 'b' }] }
    }
    const Block = loader(registry)
    const first = new Block(registry.blocksByName.stone.id, 0, 0)
    const second = new Block(registry.blocksByName.stone.id, 0, 0)
    first.computedStates.neighbor = 'b'
    assert.strictEqual(first.interactionShapes, registry.blockSelectionShapes.shapes[1])
    assert.strictEqual(second.interactionShapes, second.shapes)
  })
})
