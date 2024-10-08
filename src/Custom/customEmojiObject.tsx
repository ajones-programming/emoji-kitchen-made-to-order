import { mergeImagesCustom, mergeInfo, postCropSize, transformInfo } from './mergeImages';
import { RawEmojiContent, EmojiFlatDetail, Rect } from './types';
import { isResizeEqual as isRectEqual} from './ResizeFunctions';
import { CustomFaceObject } from './customFaceObject';
import { CustomEmojiItemObject } from './customEmojiItemObject';
import { CustomHands } from './customHands';
import { BaseResizeObject } from './baseResizeObject';
import { CustomLayer } from './customLayerObject';

//figure out how hands are meant to work? Hands are dependent on the base, which makes this complicated

export class CustomEmojiObject{
    private _id? : string;
    private _emoji? : string;

    private _base_url? : string;
    private _inherited_details_url? : string;
    private _inherited_details? : EmojiFlatDetail;

    private _face? : CustomFaceObject;
    private _is_just_face = true;
    private _face_rect? : Rect;

    private _hands? : CustomHands;
    private _foreground_layer ? : CustomLayer;

    private _additional_objects : CustomEmojiItemObject[] = [];
    private _additional_objects_back : CustomEmojiItemObject[] = [];

    private _rotation? : number;

    constructor(id? : string, data?:  RawEmojiContent, emoji? : string) {
        if (id){
            this._id = id;
        }
        if (emoji){
            this._emoji = emoji;
        }
        if (data){
            this._base_url =  "./assets/custom/" + (data.base_url ?? "") + ".png";
            if (data.inherited_details_url){
                this._inherited_details_url = "./assets/custom/" + data.inherited_details_url + ".png";
            }
            if (data.inherited_details_rect){
                this._inherited_details = {rect: data.inherited_details_rect};
            }

            this._face = data.face ? new CustomFaceObject(data.face) : undefined;
            this._is_just_face = (data.is_only_face == undefined || data.is_only_face);
            this._face_rect = data.face_rect;

            this._hands = data.hands ? new CustomHands(data.hands, data.face?.category) : undefined;
            this._foreground_layer = data.foreground_layer ? new CustomLayer(data.foreground_layer) : undefined;

            if (data.additional_parts){
                data.additional_parts.forEach(item =>{
                    this._additional_objects.push(new CustomEmojiItemObject(item));
                });
            }
            if (data.additional_parts_back){
                data.additional_parts_back.forEach(item =>{
                    this._additional_objects_back.push(new CustomEmojiItemObject(item));
                });
            }

            if (data.rotation){
                this._rotation = (data.rotation + 360)%360;
            }
        }
    }

    public inherit_traits( emoji : CustomEmojiObject, ignoreTags : boolean = false, swap : boolean = true) : CustomEmojiObject
    {
        const id = this.id() + (swap ? "" : "(" + this.id() + ")")+ emoji.id();
        const emoji_char = (this._emoji ?? "") + (swap ? "" :"(" + (this._emoji??"") + ")" ) + (emoji._emoji ?? "");

        var combined = new CustomEmojiObject(id, undefined, emoji_char);

        combined._base_url = this._base_url;
        combined._inherited_details_url = this._inherited_details_url;
        if (this._inherited_details?.rect && emoji._inherited_details_url){
            combined._inherited_details = {url: emoji._inherited_details_url, rect: this._inherited_details.rect};
        }

        combined._face = (this._face && emoji._face) ? this._face.inheritTraits(emoji._face,ignoreTags, swap) : (this._face ?? emoji._face);
        combined._face_rect = this._face_rect;
        combined._is_just_face = this._is_just_face;

        combined._hands = (this._hands && emoji._hands) ? this._hands.inheritTraits(emoji._hands, swap) : (this._hands ?? emoji._hands);
        combined._foreground_layer = this._foreground_layer ?? emoji._foreground_layer;

        combined._additional_objects = CustomEmojiItemObject.mergeItemLists(this._additional_objects, emoji._additional_objects);
        combined._additional_objects_back = CustomEmojiItemObject.mergeItemLists(this._additional_objects_back, emoji._additional_objects_back);

        if (this._rotation || emoji._rotation){
            combined._rotation = ((this._rotation ?? 0) + (emoji._rotation ?? 0)+360)%360;
            if (combined._rotation == 0){
                combined._rotation = undefined;
            }
        }

        return combined;
    }

