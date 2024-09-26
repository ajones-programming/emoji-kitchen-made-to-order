export interface EmojiMetadata {
    data: EmojiData[];
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
    unique_face_rect? : ItemScale;
    additional_parts?:EmojiItem[];
    rotation?: number;
  }

export interface FaceData{
  //split url into type and base, then get items to inherit?
  category : string;
  eyes? : EmojiItem;
  eyeDecoration? : EmojiItem;
  eyebrows?: EmojiItem;
  mouth? : EmojiItem;
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
}

export class ItemAnchor{
  x : number = 0;
  y : number = 0;
}


  export interface MouseCoordinates {
  mouseX: number;
  mouseY: number;
}