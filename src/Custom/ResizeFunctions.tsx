//put all this into a class
import { postCropSize } from "./mergeImages";
import { ItemScale} from "./types";


export function isResizeEqual(resize1 : ItemScale | undefined, resize2 : ItemScale | undefined){
    if (resize1 == undefined || resize2 == undefined){
        return (resize1 == undefined && resize2 == undefined);
    }
    return (resize1.x ?? 0) == (resize2.x ?? 0) &&
            (resize1.y ?? 0) == (resize2.y ?? 0) &&
            (resize1.width?? postCropSize()) == (resize2.width ?? postCropSize()) &&
            (resize1.height?? postCropSize()) == (resize2.height ?? postCropSize());
}
