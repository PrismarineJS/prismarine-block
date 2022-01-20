/* eslint-env mocha */
const expect = require('expect')

describe('Block From Properties', () => {
  it('spruce half slab: waterlogged, upper (pc_1.16.4)', () => {
    const registry = require('prismarine-registry')('1.16.4')
    const Block = require('prismarine-block')(registry)
    const spruceSlabId = registry.blocksByName.spruce_slab.id
    const properties = { type: 'top', waterlogged: true }
    const block = Block.fromProperties(spruceSlabId, properties, 0)

    expect(block.stateId).toBe(8310)
    expect(block.getProperties()).toMatchObject(properties)
  })
  it('spruce half slab: waterlogged, upper (bedrock_1.17.10)', () => {
    const registry = require('prismarine-registry')('bedrock_1.17.10')
    const Block = require('prismarine-block')(registry)
    const cauldronId = registry.blocksByName.cauldron.id
    const properties = { cauldron_liquid: 'water', fill_level: 5 }
    const block = Block.fromProperties(cauldronId, properties, 0)
    expect(block.getProperties()).toMatchObject(properties)
  })
})
