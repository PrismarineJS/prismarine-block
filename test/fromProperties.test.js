/* eslint-env mocha */
const expect = require('expect')
const assert = require('assert')
const mcData = require('minecraft-data')

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

describe('all versions should return block state and properties', () => {
  for (const e of ['pc', 'bedrock']) {
    const vers = mcData.versions[e]
    for (const { minecraftVersion } of vers.filter(v => !!mcData(v.minecraftVersion))) {
      it(`${e} ${minecraftVersion}`, () => {
        const registry = require('prismarine-registry')(`${e}_${minecraftVersion}`)
        const Block = require('prismarine-block')(registry)

        // Test that .stateId is set on all versions
        {
          const blockData = registry.blocksByName.dirt
          const block = Block.fromStateId(blockData.defaultState)
          assert(block.stateId >= blockData.minStateId && block.stateId <= blockData.maxStateId)
          expect(block.getProperties()).toMatchObject({})
        }

        // make sure that .fromProperties works
        {
          const blockData = registry.blocksByName.light_weighted_pressure_plate
          const properties = { pc: { power: 2 }, bedrock: { redstone_signal: 2 } }[e]
          const block = Block.fromProperties(blockData.name, properties, 0)
          assert(block.stateId >= blockData.minStateId && block.stateId <= blockData.maxStateId)
          expect(block.getProperties()).toMatchObject(properties)
        }
      })
    }
  }
})
