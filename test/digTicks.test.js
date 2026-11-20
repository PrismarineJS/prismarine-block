/* eslint-env mocha */

const expect = require('expect').default

// Dig times as the client counts them, read from the game's own BlockState.getDestroyProgress for a
// player on the ground (the server jars of 1.16, 1.20.4 and 26.1). The client adds that float to a
// float sum each tick and breaks the block on the tick the sum reaches 1, so a time can be one tick
// longer or shorter than ceil(1 / progress) in doubles, and a progress just under 1 is not instant.
// Rows: block, held item (null for the hand), efficiency V and haste II, expected ms.
const cases = [
  ['1.16.5', [
    ['bee_nest', 'netherite_axe', false, 100],
    ['stone', null, false, 7550],
    ['chest', null, false, 3800],
    ['nether_bricks', null, false, 10050],
    ['lime_concrete', 'wooden_pickaxe', false, 1400],
    ['petrified_oak_slab', 'netherite_pickaxe', false, 350],
    ['dirt', 'iron_shovel', false, 150]
  ]],
  ['1.20.4', [
    ['bee_nest', 'netherite_axe', false, 100],
    ['stone', null, false, 7550],
    ['oak_trapdoor', null, false, 4500],
    ['hopper', null, false, 15050],
    ['nether_brick_stairs', 'stone_hoe', true, 7150],
    ['green_concrete_powder', 'golden_shovel', false, 100]
  ]],
  ['26.1', [
    ['bee_nest', 'netherite_axe', false, 100],
    ['stone', null, false, 7550],
    ['clay', 'netherite_shovel', false, 150],
    ['emerald_ore', null, false, 15050],
    ['weathered_copper_door', null, false, 4500],
    ['green_concrete_powder', 'golden_axe', true, 550],
    ['attached_melon_stem', 'golden_shovel', true, 0]
  ]]
]

describe('Dig time in client ticks', () => {
  for (const [version, rows] of cases) {
    describe(version, () => {
      const registry = require('prismarine-registry')(version)
      const Block = require('prismarine-block')(registry)
      const haste = { [registry.effectsByName.Haste.id]: { amplifier: 1 } }
      for (const [blockName, itemName, boosted, ms] of rows) {
        it(`${blockName} with ${itemName ?? 'hand'}${boosted ? ', efficiency V and haste II' : ''}: ${ms} ms`, () => {
          const block = Block.fromStateId(registry.blocksByName[blockName].defaultState, 0)
          const item = itemName ? registry.itemsByName[itemName].id : null
          const time = boosted
            ? block.digTime(item, false, false, false, [{ name: 'efficiency', lvl: 5 }], haste)
            : block.digTime(item, false, false, false, [], {})
          expect(time).toBe(ms)
        })
      }
    })
  }

  it('never takes an instant break for a progress just under 1', () => {
    // netherite axe on a bee nest: 9 / 0.3 / 30 is 1 in doubles but 0.99999994 in floats
    const registry = require('prismarine-registry')('26.1')
    const Block = require('prismarine-block')(registry)
    const block = Block.fromStateId(registry.blocksByName.bee_nest.defaultState, 0)
    expect(block.digTime(registry.itemsByName.netherite_axe.id, false, false, false, [], {})).toBeGreaterThan(0)
  })
})
