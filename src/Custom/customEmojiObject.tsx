import { mergeImagesCustom, mergeInfo, postCropSize, transformInfo } from './mergeImages';
import { RawEmojiContent} from './types';
import { CustomFaceObject } from './customFaceObject';
import { CustomEmojiItemObject } from './customEmojiItemObject';
import { CustomHands } from './customHands';
import { BaseResizeObject } from './baseResizeObject';
import { CustomLayer } from './customLayerObject';
import { getNotoEmojiUrl } from './utils';
import { BaseObject } from './baseObject';


export class CustomEmojiObject{
    private _id? : string;
    private _emoji? : string;
    private _url? : string;

    private _base? : BaseObject;

    private _face? : CustomFaceObject;

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
            this._url = getNotoEmojiUrl(id ?? "");
            this._base = new BaseObject(
                "./assets/custom/" + (data.base_url ?? "") + ".png",
                (data.inherited_details_url ? "./assets/custom/" + data.inherited_details_url + ".png" : undefined),
                data.inherited_details_rect,
                data.face_rect
            );

            this._face = data.face ? new CustomFaceObject(data.face) : undefined;

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

    public sameBackground(emoji: CustomEmojiObject){
        return emoji._base_url == this._base_url && this.flatDetailsEqual(this._inherited_details, emoji._inherited_details);;
    }

    public createInherited( emoji : CustomEmojiObject, ignoreTags : boolean = false)
    {
        //now do this again for swapping?
        const allInherited : CustomEmojiObject[] = [];
        allInherited.push(new CustomEmojiObject());
        allInherited.push(new CustomEmojiObject());
        if (!this.sameBackground(emoji)){
            allInherited.push(new CustomEmojiObject);
            allInherited.push(new CustomEmojiObject());
        }

        allInherited.forEach((value, index) => {
            const swapBackground = index > 2;
            if (swapBackground){
                const previous = allInherited[index%2];
                value._id = previous._id + "SB";
                value._emoji = previous._emoji + "SB";
                value._face = previous._face;
                value._hands = previous._hands;
                value._foreground_layer = previous._foreground_layer;
                value._additional_objects = previous._additional_objects;
                value._additional_objects_back = previous._additional_objects_back;
                value._rotation = previous._rotation;
            }
            else{
                const swap = index % 2 == 1;
                if (swap){
                    const previous = allInherited[index - 1];
                    value._additional_objects = previous._additional_objects;
                    value._additional_objects_back = previous._additional_objects_back;
                    value._rotation = previous._rotation;
                }
                else{
                    value._additional_objects = CustomEmojiItemObject.mergeItemLists(this._additional_objects, emoji._additional_objects);
                    value._additional_objects_back = CustomEmojiItemObject.mergeItemLists(this._additional_objects_back, emoji._additional_objects_back);
                    if (this._rotation || emoji._rotation)
                    {
                        value._rotation = ((this._rotation ?? 0) + (emoji._rotation ?? 0)+360)%360;
                        if (value._rotation == 0){
                            value._rotation = undefined;
                        }
                    }
                }

                //inherit face and hands?
                value._id = this.id() + (swap ? "" : "(" + this.id() + ")")+ emoji.id();
                value._emoji = (this._emoji ?? "") + (swap ? "" :"(" + (this._emoji??"") + ")" ) + (emoji._emoji ?? "");
                value._face = (this._face && emoji._face) ? this._face.inheritTraits(emoji._face,ignoreTags, swap) : (this._face ?? emoji._face);

                value._hands = (this._hands && emoji._hands) ? this._hands.inheritTraits(emoji._hands, swap) : (this._hands ?? emoji._hands);
                value._foreground_layer = this._foreground_layer ?? emoji._foreground_layer;
            }

            const base = (swapBackground ? emoji : this);
            const inherited = (swapBackground ? this : emoji)._inherited_details_url;

            value._base_url = base._base_url;
            value._inherited_details_url = base._inherited_details_url;
            if (base._inherited_details?.rect && inherited){
                value._inherited_details = {url: inherited, rect: base._inherited_details.rect};
            }
            value._face_rect = base._face_rect;
            value._is_just_face = base._is_just_face;

        });
        return allInherited;
    }

    private async renderBaseAndFace(){
        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this._base){
            const baseData = await this._base.render();
            const base = new mergeInfo(baseData.src);
            base.ignoreOffset = !baseData.cropped;
            allInstructions.push(base);
        }
        if (this._face){
            //see if we can somehow put this into one command
            const faceString = await this._face.Render();
            if (faceString){
                const image = new mergeInfo(faceString, this._base?.GetFaceRect());

                //if face rect
                if (this._base?.GetFaceRect()){
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
            const faceRect = this._face?.getExpansionRect();
            if (faceRect){
                rect = new BaseResizeObject(undefined,faceRect);
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
        if (this._url){
            const item = document.getElementById(this.id()) as HTMLImageElement;
            if (item != null){
                item.src = this._url;
            }
            return;
        }
        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this._additional_objects_back){
            //sort this later
            allInstructions.push(...(await CustomEmojiItemObject.getListedMergeInfo(
                this._additional_objects_back.map(value => {return {item : value};})
            )));
        }
        if (this._base || this._face)
        {
            allInstructions.push(...await this.renderBaseAndFace());
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
            const faceRect = this._base?.GetFaceRect();
            if (faceRect){
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


        this._url = await mergeImagesCustom(allInstructions,true);

        const item = document.getElementById(this.id()) as HTMLImageElement;
        if (item != null){
            item.src = this._url ?? "";
        }
    }

    public id(){
        return this._id ?? "";
    }

    public emoji(){
        return this._emoji ?? "";
    }

    public url(){
        return this._url ?? "assets/custom/loading.png";
    }

    public isEqual(emoji : CustomEmojiObject) : boolean{

        const baseEqual = (this._base && emoji._base ) ? this._base.isEqual(emoji._base) : (!this._base && !emoji._base);
        const facesEqual = (this._face && emoji._face ) ? this._face.isEqual(emoji._face) : (!this._face && !emoji._face);
        const handsEqual = (this._hands && emoji._hands) ? this._hands.isEqual(emoji._hands) : (!this._hands && !emoji._hands);
        const foregroundEqual = (this._foreground_layer && emoji._foreground_layer) ? this._foreground_layer.isEqual(emoji._foreground_layer) : (!this._foreground_layer && !emoji._foreground_layer);

        const isEqual = baseEqual && facesEqual && handsEqual &&// faceRectEqual &&
        CustomEmojiItemObject.itemListsEqual(this._additional_objects,emoji._additional_objects) &&
        CustomEmojiItemObject.itemListsEqual(this._additional_objects_back,emoji._additional_objects_back) &&
        this._rotation == emoji._rotation &&
        foregroundEqual;
        return isEqual;
    }
}