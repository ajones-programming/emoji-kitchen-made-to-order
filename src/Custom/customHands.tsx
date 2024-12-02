import { BaseResizeObject } from "./baseResizeObject";
import { CustomEmojiItemObject } from "./customEmojiItemObject";
import { mergeImagesCustom, mergeInfo } from "./mergeImages";
import { RawHands } from "./types";

export class CustomHands{
    //default category
    private category : string = "smileys";
    private left_hand ? : CustomEmojiItemObject;
    private right_hand? : CustomEmojiItemObject;
    private base_resize : BaseResizeObject = new BaseResizeObject();

    private _src? : string;

    constructor(hands? : RawHands, category? : string){
        if (category){
            this.category = category;
        }
        if (hands?.left_hand){
            this.left_hand = new CustomEmojiItemObject(hands.left_hand);
        }
        if (hands?.right_hand){
            this.right_hand = new CustomEmojiItemObject(hands.right_hand);
        }
        this.base_resize = new BaseResizeObject(hands?.edge_ratio);
    }

    public static Inherit(hands1 : CustomHands, hands2 : CustomHands){
        const newBase1 = hands1.inheritTraits(hands2);
        const newBase2 = hands2.inheritTraits(hands1);
        if (newBase1.isEqual(newBase2)){
            return [newBase1];
        }
        return [newBase1, newBase2];
    }

    public inheritTraits(hands : CustomHands, swap : boolean = true){
        const combined = new CustomHands();
        combined.category = this.category;
        combined.left_hand = swap ? (this.left_hand ?? hands.left_hand) : (hands.left_hand ?? this.left_hand);
        combined.right_hand = hands.right_hand ?? this.right_hand;
        combined.base_resize = this.base_resize.createMax(this.base_resize,hands.base_resize);
        return combined;
    }

    //runs under the assumption that ratio will not change unless hands change
    public isEqual(hands : CustomHands){
        return this.category == hands.category &&
        CustomEmojiItemObject.IsEqual(this.left_hand, hands.left_hand) &&
        CustomEmojiItemObject.IsEqual(this.right_hand, hands.right_hand);
    }

    //this will have to change somehow?
    public async toMergeDetails(){
        const mergeInfoList : mergeInfo[] = [];
        if (this.left_hand){
            mergeInfoList.push(await this.left_hand.toMergeInfo(undefined,this.category));
        }
        if (this.right_hand){
            mergeInfoList.push(await this.right_hand.toMergeInfo(undefined, this.category));
        }
        return mergeInfoList;
    }

    public async render(){
        if (this._src == undefined){
            this._src = await mergeImagesCustom(await this.toMergeDetails());
        }
        return new mergeInfo(this._src ?? "");
    }

    public getBaseResize(){
        return this.base_resize;
    }

}