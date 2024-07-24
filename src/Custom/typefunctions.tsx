import { GetDimensions } from "./image";
import { mergeImagesCustom, mergeInfo } from "./mergeImages";
import { EmojiItem, FaceData, ItemAnchor, ItemScale} from "./types";

function getURL(item : EmojiItem): string{
    return item.custom ? item.url : ("./assets/custom/" + item.url + ".png");
  }

async function emojiItemToMergeInfo(item : EmojiItem | undefined, anchor? : ItemAnchor){
    if (item == undefined){
        return {src: ""};
    }
    var x = item.offset_x ?? 0;
    var y = item.offset_y ?? 0;
    var width : number | undefined;
    var height : number | undefined;

    if (anchor || item.scale_x || item.scale_y){
        const dimensions = await GetDimensions(getURL(item));
        if (item.scale_x || item.scale_y){
            width = dimensions.width * (item.scale_x ?? 1.0);
            height = dimensions.height * (item.scale_y ?? 1.0);
            dimensions.width = width;
            dimensions.height = height;
        }
        if (anchor){
            x += anchor.x - (dimensions.width / 2);
            y += anchor.y - (dimensions.height / 2);
        }

    }
    return {src : getURL(item), x : x, y : y, width: width, height: height}
}

function addItems(item1 : EmojiItem | undefined, item2 : EmojiItem | undefined) : EmojiItem | undefined{
    if (item1 == undefined){
        return item2;
    }
    if (item2 == undefined){
        return item1;
    }
    var item : EmojiItem = new EmojiItem();
    item.custom = true;
    const itemURLEqual = getURL(item1) == getURL(item2);
    const isItem1Dominant = (item1.isDominant && !item2.isDominant) ;
    item.url = getURL(isItem1Dominant ? item1 :item2);
    item.offset_x = (item1.offset_x?? 0) + (item2.offset_x ?? 0);
    if (item.offset_x == 0){
        item.offset_x = undefined;
    }
    item.offset_y = (item1.offset_y ?? 0) + (item2.offset_y ?? 0);
    if (item.offset_y == 0){
        item.offset_y = undefined;
    }
    item.scale_x = (item1.scale_x ?? 1.0) * (item2.scale_x ?? 1.0);
    item.scale_y = (item1.scale_y ?? 1.0) * (item2.scale_y ?? 1.0);
    //this is not correct, it should be able to scale more somehow, but idk how
    if (itemURLEqual && item.scale_x == 1.0 && item.scale_y == 1.0 && (item1.auto_scale && item2.auto_scale) ){
        item.scale_x *= 1.25;
        item.scale_y *= 1.25;
    }

    if ((isItem1Dominant ? item1 :item2).proportionate){
        const minimum = item.scale_x < item.scale_y ? item.scale_x : item.scale_y;
        item.scale_x = minimum;
        item.scale_y = minimum;
        item.proportionate = true;
    }


    if (item.scale_x == 1.0){
        item.scale_x = undefined;
    }
    if (item.scale_y == 1.0){
        item.scale_y = undefined;
    }

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
    return getURL(item1) == getURL(item2) &&
    (item1.offset_x ?? 0) == (item2.offset_x ?? 0) &&
    (item1.offset_y ?? 0) == (item2.offset_y ?? 0) &&
    (item1.scale_x ?? 1.0) == (item2.scale_x ?? 1.0) &&
    (item1.scale_y ?? 1.0) == (item2.scale_y ?? 1.0);
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
    const list : mergeInfo[] = [
        await emojiItemToMergeInfo(face.eyes, {x: 150, y: 112}),
        await emojiItemToMergeInfo(face.mouth,  {x : 150, y: 213})
    ];
    return await mergeImagesCustom(list);
}