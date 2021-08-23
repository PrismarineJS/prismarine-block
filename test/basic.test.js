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
        [{ name: mcData.enchantmentsByName.efficiency.name, lvl: 5 }],
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
    describe('digging', () => {
      for (const blockName of ['sand', 'dirt', 'soul_sand']) {
        describe(`digging ${blockName}`, () => {
          test('using iron_shovel', () => {
            const tool = mcData.itemsByName.iron_shovel
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], {})
            expect(time).toBe(150)
          })
          test('using iron_shovel with efficiency 2', () => {
            const tool = mcData.itemsByName.iron_shovel
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
            expect(time).toBe(100)
          })
          test('using iron_shovel with efficiency 5 (instant break)', () => {
            const tool = mcData.itemsByName.iron_shovel
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
            expect(time).toBe(0)
          })
          test('using iron_shovel with haste 2', () => {
            const tool = mcData.itemsByName.iron_shovel
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(100)
          })
          test('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
            const tool = mcData.itemsByName.iron_shovel
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(0)
          })
        })
      }
    })

    describe('mining', () => {
      describe('mining stone', () => {
        const blockName = 'stone'
        const toolName = 'iron_pickaxe'
        test('using iron_shovel', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [], {})
          expect(time).toBe(400)
        })
        test('using iron_shovel with efficiency 2', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
          expect(time).toBe(250)
        })
        test('using iron_shovel with efficiency 5 (instant break)', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
          expect(time).toBe(100)
        })
        test('using iron_shovel with haste 2', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
          expect(time).toBe(300)
        })
        test('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
          expect(time).toBe(150)
        })
      })
      describe('mining iron_ore', () => {
        const blockName = 'iron_ore'
        const toolName = 'iron_pickaxe'
        test('using iron_shovel', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [], {})
          expect(time).toBe(750)
        })
        test('using iron_shovel with efficiency 2', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
          expect(time).toBe(450)
        })
        test('using iron_shovel with efficiency 5 (instant break)', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
          expect(time).toBe(150)
        })
        test('using iron_shovel with haste 2', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
          expect(time).toBe(550)
        })
        test('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
          const tool = mcData.itemsByName[toolName]
          const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
          const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
          expect(time).toBe(300)
        })
      })
    })
  })
})
