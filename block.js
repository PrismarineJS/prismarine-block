module.exports = loader

var Biome
var blocks
var toolMultipliers
const flatten = arr => arr.reduce((result, item) => Array.isArray(item) ? result.concat(flatten(item)) : result.concat(item), [])

function loader (mcVersion) {
  var mcData = require('minecraft-data')(mcVersion)
  Biome = require('prismarine-biome')(mcVersion)
  blocks = prepareBlocks(mcData.blocks)
  toolMultipliers = mcData.materials
  return Block
}

function prepareBlocks (blocks) {
  let result = {}
  for (let blockId in blocks) {
    result[blockId] = prepareBlock(blocks[blockId])
  }
  return result
}

function prepareBlock (block) {
  let fields = ['name', 'hardness', 'displayName', 'boundingBox', 'diggable', 'material', 'harvestTools', 'drops']
  let prepared = fields.reduce((prepared, field) => {
    prepared[field] = block[field]
    return prepared
  }, {})

  let result = {
    '*': prepared
  }

  if ('variations' in block) {
    for (var i in block['variations']) {
      if (block['variations'][i].metadata) {
        const displayName = block['variations'][i].displayName
        const metadata = block['variations'][i].metadata

        result[metadata] = Object.assign({}, prepared, {displayName})
      }
    }
  }

  return result
}

const unknownBlockProps = {
  name: '',
  displayName: '',
  hardness: 0,
  boundingBox: 'empty',
  diggable: false
}

class Block {
  constructor (type, biomeId, metadata) {
    this.type = type
    this.biome = new Biome(biomeId)
    this.metadata = metadata

    this.light = 0
    this.skyLight = 0
    this.position = null

    const blockTemplates = blocks[type]
    if (blockTemplates) {
      Object.assign(this, blockTemplates[metadata] || blockTemplates['*'])
    } else {
      Object.assign(this, unknownBlockProps)
    }
  }

  // http://minecraft.gamepedia.com/Breaking#Speed
  digTime (heldItemType, creative, inWater, notOnGround) {
    if (creative) return 0
    var time = 1000 * this.hardness * 1.5

    if (!this.canHarvest(heldItemType)) { return time * 10 / 3 }

    // If the tool helps, then it increases digging speed by a constant multiplier
    if (heldItemType) {
      var toolMultiplier = toolMultipliers[this.material]
      if (toolMultiplier) {
        var multiplier = toolMultiplier[heldItemType]
        if (multiplier) time /= multiplier
      }
    }
    if (notOnGround) time *= 5
    if (inWater) time *= 5
    return time
  }

  canHarvest (heldItemType) {
    return !this.harvestTools || (heldItemType && this.harvestTools[heldItemType])
  }
}
