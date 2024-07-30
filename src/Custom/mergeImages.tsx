//somehow use this for faces? no source?

import { transformImage } from "./transformImages";

export class mergeInfo{
  src : string = "";
  x? : number;
  y? : number;
  width? : number;
  height? : number;
  copies? : number;
};

class drawInfo_Internal{
  img : HTMLImageElement | undefined = undefined;
  x : number = 0;
  y : number = 0;
  copies : number = 1;
}


async function processImage(value : mergeInfo){
  if (value.width != undefined && value.height != undefined){
    value.src = await transformImage(value.src, value.width, value.height);
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
      const copies = value.copies ?? 1;
      let img = new Image()
      img.onload = () =>
        {
          resolve({img: img, x : x, y: y, copies : copies});
        }
      img.onerror = reject
      img.src = value.src
    })
  }


function Draw(imgdata : drawInfo_Internal, context : CanvasRenderingContext2D){
  if (imgdata.img != undefined)
    {
      //simplify this bit
      if (imgdata.copies <= 1){
        context.drawImage(imgdata.img, imgdata.x, imgdata.y);
      }
      //draw side by side
      else{
        const width = imgdata.img.width;
        var startingPoint = imgdata.x - (width/2) *(imgdata.copies - 1);
        if (startingPoint + width*imgdata.copies > 300){
          startingPoint = 300 - width*imgdata.copies;
        }
        for (var i : number = 0; i < imgdata.copies; i++){
          context.drawImage(imgdata.img, startingPoint + (width * i), imgdata.y);
        }
      }

    }
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
  if (!context){
    return "";
  }
  const allImages = await Promise.all(data.map(processImage));
  allImages.forEach(imgdata => Draw(imgdata, context));
  return canvas.toDataURL();
}