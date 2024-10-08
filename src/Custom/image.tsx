// https://stackoverflow.com/questions/17774928/get-image-width-and-height-from-the-base64-code-in-javascript
export interface dimensions{
    width : number;
    height : number;
}

export async function GetDimensions(src : string){
    return new Promise<dimensions>(async function(resolve,reject){
        const img = new Image();

        img.src = src;

        img.onload = function() {
            resolve({width : img.naturalWidth, height: img.naturalHeight});
        };
    })
}