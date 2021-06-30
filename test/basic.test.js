/* eslint-env jest */

// https://minecraft.gamepedia.com/Breaking#Blocks_by_hardness
describe('Dig time', () => {
  describe('1.15.2', () => {
    const Block = require('../')('1.15.2')
    const mcData = require('minecraft-data')('1.15.2')
    test('dirt by hand', () => {
      const block = Block.fromStateId(mcData.blocksByName.dirt.defaultState, 0)
      const time = block.digTime(null, false, false, false)
      expect(time).toBe(750)
    })
  })
  describe('1.17', () => {
    const Block = require('../')('1.17')
    const mcData = require('minecraft-data')('1.17')
    test('instant break stone', () => {
      const block = Block.fromStateId(mcData.blocksByName.stone.defaultState, 0)
      const time = block.digTime(
        mcData.itemsByName.diamond_pickaxe.id,
        false,
        false,
        false,
        [{ id: mcData.enchantmentsByName.efficiency.name, lvl: 5 }],
        {
          [mcData.effectsByName.haste.id]: {
            amplifier: 1,
            duration: 60
          }
        }
      )
      expect(time).toBe(0)
    })

    test('instant break bedrock (creative)', () => {
      const block = Block.fromStateId(mcData.blocksByName.bedrock.defaultState, 0)
      const time = block.digTime(null, true, false, false, [], {})
      expect(time).toBe(0)
    })
  })
})
