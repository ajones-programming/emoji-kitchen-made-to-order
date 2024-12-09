//https://beej.us/blog/data/html5s-canvas-2-pixel/
function setPixel(imageData : ImageData, x : number, y: number, r: number, g: number, b: number) {
    const index = (x + y * imageData.width) * 4;
    if (imageData.data[index+3] == 0){
        return;
    }
    const greyScale = (imageData.data[index+0]+imageData.data[index+1] + imageData.data[index+2])/3;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    //imageData.data[index+3] = a;
}

export interface colour{
    r: number;
    g: number;
    b: number;

}


function setPixelGradient(imageData : ImageData, x : number, y: number, colour_0 : colour, colour_1 : colour) {
    const index = (x + y * imageData.width) * 4;
    if (imageData.data[index+3] == 0){
        return;
    }
    const point = (imageData.data[index+0]+imageData.data[index+1] + imageData.data[index+2])/(3*255);
    imageData.data[index+0] = colour_0.r * (1 - point) + colour_1.r * (point);
    imageData.data[index+1] = colour_0.g * (1 - point) + colour_1.g * (point);
    imageData.data[index+2] = colour_0.b * (1 - point) + colour_1.b * (point);
    //imageData.data[index+3] = a;
}

function hasColor(imageData : ImageData, x : number, y : number){
    const index = (x + y * imageData.width) * 4;
    return imageData.data[index+3] != 0;
}

export function cropTransparent(canvas : HTMLCanvasElement){
    const context = canvas.getContext("2d");
    const imageData = context?.getImageData(0,0,canvas.width, canvas.height);

    if (!imageData){
        console.error("NO IMAGE DATA SOMEHOWW");
        return;
    }
    //get left
    var left : number | undefined;
    for (var x = 200; x >= 0 && !left; x-=5){
        for  (var y = 0; y < canvas.height; y+=5){
            if (hasColor(imageData, x, y)){
                x-=5;
                y=0;
                continue;
            }
            left = x;
        }
    }
    var right : number | undefined;
    for (var x = 500; x < canvas.width && !right; x+=5){
        for  (var y = 0; y < canvas.height; y+=5){
            if (hasColor(imageData, x, y)){
                x+=5;
                y=0;
                continue;
            }
            right = x;
        }
    }

    var top : number | undefined;
    for (var y = 200; y >= 0 && !top; y-=5){
        for  (var x = 0; x < canvas.width; x+=5){
            if (hasColor(imageData, x, y)){
                y-=5;
                x=0;
                continue;
            }
            top = y;
        }
    }
    var bottom : number | undefined;
    for (var y = 500; y < canvas.height && !bottom; y+=5){
        for  (var x = 0; x < canvas.width; x+=5){
            if (hasColor(imageData, x, y)){
                y+=5;
                x=0;
                continue;
            }
            bottom = y;
        }
    }

    var newCanvas = document.createElement('canvas');
    var ctx = newCanvas.getContext('2d');

    const width = (right ?? canvas.width) - (left ?? canvas.width);
    const height = (bottom ?? canvas.height) - (top ?? canvas.height);
    newCanvas.width = Math.max(width, height);
    newCanvas.height = Math.max(width, height);

    if (ctx != null){
        ctx.drawImage(canvas,-(left ?? canvas.width), -(top ?? canvas.height));
    }
    return newCanvas;
}


//ABSOLUTE WORST CASE SCENARIO!!
export function changeImage(canvas : HTMLCanvasElement){
    const context = canvas.getContext("2d");
    const imageData = context?.getImageData(0,0,canvas.width, canvas.height);

    const colour0 = {r: 41, g: 27, b : 165};
    const colour1 = {r: 255, g: 255, b : 255};

    if (!imageData){
        console.error("NO IMAGE DATA SOMEHOWW");
        return;
    }
    for (var x = 0; x < canvas.width; x++){
        for (var y = 0; y < canvas.height; y++){
            setPixelGradient(imageData, x, y, colour0, colour1);
        }
    }
    context?.putImageData(imageData, 0, 0);
}
