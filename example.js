const registry = require('prismarine-registry')('1.8')
const Block = require('prismarine-block')(registry)

const stoneBlock = new Block(registry.blocksByName.stone, registry.biomesByName.plains, /* meta */ 0)

console.log(stoneBlock)

// can you harvest stone with an iron pickaxe ?
console.log(stoneBlock.canHarvest(257))

// how many milliseconds does it takes in usual conditions ? (on ground, not in water and not in creative mode)
console.log(stoneBlock.digTime(257))

const BlockNew = require('./')('1.13.2')

const redstoneBlock = BlockNew.fromStateId(3381, 0)

console.log(redstoneBlock)

console.log(BlockNew.fromStateId(1649, 0).shapes) // stairs
console.log(BlockNew.fromStateId(1651, 0).shapes) // stairs

console.log(BlockNew.fromString('minecraft:redstone_wire[power=15]', 0).getProperties().power) // get power level
