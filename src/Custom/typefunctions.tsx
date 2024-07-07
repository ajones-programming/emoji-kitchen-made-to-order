import { EmojiItem, FaceData } from "./types";
export function pushItemDataToList(item : EmojiItem, data : Object[]){
    data.push({src : item.url, x : item.offset_x, y  : item.offset_y})
}

export function pushFaceDataToList(face : FaceData, data : Object[]){
    if (face.eyes != null){
        pushItemDataToList(face.eyes, data);
    }
    if (face.mouth != null){
        pushItemDataToList(face.mouth, data);
    }
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

export function isFaceEqual(face1 : FaceData | undefined, face2 : FaceData | undefined) : boolean{
    if (face1 == undefined || face2 == undefined){
        return face1 == undefined && face2 == undefined;
    }
    return isItemEqual(face1.eyes, face2.eyes) && isItemEqual(face1.mouth, face2.mouth);

}