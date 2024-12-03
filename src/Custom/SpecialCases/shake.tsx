import { imageInfo, mergeImagesCustom } from "../mergeImages";
import { flipCanvasX } from "../transformCanvas";
import { Rect } from "../types";


export async function Shake(canvas : HTMLCanvasElement){
    const newInstructions : imageInfo[] = [];
    const rect1 = new Rect()
    rect1.x = 0;
    rect1.y = 30;
    rect1.width = 240;
    rect1.height = 240;
    const rect2 = new Rect()
    rect2.x = 60;
    rect2.y = 30;
    rect2.width = 240;
    rect2.height = 240;

    const emoji1 = new imageInfo(undefined, flipCanvasX( canvas), rect1);
    emoji1.alpha = 0.5;
    const emoji2 = new imageInfo(undefined, canvas, rect2);
    emoji2.alpha = 0.8;
    newInstructions.push(emoji1);
    newInstructions.push(emoji2);
    newInstructions.push(new imageInfo("./assets/custom/additional/shake.png"));
    return await mergeImagesCustom(newInstructions);
}