import { Rect, Vector2 } from "./types";

export class ImageRectArea{
    private _rect : Rect = new Rect();
    private new: boolean = true;

    public x = () => this._rect.x;
    public y = () => this._rect.y;
    public width = () => this._rect.width;
    public height = () => this._rect.height;

    public addRect(x: number, y: number, width : number, height: number){
        if (this.new){
            this._rect.x = x;
            this._rect.y = y;
            this._rect.width = width;
            this._rect.height = height;
            this.new = false;
            return;
        }
        if (x < this._rect.x){

            this._rect.width += (this._rect.x - x);
            this._rect.x = x;
        }
        if (y < this._rect.y){
            this._rect.height += (this._rect.y - y);
            this._rect.y = y;
        }
        if ((x + width) > (this._rect.x + this._rect.width)){
            this._rect.width = (width + x) - this._rect.x;
        }
        if ((y + height) > (this._rect.y + this._rect.height)){
            this._rect.height = (height + y) - this._rect.y;
        }
    }

    public merge(imageRect : ImageRectArea){
        if (imageRect._rect.width == 0 && imageRect._rect.height == 0){
            return;
        }
        this.addRect(imageRect._rect.x, imageRect._rect.y, imageRect._rect.width, imageRect._rect.height);
    }

    public flipX(){
        const x = 700 - (this._rect.x + this._rect.width);
        const y = 700 - (this._rect.y + this._rect.height);
        const newImageRect = new ImageRectArea();
        newImageRect.addRect(x,y,this._rect.width,this._rect.height);
        return newImageRect;
    }

    private rotate(point : Vector2, radians : number){
        return {x: point.x*Math.cos(radians) - point.y*Math.sin(radians), y: point.x*Math.sin(radians) + point.y*Math.cos(radians)};
    }

    public shrinkDown(widthRatio : number, heightRatio : number){
        const newRect = new Rect();
        //this is wrong, x and y should move forward, not backwards
        newRect.x = this._rect.x * widthRatio;
        newRect.y = this._rect.y * widthRatio;
        newRect.width = this._rect.width * widthRatio;
        newRect.height = this._rect.height * heightRatio;
        return newRect;
    }

    public rotatePoints(radians : number){
        const x1 = this._rect.x - 350;
        const x2 = this._rect.x + this._rect.width - 350;
        const y1 = this._rect.y - 350;
        const y2 = this._rect.y + this._rect.height - 350;
        [
            this.rotate({x: x1,y: y1}, radians),
            this.rotate({x: x2,y: y1}, radians),
            this.rotate({x: x1,y: y2}, radians),
            this.rotate({x: x2,y: y2}, radians)
        ].forEach(value =>{
            if (value.x + 350 < this._rect.x){
                const x = value.x + 350;
                this._rect.width += (this._rect.x - x);
                this._rect.x = x;
            }
            else if (value.x + 350> this._rect.x + this._rect.width){
                this._rect.width = value.x - this._rect.x + 350;
            }
            if (value.y + 350 < this._rect.y){
                const y = value.y + 350;
                this._rect.height += (this._rect.y - y);
                this._rect.y = y;
            }
            else if (value.y + 350 > this._rect.y + this._rect.height){
                this._rect.height = value.y - this._rect.y + 350;
            }
        });
    }
}