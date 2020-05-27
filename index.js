module.exports = loader

function loader (mcVersion) {
  const mcData = require('minecraft-data')(mcVersion)
  return provider({
    Biome: require('prismarine-biome')(mcVersion),
    blocks: mcData.blocks,
    blocksByStateId: mcData.blocksByStateId,
    toolMultipliers: mcData.materials,
    shapes: mcData.blockCollisionShapes
  })
}

function provider ({ Biome, blocks, blocksByStateId, toolMultipliers, shapes }) {
  Block.fromStateId = function (stateId, biomeId) {
    return new Block(undefined, biomeId, 0, stateId)
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
      }
      this.type = blockEnum.id
      this.name = blockEnum.name
      this.hardness = blockEnum.hardness
      this.displayName = blockEnum.displayName
      this.shapes = blockEnum.shapes
      if ('stateShapes' in blockEnum) {
        this.shapes = blockEnum.stateShapes[this.stateId - blockEnum.minStateId]
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
  return Block
}
