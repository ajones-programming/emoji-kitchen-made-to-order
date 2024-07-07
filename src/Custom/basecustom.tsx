import { mergeImages_Caller } from './mergeImages';
import { CustomEmojiData, EmojiItem, FaceData } from './types';
import { addFaces, isFaceEqual, pushFaceDataToList, pushItemDataToList } from './typefunctions';


export class CustomEmojiObject implements CustomEmojiData{
    base_url : string | undefined= undefined;
    face : FaceData | undefined = undefined;
    _b64 : string = "";
    _id : string | undefined = "";

    constructor(id? : string, data?:  CustomEmojiData){
        if (data){
            this.base_url = data.base_url;
            this.face = data.face;
            this._id = data._id;
        }
        if (id){
            this._id = id;
        }
    }


    public inherit_traits( emoji : CustomEmojiObject) : CustomEmojiObject{
        var combined = new CustomEmojiObject(this.id() + emoji.id());
        combined.base_url = this.base_url;
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
            pushFaceDataToList(this.face, allImages);
        }
        await mergeImages_Caller(allImages).then((b64) =>
            {
                this._b64 = b64;
                const item = document.getElementById(this.id()) as HTMLImageElement;
                if (item != null){
                    item.src = b64;
                    item.width = 150;
                    item.height = 150;
                    console.log("FOUND BASE ITEM");
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