import mergeImages from 'merge-images';

export async function mergeImages_Caller(allLayers){
    const result = await mergeImages(allLayers,{crossOrigin : `anonymous`});
    return result;
}