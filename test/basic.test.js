/* eslint-env mocha */

const expect = require('expect').default

// Block tags decide which tools mine a block from 1.17 on (minecraft-data tags.json, exposed as registry.tags).
// The fixture is the subset of vanilla 26.1 tags these cases need, in the tags.json shape.
describe('Dig time from block tags', () => {
  const registry = require('prismarine-registry')('26.1')
  registry.tags = {
    'minecraft:block': {
      'minecraft:leaves': ['minecraft:oak_leaves'],
      'minecraft:mineable/axe': ['minecraft:melon', 'minecraft:oak_log'],
      'minecraft:mineable/hoe': ['minecraft:oak_leaves'],
      'minecraft:mineable/pickaxe': ['minecraft:iron_ore', 'minecraft:obsidian', 'minecraft:stone'],
      'minecraft:sword_efficient': ['minecraft:melon'],
      'minecraft:sword_instantly_mines': ['minecraft:bamboo'],
      'minecraft:wool': ['minecraft:white_wool']
    }
  }
  const Block = require('prismarine-block')(registry)
  const block = name => Block.fromStateId(registry.blocksByName[name].defaultState, 0)
  const item = name => registry.itemsByName[name].id
  const dig = (blockName, itemName, enchantments = []) => block(blockName).digTime(itemName ? item(itemName) : null, false, false, false, enchantments)

  it('uses the pickaxe tier speed for a tier-gated ore', () => {
    expect(dig('iron_ore', 'diamond_pickaxe')).toBe(600)
    expect(dig('obsidian', 'diamond_pickaxe')).toBe(9400)
  })
  it('applies efficiency on top of the tag speed', () => {
    expect(dig('iron_ore', 'diamond_pickaxe', [{ name: 'efficiency', lvl: 5 }])).toBe(150)
  })
  it('keeps the harvest penalty for a tool below the required tier', () => {
    expect(dig('iron_ore', 'wooden_pickaxe')).toBe(7500)
    expect(dig('stone', null)).toBe(7500)
  })
  it('uses the vanilla sword rules', () => {
    expect(dig('melon', 'diamond_sword')).toBe(1000)
    expect(dig('melon', 'diamond_axe')).toBe(200)
    expect(dig('bamboo', 'diamond_sword')).toBe(0)
  })
  it('uses the vanilla shears rules', () => {
    expect(dig('oak_leaves', 'shears')).toBe(0)
    expect(dig('white_wool', 'shears')).toBe(250)
  })
  it('ignores tools that do not apply to the block', () => {
    expect(dig('oak_log', 'diamond_pickaxe')).toBe(dig('oak_log', null))
  })
})

describe('Dig time from block tags before the sword tags (1.17 to 1.19)', () => {
  const registry = require('prismarine-registry')('1.19.4')
  registry.tags = {
    'minecraft:block': {
      'minecraft:leaves': ['minecraft:oak_leaves'],
      'minecraft:mineable/axe': ['minecraft:bamboo', 'minecraft:melon'],
      'minecraft:mineable/hoe': ['minecraft:oak_leaves'],
      'minecraft:mineable/pickaxe': ['minecraft:stone']
    }
  }
  const Block = require('prismarine-block')(registry)
  const block = name => Block.fromStateId(registry.blocksByName[name].defaultState, 0)
  const dig = (blockName, itemName) => block(blockName).digTime(registry.itemsByName[itemName].id, false, false, false)

  it('keeps the sword speeds of the material table', () => {
    expect(dig('oak_leaves', 'diamond_sword')).toBe(200) // SwordItem: 1.5 for leaves
    expect(dig('melon', 'diamond_sword')).toBe(1000) // and for the VEGETABLE material
    expect(dig('stone', 'diamond_sword')).toBe(7500)
  })
  it('mines bamboo instantly with a sword', () => {
    expect(dig('bamboo', 'diamond_sword')).toBe(0)
    expect(dig('bamboo', 'diamond_axe')).toBe(200)
  })
  it('still takes the tool tiers from the mineable tags', () => {
    expect(dig('oak_leaves', 'diamond_hoe')).toBe(0)
    expect(dig('stone', 'diamond_pickaxe')).toBe(300)
  })
})

