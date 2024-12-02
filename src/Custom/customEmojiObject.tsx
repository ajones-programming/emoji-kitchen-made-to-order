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

    public static CreateInherited(emoji1 : CustomEmojiObject, emoji2 : CustomEmojiObject, ignoreTags = false){
        //create all unique attributes, then assign emojis to each of them

        const allInherited : CustomEmojiObject[] = [];

        const allBackgrounds = (emoji1._base && emoji2._base) ? BaseObject.Inherit(emoji1._base, emoji2._base) : [emoji1._base ?? emoji2._base];
        const allFaces = (emoji1._face && emoji2._face) ? CustomFaceObject.Inherit(emoji1._face, emoji2._face,ignoreTags) : [emoji1._face ?? emoji2._face];
        const allHands = (emoji1._hands && emoji2._hands) ? CustomHands.Inherit(emoji1._hands, emoji2._hands) : [emoji1._hands ?? emoji2._hands];
        const foregroundLayers = emoji1._foreground_layer && emoji2._foreground_layer ? [emoji1._foreground_layer, emoji2._foreground_layer] : [emoji1._foreground_layer ?? emoji2._foreground_layer];

        const additionalObjects = CustomEmojiItemObject.mergeItemLists(emoji1._additional_objects, emoji2._additional_objects);
        const additionalObjectsBack = CustomEmojiItemObject.mergeItemLists(emoji1._additional_objects_back, emoji2._additional_objects_back);
        var rotation : number | undefined;
        if (emoji1._rotation || emoji2._rotation)
            {
                rotation = ((emoji1._rotation ?? 0) + (emoji2._rotation ?? 0)+360)%360;
                if (rotation == 0){
                    rotation = undefined;
                }
            }

        allBackgrounds.forEach((background, index) =>{
            allFaces.forEach((face, face_index) =>{
                allHands.forEach((hand, hand_index) =>{
                    foregroundLayers.forEach((layer, layer_index) =>{
                        const newEmoji = new CustomEmojiObject();
                        newEmoji._id = emoji1.id() + emoji2.id() + ":" + index.toString() + "-" + face_index.toString() + "-" + hand_index.toString() + "-" + layer_index.toString();
                        newEmoji._emoji = emoji1.emoji() + emoji2.emoji() + ":" + index.toString() + "-" + face_index.toString() + "-" + hand_index.toString() + "-" + layer_index.toString();
                        newEmoji._base = background;
                        newEmoji._face = face;
                        newEmoji._hands = hand;
                        newEmoji._additional_objects = additionalObjects;
                        newEmoji._additional_objects_back = additionalObjectsBack;
                        newEmoji._rotation = rotation;
                        newEmoji._foreground_layer =  layer;
                        allInherited.push(newEmoji);
                    });

                })
            })
        })

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

        var rect : BaseResizeObject | undefined;

        if (this._face && !this._base?.GetFaceRect()){
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

        //does it have a resize?




        if (rect && rect.hasEffect()){
            const finishedFaceMergeInfo = new mergeInfo(await mergeImagesCustom(allInstructions));
            finishedFaceMergeInfo.addAreaRect(rect.getRect(postCropSize()));
            finishedFaceMergeInfo.allowCropArea = true;
            return [finishedFaceMergeInfo];
        }


        return allInstructions;
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
                const faceRect = this._base?.GetFaceRect();
                if (resize && faceRect){
                    mergeInfo.addAreaRect(resize.getInverseRect(faceRect));
                }
                allInstructions.push(mergeInfo);
            }
        }
        if (this._hands){
            const mergeInfo = await this._hands.render();
            const faceRect = this._base?.GetFaceRect();
            if (faceRect){
                const resize = this._hands.getBaseResize();
                mergeInfo.addAreaRect(resize.getInverseRect(faceRect) );
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