    private async renderBaseAndFace(){
        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this._base_url != undefined){
            allInstructions.push(new mergeInfo(this._base_url));
        }
        if (this._inherited_details?.url){
            allInstructions.push(new mergeInfo(this._inherited_details.url,this._inherited_details.rect));
        }
        if (this._face){
            //see if we can somehow put this into one command
            const faceString = await this._face.Render();
            if (faceString){
                const image = new mergeInfo(faceString, this._face_rect);
                if (this._face_rect){
                    image.allowCropArea = true;
                }
                else{
                    image.ignoreOffset = true;
                }
                allInstructions.push(image);
            }
        }
        const finishedFaceAndBase = new mergeInfo(await mergeImagesCustom(allInstructions));
        var rect : BaseResizeObject | undefined;

        if (this._is_just_face && !this._face_rect){
            if (this._hands){
                rect = this._hands.getBaseResize();
            }
            if (this._foreground_layer){
                rect = this._foreground_layer.getBaseResize();
            }
        }

        if (rect && rect.hasEffect()){
            finishedFaceAndBase.addAreaRect(rect.getRect(postCropSize()));
            finishedFaceAndBase.allowCropArea = true;
        }
        else{
            finishedFaceAndBase.ignoreOffset = true;
        }


        return finishedFaceAndBase;
    }

    public async render(){
        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this._additional_objects_back){
            //sort this later
            allInstructions.push(...(await CustomEmojiItemObject.getListedMergeInfo(
                this._additional_objects_back.map(value => {return {item : value};})
            )));
        }
        if (this._base_url || this._inherited_details || this._face)
        {
            allInstructions.push(await this.renderBaseAndFace());
        }
        if (this._foreground_layer){
            const mergeInfo = await this._foreground_layer.toMergeDetails();
            if (mergeInfo){
                const resize = this._foreground_layer.getBaseResize();
                if (resize && this._face_rect){
                    mergeInfo.addAreaRect(resize.getInverseRect(this._face_rect));
                }
                allInstructions.push(mergeInfo);
            }
        }
        if (this._hands){
            const mergeInfo = await this._hands.render();
            if (this._face_rect){
                const resize = this._hands.getBaseResize();
                mergeInfo.addAreaRect(resize.getInverseRect(this._face_rect) );
                mergeInfo.allowCropArea = true;
            }
            else{
                mergeInfo.ignoreOffset = true;
            }

            allInstructions.push(mergeInfo);
        }
        if (this._additional_objects){
            //same as aboce
            allInstructions.push(...(await CustomEmojiItemObject.getListedMergeInfo(
                this._additional_objects.map(value => {return {item : value};})
            )));
        }

        if (this._rotation){
            const rotation = new transformInfo();
            rotation.rotate = this._rotation;
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

    public emoji(){
        return this._emoji ?? "";
    }

    private flatDetailsEqual(flat1 : EmojiFlatDetail | undefined, flat2 : EmojiFlatDetail | undefined){

        if (!flat1?.url && !flat2?.url){
            return true;
        }
        return flat1?.url == flat2?.url && isRectEqual(flat1?.rect, flat2?.rect);
    }

    public isEqual(emoji : CustomEmojiObject) : boolean{

        const inherited_details_equal = this.flatDetailsEqual(this._inherited_details, emoji._inherited_details);
        const facesEqual = (this._face && emoji._face ) ? this._face.isEqual(emoji._face) : (!this._face && !emoji._face);
        const faceRectEqual = (this._face && emoji._face) ? isRectEqual(this._face_rect, emoji._face_rect) : true;
        const handsEqual = (this._hands && emoji._hands) ? this._hands.isEqual(emoji._hands) : (!this._hands && !emoji._hands);
        const foregroundEqual = (this._foreground_layer && emoji._foreground_layer) ? this._foreground_layer.isEqual(emoji._foreground_layer) : (!this._foreground_layer && !emoji._foreground_layer);

        const isEqual = this._base_url == emoji._base_url && inherited_details_equal && facesEqual && handsEqual && faceRectEqual &&
        CustomEmojiItemObject.itemListsEqual(this._additional_objects,emoji._additional_objects) &&
        CustomEmojiItemObject.itemListsEqual(this._additional_objects_back,emoji._additional_objects_back) &&
        this._rotation == emoji._rotation &&
        foregroundEqual;
        return isEqual;
    }
}