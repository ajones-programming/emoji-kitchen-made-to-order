//somehow use this for faces? no source?

import { cropImage, resizeImage, rotate } from "./transformImages";
import { ItemScale } from "./types";

function preCropSize(){return 500;}
export function postCropSize(){return 300;}

export class mergeInfo{
  src : string = "";
  x? : number;
  y? : number;
  width? : number;
  height? : number;
  copies? : number;
  copy_vertically?:boolean;
  set_copy_offset?:number;
  ignoreOffset ? : boolean;
  allowCropArea? : boolean;

  constructor(src : string, resize? : ItemScale){
    this.src = src;
    if (resize){
      this.addResize(resize);
    }
  }

  public addResize(resize : ItemScale)
  {
    this.x = resize.x;
    this.y = resize.y;
    this.width = resize.width;
    this.height = resize.height;
  }
};

export class transformInfo{
  rotate? : number;
}

//used created image
class imageObject{
  img : HTMLImageElement | undefined = undefined;
  x : number = 0;
  y : number = 0;
  ignoreOffset : boolean = false;
  copies : number = 1;
  copy_vertically : boolean = false;
  set_copy_offset ? : number;
}


function processCommand(value : mergeInfo | transformInfo){
  if (value instanceof mergeInfo){
    return processImage(value);
  }
  else{
    return processTransform(value);
  }
}

//both width and height must be assigned? put them in some kind of pair?
async function processImage(value : mergeInfo){
  if (value.width && value.height){
    if (value.allowCropArea){
      const oldWidth = value.width;
      value.width *= preCropSize()/postCropSize();
      value.x = (value.x ?? 0) - (value.width - oldWidth)/2;
      const oldHeight = value.height;
      value.height *= preCropSize()/postCropSize();
      value.y = (value.y ?? 0) - (value.height - oldHeight)/2;

    }
    value.src = await resizeImage(value.src, value.width, value.height);
    value.width = undefined;
    value.height = undefined;
  }
  return await addImage(value);
}

async function processTransform(value : transformInfo){
  return value;
}


//creates image to be manipulated later
//https://stackoverflow.com/questions/75322547/javascript-async-await-with-canvas
async function addImage(value : mergeInfo) : Promise<imageObject>{
    return new Promise((resolve, reject) => {
      const x = value.x ?? 0;
      const y = value.y ?? 0;
      const copies = value.copies ?? 1;
      let img = new Image()
      img.onload = () =>
        {
          const drawInfo = new imageObject();
          drawInfo.img = img;
          drawInfo.x = x; //+ (value.ignoreOffset ? 0 : offset)
          drawInfo.y = y;
          drawInfo.copies = copies;
          drawInfo.ignoreOffset = !!value.ignoreOffset;
          drawInfo.copy_vertically = !!value.copy_vertically;
          drawInfo.set_copy_offset = value.set_copy_offset;
          resolve(drawInfo);
        }
      img.onerror = reject
      img.src = value.src
    })
  }


function Draw(imgdata : imageObject, context : CanvasRenderingContext2D){
  if (imgdata.img != undefined)
    {

      const offset = imgdata.ignoreOffset ? 0 :((preCropSize() - postCropSize())/2);
      //simplify this bit
      if (imgdata.copies <= 1){
        context.drawImage(imgdata.img, imgdata.x + offset, imgdata.y + offset);
      }
      //draw side by side
      else{
        console.log("multiple copies of item");
        if (imgdata.copy_vertically){
          console.log("copying vertically");
          const copy_offset =  imgdata.set_copy_offset ?? imgdata.img.height;
          var startingPoint = imgdata.y - (copy_offset/2) *(imgdata.copies - 1);
          if (startingPoint + copy_offset*imgdata.copies > postCropSize()){
            startingPoint = postCropSize() - copy_offset*imgdata.copies;
          }
          for (var i : number = 0; i < imgdata.copies; i++){
            context.drawImage(imgdata.img, imgdata.x + offset,startingPoint + (copy_offset * i) + offset);
          }
        }
        else{
          const copy_offset = imgdata.set_copy_offset ?? imgdata.img.width;
          var startingPoint = imgdata.x - (copy_offset/2) *(imgdata.copies - 1);
          if (startingPoint + copy_offset*imgdata.copies > postCropSize()){
            startingPoint = postCropSize() - copy_offset*imgdata.copies;
          }
          for (var i : number = 0; i < imgdata.copies; i++){
            context.drawImage(imgdata.img, startingPoint + (copy_offset * i) + offset, imgdata.y + offset);
          }
        }

      }

    }
}

async function TransformCanvas(transformInfo : transformInfo, canvas : HTMLCanvasElement)
{
  if (transformInfo.rotate){
    const dataURL = canvas.toDataURL();
    const context = canvas.getContext('2d');
    if (!context){
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (transformInfo.rotate != undefined){
      const val = await rotate(dataURL,transformInfo.rotate,preCropSize(),preCropSize());
      const imgObj= new Image();
      return new Promise<undefined>((resolve, reject)=>{
        imgObj.onload = () =>{
          context.drawImage(imgObj,0,0);
          resolve(undefined);
        }
        imgObj.src = val;
      });
    }
  }
}

//cant i just do this to merge images without a dependency lmao
export async function mergeImagesCustom(data : (mergeInfo | transformInfo)[], crop : boolean = false, crop_using_angle : boolean = false) : Promise<string>{
  //create images
  //add urls
  //await canvas lmao
  var canvas = document.createElement('canvas');

  canvas.width = preCropSize();
  canvas.height = preCropSize();
  const context = canvas.getContext('2d');
  if (!context){
    return "";
  }
  const allImages = await Promise.all(data.map(processCommand));
  await Promise.all(allImages.map(imgdata => {
      if (imgdata instanceof imageObject){
        Draw(imgdata, context);
      }
      else if (imgdata instanceof transformInfo){
        return TransformCanvas(imgdata,canvas);
      }
      else{
        console.error(typeof(imgdata));
      }
      return undefined;
  }));
  if (crop){
    var size = postCropSize();
    if (crop_using_angle){
      size *= Math.SQRT2;
    }
    return await cropImage(canvas.toDataURL(), size, size, preCropSize(), preCropSize());

  }
  return canvas.toDataURL();
}