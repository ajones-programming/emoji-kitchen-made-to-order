//somehow use this for faces? no source?

import { cropCanvas, rotateCanvas } from "./transformCanvas";
import { Rect } from "./types";

function preCropSize(){return 700;}
export function postCropSize(){return 300;}

export class imageInfo{
  private img : HTMLImageElement |HTMLCanvasElement | undefined = undefined;

  private static imgCache : { [src: string] : HTMLImageElement | HTMLCanvasElement; }={};

  src? : string = "";
  x? : number;
  y? : number;
  width? : number;
  height? : number;
  copies? : number;
  copy_vertically?:boolean;
  set_copy_offset?:number;
  alpha? : number;
  //this is only for canvases
  private noCropOffset ? : boolean;
  private allowCropArea? : boolean;

  constructor(src? : string, canvas? : HTMLCanvasElement, resize? : Rect){

    this.src = src;
    this.img = canvas;
    if (canvas){
      this.noCropOffset = true;
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
    if (this.img instanceof HTMLCanvasElement){
      this.allowCropArea = true;
    }
    this.noCropOffset = false;
  }

  private adjustForCropArea(){
    if (this.width && this.height && this.allowCropArea)
      {
        const oldWidth = this.width;
        this.width *= preCropSize()/postCropSize();
        this.x = (this.x ?? 0) - (this.width - oldWidth)/2;
        const oldHeight = this.height;
        this.height *= preCropSize()/postCropSize();
        this.y = (this.y ?? 0) - (this.height - oldHeight)/2;
      }
  }

  public async loadImage() : Promise<imageInfo>{
    this.adjustForCropArea();
    if (!this.src){
      return this;
    }
    if (this.img){
      return this;
    }
    if (imageInfo.imgCache[this.src] != undefined){
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

  public draw(context : CanvasRenderingContext2D)
  {
    if (!this.img){
      return;
    }
    if (this.alpha){
      context.globalAlpha = this.alpha;
    }

    const cropOffset = this.noCropOffset ? 0 :((preCropSize() - postCropSize())/2);
    this.x = this.x ?? 0;
    this.y = this.y ?? 0;
  //simplify this bit
    if (!this.copies || this.copies <= 1){
      if (this.width && this.height){
        context.drawImage(this.img, this.x + cropOffset, this.y + cropOffset, this.width, this.height);
      }
      else{
        context.drawImage(this.img, this.x + cropOffset, this.y + cropOffset);
      }
      if (this.alpha){
        context.globalAlpha = 1;
      }

      return;
    }
    //draw side by side
    if (this.copy_vertically){
      const copy_offset =  this.set_copy_offset ?? this.img.height;
      var startingPoint = this.y - (copy_offset/2) *(this.copies - 1);
      if (startingPoint + copy_offset*this.copies > postCropSize()){
        startingPoint = postCropSize() - copy_offset*this.copies;
      }
      for (var i : number = 0; i < this.copies; i++){
        context.drawImage(this.img, this.x + cropOffset,startingPoint + (copy_offset * i) + cropOffset);
      }
    }
    else{
      const copy_offset = this.set_copy_offset ?? this.img.width;
      var startingPoint = this.x - (copy_offset/2) *(this.copies - 1);
      if (startingPoint + copy_offset*this.copies > postCropSize()){
        startingPoint = postCropSize() - copy_offset*this.copies;
      }
      for (var i : number = 0; i < this.copies; i++){
        context.drawImage(this.img, startingPoint + (copy_offset * i) + cropOffset, this.y + cropOffset);
      }
    }
    if (this.alpha){
      context.globalAlpha = 1;
    }
  }

};

export class transformInfo{
  rotate? : number;
}


function processCommand(value : imageInfo | transformInfo){
  if (value instanceof imageInfo){
    return value.loadImage();
  }
  else{
    return value;
  }
}

function GenerateNewCanvasFromTransform(transformInfo : transformInfo, canvas : HTMLCanvasElement)
{
  if (transformInfo.rotate){
    return rotateCanvas(canvas, transformInfo.rotate, preCropSize(),preCropSize());
  }
}

//cant i just do this to merge images without a dependency lmao
export async function mergeImagesCustom(data : (imageInfo | transformInfo)[], crop : boolean = false) : Promise<HTMLCanvasElement>{
  //create images
  //add urls
  //await canvas lmao
  var canvas = document.createElement('canvas');

  canvas.width = preCropSize();
  canvas.height = preCropSize();
  var context = canvas.getContext('2d');
  if (!context){
    return canvas;
  }
  for (const dataItem of data){
    await processCommand(dataItem);
  };

  for (const dataItem of data){
    if (dataItem instanceof imageInfo){
      dataItem.draw(context);
    }
    else if (dataItem instanceof transformInfo){
      const newCanvas = GenerateNewCanvasFromTransform(dataItem,canvas);
      const newContext = newCanvas?.getContext('2d');
      if (newCanvas && newContext){
        canvas = newCanvas;
        context = newContext;
      }
    }
    else{
      console.error(typeof(dataItem));
    }
  }
  if (crop){
    var size = postCropSize();
    return cropCanvas(canvas, size, size);

  }
  return canvas;
}