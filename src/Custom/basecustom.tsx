import { mergeImages_Caller } from './mergeImages';
import { CustomEmojiData, EmojiItem, FaceData, ItemScale } from './types';
import { addFaces, isFaceEqual, pushFaceDataToList, pushItemDataToList, RenderFace, TransformFace } from './typefunctions';


export class CustomEmojiObject implements CustomEmojiData{
    base_url : string | undefined= undefined;
    face : FaceData | undefined = undefined;
    _b64 : string = "";
    _id : string | undefined = "";
    resize: ItemScale | undefined = undefined;

    constructor(id? : string, data?:  CustomEmojiData){
        if (data){
            this.base_url = data.base_url;
            this.face = data.face;
            this._id = data._id;
            this.resize = data.resize;
        }
        if (id){
            this._id = id;
        }
    }


    public inherit_traits( emoji : CustomEmojiObject) : CustomEmojiObject{
        var combined = new CustomEmojiObject(this.id() + emoji.id());
        combined.base_url = this.base_url;
        combined.resize = this.resize;
        combined.face = addFaces(this.face, emoji.face);
        return combined;
    }

    public async render(){
        const allImages : Object[] = [];
        if (this.base_url != undefined){
            allImages.push({
                src: this.base_url
            });
        }
        if (this.face != undefined){
            var faceString : string | undefined;
            var x = 0;
            var y= 0;
            await RenderFace(this.face).then((b64) => faceString = b64);
            if (faceString != undefined && this.resize != undefined){
                x = this.resize.x;
                y = this.resize.y;
                await TransformFace(faceString, this.resize).then(value => faceString = value);
            }
            allImages.push({src : faceString, x: x, y : y});
        }
        await mergeImages_Caller(allImages).then((b64) =>
            {
                this._b64 = b64;
                const item = document.getElementById(this.id()) as HTMLImageElement;
                if (item != null){
                    item.src = b64;
                }
            }
        );
    }

    public id(){
        return this._id ?? "";
    }

    public b64(){
        return this._b64;
    }
}

export function isEmojiEqual(emoji1 : CustomEmojiObject, emoji2 : CustomEmojiObject) : boolean{
    return emoji1.base_url == emoji2.base_url && isFaceEqual(emoji1.face, emoji2.face);
}