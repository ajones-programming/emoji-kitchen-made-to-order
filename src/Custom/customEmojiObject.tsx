import { mergeImagesCustom, mergeInfo, postCropSize, transformInfo } from './mergeImages';
import { CustomEmojiData, EmojiFlatDetail, ItemScale } from './types';
import { isResizeEqual} from './ResizeFunctions';
import { CustomFaceObject } from './customFaceObject';
import { CustomEmojiItemObject } from './customEmojiItemObject';
import { CustomHands } from './customHands';

//figure out how hands are meant to work? Hands are dependent on the base, which makes this complicated

export class CustomEmojiObject{
    private base_url? : string;
    private base_details_url? : string;
    private additional_base_details? : EmojiFlatDetail;
    private face? : CustomFaceObject;
    private allFace = true;
    private hands? : CustomHands;
    private _id? : string;
    private _emoji? : string;
    private faceResize? : ItemScale;
    private additionalObjects : CustomEmojiItemObject[] = [];
    private additionalObjects_back : CustomEmojiItemObject[] = [];
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
            this.face = data.face ? new CustomFaceObject(data.face) : undefined;
            this.hands = data.hands ? new CustomHands(data.hands, data.face?.category) : undefined;
            this.faceResize = data.unique_face_rect;
            this.rotation = data.rotation;
            this.allFace = (data.allFace == undefined || data.allFace);
            if (this.rotation){
                this.rotation = (this.rotation + 360)%360;
            }
            if (data.additional_parts){
                data.additional_parts.forEach(item =>{
                    this.additionalObjects?.push(new CustomEmojiItemObject(item));
                });
            }
            if (data.additional_parts_back){
                data.additional_parts_back.forEach(item =>{
                    this.additionalObjects_back?.push(new CustomEmojiItemObject(item));
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

    public inherit_traits( emoji : CustomEmojiObject, ignoreTags : boolean = false, swap : boolean = true) : CustomEmojiObject{
        var combined = new CustomEmojiObject(this.id() + (swap ? "" : "(" + this.id() + ")")+ emoji.id());
        if (this._emoji || emoji._emoji){
            combined._emoji = (this._emoji ?? "") + (swap ? "" :"(" + (this._emoji??"") + ")" ) + (emoji._emoji ?? "");
        }
        combined.base_url = this.base_url;
        combined.faceResize = this.faceResize;
        combined.allFace = this.allFace;
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
            combined.face =  this.face.inheritTraits(emoji.face,ignoreTags, swap);
        }
        if (!this.hands || !emoji.hands){
            combined.hands = this.hands ?? emoji.hands;
        }
        else{
            combined.hands =  this.hands.inheritTraits(emoji.hands, swap);
        }
        combined.additionalObjects = CustomEmojiItemObject.mergeItemLists(this.additionalObjects, emoji.additionalObjects);
        combined.additionalObjects_back = CustomEmojiItemObject.mergeItemLists(this.additionalObjects_back, emoji.additionalObjects_back);
        return combined;
    }

    private async renderBaseAndFace(){
        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this.base_url != undefined){
            allInstructions.push(new mergeInfo(this.base_url));
        }
        if (this.additional_base_details != undefined && this.additional_base_details.url){
            const baseMergeDetails = new mergeInfo(this.additional_base_details.url,this.additional_base_details.resize);
            allInstructions.push(baseMergeDetails);
        }
        if (this.face != undefined){
            //see if we can somehow put this into one command
            const faceString = await this.face.Render();
            if (faceString){
                const image = new mergeInfo(faceString, this.faceResize);
                if (this.faceResize){
                    image.allowCropArea = true;
                }
                else{
                    image.ignoreOffset = true;
                }
                allInstructions.push(image);
            }
        }
        const finishedFaceAndBase = new mergeInfo(await mergeImagesCustom(allInstructions,true));
        if (this.allFace && this.hands){
            const handsResize = this.hands.getResize().getRatios();
            finishedFaceAndBase.height = postCropSize() * (1.0 - (handsResize.top + handsResize.bottom));
            finishedFaceAndBase.width = postCropSize() * (1.0 - (handsResize.left + handsResize.right));
            finishedFaceAndBase.x = postCropSize() * handsResize.left;
            finishedFaceAndBase.y = postCropSize() * handsResize.top;
        }
        return finishedFaceAndBase;
    }

    public async render(){
        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this.additionalObjects_back){
            allInstructions.push(...(await CustomEmojiItemObject.getListedMergeInfo(
                this.additionalObjects_back.map(value => {return {item : value};})
            )));
        }
        if (this.base_url || this.additional_base_details || this.face)
        {
            allInstructions.push(await this.renderBaseAndFace());
        }
        if (this.hands){
            allInstructions.push(...await this.hands.toMergeDetails());
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
        if (this.face && emoji.face ){
            console.log("BOTH FACES ARE DEFINED");
        }
        const facesEqual = (this.face && emoji.face ) ? this.face.isEqual(emoji.face) : (!this.face && !emoji.face);
        const handsEqual = (this.hands && emoji.hands) ? this.hands.isEqual(emoji.hands) : (!this.hands && !emoji.hands);
        const isEqual = this.base_url == emoji.base_url &&
        this.flatDetailsEqual(this.additional_base_details, emoji.additional_base_details) &&
        facesEqual &&
        handsEqual &&
        ((this.face != undefined && emoji.face != undefined) ? isResizeEqual(this.faceResize, emoji.faceResize) : true) &&
        CustomEmojiItemObject.itemListsEqual(this.additionalObjects,emoji.additionalObjects) &&
        CustomEmojiItemObject.itemListsEqual(this.additionalObjects_back,emoji.additionalObjects_back) &&
        this.rotation == emoji.rotation;
        return isEqual;
    }
}