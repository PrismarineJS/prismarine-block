/* eslint-env mocha */

const testedVersions = require('..').testedVersions
const assert = require('assert')

testedVersions.forEach(version => {
  describe(version, () => {
    const registry = require('prismarine-registry')(version)
    const blockArray = registry.blocksArray
    const Block = require('prismarine-block')(registry)
    blockArray.forEach(block => {
      it('shape ' + block.name, () => {
        const blockV = new Block(block.id, 0, 0, block.defaultState)
        assert.ok(blockV.shapes !== undefined)
        if (blockV.missingStateShape !== undefined) {
          console.log(`state shape of ${block.name} is missing`)
        }
      })
    })
  })
})

describe('pre-1.13 shapes by metadata', () => {
  const registry = require('prismarine-registry')('1.8.9')
  const Block = require('prismarine-block')(registry)
  const collision = registry.blockCollisionShapes

  it('piston_head facing up uses its own shape, not the facing-down one', () => {
    const id = registry.blocksByName.piston_head.id
    const down = Block.fromStateId(registry.blocksByName.piston_head.minStateId + 0, 0)
    const up = Block.fromStateId(registry.blocksByName.piston_head.minStateId + 1, 0)
    assert.deepStrictEqual(down.shapes, collision.shapes[collision.blocks.piston_head[0]])
    assert.deepStrictEqual(up.shapes, collision.shapes[collision.blocks.piston_head[1]])
    assert.notDeepStrictEqual(up.shapes, down.shapes)
    assert.deepStrictEqual(new Block(id, 0, 1).shapes, up.shapes)
  })
})