describe('Dig time without block tags (before 1.17)', () => {
  const registry = require('prismarine-registry')('1.16.4')
  const Block = require('prismarine-block')(registry)
  it('mines stone with an iron pickaxe from materials', () => {
    const stone = Block.fromStateId(registry.blocksByName.stone.defaultState, 0)
    expect(stone.digTime(registry.itemsByName.iron_pickaxe.id, false, false, false)).toBe(400)
  })
})

// https://minecraft.gamepedia.com/Breaking#Blocks_by_hardness
describe('Dig time', () => {
  describe('1.20.5', () => {
    const registry = require('prismarine-registry')('1.20.5')
    const Block = require('prismarine-block')(registry)
    it('dig dirt (shovel faster than hand)', () => {
      const dirt = Block.fromStateId(registry.blocksByName.dirt.defaultState, 0)
      const shovel = registry.itemsByName.iron_shovel
      const handTime = dirt.digTime(null, false, false, false)
      const shovelTime = dirt.digTime(shovel.id, false, false, false)
      expect(shovelTime < handTime).toBeTruthy()
    })

    it('mine stone (pickaxe faster than hand)', () => {
      const stone = Block.fromStateId(registry.blocksByName.stone.defaultState, 0)
      const pickaxe = registry.itemsByName.iron_pickaxe
      const handTime = stone.digTime(null, false, false, false)
      const pickaxeTime = stone.digTime(pickaxe.id, false, false, false)
      expect(pickaxeTime < handTime).toBeTruthy()
    })
  })

  describe('1.20.4', () => {
    const registry = require('prismarine-registry')('1.20.4')
    const Block = require('prismarine-block')(registry)
    it('dig dirt (shovel faster than hand)', () => {
      const dirt = Block.fromStateId(registry.blocksByName.dirt.defaultState, 0)
      const shovel = registry.itemsByName.iron_shovel
      const handTime = dirt.digTime(null, false, false, false)
      const shovelTime = dirt.digTime(shovel.id, false, false, false)
      expect(shovelTime < handTime).toBeTruthy()
    })

    it('mine stone (pickaxe faster than hand)', () => {
      const stone = Block.fromStateId(registry.blocksByName.stone.defaultState, 0)
      const pickaxe = registry.itemsByName.iron_pickaxe
      const handTime = stone.digTime(null, false, false, false)
      const pickaxeTime = stone.digTime(pickaxe.id, false, false, false)
      expect(pickaxeTime < handTime).toBeTruthy()
    })
  })

  describe('1.15.2', () => {
    const registry = require('prismarine-registry')('1.15.2')
    const Block = require('prismarine-block')(registry)
    it('dirt by hand', () => {
      const block = Block.fromStateId(registry.blocksByName.dirt.defaultState, 0)
      const time = block.digTime(null, false, false, false)
      expect(time).toBe(750)
    })
  })

  describe('bedrock 1.17.10', () => {
    const registry = require('prismarine-registry')('bedrock_1.17.10')
    const Block = require('prismarine-block')(registry)

    it('dirt by hand', () => {
      const block = Block.fromStateId(registry.blocksByName.dirt.defaultState, 0)
      const time = block.digTime(null, false, false, false)
      require('assert').ok(time)
    })
  })

  for (const version of ['1.17', 'bedrock_1.17.10', 'bedrock_1.18.0', '1.20']) {
    describe(version, () => {
      const registry = require('prismarine-registry')(version)
      const Block = require('prismarine-block')(registry)
      it('instant break stone', () => {
        const block = Block.fromStateId(registry.blocksByName.stone.defaultState, 0)
        const time = block.digTime(
          registry.itemsByName.diamond_pickaxe.id,
          false,
          false,
          false,
          [{ name: registry.enchantmentsByName.efficiency.name, lvl: 5 }],
          {
            [registry.effectsByName.Haste.id]: {
              amplifier: 1,
              duration: 60
            }
          }
        )
        expect(time).toBe(0)
      })

      it('instant break bedrock (creative)', () => {
        const block = Block.fromStateId(registry.blocksByName.bedrock.defaultState, 0)
        const time = block.digTime(null, true, false, false, [], {})
        expect(time).toBe(0)
      })
      describe('digging', () => {
        for (const blockName of ['sand', 'dirt', 'soul_sand']) {
          describe(`digging ${blockName}`, () => {
            it('using iron_shovel', () => {
              const tool = registry.itemsByName.iron_shovel
              const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [], {})
              expect(time).toBe(150)
            })
            it('using iron_shovel with efficiency 2', () => {
              const tool = registry.itemsByName.iron_shovel
              const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
              expect(time).toBe(100)
            })
            it('using iron_shovel with efficiency 5 (instant break)', () => {
              const tool = registry.itemsByName.iron_shovel
              const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
              expect(time).toBe(0)
            })
            it('using iron_shovel with haste 2', () => {
              const tool = registry.itemsByName.iron_shovel
              const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [], { [registry.effectsByName.Haste.id]: { amplifier: 1, lvl: 1 } })
              expect(time).toBe(100)
            })
            it('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
              const tool = registry.itemsByName.iron_shovel
              const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
              const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [registry.effectsByName.Haste.id]: { amplifier: 1, lvl: 1 } })
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
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], {})
            expect(time).toBe(400)
          })
          it('using iron_shovel with efficiency 2', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
            expect(time).toBe(250)
          })
          it('using iron_shovel with efficiency 5 (instant break)', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
            expect(time).toBe(100)
          })
          it('using iron_shovel with haste 2', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], { [registry.effectsByName.Haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(300)
          })
          it('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [registry.effectsByName.Haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(150)
          })
        })
        describe('mining iron_ore', () => {
          const blockName = 'iron_ore'
          const toolName = 'iron_pickaxe'
          it('using iron_shovel', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            console.log('Block', block)
            const time = block.digTime(tool.id, false, false, false, [], {})
            expect(time).toBe(750)
          })
          it('using iron_shovel with efficiency 2', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], {})
            expect(time).toBe(450)
          })
          it('using iron_shovel with efficiency 5 (instant break)', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 5 }], {})
            expect(time).toBe(150)
          })
          it('using iron_shovel with haste 2', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [], { [registry.effectsByName.Haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(550)
          })
          it('using iron_shovel with eff 2 + haste 2 (instant break)', () => {
            const tool = registry.itemsByName[toolName]
            const block = Block.fromStateId(registry.blocksByName[blockName].defaultState)
            const time = block.digTime(tool.id, false, false, false, [{ name: 'efficiency', lvl: 2 }], { [registry.effectsByName.Haste.id]: { amplifier: 1, lvl: 1 } })
            expect(time).toBe(300)
          })
        })
      })
    })
  }
})

describe('fromString', () => {
  const versions = {
    1.18: 'minecraft:candle[lit=true]',
    'pe_1.18.0': 'minecraft:candle["lit":true]',
    1.19: 'minecraft:candle["lit":true]',
    '1.20': 'minecraft:candle[lit=true]'
  }
  for (const [version, str] of Object.entries(versions)) {
    it(version, () => {
      const Block = require('prismarine-block')(version)
      const block = Block.fromString(str, 0)
      // console.log(block)
      expect(block.getProperties().lit).toBeTruthy()
    })
  }
})

describe('Block hash computation', () => {
  for (const version of ['bedrock_1.20.0']) {
    const Block = require('prismarine-block')(version)
    it('minecraft:soul_soil', function () {
      const block = Block.fromString('minecraft:soul_soil', 0)
      expect(block.hash).toBe(601701031)
    })
    it('minecraft:planks', function () {
      const block = Block.fromString('minecraft:planks', 0)
      expect(block.hash).toBe(1835335165)
    })
    it('minecraft:stone', function () {
      const block = Block.fromString('minecraft:stone', 0)
      expect(block.hash).toBe(-1177000405)
    })
  }
})
