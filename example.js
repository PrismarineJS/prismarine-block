var Block=require("./")("1.8");

var stoneBlock=new Block(1,1,0);

console.log(stoneBlock);

// can you harvest stone with an iron pickaxe ?
console.log(stoneBlock.canHarvest(257));

// how many milliseconds does it takes in usual conditions ? (on ground, not in water and not in creative mode)
console.log(stoneBlock.digTime(257));
