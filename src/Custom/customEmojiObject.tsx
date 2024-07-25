import { mergeImagesCustom, mergeInfo } from './mergeImages';
import { CustomEmojiData, ItemScale } from './types';
import { isResizeEqual} from './ResizeFunctions';
import { CustomFaceObject } from './customFaceObject';


export class CustomEmojiObject{
    private base_url? : string;
    private face? : CustomFaceObject;
    private _id? : string;
    private resize? : ItemScale;

    constructor(id? : string, data?:  CustomEmojiData){
        if (data){
            this.base_url =  "./assets/custom/" + (data.base_url ?? "") + ".png";
            this.face = new CustomFaceObject(data.face);
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
        if (!this.face || !emoji.face){
            combined.face = this.face ?? emoji.face;
        }
        else{
            combined.face =  this.face.inheritTraits(emoji.face);
        }
        return combined;
    }

    public async render(){
        const allImages : mergeInfo[] = [];
        if (this.base_url != undefined){
            allImages.push({
                src: this.base_url
            });
        }
        if (this.face != undefined){
            //see if we can somehow put this into one command
            const faceString = await this.face.Render();
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

    public isEqual(emoji : CustomEmojiObject) : boolean{
        const facesEqual = (this.face && emoji.face ) ? this.face.isEqual(emoji.face) : (!this.face && !emoji.face);
        return this.base_url == emoji.base_url && facesEqual && isResizeEqual(this.resize, emoji.resize);
    }
}