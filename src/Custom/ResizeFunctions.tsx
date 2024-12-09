//put all this into a class
import { targetSize } from "./mergeImages";
import { Rect} from "./types";


export function isRectEqual(resize1 : Rect | undefined, resize2 : Rect | undefined){
    if (resize1 == undefined || resize2 == undefined){
        return (resize1 == undefined && resize2 == undefined);
    }
    return (resize1.x ?? 0) == (resize2.x ?? 0) &&
            (resize1.y ?? 0) == (resize2.y ?? 0) &&
            (resize1.width?? targetSize()) == (resize2.width ?? targetSize()) &&
            (resize1.height?? targetSize()) == (resize2.height ?? targetSize());
}
