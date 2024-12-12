//somehow use this for faces? no source?
import { MergedCanvas } from "./mergedCanvas";
import { ItemAnchor, Rect } from "./types";

export function targetSize(){return 300;}



export type imageInput = string | MergedCanvas;

export class imageInfo{
  private img : HTMLImageElement | undefined = undefined;
  private canvas : MergedCanvas | undefined;

  private static imgCache : { [src: string] : HTMLImageElement }={};

  src? : string = "";
  x? : number;
  y? : number;
  width? : number;
  height? : number;
  copies? : number;
  copy_vertically?:boolean;
  set_copy_offset?:number;
  alpha? : number;
  anchor? : ItemAnchor;
  custom_anchor? : ItemAnchor;
  scale_x? : number;
  scale_y? : number;

  constructor(input : imageInput, resize? : Rect){

    if (input instanceof MergedCanvas){
      this.canvas = input;
    }
    else{
      this.src = input;
    }
    if (resize){
      this.addAreaRect(resize);
    }
  }

  public static updateCache(){
    if (Object.keys(this.imgCache).length > 30){
      this.imgCache = {};
    }
  }

  public addAreaRect(resize : Rect)
  {
    this.x = resize.x;
    this.y = resize.y;
    this.width = resize.width;
    this.height = resize.height;
  }

  public async loadImage() : Promise<imageInfo>{
    if (!this.src || this.img || this.canvas){
      return this;
    }
    if (imageInfo.imgCache[this.src]){
      this.img = imageInfo.imgCache[this.src];
      return this;
    }

    return new Promise((resolve, reject) => {
      this.img = new Image();
      this.img.onload = () =>
        {
          if (this.img && this.src){
            imageInfo.imgCache[this.src] = this.img;
          }
          resolve(this);
        }
      this.img.onerror = reject;
      this.img.src = this.src ?? "";
    })
  }

  private makeAdditionalObject(){
    const object : any = {};
    if (this.alpha){
      object.alpha = this.alpha;
    }
    return object;
  }

  public draw(canvasData : MergedCanvas)
  {
    if (!this.img && !this.canvas){
      return;
    }
    var x = this.x ?? 0;
    var y = this.y ?? 0;
    var _width = this.width ?? undefined;
    var _height = this.height ?? undefined;
    var _customAnchor : ItemAnchor | undefined;
    if (this.custom_anchor){
      _customAnchor = new ItemAnchor();
      _customAnchor.x = this.custom_anchor.x;
      _customAnchor.y = this.custom_anchor.y;
    }

    const additional = this.makeAdditionalObject();

    if (this.scale_x || this.scale_y){
      if (_customAnchor){
        _customAnchor.x *= (this.scale_x ?? 1.0);
        _customAnchor.y *= (this.scale_y ?? 1.0);
      }
      _width =(_width ?? (this.img?.width || this.canvas?.width()) ?? 0) * (this.scale_x ?? 1.0);
      _height =(_height ?? (this.img?.height || this.canvas?.height()) ?? 0) * (this.scale_y ?? 1.0);
    }

    if (this.anchor){
      if (this.img){
        x += this.anchor.x - (_customAnchor?.x ?? (_width ?? this.img.width)/2);
        y += this.anchor.y - (_customAnchor?.y ?? (_height ?? this.img.height)/2);
      }
      else if (this.canvas){
        x += this.anchor.x - (_customAnchor?.x ?? (_width ?? this.canvas.width())/2);
        y += this.anchor.y - (_customAnchor?.y ?? (_height ?? this.canvas.height())/2);
      }
    }
  //simplify this bit
    if (!this.copies || this.copies <= 1){
      canvasData.drawToCanvas(this.img ?? this.canvas, x, y, _width, _height, additional);
      return;
    }

    const width = this.img?.width ?? this.canvas?.width() ?? 0;
    const height = this.img?.height ?? this.canvas?.height() ?? 0;

    //draw side by side
    if (this.copy_vertically){
      const copy_offset =  this.set_copy_offset ?? height;
      var startingPoint = y - (copy_offset/2) *(this.copies - 1);
      if (startingPoint + copy_offset*this.copies > targetSize()){
        startingPoint = targetSize() - copy_offset*this.copies;
      }
      for (var i : number = 0; i < this.copies; i++){
        canvasData.drawToCanvas(this.img ?? this.canvas, x, startingPoint + (copy_offset * i),  _width, _height, additional);
      }
    }
    else{
      const copy_offset = this.set_copy_offset ?? width;
      var startingPoint = x - (copy_offset/2) *(this.copies - 1);
      if (startingPoint + copy_offset*this.copies > targetSize()){
        startingPoint = targetSize() - copy_offset*this.copies;
      }
      for (var i : number = 0; i < this.copies; i++){
        canvasData.drawToCanvas(this.img ?? this.canvas, startingPoint + (copy_offset * i) , y,  _width, _height, additional);
      }
    }
  }

};

export class transformInfo{
  rotate? : number;
}


async function processCommand(value : imageInfo | transformInfo){
  if (value instanceof imageInfo){
    await value.loadImage();
  }
}

function Transform(transformInfo : transformInfo, canvas : MergedCanvas)
{
  if (transformInfo.rotate){
    const radians = transformInfo.rotate * Math.PI / 180;
    canvas.Rotate(radians);
  }
}

//cant i just do this to merge images without a dependency lmao
export async function mergeImagesCustom(data : (imageInfo | transformInfo)[]) : Promise<MergedCanvas>{
  const canvasData = new MergedCanvas ();

  await Promise.all(data.map(processCommand));
  for (const dataItem of data){
    if (dataItem instanceof imageInfo){
      dataItem.draw(canvasData);
    }
    else if (dataItem instanceof transformInfo){
      Transform(dataItem,canvasData);
    }
    else{
      console.error(typeof(dataItem));
    }
  }
  return canvasData;
}