import { BaseResizeObject } from "./baseResizeObject";
import { CustomEmojiItemObject } from "./customEmojiItemObject";
import { mergeInfo } from "./mergeImages";
import { EmojiItem, HandsData } from "./types";

export class CustomHands{
    //default category
    private category : string = "smileys";
    private leftHand ? : CustomEmojiItemObject;
    private rightHand? : CustomEmojiItemObject;
    private baseResize : BaseResizeObject = new BaseResizeObject();

    constructor(hands? : HandsData, category? : string){
        if (category){
            this.category = category;
        }
        if (hands?.leftHand){
            this.leftHand = new CustomEmojiItemObject(hands.leftHand);
        }
        if (hands?.rightHand){
            this.rightHand = new CustomEmojiItemObject(hands.rightHand);
        }
        this.baseResize = new BaseResizeObject(hands?.edgeRatio?.left,hands?.edgeRatio?.right,
            hands?.edgeRatio?.top,hands?.edgeRatio?.bottom);
    }

    public inheritTraits(hands : CustomHands, swap : boolean = true){
        const combined = new CustomHands();
        combined.category = this.category;
        combined.leftHand = swap ? (this.leftHand ?? hands.leftHand) : (hands.leftHand ?? this.leftHand);
        combined.rightHand = hands.rightHand ?? hands.rightHand;
        combined.baseResize = this.baseResize.createMax(this.baseResize,hands.baseResize);
        return combined;
    }

    //runs under the assumption that ratio will not change unless hands change
    public isEqual(hands : CustomHands){
        return this.category == hands.category &&
        CustomEmojiItemObject.IsEqual(this.leftHand, hands.leftHand) &&
        CustomEmojiItemObject.IsEqual(this.rightHand, hands.rightHand);
    }

    //this will have to change somehow?
    public async toMergeDetails(){
        const mergeInfoList : mergeInfo[] = [];
        if (this.leftHand){
            mergeInfoList.push(await this.leftHand.toMergeInfo(undefined,this.category));
        }
        if (this.rightHand){
            mergeInfoList.push(await this.rightHand.toMergeInfo(undefined, this.category));
        }
        return mergeInfoList;
    }

    public getResize(){
        return this.baseResize;
    }

}