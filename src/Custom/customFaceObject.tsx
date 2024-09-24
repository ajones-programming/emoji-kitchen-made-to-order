import { mergeImagesCustom, mergeInfo } from "./mergeImages";
import { FaceData} from "./types";
import { CustomEmojiItemObject } from "./customEmojiItemObject";

//also put this into a class or something
export class CustomFaceObject{
    private category : string = "smileys";
    private eyes? : CustomEmojiItemObject;
    private eyeDecoration? : CustomEmojiItemObject;
    private mouth? : CustomEmojiItemObject;

    constructor(face? : FaceData){
        if (face){
            this.category = face.category;
            this.eyes = face.eyes ? new CustomEmojiItemObject(face.eyes) : undefined;
            this.mouth = face.mouth ? new CustomEmojiItemObject(face.mouth) : undefined;
            this.eyeDecoration = face.eyeDecoration ? new CustomEmojiItemObject(face.eyeDecoration) : undefined;
        }

    }

    public inheritTraits(face : CustomFaceObject) : CustomFaceObject{
        const newFace : CustomFaceObject = new CustomFaceObject();
        newFace.category = this.category;
        newFace.eyes = CustomEmojiItemObject.InheritTraits(this.eyes, face?.eyes);
        newFace.mouth = CustomEmojiItemObject.InheritTraits(this.mouth, face?.mouth);
        newFace.eyeDecoration = CustomEmojiItemObject.InheritTraits(this.eyeDecoration, face?.eyeDecoration);
        return newFace;
    }

    public isEqual(face : CustomFaceObject) : boolean{
        return this.category == face.category &&
        CustomEmojiItemObject.IsEqual(this.eyes, face.eyes) &&
        CustomEmojiItemObject.IsEqual(this.mouth, face.mouth) &&
        CustomEmojiItemObject.IsEqual(this.eyeDecoration, face.eyeDecoration);
    }

    public async Render(){
        const list : mergeInfo[] = [];
        if (this.eyes){
            list.push(await this.eyes.toMergeInfo({x: 150, y: 112}, this.category));
        }
        if (this.mouth){
            list.push(await this.mouth.toMergeInfo({x : 150, y: 213}, this.category));
        }
        if (this.eyeDecoration){
            list.push(await this.eyeDecoration.toMergeInfo({x: 150, y: 112 + (this.eyes?.getOffset_y() ?? 0)}, this.category));
        }
        return await mergeImagesCustom(list);
    }
}