import { GetDimensions } from "./image";
import { mergeImagesCustom, mergeInfo } from "./mergeImages";
import { EmojiItem, FaceData, ItemAnchor, ItemScale} from "./types";

async function pushItemDataToList(item : EmojiItem | undefined, data : Object[], anchor? : ItemAnchor){
    if (item == undefined){
        return;
    }
    var x = item.offset_x ?? 0;
    var y = item.offset_y ?? 0;
    if (anchor){
        const dimensions = await GetDimensions(item.url);
        x += anchor.x - (dimensions.width / 2);
        y += anchor.y - (dimensions.height / 2);
    }
    data.push({src : item.url, x : x, y  : y})
}

function addItems(item1 : EmojiItem | undefined, item2 : EmojiItem | undefined) : EmojiItem | undefined{
    if (item1 == undefined){
        return item2;
    }
    if (item2 == undefined){
        return item1;
    }
    var item : EmojiItem = new EmojiItem();
    item.url = ((item1.isDominant && !item2.isDominant) ? item1 :item2).url;
    item.offset_x = (item1.offset_x?? 0) + (item2.offset_x?? 0);
    item.offset_y = (item1.offset_y ?? 0) + (item2.offset_y ?? 0);
    return item;
}

export function addFaces(face1 : FaceData | undefined, face2 : FaceData | undefined){
    if (face1 == undefined){
        return face2;
    }
    if (face2 == undefined){
        return face1;
    }
    const face : FaceData = new FaceData();
    face.eyes = addItems(face1.eyes, face2.eyes);
    face.mouth = addItems(face1.mouth, face2.mouth);
    return face;
}

function isItemEqual(item1 : EmojiItem | undefined, item2 : EmojiItem | undefined){
    if (item1 == undefined || item2 == undefined){
        return (item1 == undefined && item2 == undefined);
    }
    return item1.url == item2.url &&
    (item1.offset_x ?? 0) == (item2.offset_x ?? 0) &&
    (item1.offset_y ?? 0) == (item2.offset_y ?? 0);
}

export function isResizeEqual(resize1 : ItemScale | undefined, resize2 : ItemScale | undefined){
    if (resize1 == undefined || resize2 == undefined){
        return (resize1 == undefined && resize2 == undefined);
    }
    return (resize1.x ?? 0) == (resize2.x ?? 0) &&
            (resize1.y ?? 0) == (resize2.y ?? 0) &&
            (resize1.width?? 300) == (resize2.width ?? 300) &&
            (resize1.height?? 300) == (resize2.height ?? 300);
}

export function isFaceEqual(face1 : FaceData | undefined, face2 : FaceData | undefined) : boolean{
    if (face1 == undefined || face2 == undefined){
        return face1 == undefined && face2 == undefined;
    }
    return isItemEqual(face1.eyes, face2.eyes) && isItemEqual(face1.mouth, face2.mouth);
}

//have defined anchors for now
export async function RenderFace(face : FaceData){
    //ANCHOR FACE ITEMS, THEN DRAW ON A 300X300 CANVAS
    const list : mergeInfo[] = [];
    await pushItemDataToList(face.eyes, list, {x: 150, y: 112});
    await pushItemDataToList(face.mouth, list, {x : 150, y: 213});
    return await mergeImagesCustom(list);
}