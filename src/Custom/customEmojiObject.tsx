import { mergeImagesCustom, imageInfo, targetSize, transformInfo} from './mergeImages';
import { MergedCanvas } from "./mergedCanvas";
import { RawEmojiContent} from './types';
import { CustomFaceObject } from './customFaceObject';
import { CustomEmojiItemObject } from './customEmojiItemObject';
import { CustomHands } from './customHands';
import { BaseResizeObject } from './baseResizeObject';
import { CustomLayer } from './customLayerObject';
import { getNotoEmojiUrl } from './utils';
import { BaseObject } from './baseObject';
import { Shake } from './SpecialCases/shake';


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

    private _specialFeatures : string[]=[];

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
                "./assets/custom/" + (data.base_url ?? "") + ".webp",
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

            if (data.special_features){
                this._specialFeatures = data.special_features;
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
        const allSpecialFeatures : string[] = [];
        if (emoji1._specialFeatures.length > 0){
            allSpecialFeatures.push(...emoji1._specialFeatures);
        }
        if (emoji2._specialFeatures.length > 0){
            allSpecialFeatures.push(...emoji2._specialFeatures);
        }

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
                        newEmoji._specialFeatures = allSpecialFeatures;
                        allInherited.push(newEmoji);
                    });

                })
            })
        })

        return allInherited;
    }

    private async renderBaseAndFace(){
        const allInstructions : (imageInfo | transformInfo) [] = [];
        if (this._base){
            const baseData = await this._base.render();
            if (baseData){
                const base = new imageInfo(baseData);
                allInstructions.push(base);
            }
        }
        if (this._face){
            //see if we can somehow put this into one command
            const face = await this._face.Render();
            if (face){
                const image = new imageInfo(face, this._base?.GetFaceRect());
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
        }

        if (rect && rect.hasEffect()){
            const finishedFaceImageInfo = new imageInfo(await mergeImagesCustom(allInstructions),rect.getRect(targetSize()));
            return [finishedFaceImageInfo];
        }


        return allInstructions;
    }


    async finalTouches(canvas : MergedCanvas){
        for (const feature of this._specialFeatures){
            switch(feature){
                case "SHAKE":
                    canvas = await Shake(canvas);
                    break;
            }
        }
        return canvas;
    }

    public async render(){
        if (this._url){
            const item = document.getElementById(this.id()) as HTMLImageElement;
            if (item != null){
                item.src = this._url;
            }
            return;
        }
        const allInstructions : (imageInfo | transformInfo) [] = [];
        if (this._additional_objects_back && this._additional_objects_back.length > 0){
            //sort this later
            allInstructions.push(...(CustomEmojiItemObject.getListedImageInfo(
                this._additional_objects_back.map(value => {return {item : value};})
            )));
        }
        if (this._base || this._face)
        {
            allInstructions.push(...await this.renderBaseAndFace());
        }
        if (this._foreground_layer){
            const imageInfo = this._foreground_layer.toMergeDetails();
            if (imageInfo){
                const resize = this._foreground_layer.getBaseResize();
                const faceRect = this._base?.GetFaceRect();
                if (resize && faceRect){
                    imageInfo.addAreaRect(resize.getInverseRect(faceRect));
                }
                allInstructions.push(imageInfo);
            }
        }
        if (this._hands){
            const imageInfo = await this._hands.render();
            const faceRect = this._base?.GetFaceRect();
            if (faceRect){
                const resize = this._hands.getBaseResize();
                imageInfo.addAreaRect(resize.getInverseRect(faceRect) );
            }

            allInstructions.push(imageInfo);
        }
        if (this._additional_objects && this._additional_objects.length > 0){
            //same as aboce
            allInstructions.push(...(CustomEmojiItemObject.getListedImageInfo(
                this._additional_objects.map(value => {return {item : value};})
            )));
        }

        if (this._rotation){
            const rotation = new transformInfo();
            rotation.rotate = this._rotation;
            allInstructions.push(rotation);
        }

        var fullCanvas = await mergeImagesCustom(allInstructions);
        if (fullCanvas){
            fullCanvas = await this.finalTouches(fullCanvas);
        }
        const croppedCanvas = fullCanvas?.cropCanvas();

        this._url = croppedCanvas;

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

    //ADD SPECIAL FEATURES
    public isEqual(emoji : CustomEmojiObject) : boolean{

        const baseEqual = (this._base && emoji._base ) ? this._base.isEqual(emoji._base) : (!this._base && !emoji._base);
        const facesEqual = (this._face && emoji._face ) ? this._face.isEqual(emoji._face) : (!this._face && !emoji._face);
        const handsEqual = (this._hands && emoji._hands) ? this._hands.isEqual(emoji._hands) : (!this._hands && !emoji._hands);
        const foregroundEqual = (this._foreground_layer && emoji._foreground_layer) ? this._foreground_layer.isEqual(emoji._foreground_layer) : (!this._foreground_layer && !emoji._foreground_layer);
        const specialFeaturesEqual = (this._specialFeatures.length == emoji._specialFeatures.length);

        const isEqual = baseEqual && facesEqual && handsEqual &&// faceRectEqual &&
        CustomEmojiItemObject.itemListsEqual(this._additional_objects,emoji._additional_objects) &&
        CustomEmojiItemObject.itemListsEqual(this._additional_objects_back,emoji._additional_objects_back) &&
        this._rotation == emoji._rotation &&
        foregroundEqual && specialFeaturesEqual;
        return isEqual;
    }
}