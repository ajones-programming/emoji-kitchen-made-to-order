import { GetDimensions } from "./image";
import { mergeInfo } from "./mergeImages";
import { EmojiItem, ItemAnchor } from "./types";


export class CustomEmojiItemObject{
    private url : string = "";
    private isDominant : boolean = false;
    private offset_x : number = 0;
    private offset_y : number = 0;
    private scale_x : number = 1.0;
    private scale_y : number = 1.0;
    private auto_scale : boolean = false;
    private proportionate : boolean = false;
    private always_recessive : boolean = false;
    private numOfCopies : number = 1;
    private copy_vertically : boolean = false;
    private set_copy_offset?:number;

    constructor(item? : EmojiItem, copy? : CustomEmojiItemObject){
        if (item){
            this.url = item.url;
            this.isDominant = item.isDominant ?? false;
            this.offset_x = item.offset_x ?? 0;
            this.offset_y = item.offset_y ?? 0;
            this.scale_x = item.scale_x ?? 1.0;
            this.scale_y = item.scale_y ?? 1.0;
            this.auto_scale = item.auto_scale ?? false;
            this.proportionate = item.proportionate ?? false;
            this.always_recessive = item.always_recessive ?? false;
            this.copy_vertically = item.copy_vertically ?? false;
            this.set_copy_offset = item.copy_set_offset;

        }
        if (copy){
            this.url = copy.url;
            this.isDominant = copy.isDominant;
            this.offset_x = copy.offset_x;
            this.offset_y = copy.offset_y;
            this.scale_x = copy.scale_x;
            this.scale_y = copy.scale_y;
            this.auto_scale = copy.auto_scale;
            this.proportionate = copy.proportionate;
            this.always_recessive = copy.always_recessive;
            this.numOfCopies = copy.numOfCopies;
            this.copy_vertically = copy.copy_vertically;
            this.set_copy_offset = copy.set_copy_offset;
        }
    }
    public static InheritTraits(base : CustomEmojiItemObject | undefined, toBeInherited : CustomEmojiItemObject | undefined,
        ignoreTags : boolean = false){
        return (base && toBeInherited) ? base.inheritTraits(toBeInherited, ignoreTags) : (base ?? toBeInherited);
    }

    private inheritTraits(item : CustomEmojiItemObject, ignoreTags : boolean = false){

        var newItem : CustomEmojiItemObject = new CustomEmojiItemObject();
        const itemURLEqual = this.url == item.url;
        const thisDominant = (item.always_recessive && !ignoreTags) || (this.isDominant && !item.isDominant);
        const dominantItem = thisDominant ? this : item ;
        const nonDominantItem = thisDominant ? item : this;
        newItem.url = dominantItem.url;
        newItem.offset_x = dominantItem.offset_x + (nonDominantItem.always_recessive&&!ignoreTags ? 0 : nonDominantItem.offset_x);//this.offset_x + (item.ignore_maths ? 0 : item.offset_x );
        newItem.offset_y = dominantItem.offset_y + (nonDominantItem.always_recessive&&!ignoreTags ? 0 : nonDominantItem.offset_y);
        newItem.scale_x = dominantItem.scale_x * (nonDominantItem.always_recessive&&!ignoreTags ? 1.0 : nonDominantItem.scale_x);
        newItem.scale_y = dominantItem.scale_y * (nonDominantItem.always_recessive&&!ignoreTags ? 1.0 : nonDominantItem.scale_y);
        //this is not correct, it should be able to scale more somehow, but idk how
        if (itemURLEqual && newItem.scale_x == 1.0 && newItem.scale_y == 1.0 && ((this.auto_scale && item.auto_scale) || ignoreTags) ){
            newItem.scale_x *= 1.25;
            newItem.scale_y *= 1.25;
        }

        if (dominantItem.proportionate){
            const minimum = newItem.scale_x < newItem.scale_y ? newItem.scale_x : newItem.scale_y;
            newItem.scale_x = minimum;
            newItem.scale_y = minimum;
            newItem.proportionate = true;
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
        !this.significantDiff(this.offset_x ?? 0, item.offset_x ?? 0, 18) &&
        !this.significantDiff(this.offset_y ?? 0, item.offset_y ?? 0, 18) &&
        !this.significantDiff(this.scale_x ?? 1, item.scale_x ?? 1, 0.05) &&
        !this.significantDiff(this.scale_y ?? 1, item.scale_y ?? 1, 0.05) &&
        (includeCopies ? this.numOfCopies == item.numOfCopies : true) &&
        (includeCopies ? this.copy_vertically == item.copy_vertically : true) &&
        (includeCopies ? this.set_copy_offset == item.set_copy_offset : true);
    }

    private getFullURL(category? : string){
        return "./assets/custom/" + (category ? (category + "/") : "") + this.url + ".png";
    }

    public async toMergeInfo(anchor? : ItemAnchor, category? : string){
        var x = this.offset_x;
        var y = this.offset_y;
        var width : number | undefined;
        var height : number | undefined;

        if (anchor || this.scale_x != 1.0 || this.scale_y != 1.0){
            const dimensions = await GetDimensions(this.getFullURL(category));
            if (this.scale_x != 1.0 || this.scale_y != 1.0){
                width = dimensions.width * this.scale_x;
                height = dimensions.height * this.scale_y;
                dimensions.width = width;
                dimensions.height = height;
            }
            if (anchor){
                x += anchor.x - (dimensions.width / 2);
                y += anchor.y - (dimensions.height / 2);
            }
        }
        const info : mergeInfo = new mergeInfo();
        info.src = this.getFullURL(category);
        info.x = x;
        info.y = y;
        info.width = width;
        info.height = height;
        info.copies = this.numOfCopies;
        info.copy_vertically = this.copy_vertically;
        info.set_copy_offset = this.set_copy_offset;
        return info;
    }

    private static async method (value : {item : CustomEmojiItemObject, anchor? : ItemAnchor, category ? : string}) : Promise<mergeInfo>{
        return value.item.toMergeInfo(value.anchor,value.category);
    }

    public static async getListedMergeInfo(itemList: {item : CustomEmojiItemObject, anchor? : ItemAnchor, category ? : string}[]){
        return await Promise.all(itemList.map(this.method));
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
                value.numOfCopies++;
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
        if (newList.length > 0){
            console.log("num copies: " + newList[0].numOfCopies);
        }
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