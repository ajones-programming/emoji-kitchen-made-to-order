import { mergeImagesCustom, mergeInfo, transformInfo } from './mergeImages';
import { CustomEmojiData, ItemScale } from './types';
import { isResizeEqual} from './ResizeFunctions';
import { CustomFaceObject } from './customFaceObject';
import { CustomEmojiItemObject } from './customEmojiItemObject';


export class CustomEmojiObject{
    private base_url? : string;
    private face? : CustomFaceObject;
    private _id? : string;
    private resize? : ItemScale;
    private additionalObjects : CustomEmojiItemObject[] = [];
    private rotation? : number;

    constructor(id? : string, data?:  CustomEmojiData){
        if (data){
            this.base_url =  "./assets/custom/" + (data.base_url ?? "") + ".png";
            this.face = new CustomFaceObject(data.face);
            this._id = data._id;
            this.resize = data.resize;
            this.rotation = data.rotation;
            if (data.additional_parts){
                data.additional_parts.forEach(item =>{
                    this.additionalObjects?.push(new CustomEmojiItemObject(item));
                });
            }
        }
        if (id){
            this._id = id;
        }
    }

    public inherit_traits( emoji : CustomEmojiObject) : CustomEmojiObject{
        var combined = new CustomEmojiObject(this.id() + emoji.id());
        combined.base_url = this.base_url;
        combined.resize = this.resize;
        if (this.rotation != undefined || emoji.rotation != undefined){
            combined.rotation = (this.rotation ?? 0) + (emoji.rotation ?? 0);
        }
        if (!this.face || !emoji.face){
            combined.face = this.face ?? emoji.face;
        }
        else{
            combined.face =  this.face.inheritTraits(emoji.face);
        }
        combined.additionalObjects = CustomEmojiItemObject.mergeItemLists(this.additionalObjects, emoji.additionalObjects);
        return combined;
    }

    public async render(){
        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this.base_url != undefined){
            const base = new mergeInfo();
            base.src = this.base_url;
            allInstructions.push(base);
        }
        if (this.face != undefined){
            //see if we can somehow put this into one command
            const faceString = await this.face.Render();
            if (faceString != undefined){
                const image = new mergeInfo();
                image.src = faceString;
                //if face is mapped
                if (this.resize){
                    image.x = this.resize.x;
                    image.y = this.resize.y;
                    image.width = this.resize.width;
                    image.height = this.resize.height;
                    image.allowCropArea = true;
                }
                else{
                    image.ignoreOffset = true;
                }

                allInstructions.push(image);
            }
        }
        if (this.additionalObjects){
            allInstructions.push(...(await CustomEmojiItemObject.getListedMergeInfo(
                this.additionalObjects.map(value => {return {item : value};})
            )));
        }
        if (this.rotation){
            const rotation = new transformInfo();
            rotation.rotate = this.rotation;
            allInstructions.push(rotation);
        }

        const item = document.getElementById(this.id()) as HTMLImageElement;
        if (item != null){
            item.src = await mergeImagesCustom(allInstructions,true);
        }
    }

    public id(){
        return this._id ?? "";
    }

    public isEqual(emoji : CustomEmojiObject) : boolean{
        const facesEqual = (this.face && emoji.face ) ? this.face.isEqual(emoji.face) : (!this.face && !emoji.face);
        return this.base_url == emoji.base_url && facesEqual && isResizeEqual(this.resize, emoji.resize) &&
        CustomEmojiItemObject.itemListsEqual(this.additionalObjects,emoji.additionalObjects) && this.rotation == emoji.rotation ;
    }
}