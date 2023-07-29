import { Vec3 } from 'vec3';
import { Biome } from 'prismarine-biome';
import { NBT } from 'prismarine-nbt';
import { NormalizedEnchant } from 'prismarine-item';
import Registry from 'prismarine-registry';
import { ChatMessage } from 'prismarine-chat';

interface Effect {
    id: number;
    amplifier: number;
    duration: number;
}


export type Shape = [number, number, number, number, number, number]; 

declare class Block {
    /**
     * Constructor of a block
     * @param type is the block numerical id
     * @param biomeId is the biome numerical id
     * @param metadata is the metadata numerical value
     * @param stateId the state of the block, same as metadata in newer versions
     */
    constructor(type: number, biomeId: number, metadata: number, stateId?: number);

    type: number;

    /**
     * Number which represents different things depending on the block.
     * @see http://www.minecraftwiki.net/wiki/Data_values#Data
     */
    metadata: number;

    light: number;

    skyLight: number;

    // Contains a simplified NBT object
    blockEntity: object;
    // Only set if this block is an actual entity (or has an entity component to it)
    // Contains a full NBT, unserialized object
    entity: NBT | null;

    /**
     * A biome instance.
     * @see https://github.com/prismarinejs/prismarine-biome#api.
     */
    biome: Biome;

    /**
     * Position of the block
     */
    position: Vec3;

    stateId?: number;

    /**
     * Minecraft Id (string) of the block
     * @example diamond_ore
     */
    name: string;

    /**
     * Display Name of the block
     * @example Stone
     */
    displayName: string;

    /**
     * Array of bounding boxes representing the block shape.
     * Each bounding box is an array of the form [xmin, ymin, zmin, xmax, ymax, zmax].
     * Depends on the type and state of the block.
     */
    shapes: Shape[]

    hardness: number;

    /**
     * The shape of the block according to the physics engine's collision decection. Currently one of:
     * - block - currently, partially solid blocks, such as half-slabs and ladders, are considered entirely solid.
     * - empty - such as flowers and lava.
     */
    boundingBox: string;

    /**
     * If the block texture has some transparency.
     */
    transparent: boolean;

    /**
     * Boolean, whether the block is considered diggable.
     */
    diggable: boolean;

    /**
     * This tells what types of tools will be effective against the block.
     * Possible values are: null, rock, wood, plant, melon, leaves, dirt, web, and wool.
     *
     * @see http://www.minecraftwiki.net/wiki/Digging and the toolMultipliers variable at the top of lib/plugins/digging.js for more info.
     */
    material?: string | null;

    /**
     * The set of tools that will allow you to harvest the block.
     */
    harvestTools?: { [k: string]: boolean };

    /**
     * The blocks or items dropped by that block.
     */
    drops?: Array<number | { minCount?: number, maxCount?: number, drop: number | { id: number, metadata: number } }>;

    /**
     * If the block is a sign, contains the sign text.
     * @deprecated use getSignText() and setSignText(front, back)
     */
    signText?: string;

    /**
     * Set the text on a sign
     */
    setSignText: (front?: string | any[] | ChatMessage[], back?: string | any[] | ChatMessage[]) => void
    /**
     * Get the plain text on a sign
     */
    getSignText: () => [string, string?]

    /**
     * If the block is a painting, contains information about the painting.
     * - id
     * - position
     * - name
     * - direction (direction vector telling how the painting is facing)
     */
    painting?: {
        id: number,
        position: Vec3,
        name: string,
        direction: Vec3
    };

    /**
     * Tells you if heldItemType is one of the right tool to harvest the block.
     * @param heldItemType the id of the held item (or null if nothing is held)
     */
    canHarvest(heldItemType: number | null): boolean;

    /**
     * Parse the block state and return its properties.
     */
    getProperties() : { [key: string]: string | number | boolean };

    /**
     * Tells you how long it will take to dig the block, in milliseconds.
     * @param heldItemType the id of the held item (or null if nothing is held)
     * @param creative is the bot in gamemode creative?
     * @param inWater is the bot in water?
     * @param notOnGround is the bot not on the ground?
     * @param enchantments list of enchantments from the held item (from simplified nbt data)
     * @param effects effects on the bot (bot.entity.effects)
     */
    digTime(heldItemType: number | null, creative: boolean, inWater: boolean, notOnGround: boolean, enchantments?: NormalizedEnchant[], effects?: Effect[]): number;

    static fromStateId(stateId: number, biomeId: number): Block;

    /**
     * Creates a block object from a given type id and set of block state properties.
     * @param typeId - The block type ID
     * @param properties - A dictionary of block states to build from.
     * @param biomeId - The biome this block is in.
     */
    static fromProperties(typeId: number | string, properties: { [key: string]: string | number }, biomeId: number): Block;
    
    /**
     * Create a block from a given string.
     * @param stateString - the string representation of a block 
     * @param biomeId - the biome numerical id
     */
    static fromString(stateString: string, biomeId: number): Block;
}

/** @deprecated */
function loader(mcVersion: string): typeof Block;
function loader(registry: ReturnType<typeof Registry>): typeof Block;

export = loader
