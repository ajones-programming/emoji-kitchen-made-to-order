//somehow use this for faces? no source?
import { MergedCanvas } from "./mergedCanvas";
import { ItemAnchor, Rect } from "./types";

export function targetSize(){return 300;}



type canvasInput = string | MergedCanvas;

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
  scale_x? : number;
  scale_y? : number;

  constructor(input : canvasInput, resize? : Rect){

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
    this.x = this.x ?? 0;
    this.y = this.y ?? 0;
    const additional = this.makeAdditionalObject();

    if (this.scale_x || this.scale_y){
      this.width =(this.width ?? (this.img?.width || this.canvas?.width()) ?? 0) * (this.scale_x ?? 1.0);
      this.height =(this.height ?? (this.img?.height || this.canvas?.height()) ?? 0) * (this.scale_y ?? 1.0);
    }

    if (this.anchor){
      if (this.img){
        this.x += this.anchor.x - (this.width ?? this.img.width)/2;
        this.y += this.anchor.y - (this.height ?? this.img.height)/2;
      }
      else if (this.canvas){
        this.x += this.anchor.x - (this.width ?? this.canvas.width())/2;
        this.y += this.anchor.y - (this.height ?? this.canvas.height())/2;
      }
    }
  //simplify this bit
    if (!this.copies || this.copies <= 1){
      canvasData.drawToCanvas(this.img ?? this.canvas, this.x, this.y, this.width, this.height, additional);
      return;
    }

    const width = this.img?.width ?? this.canvas?.width() ?? 0;
    const height = this.img?.height ?? this.canvas?.height() ?? 0;

    //draw side by side
    if (this.copy_vertically){
      const copy_offset =  this.set_copy_offset ?? height;
      var startingPoint = this.y - (copy_offset/2) *(this.copies - 1);
      if (startingPoint + copy_offset*this.copies > targetSize()){
        startingPoint = targetSize() - copy_offset*this.copies;
      }
      for (var i : number = 0; i < this.copies; i++){
        canvasData.drawToCanvas(this.img ?? this.canvas, this.x, startingPoint + (copy_offset * i), this.width, this.height, additional);
      }
    }
    else{
      const copy_offset = this.set_copy_offset ?? width;
      var startingPoint = this.x - (copy_offset/2) *(this.copies - 1);
      if (startingPoint + copy_offset*this.copies > targetSize()){
        startingPoint = targetSize() - copy_offset*this.copies;
      }
      for (var i : number = 0; i < this.copies; i++){
        canvasData.drawToCanvas(this.img ?? this.canvas, startingPoint + (copy_offset * i) , this.y, this.width, this.height, additional);
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