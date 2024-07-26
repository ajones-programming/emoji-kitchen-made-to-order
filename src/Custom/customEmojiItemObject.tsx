import { GetDimensions } from "./image";
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

    constructor(item? : EmojiItem){
        if (item){
            this.url = item.url;
            this.isDominant = item.isDominant ?? false;
            this.offset_x = item.offset_x ?? 0;
            this.offset_y = item.offset_y ?? 0;
            this.scale_x = item.scale_x ?? 1.0;
            this.scale_y = item.scale_y ?? 1.0;
            this.auto_scale = item.auto_scale ?? false;
            this.proportionate = item.proportionate ?? false;
        }
    }
    public static InheritTraits(base : CustomEmojiItemObject | undefined, toBeInherited : CustomEmojiItemObject | undefined){
        return (base && toBeInherited) ? base.inheritTraits(toBeInherited) : (base ?? toBeInherited);
    }

    private inheritTraits(item : CustomEmojiItemObject){

        var newItem : CustomEmojiItemObject = new CustomEmojiItemObject();
        const itemURLEqual = this.url == item.url;
        const dominantItem = (this.isDominant && !item.isDominant) ? this : item ;
        newItem.url = dominantItem.url;
        newItem.offset_x = this.offset_x + item.offset_x;
        newItem.offset_y = this.offset_y + item.offset_y;
        newItem.scale_x = this.scale_x * item.scale_x;
        newItem.scale_y = this.scale_y * item.scale_y;
        //this is not correct, it should be able to scale more somehow, but idk how
        if (itemURLEqual && newItem.scale_x == 1.0 && newItem.scale_y == 1.0 && (this.auto_scale && item.auto_scale) ){
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

    private isEqual(item : CustomEmojiItemObject): boolean{
        return this.url == item.url &&
        this.offset_x == item.offset_x &&
        this.offset_y == item.offset_y &&
        this.scale_x == item.scale_x &&
        this.scale_y == item.scale_y;
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
        return {src : this.getFullURL(category), x : x, y : y, width: width, height: height}
    }
}