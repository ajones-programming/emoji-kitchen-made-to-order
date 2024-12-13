import { ImageRectArea } from "./imageRectArea";
import { cropTransparent } from "./manipulateImageData";
import { targetSize} from "./mergeImages";
import { flipCanvasX, rotateCanvas } from "./transformCanvas";
import { Rect } from "./types";


function preCropSize(){return 700;}

export class MergedCanvas{
  private canvas : HTMLCanvasElement;
  private imageRect : ImageRectArea;
  private context ?: CanvasRenderingContext2D;
  private hasBeenRotated =false;

  constructor(canvas? : HTMLCanvasElement, imageRect? : ImageRectArea){
    if (!canvas){
      canvas = document.createElement('canvas');
      canvas.width = preCropSize();
      canvas.height = preCropSize();
    }
    this.canvas = canvas;
    this.imageRect = imageRect ?? new ImageRectArea();
    this.context = this.canvas.getContext("2d") ?? undefined;

  }

  public width(){
    return this.imageRect.width();
  }
  public height(){
    return this.imageRect.height();
  }

  public setCanvasDimension(width : number, height : number){
      this.canvas.width = width;
      this.canvas.height = height;
  }

  public cropCanvas(){
    if (this.hasBeenRotated){
      return cropTransparent(this.canvas)?.toDataURL();
    }
    var newCanvas = document.createElement('canvas');
    var ctx = newCanvas.getContext('2d');

    newCanvas.width = Math.max(this.width(), this.height());
    newCanvas.height = Math.max(this.width(), this.height());

    if (ctx != null){
      ctx.drawImage(this.canvas,-this.imageRect.x(), -this.imageRect.y());
    }
    return newCanvas.toDataURL();
  }

  private arrangeArea(x : number, y: number, width : number, height : number){
      const rect = new Rect();
      rect.width = width * preCropSize()/targetSize();
      rect.x = x - (rect.width - width)/2;
      rect.height = height * preCropSize()/targetSize();
      rect.y = y - (rect.height - height)/2;
      return rect;
  }

  private cropOffset(){
      return (preCropSize() - targetSize())/2;
  }

  private contextChanging(additional : any, switchOn = true){
    if (!this.context){
      return;
    }
    if (additional.alpha){
      this.context.globalAlpha = switchOn ? additional.alpha : 1;
    }
    if (additional.keep_original_transparent){
      this.context.globalCompositeOperation = switchOn ? "source-atop" : "source-over";
    }
  }

  //include alpha??
  public drawToCanvas(img : HTMLImageElement | MergedCanvas | undefined, x: number, y: number, width? : number, height?: number, additional? : Object){
    if (!img){return;}
    const toDraw = (img instanceof HTMLImageElement) ? img : img.canvas;
    if (!this.context || !toDraw){
        return;
    }

    if (additional){
      this.contextChanging(additional, true);
    }

    if (img instanceof HTMLImageElement){
      x += this.cropOffset();
      y += this.cropOffset();
      if (width && height){
        this.context.drawImage(toDraw, x, y, width,height);
      }
      else{
        this.context.drawImage(toDraw, x, y);
      }
      this.imageRect.addRect(x,y, width ?? img.width, height ?? img.height);
    }
    else{
      if (width && height){
        const rect = this.arrangeArea(x + this.cropOffset(),y + this.cropOffset(),width,height);
        this.context.drawImage(toDraw, rect.x, rect.y, rect.width,rect.height);

        const toAddRect = img.imageRect.shrinkDown(rect.width/toDraw.width,rect.height/toDraw.height);
        this.imageRect.addRect(
          rect.x + toAddRect.x,
          rect.y + toAddRect.y,
          toAddRect.width,
          toAddRect.height
        );
      }
      else{
        this.context.drawImage(toDraw, x,y);
        this.imageRect.merge(img.imageRect);
      }

    }
    if (additional){
      this.contextChanging(additional, false);
    }
  }

  public Rotate(radians: number){
    if (!this.canvas){
      return;
    }
    this.hasBeenRotated = true;
    this.imageRect.rotatePoints(radians);
    this.canvas = rotateCanvas(this.canvas, radians, preCropSize(),preCropSize());
  }


  public createdFlippedX(){
    if (!this.canvas){
      return;
    }
    return new MergedCanvas(flipCanvasX(this.canvas), this.imageRect.flipX());
  }


}