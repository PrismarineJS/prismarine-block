/* eslint-env mocha */
const assert = require('assert')
const nbt = require('prismarine-nbt')

describe('handles block entities', () => {
  for (const version of ['pc_1.15.2', 'bedrock_1.18.0', '1.20']) {
    const registry = require('prismarine-registry')(version)
    const Block = require('prismarine-block')(registry)

    it('creates a block entity on ' + version, () => {
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

    describe('signs', function () {
      it('Sets entity NBT correctly on ' + version, () => {
        const sign = Block.fromStateId(registry.blocksByName.standing_sign?.defaultState || registry.blocksByName.oak_sign?.defaultState)
        sign.setSignText(['Hello', 'World', '!', '?'])

        if (registry.supportFeature('multiSidedSigns')) {
          sign.setSignText(undefined, ['Back'])

          assert.deepEqual(nbt.simplify(sign.entity), nbt.simplify(nbt.comp({
            id: nbt.string('minecraft:sign'),
            isWaxed: nbt.byte(0),
            back_text: nbt.comp({
              has_glowing_text: nbt.byte(0),
              color: nbt.string('black'),
              messages: nbt.list(nbt.string(['{"text":"Back"}']))
            }),
            front_text: nbt.comp({
              has_glowing_text: nbt.byte(0),
              color: nbt.string('black'),
              messages: nbt.list(nbt.string(['{"text":"Hello"}', '{"text":"World"}', '{"text":"!"}', '{"text":"?"}']))
            })
          })))
        } else if (registry.type === 'pc') {
          assert.deepEqual(nbt.simplify(sign.entity), nbt.simplify(nbt.comp({
            id: nbt.string(registry.version['>=']('1.11') ? 'minecraft:sign' : 'Sign'),
            Text1: nbt.string('{"text":"Hello"}'),
            Text2: nbt.string('{"text":"World"}'),
            Text3: nbt.string('{"text":"!"}'),
            Text4: nbt.string('{"text":"?"}')
          })))
        } else if (registry.type === 'bedrock') {
          assert.deepEqual(nbt.simplify(sign.entity), nbt.simplify(nbt.comp({
            id: nbt.string('Sign'),
            Text: nbt.string('Hello\nWorld\n!\n?')
          })))
        }
      })

      it('.signText works on ' + version, () => {
        const sign = Block.fromStateId(registry.blocksByName.standing_sign?.defaultState || registry.blocksByName.oak_sign?.defaultState)
        sign.signText = ['Hello', 'World']

        if (registry.type === 'pc') {
          assert(sign.getSignText()[0] === 'Hello\nWorld')
        }

        if (registry.type === 'bedrock') {
          assert(sign.blockEntity.Text.toString() === 'Hello\nWorld')
          assert(sign.blockEntity.id === 'Sign')
          assert.deepStrictEqual(sign.getSignText(), ['Hello\nWorld'])
          assert(sign.signText === 'Hello\nWorld')
        }
      })

      if (registry.type === 'bedrock') {
        it('.getSignText reads a sign entity from the server on ' + version, () => {
          const sign = Block.fromStateId(registry.blocksByName.standing_sign.defaultState)

          // A sign from before 1.20 has one side
          sign.entity = nbt.comp({ id: nbt.string('Sign'), Text: nbt.string('Hello\nWorld') })
          assert.deepStrictEqual(sign.getSignText(), ['Hello\nWorld'])

          // Since 1.20 a sign has a front and a back, each with its own Text
          const side = text => nbt.comp({ Text: nbt.string(text), SignTextColor: nbt.int(-16777216), IgnoreLighting: nbt.byte(0) })
          sign.entity = nbt.comp({ id: nbt.string('Sign'), FrontText: side('Front\nText'), BackText: side('Back'), IsWaxed: nbt.byte(0) })
          assert.deepStrictEqual(sign.getSignText(), ['Front\nText', 'Back'])
          assert(sign.signText === 'Front\nText')

          sign.entity = nbt.comp({ id: nbt.string('Sign'), FrontText: side('Front') })
          assert.deepStrictEqual(sign.getSignText(), ['Front', ''])
        })
      }
    })
  }
})
