

//https://stackoverflow.com/questions/20958078/resize-a-base-64-image-in-javascript-without-using-canvas
// Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.
export async function transformImage(file : string, width : number, height : number){
  return new Promise<string>(async function(resolve,reject){

    // We create an image to receive the Data URI
    var img : HTMLImageElement= document.createElement('img');

    // When the event "onload" is triggered we can resize the image.
    img.onload = function()
    {
        // We create a canvas and get its context.
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // We set the dimensions at the wanted size.
        canvas.width = width;
        canvas.height = height;
        if (ctx != null){
          ctx.drawImage(img, 0, 0,width,height);
        }
        // We resize the image with the canvas method drawImage();
        var dataURI = canvas.toDataURL();

        // This is the return of the Promise
        resolve(dataURI);
    };

    // We put the Data URI in the image's src attribute
    img.src = file;

})
}