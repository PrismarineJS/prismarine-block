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

// Generates a block map type => metadata => template block, so that block names don't
function prepareBlocks (blocks) {
  let result = {}
  for (let type in blocks) {
    result[type] = prepareBlock(blocks[type])
  }
  return result
}

function prepareBlock (block) {
  let fields = [
    'name', 'hardness', 'displayName', 'boundingBox',
    'diggable', 'material', 'harvestTools', 'drops'
  ]

  let prepared = fields.reduce((prepared, field) => {
    prepared[field] = block[field]
    return prepared
  }, {type: block.id})

  let result = {
    '*': prepared
  }

  for (var i in (block['variations'] || {})) {
    if (block['variations'][i].metadata !== undefined) {
      const displayName = block['variations'][i].displayName
      const metadata = block['variations'][i].metadata

      result[metadata] = Object.assign({}, prepared, {displayName, metadata})
    }
  }

  return result
}

const unknownBlockTemplate = {
  name: '',
  displayName: '',
  hardness: 0,
  boundingBox: 'empty',
  diggable: false
}

class Block {
  constructor (type, biomeId, metadata) {
    const blockTemplates = blocks[type]
    const blockTemplate = blockTemplates
      ? (blockTemplates[metadata] || blockTemplates['*'])
      : unknownBlockTemplate

    Object.assign(this, {
      biome: new Biome(biomeId),
      light: 0,
      skyLight: 0,
      position: null
    }, blockTemplate)
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
    return !this.harvestTools || this.harvestTools[heldItemType]
  }
}
