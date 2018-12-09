# prismarine-block
[![NPM version](https://img.shields.io/npm/v/prismarine-block.svg)](http://npmjs.com/package/prismarine-block)
[![Build Status](https://circleci.com/gh/PrismarineJS/prismarine-block/tree/master.svg?style=shield)](https://circleci.com/gh/PrismarineJS/prismarine-block/tree/master)

Represent a minecraft block with its associated data

## Usage

```js
const Block=require("prismarine-block")("1.8");

const stoneBlock=new Block(1,1,0);

console.log(stoneBlock);

// can you harvest stone with an iron pickaxe ?
console.log(stoneBlock.canHarvest(257));

// how many milliseconds does it takes in usual conditions ? (on ground, not in water and not in creative mode)
console.log(stoneBlock.digTime(257));

```

## API

### Block

#### Block.fromStateId(stateId, biomeId)

#### Block(type,biomeId,metadata)

Constructor of a block
* `type` is the block numerical id
* `biomeId` is the biome numerical id
* `metadata` is the metadata numerical value

#### block.canHarvest(heldItemType)

Tells you if `heldItemType` is one of the right tool to harvest the block.

 * `heldItemType` the id of the held item (or null if nothing is held)

#### block.digTime(heldItemType,creative,inWater,notOnGround)

Tells you how long it will take to dig the block, in milliseconds.

 * `heldItemType` the id of the held item (or null if nothing is held)
 * `creative` game in creative
 * `inWater` the bot is in water
 * `notOnGround` the bot is not on the ground

#### block.position

Vec3 instance.

#### block.type

Numerical id.

#### block.name

#### block.displayName

#### block.metadata

Number which represents different things depending on the block.
See http://www.minecraftwiki.net/wiki/Data_values#Data

#### block.light

#### block.skyLight

#### block.hardness

#### block.biome

A biome instance. See [Biome](https://github.com/prismarinejs/prismarine-biome#api).

#### block.signText

If the block is a sign, contains the sign text.

#### block.painting

If the block is a painting, contains information about the painting.

 * `id`
 * `position`
 * `name`
 * `direction` - direction vector telling how the painting is facing.

#### block.diggable

Boolean, whether the block is considered diggable.

#### block.boundingBox

The shape of the block according to the physics engine's collision decection. Currently one of:

 * `block` - currently, partially solid blocks, such as half-slabs and ladders, are considered entirely solid.
 * `empty` - such as flowers and lava.

#### block.material

This tells what types of tools will be effective against the block. Possible
values are: `null`, `rock`, `wood`, `plant`, `melon`, `leaves`, `dirt`, `web`, and `wool`.

See http://www.minecraftwiki.net/wiki/Digging and the `toolMultipliers`
variable at the top of lib/plugins/digging.js for more info.

#### block.harvestTools

The set of tools that will allow you to harvest the block.

#### block.drops

The blocks or items dropped by that block.

## History

### 1.1.1

* use the minStateId if passing the blockType

### 1.1.0

* add block state id feature (for >= 1.13)

### 1.0.1

* bump mcdata

### 1.0.0

* bump dependencies

### 0.1.0

* Import from mineflayer
