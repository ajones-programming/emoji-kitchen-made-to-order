import { mergeImagesCustom, mergeInfo, transformInfo } from './mergeImages';
import { CustomEmojiData, EmojiFlatDetail, ItemScale } from './types';
import { isResizeEqual} from './ResizeFunctions';
import { CustomFaceObject } from './customFaceObject';
import { CustomEmojiItemObject } from './customEmojiItemObject';


export class CustomEmojiObject{
    private base_url? : string;
    private base_details_url? : string;
    private additional_base_details? : EmojiFlatDetail;
    private face? : CustomFaceObject;
    private _id? : string;
    private _emoji? : string;
    private resize? : ItemScale;
    private additionalObjects : CustomEmojiItemObject[] = [];
    private rotation? : number;

    constructor(id? : string, data?:  CustomEmojiData, emoji? : string) {
        if (data){
            this.base_url =  "./assets/custom/" + (data.base_url ?? "") + ".png";

            if (data.inherited_details_url){
                this.base_details_url = "./assets/custom/" + data.inherited_details_url + ".png";
            }
            if (data.additional_details_rect){
                this.additional_base_details = {resize: data.additional_details_rect};
            }
            this.face = new CustomFaceObject(data.face);
            this.resize = data.unique_face_rect;
            this.rotation = data.rotation;
            if (this.rotation){
                this.rotation = (this.rotation + 360)%360;
            }
            if (data.additional_parts){
                data.additional_parts.forEach(item =>{
                    this.additionalObjects?.push(new CustomEmojiItemObject(item));
                });
            }
        }
        if (id){
            this._id = id;
        }
        if (emoji){
            this._emoji = emoji;
        }
    }

    public inherit_traits( emoji : CustomEmojiObject, ignoreTags : boolean = false) : CustomEmojiObject{
        var combined = new CustomEmojiObject(this.id() + emoji.id());
        if (this._emoji || emoji._emoji){
            combined._emoji = (this._emoji ?? "") + (emoji._emoji ?? "");
        }
        combined.base_url = this.base_url;
        combined.resize = this.resize;
        combined.base_details_url = this.base_details_url;
        if (this.additional_base_details && this.additional_base_details.resize && emoji.base_details_url){
            combined.additional_base_details = {url: emoji.base_details_url, resize: this.additional_base_details.resize};
        }
        if (this.rotation || emoji.rotation){
            combined.rotation = ((this.rotation ?? 0) + (emoji.rotation ?? 0)+360)%360;
            if (combined.rotation == 0){
                combined.rotation = undefined;
            }
        }
        if (!this.face || !emoji.face){
            combined.face = this.face ?? emoji.face;
        }
        else{
            combined.face =  this.face.inheritTraits(emoji.face,ignoreTags);
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
        if (this.additional_base_details != undefined && this.additional_base_details.url){
            const baseMergeDetails = new mergeInfo();
            baseMergeDetails.src = this.additional_base_details.url;
            if (this.additional_base_details.resize){
                //surely we can make this smaller by adding a resize?
                baseMergeDetails.x = this.additional_base_details.resize.x;
                baseMergeDetails.y = this.additional_base_details.resize.y;
                baseMergeDetails.width = this.additional_base_details.resize.width;
                baseMergeDetails.height = this.additional_base_details.resize.height;
            }
            allInstructions.push(baseMergeDetails);
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

    private flatDetailsEqual(flat1 : EmojiFlatDetail | undefined, flat2 : EmojiFlatDetail | undefined){

        if (!flat1?.url && !flat2?.url){
            return true;
        }
        return flat1?.url == flat2?.url && isResizeEqual(flat1?.resize, flat2?.resize);
    }

    public isEqual(emoji : CustomEmojiObject) : boolean{
        const facesEqual = (this.face && emoji.face ) ? this.face.isEqual(emoji.face) : (!this.face && !emoji.face);
        const isEqual = this.base_url == emoji.base_url &&
        this.flatDetailsEqual(this.additional_base_details, emoji.additional_base_details) &&
        facesEqual &&
        (this.face != undefined && emoji.face != undefined && isResizeEqual(this.resize, emoji.resize)) &&
        CustomEmojiItemObject.itemListsEqual(this.additionalObjects,emoji.additionalObjects) &&
        this.rotation == emoji.rotation;
        return isEqual;
    }
}