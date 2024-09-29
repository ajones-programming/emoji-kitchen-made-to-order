export interface EmojiMetadata {
    faceObjectInformation : FaceObjectPlacement[];
    data: EmojiData[];
  }

export interface Vector2{
  x : number;
  y : number;
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
    emojiCodepoint : string;
    data : CustomEmojiData;
  }

export interface CustomEmojiData{
    base_url? : string;
    inherited_details_url?: string;
    additional_details_rect? : ItemScale;
    face? : FaceData;
    hands? : HandsData;
    unique_face_rect? : ItemScale;
    additional_parts_back?:EmojiItem[];
    additional_parts?:EmojiItem[];
    allFace? : boolean;
    rotation?: number;
  }

export interface FaceData{
  //split url into type and base, then get items to inherit?
  category : string;
  eyes? : EmojiItem;
  tears? : EmojiItem;
  eyebrows?: EmojiItem;
  mouth? : EmojiItem;
  cheeks? : EmojiItem;
  additional_parts?:EmojiItem[];
}

export interface HandsData{
  leftHand? : EmojiItem;
  rightHand? : EmojiItem;
  edgeRatio? : EdgeRatios;
}

export interface FaceObjectPlacement{
  name : string;
  eyes : Vector2;
  mouth : Vector2;
  eyebrows : Vector2;
  cheeks : Vector2;
  tears : Vector2;
}

export class ItemScale{
  x : number = 0;
  y : number = 0;
  width : number = 300;
  height : number = 300;
}

export interface EmojiFlatDetail{
  url? : string;
  resize ? : ItemScale;
}

export interface EmojiItem{
  custom? : boolean;
  url : string;
  isDominant? : boolean ;
  offset_x? : number;
  offset_y? : number;
  scale_x? : number;
  scale_y? : number;
  auto_scale? : boolean;
  proportionate? : boolean;
  always_recessive?: boolean;
  copy_vertically?:boolean;
  copy_set_offset?:number;
}

export class ItemAnchor{
  x : number = 0;
  y : number = 0;
}


  export interface MouseCoordinates {
  mouseX: number;
  mouseY: number;
}