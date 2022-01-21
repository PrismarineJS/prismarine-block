/* eslint-env mocha */
const assert = require('assert')
const nbt = require('prismarine-nbt')

describe('handles block entities', () => {
  for (const version of ['pc_1.15.2', 'bedrock_1.18.0']) {
    it('creates a block entity on ' + version, () => {
      const registry = require('prismarine-registry')(version)
      const Block = require('prismarine-block')(registry)
      const chest = Block.fromStateId(registry.blocksByName.chest.defaultState)
      const tag = nbt.comp({
        Items: nbt.list(nbt.comp([
          {
            Slot: nbt.int(13),
            id: nbt.string('minecraft:gray_die'),
            Count: nbt.int(1),
            Enchantments: nbt.list(nbt.comp([{
              lvl: nbt.int(3),
              id: nbt.string('minecraft:unbreaking'),
              display: nbt.comp({
                Lore: nbt.list(nbt.string(['{"text":"Unbreaking III"}']))
              })
            }]))
          }
        ]))
      })
      const simplified = nbt.simplify(tag)
      chest.entity = tag
      assert.deepEqual(simplified, chest.blockEntity)
    })
  }
})
