export interface EmojiMetadata {
    face_category_information : FaceCategoryPlacement[];
    data: EmojiData[];
  }

export interface Vector2{
  x : number;
  y : number;
}

export interface colour{
  r: number;
  g: number;
  b: number;
}

export class Rect{
  x : number = 0;
  y : number = 0;
  width : number = 300;
  height : number = 300;
}

export interface EdgeRatios{
  left : number;
  right : number;
  top : number;
  bottom : number;
}

export interface EmojiData{
    twemoji_name: string;
    char : string;
    emoji_codepoint : string;
    data : RawEmojiContent;
  }

export interface RawEmojiContent{
    base_url? : string;
    inherited_details_url?: string;
    inherited_details_rect? : Rect;

    face? : RawFace;
    is_only_face? : boolean;
    face_rect? : Rect;
    hat_rect? : Rect;

    hands? : RawHands;

    foreground_layer? : RawLayer;

    additional_parts_back?:RawEmojiItem[];
    additional_parts?:RawEmojiItem[];

    rotation?: number;
    colour? : colour;

    special_features? : string[];
  }

export interface RawFace{
  //split url into type and base, then get items to inherit?
  category : string;
  eyes? : RawEmojiItem;
  tears? : RawEmojiItem;
  eyebrows?: RawEmojiItem;
  nose? : RawEmojiItem;
  mouth? : RawEmojiItem;
  mask? : RawEmojiItem;
  hat? : RawEmojiItem;
  cheeks? : RawEmojiItem;
  additional_parts?:RawEmojiItem[];
  rotation? : number;
}

export interface RawHands{
  left_hand? : RawEmojiItem;
  right_hand? : RawEmojiItem;
  edge_ratio? : EdgeRatios;
}

export interface RawLayer{
  item? : RawEmojiItem;
  edge_ratio? : EdgeRatios;
}

export interface FaceCategoryPlacement{
  name : string;
  eyes : Vector2;
  nose : Vector2;
  mouth : Vector2;
  eyebrows : Vector2;
  cheeks : Vector2;
  tears : Vector2;
}



export interface EmojiFlatDetail{
  url? : string;
  rect ? : Rect;
}

export interface RawEmojiItem{
  custom? : boolean;
  url : string;
  offset_x? : number;
  offset_y? : number;
  scale_x? : number;
  scale_y? : number;
  auto_scale? : boolean;
  proportionate? : boolean;
  ignore_properties?: boolean;
  copy_vertically?:boolean;
  copy_set_offset?:number;
  can_copy? : boolean;
  keep_original_transparent?: boolean;

  custom_anchor? : Vector2;

  edge_ratio? : EdgeRatios;


}

export class ItemAnchor{
  x : number = 0;
  y : number = 0;
}


  export interface MouseCoordinates {
  mouseX: number;
  mouseY: number;
}