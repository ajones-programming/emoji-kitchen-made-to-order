import { mergeImagesCustom, imageInfo, transformInfo} from "./mergeImages";
import { MergedCanvas } from "./mergedCanvas";
import { RawFace, Rect} from "./types";
import { CustomEmojiItemObject } from "./customEmojiItemObject";
import { getFaceObjectPlacement } from "./utils";

//also put this into a class or something
export class CustomFaceObject{
    private category : string = "smileys";
    private eyes? : CustomEmojiItemObject;
    private eyebrows? : CustomEmojiItemObject;
    private nose ? : CustomEmojiItemObject;
    private tears? : CustomEmojiItemObject;
    private mouth? : CustomEmojiItemObject;
    private cheeks? : CustomEmojiItemObject;
    private additionalObjects : CustomEmojiItemObject[] = [];
    private rotation? : number;

    private _canvas? : MergedCanvas;

    constructor(face? : RawFace){
        if (face){
            this.category = face.category;
            this.eyes = face.eyes ? new CustomEmojiItemObject(face.eyes) : undefined;
            this.nose = face.nose ? new CustomEmojiItemObject(face.nose) : undefined;
            this.mouth = face.mouth ? new CustomEmojiItemObject(face.mouth) : undefined;
            this.eyebrows = face.eyebrows ? new CustomEmojiItemObject(face.eyebrows) : undefined;
            this.tears = face.tears ? new CustomEmojiItemObject(face.tears) : undefined;
            this.cheeks = face.cheeks ? new CustomEmojiItemObject(face.cheeks) : undefined;
            if (face.additional_parts){
                face.additional_parts.forEach(item =>{
                    this.additionalObjects.push(new CustomEmojiItemObject(item));
                });
            }
            if (face.rotation){
                this.rotation = (face.rotation + 360)%360;
            }
        }

    }

    public static Inherit(face1 : CustomFaceObject, face2 : CustomFaceObject, ignoreTags = false){
        const newFaces = [
            face1.inheritTraits(face2, ignoreTags, false),
            face1.inheritTraits(face2, ignoreTags, true),
            face2.inheritTraits(face1, ignoreTags, false),
            face2.inheritTraits(face1, ignoreTags, true)
        ];
        const toPush : CustomFaceObject[] = [];
        newFaces.forEach(face =>
        {
            var canPush = true;
            toPush.forEach(toCompare =>{
                if (face.isEqual(toCompare)){
                    canPush = false;
                }
            })

            if (canPush){
                if (face.isEqual(face1)){
                    toPush.push(face1);
                }
                else if (face.isEqual(face2)){
                    toPush.push(face2);
                }
                else{
                    toPush.push(face);
                }

            }
        }
        )
        return toPush;
    }

    public inheritTraits(face : CustomFaceObject, ignoreTags : boolean = false, swap : boolean = true) : CustomFaceObject{
        const newFace : CustomFaceObject = new CustomFaceObject();
        newFace.category = this.category;
        newFace.eyebrows = CustomEmojiItemObject.InheritTraits(this.eyebrows,face.eyebrows, ignoreTags);
        newFace.eyes = CustomEmojiItemObject.InheritTraits(face.eyes , this.eyes, ignoreTags);
        newFace.nose = CustomEmojiItemObject.InheritTraits(this.nose, face.nose, ignoreTags);
        newFace.mouth = CustomEmojiItemObject.InheritTraits(swap ? this.mouth : face.mouth, swap ? face.mouth : this.mouth, ignoreTags);
        newFace.tears = CustomEmojiItemObject.InheritTraits(this.tears, face.tears, ignoreTags);
        newFace.cheeks = CustomEmojiItemObject.InheritTraits(this.cheeks, face.cheeks, ignoreTags);
        newFace.additionalObjects = CustomEmojiItemObject.mergeItemLists(this.additionalObjects, face.additionalObjects);
        if (this.rotation || face.rotation){
            newFace.rotation = ((this.rotation ?? 0) + (face.rotation ?? 0)+ 360)%360;
            if (newFace.rotation == 0){
                newFace.rotation = undefined;
            }
        }
        return newFace;
    }

    public isEqual(face : CustomFaceObject) : boolean{
        return this.category == face.category &&
        CustomEmojiItemObject.IsEqual(this.eyes, face.eyes) &&
        CustomEmojiItemObject.IsEqual(this.eyebrows, face.eyebrows) &&
        CustomEmojiItemObject.IsEqual(this.nose, face.nose) &&
        CustomEmojiItemObject.IsEqual(this.mouth, face.mouth) &&
        CustomEmojiItemObject.IsEqual(this.cheeks, face.cheeks) &&
        CustomEmojiItemObject.IsEqual(this.tears, face.tears) &&
        CustomEmojiItemObject.itemListsEqual(this.additionalObjects,face.additionalObjects) &&
        this.rotation == face.rotation;
    }
    public getExpansionRect() : Rect | undefined{
        var rect : Rect | undefined;
        var newRect;
        const faceAnchor = getFaceObjectPlacement(this.category);
        if (newRect = this.nose?.getRectSize(faceAnchor?.nose)){
            if (!rect){
                rect = newRect;
            }
            else{
                rect.x = Math.min(rect.x,newRect.x);
                rect.y = Math.min(rect.y, newRect.y);
                rect.width = Math.max(rect.width, newRect.width);
                rect.height = Math.max(rect.height, newRect.height);
            }
        }
        return rect;
    }

    public async Render(){
        if (this._canvas){
            return this._canvas;
        }
        const list : (imageInfo | transformInfo)[] = [];
        const faceAnchor = getFaceObjectPlacement(this.category);
        if (this.cheeks?.can_render()){
            const anchor = faceAnchor?.cheeks ?? {x : 0, y : 0};
            list.push(this.cheeks.toImageInfo(anchor, this.category));
        }
        if (this.eyes?.can_render()){
            const anchor = faceAnchor?.eyes ?? {x : 0, y : 0};
            list.push(this.eyes.toImageInfo(anchor, this.category));
        }
        if (this.eyebrows?.can_render()){
            const anchor = {x : (faceAnchor?.eyebrows.x ?? 0) + (this.eyes?.getOffset_x() ?? 0), y : (faceAnchor?.eyebrows.y ?? 0) + (this.eyes?.getOffset_y() ?? 0) } ;
            list.push(this.eyebrows.toImageInfo(anchor, this.category));
        }
        if (this.mouth?.can_render()){
            const anchor = faceAnchor?.mouth ?? {x : 0, y : 0};
            list.push(this.mouth.toImageInfo(anchor, this.category));
        }
        if (this.tears?.can_render()){
            const anchor = {x : (faceAnchor?.tears.x ?? 0) + (this.eyes?.getOffset_x() ?? 0), y : (faceAnchor?.tears.y ?? 0) + (this.eyes?.getOffset_y() ?? 0) } ;
            list.push(this.tears.toImageInfo(anchor, this.category));
        }
        if (this.nose?.can_render()){
            const anchor = faceAnchor?.nose ?? {x : 0, y : 0};
            list.push(this.nose.toImageInfo(anchor, this.category));
        }
        if (this.additionalObjects && this.additionalObjects.length > 0){
            list.push(...(CustomEmojiItemObject.getListedImageInfo(
                this.additionalObjects.map(value => {return {item : value};})
            )));
        }
        if (this.rotation){
            const transform = new transformInfo();
            transform.rotate = this.rotation;
            list.push(transform);
        }
        this._canvas = await mergeImagesCustom(list);
        return this._canvas;
    }
}