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
    // for (var i = 0; i < 1000; i++) {
    //     const x = Math.random() * canvas.width | 0; // |0 to truncate to Int32
    //     const y = Math.random() * canvas.height | 0;
    //     const r = Math.random() * 256 | 0;
    //     const g = Math.random() * 256 | 0;
    //     const b = Math.random() * 256 | 0;
    //     setPixel(imageData, x, y, r, g, b, 255); // 255 opaque
    // }
    context?.putImageData(imageData, 0, 0);
}
