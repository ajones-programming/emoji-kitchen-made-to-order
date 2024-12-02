import { mergeImagesCustom, mergeInfo, transformInfo } from "./mergeImages";
import { isRectEqual } from "./ResizeFunctions";
import { EmojiFlatDetail, Rect } from "./types";

export class BaseObject{

    private _src? : string;
    private _isCropped : boolean = false;

    private _base_url? : string;
    private _inherited_details_url ? : string;
    private _inherited_details? : EmojiFlatDetail;
    private _face_rect? : Rect;


    constructor(base_url? : string, inherited_details_url? : string, inherited_details_rect? : Rect, face_rect? : Rect){
        this._base_url =  base_url;
        if (inherited_details_url){
            this._inherited_details_url = inherited_details_url;
        }
        if (inherited_details_rect){
            this._inherited_details = {rect: inherited_details_rect};
        }
        if (face_rect){
            this._face_rect = face_rect;
        }
    }

    private flatDetailsEqual(flat1 : EmojiFlatDetail | undefined, flat2 : EmojiFlatDetail | undefined){

        if (!flat1?.url && !flat2?.url){
            return true;
        }
        return flat1?.url == flat2?.url && isRectEqual(flat1?.rect, flat2?.rect);
    }

    public isEqual(base : BaseObject){

        return this._base_url == base._base_url && this.flatDetailsEqual(this._inherited_details, base._inherited_details);
    }

    public inherit(base1 : BaseObject){

        //if it will be the same as the base, don't bother - if neither have inheritence rects?
        //figure that out later lmao
        const newBase = new BaseObject();

        newBase._base_url = this._base_url;
        newBase._inherited_details_url = this._inherited_details_url;
        if (this._inherited_details?.rect && base1._inherited_details_url){
            newBase._inherited_details = {url: base1._inherited_details_url, rect: this._inherited_details.rect};
        }
        //this only comes with backgrounds with inherited details?
        newBase._face_rect = this._face_rect;
        return newBase;
    }

    public static Inherit(base1 : BaseObject, base2 : BaseObject) : BaseObject[]{
        const newBase1 = base1.inherit(base2);
        const newBase2 = base2.inherit(base1);
        if (newBase1.isEqual(newBase2)){
            return [newBase1];
        }
        return [newBase1, newBase2];
    }


    public GetFaceRect(){
        return this._face_rect;
    }

    private returnFromRender(){
        return {src: this._src ?? "", cropped : this._isCropped };
    }

    public async render()
    {
        if (this._src){
            return this.returnFromRender();
        }
        if (this._base_url && !this._inherited_details_url){
            this._src = this._base_url;
            this._isCropped = true;
            return this.returnFromRender();
        }

        const allInstructions : (mergeInfo | transformInfo) [] = [];
        if (this._base_url != undefined){
            allInstructions.push(new mergeInfo(this._base_url));
        }
        if (this._inherited_details?.url){
            allInstructions.push(new mergeInfo(this._inherited_details.url,this._inherited_details.rect));
        }
        this._src = await mergeImagesCustom(allInstructions);
        this._isCropped = false;
        return this.returnFromRender();
    }
}