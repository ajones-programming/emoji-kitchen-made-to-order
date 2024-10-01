import { mergeImagesCustom, mergeInfo, transformInfo } from "./mergeImages";
import { RawFace} from "./types";
import { CustomEmojiItemObject } from "./customEmojiItemObject";
import { getFaceObjectPlacement } from "./utils";

//also put this into a class or something
export class CustomFaceObject{
    private category : string = "smileys";
    private eyes? : CustomEmojiItemObject;
    private eyebrows? : CustomEmojiItemObject;
    private tears? : CustomEmojiItemObject;
    private mouth? : CustomEmojiItemObject;
    private cheeks? : CustomEmojiItemObject;
    private additionalObjects : CustomEmojiItemObject[] = [];

    constructor(face? : RawFace){
        if (face){
            this.category = face.category;
            this.eyes = face.eyes ? new CustomEmojiItemObject(face.eyes) : undefined;
            this.mouth = face.mouth ? new CustomEmojiItemObject(face.mouth) : undefined;
            this.eyebrows = face.eyebrows ? new CustomEmojiItemObject(face.eyebrows) : undefined;
            this.tears = face.tears ? new CustomEmojiItemObject(face.tears) : undefined;
            this.cheeks = face.cheeks ? new CustomEmojiItemObject(face.cheeks) : undefined;
            if (face.additional_parts){
                face.additional_parts.forEach(item =>{
                    this.additionalObjects.push(new CustomEmojiItemObject(item));
                });
            }
        }

    }

    public inheritTraits(face : CustomFaceObject, ignoreTags : boolean = false, swap : boolean = true) : CustomFaceObject{
        const newFace : CustomFaceObject = new CustomFaceObject();
        newFace.category = this.category;
        newFace.eyebrows = CustomEmojiItemObject.InheritTraits(this.eyebrows,face.eyebrows, ignoreTags);
        //swap for eyes?
        newFace.eyes = CustomEmojiItemObject.InheritTraits(face.eyes , this.eyes, ignoreTags);
        newFace.mouth = CustomEmojiItemObject.InheritTraits(swap ? this.mouth : face.mouth, swap ? face.mouth : this.mouth, ignoreTags);
        newFace.tears = CustomEmojiItemObject.InheritTraits(this.tears, face.tears, ignoreTags);
        newFace.cheeks = CustomEmojiItemObject.InheritTraits(this.cheeks, face.cheeks, ignoreTags);
        newFace.additionalObjects = CustomEmojiItemObject.mergeItemLists(this.additionalObjects, face.additionalObjects);
        return newFace;
    }

    public isEqual(face : CustomFaceObject) : boolean{
        return this.category == face.category &&
        CustomEmojiItemObject.IsEqual(this.eyes, face.eyes) &&
        CustomEmojiItemObject.IsEqual(this.eyebrows, face.eyebrows) &&
        CustomEmojiItemObject.IsEqual(this.mouth, face.mouth) &&
        CustomEmojiItemObject.IsEqual(this.cheeks, face.cheeks) &&
        CustomEmojiItemObject.IsEqual(this.tears, face.tears) &&
        CustomEmojiItemObject.itemListsEqual(this.additionalObjects,face.additionalObjects);
    }

    public async Render(){
        const list : mergeInfo[] = [];
        const faceAnchor = getFaceObjectPlacement(this.category);
        if (this.cheeks){
            const anchor = faceAnchor?.cheeks ?? {x : 0, y : 0};
            list.push(await this.cheeks.toMergeInfo(anchor, this.category));
        }
        if (this.eyes){
            const anchor = faceAnchor?.eyes ?? {x : 0, y : 0};
            list.push(await this.eyes.toMergeInfo(anchor, this.category));
        }
        if (this.eyebrows){
            const anchor = {x :faceAnchor?.eyebrows.x ?? 0, y : (faceAnchor?.eyebrows.y ?? 0) + (this.eyes?.getOffset_y() ?? 0) } ;
            list.push(await this.eyebrows.toMergeInfo(anchor, this.category));
        }
        if (this.mouth){
            const anchor = faceAnchor?.mouth ?? {x : 0, y : 0};
            list.push(await this.mouth.toMergeInfo(anchor, this.category));
        }
        if (this.tears){
            const anchor = {x :faceAnchor?.tears.x ?? 0, y : (faceAnchor?.tears.y ?? 0) + (this.eyes?.getOffset_y() ?? 0) } ;
            list.push(await this.tears.toMergeInfo(anchor, this.category));
        }
        if (this.additionalObjects){
            list.push(...(await CustomEmojiItemObject.getListedMergeInfo(
                this.additionalObjects.map(value => {return {item : value};})
            )));
        }
        return await mergeImagesCustom(list);
    }
}