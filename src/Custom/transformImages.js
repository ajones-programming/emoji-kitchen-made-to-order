//https://stackoverflow.com/questions/20958078/resize-a-base-64-image-in-javascript-without-using-canvas
// Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.
function resizedataURL(datas, x, y, wantedWidth, wantedHeight){
  return new Promise(async function(resolve,reject){

      // We create an image to receive the Data URI
      var img = document.createElement('img');

      // When the event "onload" is triggered we can resize the image.
      img.onload = function()
      {
          // We create a canvas and get its context.
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');

          // We set the dimensions at the wanted size.
          canvas.width = wantedWidth;
          canvas.height = wantedHeight;

          // We resize the image with the canvas method drawImage();
          ctx.drawImage(this, x, y, wantedWidth, wantedHeight);

          var dataURI = canvas.toDataURL();

          // This is the return of the Promise
          resolve(dataURI);
      };

      // We put the Data URI in the image's src attribute
      img.src = datas;

  })
}// Use it like : var newDataURI = await resizedataURL('yourDataURIHere', 50, 50);

export async function transformImage_Caller(file, width, height){
  var returntype = file;

  await resizedataURL(file,0,0,width,height).then(
    value =>{
      console.log(value);
      returntype = value;
    }
  );

   return returntype;
}