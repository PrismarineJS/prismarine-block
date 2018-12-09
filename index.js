module.exports = loader

function loader (mcVersion) {
  const mcData = require('minecraft-data')(mcVersion)
  Biome = require('prismarine-biome')(mcVersion)
  blocks = mcData.blocks
  blocksByStateId = mcData.blocksByStateId
  toolMultipliers = mcData.materials
  return Block
}

let Biome
let blocks
let blocksByStateId
let toolMultipliers

Block.fromStateId = function (stateId, biomeId) {
  return new Block(undefined, biomeId, 0, stateId)
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
    }
    this.type = blockEnum.id
    this.name = blockEnum.name
    this.hardness = blockEnum.hardness
    this.displayName = blockEnum.displayName
    if ('variations' in blockEnum) {
      Object.keys(blockEnum['variations']).forEach(i => {
        if (blockEnum['variations'][i].metadata === metadata) { this.displayName = blockEnum['variations'][i].displayName }
      })
    }
    this.boundingBox = blockEnum.boundingBox
    this.diggable = blockEnum.diggable
    this.material = blockEnum.material
    this.harvestTools = blockEnum.harvestTools
    this.drops = blockEnum.drops
  } else {
    this.name = ''
    this.displayName = ''
    this.hardness = 0
    this.boundingBox = 'empty'
    this.diggable = false
  }
}

Block.prototype.canHarvest = function (heldItemType) {
  if (this.harvestTools) {
    const penalty = heldItemType === null || !this.harvestTools[heldItemType]
    if (penalty) return false
  }
  return true
}

// http://minecraft.gamepedia.com/Breaking#Speed
Block.prototype.digTime = function (heldItemType, creative, inWater, notOnGround) {
  if (creative) return 0
  let time = 1000 * this.hardness * 1.5

  if (!this.canHarvest(heldItemType)) { return time * 10 / 3 }

  // If the tool helps, then it increases digging speed by a constant multiplier
  const toolMultiplier = toolMultipliers[this.material]
  if (toolMultiplier && heldItemType) {
    const multiplier = toolMultiplier[heldItemType]
    if (multiplier) time /= multiplier
  }
  if (notOnGround) time *= 5
  if (inWater) time *= 5
  return time
}
