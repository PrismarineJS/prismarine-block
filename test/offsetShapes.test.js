/* eslint-env mocha */

const assert = require('assert')
const loader = require('..')
const createRegistry = require('prismarine-registry')

// Collision boxes the game (26.1) gives these blocks at these positions.
const bamboo = [
  [{ x: 0, y: 0, z: 0 }, [0.15625, 0, 0.15625, 0.34375, 1, 0.34375]],
  [{ x: 1, y: 64, z: 1 }, [0.3229166716337204, 0, 0.3229166716337204, 0.5104166716337204, 1, 0.5104166716337204]],
  [{ x: -1, y: 5, z: -7 }, [0.35625000298023224, 0, 0.5895833373069763, 0.5437500029802322, 1, 0.7770833373069763]],
  [{ x: 7, y: 64, z: 3 }, [0.6229166686534882, 0, 0.65625, 0.8104166686534882, 1, 0.84375]],
  [{ x: -20, y: 64, z: 15 }, [0.35625000298023224, 0, 0.4229166805744171, 0.5437500029802322, 1, 0.6104166805744171]],
  [{ x: 29999984, y: 0, z: -29999984 }, [0.18958333507180214, 0, 0.4895833432674408, 0.37708333507180214, 1, 0.6770833432674408]],
  [{ x: -123456, y: 10, z: 654321 }, [0.65625, 0, 0.5229166746139526, 0.84375, 1, 0.7104166746139526]]
]
// pointed_dripstone[thickness=tip,vertical_direction=up], which moves at most 0.125
const dripstoneTip = [
  [{ x: 0, y: 0, z: 0 }, [0.1875, 0, 0.1875, 0.5625, 0.6875, 0.5625]],
  [{ x: 1, y: 64, z: 1 }, [0.2291666716337204, 0, 0.2291666716337204, 0.6041666716337204, 0.6875, 0.6041666716337204]],
  [{ x: -1, y: 5, z: -7 }, [0.26250000298023224, 0, 0.4375, 0.6375000029802322, 0.6875, 0.8125]],
  [{ x: 7, y: 64, z: 3 }, [0.4375, 0, 0.4375, 0.8125, 0.6875, 0.8125]],
  [{ x: 29999984, y: 0, z: -29999984 }, [0.1875, 0, 0.3958333432674408, 0.5625, 0.6875, 0.7708333432674408]],
  [{ x: -123456, y: 10, z: 654321 }, [0.4375, 0, 0.42916667461395264, 0.8125, 0.6875, 0.8041666746139526]]
]

describe('offset collision shapes', () => {
  for (const version of ['1.14.4', '1.16.5', '1.17.1', '1.20.4', '1.21.4', '26.1']) {
    describe(version, () => {
      const registry = createRegistry(version)
      const Block = loader(registry)
      const hasDripstone = registry.blocksByName.pointed_dripstone !== undefined

      it('moves bamboo by its position', () => {
        for (const [position, box] of bamboo) {
          const block = Block.fromStateId(registry.blocksByName.bamboo.defaultState, 0)
          block.position = position
          assert.deepStrictEqual(block.shapes, [box], `at ${position.x} ${position.z}`)
        }
      })

      it('moves pointed dripstone by its position, at most 0.125', function () {
        if (!hasDripstone) return this.skip()
        for (const [position, box] of dripstoneTip) {
          const block = Block.fromProperties('pointed_dripstone', { thickness: 'tip', vertical_direction: 'up', waterlogged: false }, 0)
          block.position = position
          assert.deepStrictEqual(block.shapes, [box], `at ${position.x} ${position.z}`)
        }
      })

      it('follows a new position and uses only x and z', () => {
        const block = Block.fromStateId(registry.blocksByName.bamboo.defaultState, 0)
        block.position = { x: 1.7, y: 64, z: 1.2 }
        assert.deepStrictEqual(block.shapes, [bamboo[1][1]])
        block.position = { x: 7, y: -30, z: 3 }
        assert.deepStrictEqual(block.shapes, [bamboo[3][1]])
      })

      it('keeps the boxes at 0 0 without a position and leaves the data alone', () => {
        const snapshot = JSON.stringify(registry.blockCollisionShapes)
        const block = Block.fromStateId(registry.blocksByName.bamboo.defaultState, 0)
        assert.deepStrictEqual(block.shapes, [bamboo[0][1]])
        block.position = bamboo[3][0]
        assert.notDeepStrictEqual(block.shapes, [bamboo[0][1]])
        assert.deepStrictEqual(registry.blocksByName.bamboo.shapes, [bamboo[0][1]])
        assert.strictEqual(JSON.stringify(registry.blockCollisionShapes), snapshot)
      })

      it('lets shapes be assigned', () => {
        const block = Block.fromStateId(registry.blocksByName.bamboo.defaultState, 0)
        block.position = bamboo[1][0]
        block.shapes = []
        assert.deepStrictEqual(block.shapes, [])
        block.position = bamboo[3][0]
        assert.deepStrictEqual(block.shapes, [])
      })

      it('does not move other blocks', () => {
        for (const name of ['stone', 'oak_fence', 'sugar_cane']) {
          const block = Block.fromStateId(registry.blocksByName[name].defaultState, 0)
          const before = block.shapes
          block.position = bamboo[3][0]
          assert.strictEqual(block.shapes, before, name)
        }
      })
    })
  }

  it('does not move bamboo on bedrock', () => {
    const registry = createRegistry('bedrock_1.18.0')
    const Block = loader(registry)
    const block = Block.fromStateId(registry.blocksByName.bamboo.defaultState, 0)
    const before = block.shapes
    block.position = bamboo[3][0]
    assert.strictEqual(block.shapes, before)
  })
})
