

//https://stackoverflow.com/questions/20958078/resize-a-base-64-image-in-javascript-without-using-canvas
// Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.

export function rotateCanvas(canvas : HTMLCanvasElement, rotation : number ,  width : number, height : number){
  const inradians = rotation * Math.PI / 180;
  var newCanvas = document.createElement('canvas');
  var ctx = newCanvas.getContext('2d');

  // We set the dimensions at the wanted size.
  newCanvas.width = width;
  newCanvas.height = height;

  if (ctx != null){
    ctx.translate(width/2, height/2);
    ctx.rotate(inradians);
    ctx.translate(-width/2, -width/2);
    ctx.drawImage(canvas, 0,0);
  }
  // We resize the image with the canvas method drawImage();
  return newCanvas;
}

export function cropCanvas(canvas : HTMLCanvasElement, width : number, height : number){
  var newCanvas = document.createElement('canvas');
  var ctx = newCanvas.getContext('2d');

  newCanvas.width = width;
  newCanvas.height = height;

  if (ctx != null){
    ctx.drawImage(canvas,(width-canvas.width)/2, (height-canvas.height)/2);
  }
  return newCanvas;
}

export function flipCanvasX(canvas : HTMLCanvasElement){
  var newCanvas = document.createElement('canvas');
  var ctx = newCanvas.getContext('2d');

  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;

  if (ctx != null){
    ctx.translate(canvas.width,0);
    ctx.scale(-1,1)
    ctx.drawImage(canvas,0, 0);
  }
  return newCanvas;
}