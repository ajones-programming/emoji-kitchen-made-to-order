import { imageInfo } from "./mergeImages";
import { RawEmojiItem, ItemAnchor } from "./types";

export interface itemMergeDetails{
    item : CustomEmojiItemObject;
    anchor? : ItemAnchor;
    category? : string;
}


export class CustomEmojiItemObject{
    private url : string = "";
    private offset_x : number = 0;
    private offset_y : number = 0;
    private scale_x : number = 1.0;
    private scale_y : number = 1.0;
    private auto_scale : boolean = false;
    private proportionate : boolean = false;
    private ignore_properties : boolean = false;
    private num_of_copies : number = 1;
    private copy_vertically : boolean = false;
    private set_copy_offset?:number;
    private can_copy : boolean = false;

    private custom_anchor? : ItemAnchor;

    constructor(item? : RawEmojiItem, copy? : CustomEmojiItemObject){
        if (item){
            this.url = item.url;
            this.offset_x = item.offset_x ?? 0;
            this.offset_y = item.offset_y ?? 0;
            this.scale_x = item.scale_x ?? 1.0;
            this.scale_y = item.scale_y ?? 1.0;
            this.auto_scale = item.auto_scale ?? false;
            this.proportionate = item.proportionate ?? false;
            this.ignore_properties = item.ignore_properties ?? false;
            this.copy_vertically = item.copy_vertically ?? false;
            this.set_copy_offset = item.copy_set_offset;
            this.can_copy = item.can_copy ?? false;
            this.custom_anchor = item.custom_anchor;
        }
        if (copy){
            this.url = copy.url;
            this.offset_x = copy.offset_x;
            this.offset_y = copy.offset_y;
            this.scale_x = copy.scale_x;
            this.scale_y = copy.scale_y;
            this.auto_scale = copy.auto_scale;
            this.proportionate = copy.proportionate;
            this.ignore_properties = copy.ignore_properties;
            this.num_of_copies = copy.num_of_copies;
            this.copy_vertically = copy.copy_vertically;
            this.set_copy_offset = copy.set_copy_offset;
            this.can_copy = copy.can_copy;
            this.custom_anchor = copy.custom_anchor;
        }
    }
    public static InheritTraits(base : CustomEmojiItemObject | undefined, toBeInherited : CustomEmojiItemObject | undefined,
        ignoreTags : boolean = false){
        return (base && toBeInherited) ? base.inheritTraits(toBeInherited, ignoreTags) : (base ?? toBeInherited);
    }



    private inheritTraits(item : CustomEmojiItemObject, ignoreTags : boolean = false){

        var newItem : CustomEmojiItemObject = new CustomEmojiItemObject();
        const itemURLEqual = this.url == item.url;
        const ignoreProperty = item.ignore_properties&&!ignoreTags;

        newItem.url = this.url;
        if (!newItem.can_render()){
            return newItem;
        }

        newItem.custom_anchor = this.custom_anchor;

        newItem.offset_x = this.offset_x + (ignoreProperty ? 0 :item.offset_x);
        newItem.offset_y = this.offset_y + (ignoreProperty ? 0 : item.offset_y);
        newItem.scale_x = this.scale_x * item.scale_x;//(ignoreProperty ? 1.0 : item.scale_x);
        newItem.scale_y = this.scale_y * item.scale_y;//(ignoreProperty ? 1.0 : item.scale_y);
        newItem.auto_scale = this.auto_scale;
        //this is not correct, it should be able to scale more somehow, but idk how
        const willAutoScale = ((this.scale_x == 1.0 && this.scale_y == 1.0) || (item.scale_x == 1.0 && item.scale_y == 1.0)) &&
        ((this.auto_scale && item.auto_scale) || ignoreTags);
        if (itemURLEqual &&  willAutoScale){
            newItem.scale_x *= 1.25;
            newItem.scale_y *= 1.25;
        }

        if (this.proportionate){
            const minimum = newItem.scale_x < newItem.scale_y ? newItem.scale_x : newItem.scale_y;
            newItem.scale_x = minimum;
            newItem.scale_y = minimum;
            newItem.proportionate = true;
        }
        if (!ignoreTags){
            newItem.capOffsets(-20,20,-45,40);
        }

        return newItem;
    }

