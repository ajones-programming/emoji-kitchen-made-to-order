//somehow use this for faces? no source?

import { transformImage_Caller } from "./transformImages";

export class mergeInfo{
  src : string = "";
  x? : number;
  y? : number;
  width? : number;
  height? : number;
};

class drawInfo_Internal{
  img : HTMLImageElement | undefined = undefined;
  x : number = 0;
  y : number = 0;
}


async function processImage(value : mergeInfo){
  if (value.width != undefined && value.height != undefined){
    value.src = await transformImage_Caller(value.src, value.width, value.height);
    value.width = undefined;
    value.height = undefined;
  }
  return await addImage(value);
}


//also transform images here??
//https://stackoverflow.com/questions/75322547/javascript-async-await-with-canvas
async function addImage(value : mergeInfo) : Promise<drawInfo_Internal>{
    return new Promise((resolve, reject) => {
      const x = value.x ?? 0;
      const y = value.y ?? 0;
      let img = new Image()
      img.onload = () =>
        {
          resolve({img: img, x : x, y: y});
        }
      img.onerror = reject
      img.src = value.src
    })
  }


//cant i just do this to merge images without a dependency lmao
export async function mergeImagesCustom(data : mergeInfo[], width = 300, height = 300) : Promise<string>{
//create images
//add urls
//await canvas lmao
var canvas = document.createElement('canvas');

canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');
return new Promise(async function (resolve, reject){
    Promise.all(data.map(processImage)).then((allImages)=>
        {
            allImages.map(imgdata=>{
              if (context != null && imgdata.img != undefined){
                context.drawImage(imgdata.img, imgdata.x, imgdata.y);
              }
            });
            resolve(canvas.toDataURL());
        });
    });
}