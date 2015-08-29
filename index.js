module.exports = loader;

function loader(mcVersion)
{
  var mcData=require('minecraft-data')(mcVersion);
  Biome = require('prismarine-biome')(mcVersion);
  blocks=mcData.blocks;
  toolMultipliers = mcData.materials;
  return Block;
}

var Biome;
var blocks;
var toolMultipliers;


function Block(type, biomeId, metadata) {
  this.type = type;
  this.metadata = metadata;
  this.light = 0;
  this.skyLight = 0;
  this.biome = new Biome(biomeId);
  this.position = null;

  var blockEnum = blocks[type];
  if(blockEnum) {
    this.name = blockEnum.name;
    this.hardness = blockEnum.hardness;
    this.displayName = blockEnum.displayName;
    if("variations" in blockEnum)
      for(var i in blockEnum["variations"]) {
        if(blockEnum["variations"][i].metadata === metadata)
          this.displayName = blockEnum["variations"][i].displayName;
      }
    this.boundingBox = blockEnum.boundingBox;
    this.diggable = blockEnum.diggable;
    this.material = blockEnum.material;
    this.harvestTools = blockEnum.harvestTools;
    this.drops = blockEnum.drops;
  } else {
    this.name = "";
    this.displayName = "";
    this.hardness = 0;
    this.boundingBox = "empty";
    this.diggable = false;
  }
}

Block.prototype.canHarvest = function(heldItemType) {
  if(this.harvestTools) {
    var penalty = heldItemType === null || !this.harvestTools[heldItemType];
    if(penalty) return false;
  }
  return true;
};

// http://minecraft.gamepedia.com/Breaking#Speed
Block.prototype.digTime = function(heldItemType,creative, inWater, notOnGround) {
  if(creative) return 0;
  var time = 1000 * this.hardness * 1.5;

  if(!this.canHarvest(heldItemType))
    return time * 10 / 3;

  // If the tool helps, then it increases digging speed by a constant multiplier
  var toolMultiplier = toolMultipliers[this.material];
  if(toolMultiplier && heldItemType) {
    var multiplier = toolMultiplier[heldItemType];
    if(multiplier) time /= multiplier;
  }
  if(notOnGround) time *= 5;
  if(inWater) time *= 5;
  return time;
};
