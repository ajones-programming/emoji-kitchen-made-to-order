import { mergeImagesCustom, mergeInfo } from './mergeImages';
import { CustomEmojiData, FaceData, ItemScale } from './types';
import { addFaces, isFaceEqual, isResizeEqual, RenderFace} from './typefunctions';


export class CustomEmojiObject implements CustomEmojiData{
    base_url : string | undefined= undefined;
    face : FaceData | undefined = undefined;
    _b64 : string = "";
    _id : string | undefined = "";
    resize: ItemScale | undefined = undefined;
    #isCustom = false;

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

    public getSourceString() : string{
        return this.#isCustom ? (this.base_url ?? "") : ( "./assets/custom/" + (this.base_url??"") + ".png");
    }

    public inherit_traits( emoji : CustomEmojiObject) : CustomEmojiObject{
        var combined = new CustomEmojiObject(this.id() + emoji.id());
        combined.#isCustom = true;
        combined.base_url = this.getSourceString();
        combined.resize = this.resize;
        combined.face = addFaces(this.face, emoji.face);
        return combined;
    }

    public async render(){
        const allImages : mergeInfo[] = [];
        if (this.base_url != undefined){
            allImages.push({
                src: this.getSourceString()
            });
        }
        if (this.face != undefined){
            const faceString = await RenderFace(this.face);
            if (faceString != undefined){
                allImages.push(
                {
                    src : faceString,
                    x: this.resize?.x,
                    y : this.resize?.y,
                    width : this.resize?.width,
                    height : this.resize?.height
                });
            }
        }
        const item = document.getElementById(this.id()) as HTMLImageElement;
        if (item != null){
            item.src = await mergeImagesCustom(allImages);
        }
    }

    public id(){
        return this._id ?? "";
    }

    public b64(){
        return this._b64;
    }
}

export function isEmojiEqual(emoji1 : CustomEmojiObject, emoji2 : CustomEmojiObject) : boolean{
    return emoji1.getSourceString() == emoji2.getSourceString() && isFaceEqual(emoji1.face, emoji2.face) && isResizeEqual(emoji1.resize, emoji2.resize);
}