module.exports = loader
module.exports.testedVersions = ['1.8.8', '1.9.4', '1.10.2', '1.11.2', '1.12.2', '1.13.2', '1.14.4', '1.15.2', '1.16.4']

function loader (mcVersion) {
  const mcData = require('minecraft-data')(mcVersion)
  return provider({
    Biome: require('prismarine-biome')(mcVersion),
    blocks: mcData.blocks,
    blocksByStateId: mcData.blocksByStateId,
    toolMultipliers: mcData.materials,
    shapes: mcData.blockCollisionShapes,
    protocolVersion: mcData.version.version,
    effectsByName: mcData.effectsByName
  })
}

function provider ({ Biome, blocks, blocksByStateId, toolMultipliers, shapes, protocolVersion, effectsByName }) {
  Block.fromStateId = function (stateId, biomeId) {
    if (protocolVersion <= 340) {
      return new Block(stateId >> 4, biomeId, stateId & 15)
    } else {
      return new Block(undefined, biomeId, 0, stateId)
    }
  }

  function parseValue (value, state) {
    if (state.type === 'enum') {
      return state.values.indexOf(value)
    }
    if (state.type === 'bool') {
      if (value === true) return 0
      if (value === false) return 1
    }
    // Assume by-name mapping for unknown properties
    return state.values.indexOf(value.toString())
  }

  function getStateValue (states, name, value) {
    let offset = 1
    for (let i = states.length - 1; i >= 0; i--) {
      const state = states[i]
      if (state.name === name) {
        return offset * parseValue(value, state)
      }
      offset *= state.num_values
    }
    return 0
  }

  Block.fromProperties = function (typeId, properties, biomeId) {
    const block = blocks[typeId]

    if (block.minStateId == null) {
      throw new Error('Block properties not available in current Minecraft version!')
    }

    let data = 0
    for (const [key, value] of Object.entries(properties)) {
      data += getStateValue(block.states, key, value)
      console.log(`${key}: ${value}, ${data}`)
    }
    return new Block(undefined, biomeId, 0, block.minStateId + data)
  }

  if (shapes) {
    // Prepare block shapes
    for (const id in blocks) {
      const block = blocks[id]
      const shapesId = shapes.blocks[block.name]
      block.shapes = (shapesId instanceof Array) ? shapes.shapes[shapesId[0]] : shapes.shapes[shapesId]
      if ('states' in block) { // post 1.13
        if (shapesId instanceof Array) {
          block.stateShapes = []
          for (const i in shapesId) {
            block.stateShapes.push(shapes.shapes[shapesId[i]])
          }
        }
      } else { // pre 1.13
        if ('variations' in block) {
          for (const i in block.variations) {
            const metadata = block.variations[i].metadata
            if (shapesId instanceof Array) {
              block.variations[i].shapes = shapes.shapes[shapesId[metadata]]
            } else {
              block.variations[i].shapes = shapes.shapes[shapesId]
            }
          }
        }
      }
    }
  }

  function Block (type, biomeId, metadata, stateId) {
    this.type = type
    this.metadata = metadata
    this.light = 0
    this.skyLight = 0
    this.biome = new Biome(biomeId)
    this.position = null
    this.stateId = stateId

    const blockEnum = stateId === undefined ? blocks[type] : blocksByStateId[stateId]
    if (blockEnum) {
      if (stateId === undefined) {
        this.stateId = blockEnum.minStateId
      } else {
        this.metadata = this.stateId - blockEnum.minStateId
      }
      this.type = blockEnum.id
      this.name = blockEnum.name
      this.hardness = blockEnum.hardness
      this.displayName = blockEnum.displayName
      this.shapes = blockEnum.shapes
      if ('stateShapes' in blockEnum) {
        if (blockEnum.stateShapes[this.metadata] !== undefined) {
          this.shapes = blockEnum.stateShapes[this.metadata]
        } else {
          this.missingStateShape = true
        }
      } else if ('variations' in blockEnum) {
        const variations = blockEnum.variations
        for (const i in variations) {
          if (variations[i].metadata === metadata) {
            this.displayName = variations[i].displayName
            this.shapes = variations[i].shapes
          }
        }
      }
      this.boundingBox = blockEnum.boundingBox
      this.transparent = blockEnum.transparent
      this.diggable = blockEnum.diggable
      this.material = blockEnum.material
      this.harvestTools = blockEnum.harvestTools
      this.drops = blockEnum.drops
    } else {
      this.name = ''
      this.displayName = ''
      this.shapes = []
      this.hardness = 0
      this.boundingBox = 'empty'
      this.transparent = true
      this.diggable = false
    }
  }

  function propValue (state, value) {
    if (state.type === 'enum') return state.values[value]
    if (state.type === 'bool') return !value
    return value
  }

  Block.prototype.getProperties = function () {
    const properties = {}
    const blockEnum = this.stateId === undefined ? blocks[this.type] : blocksByStateId[this.stateId]
    if (blockEnum && blockEnum.states) {
      let data = this.metadata
      for (let i = blockEnum.states.length - 1; i >= 0; i--) {
        const prop = blockEnum.states[i]
        properties[prop.name] = propValue(prop, data % prop.num_values)
        data = Math.floor(data / prop.num_values)
      }
    }
    return properties
  }

  Block.prototype.canHarvest = function (heldItemType) {
    if (!this.harvestTools) { return true }; // for blocks harvestable by hand
    return heldItemType && this.harvestTools && this.harvestTools[heldItemType]
  }

  // Determine data required to actually compute dig times that is version-dependent
  let blockDigTimeData

  // 1.17+: effect names have been fixed to actually match their registry names
  if (protocolVersion >= 755) {
    blockDigTimeData = {
      enchantmentKey: 'efficiency',
      hasteEffectName: 'haste',
      miningFatigueEffectName: 'mining_fatigue',
      conduitPowerEffectName: 'conduit_power',
      aquaAffinityEnchantmentName: 'aqua_affinity'
    }
  } else {
    // 1.13+: enchantments are no longer stored by IDs, but rather by registry names
    const isPost113 = protocolVersion >= 393
    blockDigTimeData = {
      enchantmentKey: isPost113 ? 'efficiency' : 32,
      hasteEffectName: 'Haste',
      miningFatigueEffectName: 'MiningFatigue',
      conduitPowerEffectName: 'ConduitPower',
      aquaAffinityEnchantmentName: 'AquaAffinity'
    }
  }

  function getEffectLevel (effectName, effects) {
    const e = effects[effectsByName[effectName].id]
    return e ? e.amplifier : -1
  }

  function getEnchantmentLevel (enchantmentKey, enchantments) {
    for (const e of enchantments) {
      if (typeof enchantmentKey === 'string' ? e.id.includes(enchantmentKey) : e.id === enchantmentKey) {
        return e.lvl
      }
    }
    return -1
  }

  function getMiningFatigueMultiplier (effectLevel) {
    switch (effectLevel) {
      case 0: return 0.0
      case 1: return 0.3
      case 2: return 0.09
      case 3: return 0.0027
      default: return 8.1E-4
    }
  }

  // Reworked to completely match Minecraft 1.7 block breaking code
  // This has not introduced any considerable changes though, so for older version behaviour should still remain consistent
  Block.prototype.digTime = function (heldItemType, creative, inWater, notOnGround, enchantments = [], effects = {}) {
    if (creative) return 0

    const materialToolMultipliers = toolMultipliers[this.material]
    const isBestTool = heldItemType && materialToolMultipliers && materialToolMultipliers[heldItemType]

    // Compute breaking speed multiplier
    let blockBreakingSpeed = 1

    if (isBestTool) {
      blockBreakingSpeed = materialToolMultipliers[heldItemType]
    }

    // Efficiency is applied if tools speed multiplier is more than 1.0
    const efficiencyLevel = getEnchantmentLevel(blockDigTimeData.enchantmentKey, enchantments)
    if (efficiencyLevel >= 0 && blockBreakingSpeed > 1.0) {
      blockBreakingSpeed += efficiencyLevel * efficiencyLevel + 1
    }

    // Haste is always considered when effect is present, and when both
    // Conduit Power and Haste are present, highest level is considered
    const hasteLevel = Math.max(
      getEffectLevel(blockDigTimeData.hasteEffectName, effects),
      getEffectLevel(blockDigTimeData.conduitPowerEffectName, effects))

    if (hasteLevel > 0) {
      blockBreakingSpeed *= 1 + (0.2 * hasteLevel)
    }

    // Mining fatigue is applied afterwards, but multiplier only decreases up to level 4
    const miningFatigueLevel = getEffectLevel(blockDigTimeData.miningFatigueEffectName, effects)

    if (miningFatigueLevel >= 0) {
      blockBreakingSpeed *= getMiningFatigueMultiplier(miningFatigueLevel)
    }

    // Apply 5x breaking speed de-buff if we are submerged in water and do not have aqua affinity
    const aquaAffinityLevel = getEnchantmentLevel(blockDigTimeData.miningFatigueEffectName, effects)

    if (inWater && aquaAffinityLevel === 0) {
      blockBreakingSpeed /= 5.0
    }

    // We always get 5x breaking speed de-buff if we are not on the ground
    if (notOnGround) {
      blockBreakingSpeed /= 5.0
    }

    // Compute block breaking delta (breaking progress applied in a single tick)
    const blockHardness = this.hardness
    const matchingToolMultiplier = this.canHarvest(heldItemType) ? 30.0 : 100.0

    let blockBreakingDelta = blockBreakingSpeed / blockHardness / matchingToolMultiplier

    // Delta will always be zero if block has -1.0 durability
    if (blockHardness === -1.0) {
      blockBreakingDelta = 0.0
    }

    // We will never be capable of breaking block if delta is zero, so abort now and return infinity
    if (blockBreakingDelta === 0.0) {
      return Infinity
    }

    // If breaking delta is more than 1.0 per tick, the block is broken instantly, so return 0
    if (blockBreakingDelta >= 1.0) {
      return 0
    }

    // Determine how many ticks breaking will take, then convert to millis and return result
    // We round ticks up because if progress is below 1.0, it will be finished next tick

    const ticksToBreakBlock = Math.ceil(1.0 / blockBreakingDelta)
    return ticksToBreakBlock * 50
  }

  return Block
}
