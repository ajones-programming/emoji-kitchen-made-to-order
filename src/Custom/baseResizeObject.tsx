import { EdgeRatios, Rect } from "./types";


export class BaseResizeObject{

    private leftGapRatio : number = 0;
    private rightGapRatio : number = 0;
    private topGapRatio : number = 0;
    private bottomGapRatio : number = 0;

    constructor(edgeRatio? : EdgeRatios){
        if (edgeRatio){
            this.leftGapRatio = edgeRatio.left ?? 0;
            this.rightGapRatio = edgeRatio.right ?? 0;
            this.bottomGapRatio = edgeRatio.bottom ?? 0;
            this.topGapRatio = edgeRatio.top ?? 0;
        }
    }

    public hasEffect(){
        return this.leftGapRatio > 0 || this.rightGapRatio > 0 || this.bottomGapRatio > 0 || this.topGapRatio > 0;
    }

    public createMax(resize1 : BaseResizeObject, resize2 : BaseResizeObject ){
        const max = new BaseResizeObject();
        max.bottomGapRatio = Math.max(resize1.bottomGapRatio,resize2.bottomGapRatio);
        max.topGapRatio = Math.max(resize1.topGapRatio,resize2.topGapRatio);
        max.leftGapRatio = Math.max(resize1.leftGapRatio,resize2.leftGapRatio);
        max.rightGapRatio = Math.max(resize1.rightGapRatio,resize2.rightGapRatio);
        return max;
    }

    public getRatios() : EdgeRatios{
        const widthMax = (this.leftGapRatio + this.rightGapRatio) > (this.bottomGapRatio + this.topGapRatio);
        const squareEdge = widthMax ? (this.leftGapRatio + this.rightGapRatio) : (this.bottomGapRatio + this.topGapRatio);
        const widthDif = widthMax ? 0 : (squareEdge - (this.leftGapRatio + this.rightGapRatio));
        const heightDif = widthMax ? (squareEdge - (this.bottomGapRatio + this.topGapRatio)) : 0;
        return {
            left : this.leftGapRatio + widthDif/2,
            right: this.rightGapRatio + widthDif/2,
            top : this.topGapRatio + heightDif/2,
            bottom: this.bottomGapRatio + heightDif/2
        }

    }

    public getRect(edgeSize : number = 1) : Rect{
        const edgeRatios = this.getRatios();
        console.log(edgeRatios);
        return {
            x: edgeSize * (edgeRatios.left ?? 0),
            y: edgeSize * (edgeRatios.top ?? 0),
            width: edgeSize * (1.0 - ((edgeRatios.left ?? 0) + (edgeRatios.right ?? 0))),
            height: edgeSize * (1.0 - ((edgeRatios.top ?? 0) + (edgeRatios.bottom ?? 0)))
        };
    }

}