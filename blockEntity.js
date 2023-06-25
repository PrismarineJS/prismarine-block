const nbt = require('prismarine-nbt')

module.exports = registry => {
  if (registry.version.type === 'pc') {
    const ChatMessage = require('prismarine-chat')(registry.version.majorVersion)

    function setSignTextForMultiSideSign (block, side, text) {
      const texts = []
      if (typeof text === 'string') {
        // Sign line should look like JSON string of `{"text: "actualText"}`. Since we have plaintext, need to add in this JSON wrapper.
        texts.push(JSON.stringify(text.split('\n').map((t) => ({ text: t }))))
      } else if (Array.isArray(text)) {
        for (const t of text) {
          if (t.toJSON) { // prismarine-chat
            texts.push(JSON.stringify(t.toJSON()))
          } else if (typeof t === 'object') { // normal JS object
            texts.push(JSON.stringify(t))
          } else { // plaintext
            texts.push(JSON.stringify({ text: t }))
          }
        }
      }

      if (!block.entity) {
        block.entity = nbt.comp({
          id: nbt.string(registry.version['>=']('1.11') ? 'minecraft:sign' : 'Sign')
        })
      }

      block.entity.value[side].value.messages.value.value = texts
    }

    function getSignTextForMultiSideSign (block, side) {
      if (!block.entity) return ''
      return block.entity.value[side].value.messages.value.value.map(text => typeof JSON.parse(text) === 'string' ? JSON.parse(text) : new ChatMessage(JSON.parse(text)).toString()).join('\n')
    }

    function setSignTextForLegacySign (block, text) {
      const texts = []
      if (typeof text === 'string') {
        // Sign line should look like JSON string of `{"text: "actualText"}`. Since we have plaintext, need to add in this JSON wrapper.
        texts.push(JSON.stringify(text.split('\n').map((t) => ({ text: t }))))
      } else if (Array.isArray(text)) {
        for (const t of text) {
          if (t.toJSON) { // prismarine-chat
            texts.push(JSON.stringify(t.toJSON()))
          } else if (typeof t === 'object') { // normal JS object
            texts.push(JSON.stringify(t))
          } else { // plaintext
            texts.push(JSON.stringify({ text: t }))
          }
        }
      }

      if (!block.entity) {
        block.entity = nbt.comp({
          id: nbt.string(registry.version['>=']('1.11') ? 'minecraft:sign' : 'Sign')
        })
      }

      Object.assign(block.entity.value, {
        Text1: nbt.string(texts[0] || '""'),
        Text2: nbt.string(texts[1] || '""'),
        Text3: nbt.string(texts[2] || '""'),
        Text4: nbt.string(texts[3] || '""')
      })
    }

    function getSignTextForLegacySign (block) {
      if (!block.entity) return ''
      const texts = [block.entity.value.Text1.value, block.entity.value.Text2.value, block.entity.value.Text3.value, block.entity.value.Text4.value].map(val => val || '"')
      return texts.map(text => typeof JSON.parse(text) === 'string' ? JSON.parse(text) : new ChatMessage(JSON.parse(text)).toString()).join('\n')
    }

    return {
      sign: {
        setSignText (front, back) {
          if (registry.supportFeature('multiSidedSigns')) {
            if (front !== undefined) setSignTextForMultiSideSign(this, 'front_text', front)
            if (back !== undefined) setSignTextForMultiSideSign(this, 'back_text', back)
          } else {
            if (front !== undefined) setSignTextForLegacySign(this, front)
            if (back !== undefined) throw new Error(`Cannot set the back text of a sign on a version before 1.20 : ${registry.version.minecraftVersion}`)
          }
        },

        getSignText () {
          if (registry.supportFeature('multiSidedSigns')) {
            return [getSignTextForMultiSideSign(this, 'front_text'), getSignTextForMultiSideSign(this, 'back_text')]
          } else {
            return [getSignTextForLegacySign(this)]
          }
        },

        // Deprecated APIs kept for backwards compatibility
        get signText () {
          return this.getSignText()[0]
        },
        set signText (text) {
          this.setSignText(text)
        }
      }
    }
  }

  if (registry.version.type === 'bedrock') {
    return {
      sign: {
        getSignText () {
          if (!this.entity) return ['']
          return [this.entity.Text.value]
        },
        setSignText (text) {
          if (!this.entity) {
            this.entity = nbt.comp({
              id: nbt.string('Sign')
            })
          }

          Object.assign(this.entity.value, {
            Text: nbt.string(Array.isArray(text) ? text.join('\n') : text)
          })
        },

        // Deprecated APIs kept for backwards compatibility
        get signText () {
          return this.getSignText()[0]
        },
        set signText (text) {
          this.setSignText(text)
        }
      }
    }
  }
}