    public static IsEqual(item1 : CustomEmojiItemObject | undefined, item2 : CustomEmojiItemObject | undefined ){
        return (item1 && item2) ? item1.isEqual(item2) : (!item1 && !item2);
    }

    private significantDiff(x : number,y : number,boundary:number){
        return Math.abs(x-y) > boundary;
    }

    private isEqual(item : CustomEmojiItemObject, includeCopies = true): boolean{
        return this.url == item.url &&
        !this.significantDiff(this.offset_x ?? 0, item.offset_x ?? 0, 30) &&
        !this.significantDiff(this.offset_y ?? 0, item.offset_y ?? 0, 30) &&
        !this.significantDiff(this.scale_x ?? 1, item.scale_x ?? 1, 0.05) &&
        !this.significantDiff(this.scale_y ?? 1, item.scale_y ?? 1, 0.05) &&
        (includeCopies ? this.num_of_copies == item.num_of_copies : true) &&
        (includeCopies ? this.copy_vertically == item.copy_vertically : true) &&
        (includeCopies ? this.set_copy_offset == item.set_copy_offset : true);
    }

    private getFullURL(category? : string){
        return "./assets/custom/" + (category ? (category + "/") : "") + this.url + ".png";
    }

    public capOffsets(min_x : number, max_x : number, min_y : number, max_y : number){
        if (this.offset_x < min_x){
            this.offset_x = min_x;
        }
        else if (this.offset_x > max_x){
            this.offset_x = max_x;
        }
        if (this.offset_y < min_y){
            this.offset_y = min_y;
        }
        if (this.offset_y > max_y){
            this.offset_y = max_y;
        }
    }

    public can_render() {
        return this.url != "";
    }

    public toImageInfo(anchor? : ItemAnchor, category? : string){
        var x = this.offset_x;
        var y = this.offset_y;
        var width : number | undefined;
        var height : number | undefined;
        const info : imageInfo = new imageInfo(this.getFullURL(category));
        info.x = x;
        info.y = y;
        info.width = width;
        info.height = height;
        info.copies = this.num_of_copies;
        info.copy_vertically = this.copy_vertically;
        info.set_copy_offset = this.set_copy_offset;
        info.anchor = anchor;
        info.custom_anchor = this.custom_anchor;
        info.scale_x = this.scale_x != 1.0 ? this.scale_x : undefined;
        info.scale_y = this.scale_y != 1.0 ? this.scale_y : undefined;
        return info;
    }

    private static toImageInfo (value : itemMergeDetails){
        return value.item.toImageInfo(value.anchor,value.category);
    }

    public static getListedImageInfo(itemList: itemMergeDetails[]){
        return itemList.map(this.toImageInfo);
    }

    public static mergeItemLists(itemList1 : CustomEmojiItemObject[], itemList2 : CustomEmojiItemObject[]){
        const newList : CustomEmojiItemObject[] = [];
        const list1 : CustomEmojiItemObject[] = itemList1.map(x => new CustomEmojiItemObject(undefined,x));
        const list2 : (CustomEmojiItemObject| undefined)[]  = itemList2.map(x => new CustomEmojiItemObject(undefined,x));
        list1.forEach(value =>
        {
            const copy = list2.findIndex(val2 => val2 ? value.isEqual(val2,false) : false);
            if (copy > -1){
                list2[copy] = undefined;
                if (value.can_copy){
                    value.num_of_copies++;
                }
            }
            newList.push(value);
        });
        list2.forEach(value =>
        {
            if (value){
                newList.push(value);
            }
        }
        );
        return newList;
    }

    //assuming same item position
    public static itemListsEqual(itemList1 : CustomEmojiItemObject[], itemList2 : CustomEmojiItemObject[]){
        if (itemList1.length != itemList2.length){
            return false;
        }
        for (var i = 0; i < itemList1.length; ++i){
            if (!itemList1[i].isEqual(itemList2[i])){
                return false;
            }
        }
        return true;
    }

    public getOffset_x(){return this.offset_x};
    public getOffset_y(){return this.offset_y};
}