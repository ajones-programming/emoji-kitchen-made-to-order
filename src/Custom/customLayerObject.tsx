import { BaseResizeObject } from "./baseResizeObject";
import { CustomEmojiItemObject } from "./customEmojiItemObject";
import { RawLayer } from "./types";

export class CustomLayer{
    //default category
    private object ? : CustomEmojiItemObject;
    private base_resize? : BaseResizeObject = undefined;

    constructor(item ? : RawLayer){
        if (item){
            if (item.item){
                this.object = new CustomEmojiItemObject(item.item);
            }
            if (item.edge_ratio){
                this.base_resize = new BaseResizeObject(item.edge_ratio);
            }
        }
    }
    //runs under the assumption that ratio will not change unless hands change
    public isEqual(layer : CustomLayer){
        return CustomEmojiItemObject.IsEqual(this.object, layer.object);
    }

    //this will have to change somehow?
    public async toMergeDetails(){
        if (this.object){
            return await this.object.toMergeInfo(undefined);
        }
        return undefined;
    }

    public getBaseResize(){
        return this.base_resize;
    }

}