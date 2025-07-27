const nbt = require('prismarine-nbt')

module.exports = (registry) => {
  switch (registry.version.type) {
    case 'pc': return { sign: signPC(registry) }
    case 'bedrock': return { sign: signBedrock(registry) }
  }
}

// Signs

function signPC (registry) {
  const ChatMessage = require('prismarine-chat')(registry.version.minecraftVersion)
  const noMoreJson = registry.version['>=']('1.21.5')

  function toJsonArray (text) {
    if (typeof text === 'string') {
      if (noMoreJson) return text.split('\n')
      return text.split('\n').map(line => JSON.stringify({ text: line }))
    }
    if (Array.isArray(text)) {
      if (noMoreJson) return text
      return text.map(t =>
        t?.toJSON
          ? JSON.stringify(t.toJSON())
          : typeof t === 'object'
            ? JSON.stringify(t)
            : JSON.stringify({ text: t })
      )
    }
    return []
  }

  function deepMerge (target, source) {
    for (const [key, value] of Object.entries(source)) {
      if (!(key in target)) {
        target[key] = value
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        deepMerge(target[key], value)
      }
    }
  }

  function initSignEntity (block) {
    if (!block.entity) {
      block.entity = nbt.comp({
        id: nbt.string(registry.version['>=']('1.11') ? 'minecraft:sign' : 'Sign')
      })
    }
  }

  function defaultSignNbt () {
    return nbt.comp({
      isWaxed: nbt.byte(0),
      back_text: nbt.comp({
        has_glowing_text: nbt.byte(0),
        color: nbt.string('black'),
        messages: nbt.list(nbt.string(noMoreJson ? '' : ['{"text":""}']))
      }),
      front_text: nbt.comp({
        has_glowing_text: nbt.byte(0),
        color: nbt.string('black'),
        messages: nbt.list(nbt.string(noMoreJson ? '' : ['{"text":""}']))
      })
    })
  }

  function setMultiSideSignText (block, side, text) {
    const messages = toJsonArray(text)
    initSignEntity(block)
    deepMerge(block.entity, defaultSignNbt())
    block.entity.value[side].value.messages.value.value = messages
  }

  function getMultiSideSignText (block, side) {
    if (!block.entity) return ''
    const messages = block.entity?.value?.[side]?.value?.messages?.value?.value
    if (!messages) return ''
    return noMoreJson
      ? messages.join('\n')
      : messages.map(text => {
        const parsed = JSON.parse(text)
        return typeof parsed === 'string'
          ? parsed
          : new ChatMessage(parsed).toString()
      }).join('\n')
  }

  function setLegacySignText (block, text) {
    const messages = toJsonArray(text)
    initSignEntity(block)
    Object.assign(block.entity.value, {
      Text1: nbt.string(messages[0] || '""'),
      Text2: nbt.string(messages[1] || '""'),
      Text3: nbt.string(messages[2] || '""'),
      Text4: nbt.string(messages[3] || '""')
    })
  }

  function getLegacySignText (block) {
    if (!block.entity) return ''
    const values = [
      block.entity.value.Text1.value,
      block.entity.value.Text2.value,
      block.entity.value.Text3.value,
      block.entity.value.Text4.value
    ].map(val => val || '""')
    return values.map(text => {
      const parsed = JSON.parse(text)
      return typeof parsed === 'string'
        ? parsed
        : new ChatMessage(parsed).toString()
    }).join('\n').trimEnd()
  }

  return {
    setSignText (front, back) {
      if (registry.supportFeature('multiSidedSigns')) {
        if (front !== undefined) setMultiSideSignText(this, 'front_text', front)
        if (back !== undefined) setMultiSideSignText(this, 'back_text', back)
      } else {
        if (front !== undefined) setLegacySignText(this, front)
        if (back !== undefined) {
          throw new Error(`Cannot set the back text of a sign on a version before 1.20 : ${registry.version.minecraftVersion}`)
        }
      }
    },

    getSignText () {
      if (registry.supportFeature('multiSidedSigns')) {
        return [
          getMultiSideSignText(this, 'front_text'),
          getMultiSideSignText(this, 'back_text')
        ]
      }
      return [getLegacySignText(this)]
    },

    // Deprecated APIs for backwards compatibility
    get signText () {
      return this.getSignText()[0]
    },
    set signText (text) {
      this.setSignText(text)
    }
  }
}

function signBedrock (registry) {
  return {
    getSignText () {
      if (!this.entity) return ['']
      return [this.entity.Text.value]
    },
    setSignText (text) {
      if (!this.entity) {
        this.entity = nbt.comp({ id: nbt.string('Sign') })
      }
      Object.assign(this.entity.value, {
        Text: nbt.string(Array.isArray(text) ? text.join('\n') : text)
      })
    },
    // Deprecated APIs for backwards compatibility
    get signText () {
      return this.getSignText()[0]
    },
    set signText (text) {
      this.setSignText(text)
    }
  }
}
