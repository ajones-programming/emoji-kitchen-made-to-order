import { EdgeRatios } from "./types";


export class BaseResizeObject{

    private leftGapRatio ? : number;
    private rightGapRatio? : number;
    private topGapRatio? : number;
    private bottomGapRatio? : number;

    constructor(leftGap? : number, rightGap? : number, topGap? : number, bottomGap? : number){
        this.leftGapRatio = leftGap;
        this.rightGapRatio = rightGap;
        this.topGapRatio = topGap;
        this.bottomGapRatio = bottomGap;
    }

    public createMax(resize1 : BaseResizeObject, resize2 : BaseResizeObject ){
        const max = new BaseResizeObject();
        max.bottomGapRatio = (resize1.bottomGapRatio && resize2.bottomGapRatio)?Math.max(resize1.bottomGapRatio,resize2.bottomGapRatio):
            resize1.bottomGapRatio??resize2.bottomGapRatio;
        max.topGapRatio = (resize1.topGapRatio && resize2.topGapRatio)?Math.max(resize1.topGapRatio,resize2.topGapRatio):
            resize1.topGapRatio??resize2.topGapRatio;
        max.leftGapRatio = (resize1.leftGapRatio && resize2.leftGapRatio)?Math.max(resize1.leftGapRatio,resize2.leftGapRatio):
            resize1.leftGapRatio??resize2.leftGapRatio;
        max.rightGapRatio = (resize1.rightGapRatio && resize2.rightGapRatio)?Math.max(resize1.rightGapRatio,resize2.rightGapRatio):
            resize1.rightGapRatio??resize2.rightGapRatio;
        return max;
    }

    public getRatios() : EdgeRatios{
        const widthMax = ((this.leftGapRatio??0) + (this.rightGapRatio??0)) > ((this.bottomGapRatio??0) + (this.topGapRatio??0));
        const squareEdge = widthMax ? ((this.leftGapRatio??0) + (this.rightGapRatio??0)) : ((this.bottomGapRatio??0) + (this.topGapRatio??0));
        const widthDif = widthMax ? 0 : (squareEdge - ((this.leftGapRatio??0) + (this.rightGapRatio??0)));
        const heightDif = widthMax ? (squareEdge - ((this.bottomGapRatio??0) + (this.topGapRatio??0))) : 0;
        return {
            left : (this.leftGapRatio??0) + widthDif/2,
            right: (this.rightGapRatio??0) + widthDif/2,
            top : (this.topGapRatio??0) + heightDif/2,
            bottom:(this.bottomGapRatio??0) + heightDif/2
        }

    }


}