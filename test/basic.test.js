/* eslint-env mocha */

const expect = require('expect')

// https://minecraft.gamepedia.com/Breaking#Blocks_by_hardness
describe('Dig time', () => {
  describe('1.15.2', () => {
    const Block = require('../')('1.15.2')
    const mcData = require('minecraft-data')('1.15.2')
    it('dirt by hand', () => {
      const block = Block.fromStateId(mcData.blocksByName.dirt.defaultState, 0)
      const time = block.digTime(null, false, false, false)
      expect(time).toBe(750)
    })
  })

  describe('bedrock 1.17.10', () => {
    const Block = require('../')('bedrock_1.17.10')
    const mcData = require('minecraft-data')('bedrock_1.17.10')

    it('dirt by hand', () => {
      const block = Block.fromStateId(mcData.blocksByName.dirt.defaultState, 0)
      const time = block.digTime(null, false, false, false)
      require('assert').ok(time)
    })
  })

  for (const version of ['1.17', 'bedrock_1.17.10', 'bedrock_1.18.0']) {
    describe(version, () => {
      const Block = require('../')(version)
      const mcData = require('minecraft-data')(version)
      it('instant break stone', () => {
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

      it('instant break bedrock (creative)', () => {
        const block = Block.fromStateId(mcData.blocksByName.bedrock.defaultState, 0)
        const time = block.digTime(null, true, false, false, [], {})
        expect(time).toBe(0)
      })
      describe('digging', () => {
        for (const blockName of ['sand', 'dirt', 'soul_sand']) {
          describe(`digging ${blockName}`, () => {
            it('using iron_shovel', () => {
              const tool = mcData.itemsByName.iron_shovel
              const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [], {})
              expect(time).toBe(150)
            })
            it('using iron_shovel with efficiency 2', () => {
              const tool = mcData.itemsByName.iron_shovel
              const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
              expect(time).toBe(100)
            })
            it('using iron_shovel with efficiency 5 (instant break)', () => {
              const tool = mcData.itemsByName.iron_shovel
              const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
              expect(time).toBe(0)
            })
            it('using iron_shovel with haste 2', () => {
              const tool = mcData.itemsByName.iron_shovel
              const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
              expect(time).toBe(100)
            })
            it('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
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
          it('using iron_shovel', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], {})
            expect(time).toBe(400)
          })
          it('using iron_shovel with efficiency 2', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
            expect(time).toBe(250)
          })
          it('using iron_shovel with efficiency 5 (instant break)', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
            expect(time).toBe(100)
          })
          it('using iron_shovel with haste 2', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(300)
          })
          it('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(150)
          })
        })
        describe('mining iron_ore', () => {
          const blockName = 'iron_ore'
          const toolName = 'iron_pickaxe'
          it('using iron_shovel', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            console.log('Block', block)
            const time = block.digTime(tool.id, false, false, false, [], {})
            expect(time).toBe(750)
          })
          it('using iron_shovel with efficiency 2', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
            expect(time).toBe(450)
          })
          it('using iron_shovel with efficiency 5 (instant break)', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
            expect(time).toBe(150)
          })
          it('using iron_shovel with haste 2', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(550)
          })
          it('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
            const tool = mcData.itemsByName[toolName]
            const block = Block.fromStateId(mcData.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [mcData.effectsByName.haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(300)
          })
        })
      })
    })
  }
})
