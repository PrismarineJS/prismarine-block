/* Declaration file wrriten by ronthecookie <ronthecookie0101@gmail.com>
 * These typings have yet to be extensively tested
 * Paintings and signs are not declared because they aren't actually implemented
 */
export = prismarine_block;
import { Vec3 } from "vec3";
declare function prismarine_block(mcVersion: string): Block;
interface Biome {
    id: number;
    name: string;
    displayName: string;
    rainfall: number;
    temperature: number;
}
declare class Block {
    constructor(type: number, biomeId: number, metadata: number);

    canHarvest(heldItemType: number): boolean;

    digTime(
        heldItemType: number | null,
        creative: boolean,
        inWater: boolean,
        notOnGround: boolean
    ): number;

    position: Vec3;
    type: number;
    name: string;
    displayName: string;
    metadata: number;
    light: number;
    skyLight: number;
    hardness: number;
    biome: Biome;
    diggable: boolean;
    boundingBox: "block" | "empty";
    material:
        | null
        | "rock"
        | "wood"
        | "plant"
        | "melon"
        | "leaves"
        | "dirt"
        | "web"
        | "wool";
    harvestTools: any;
    drops: number[];
}
