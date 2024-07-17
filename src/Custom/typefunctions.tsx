import { mergeImagesCustom, mergeInfo } from "./mergeImages";
import { EmojiItem, FaceData, ItemScale} from "./types";

export function pushItemDataToList(item : EmojiItem | undefined, data : Object[]){
    if (item == undefined){
        return;
    }
    data.push({src : item.url, x : item.offset_x, y  : item.offset_y})
}

export function addItems(item1 : EmojiItem | undefined, item2 : EmojiItem | undefined) : EmojiItem | undefined{
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

export function isItemEqual(item1 : EmojiItem | undefined, item2 : EmojiItem | undefined){
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
    const list : mergeInfo[] = [];
    pushItemDataToList(face.eyes, list);
    pushItemDataToList(face.mouth, list);
    return await mergeImagesCustom(list);
}