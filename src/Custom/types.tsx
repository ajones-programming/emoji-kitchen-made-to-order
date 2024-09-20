export interface EmojiMetadata {
    data: EmojiData[];
  }

export interface EmojiData{
    name: string;
    emoji : string;
    emojiCodepoint? : string;
    data : CustomEmojiData;
    resize? : ItemScale;

  }

export interface CustomEmojiData{
    base_url? : string;
    _id? : string;
    face? : FaceData;
    resize? : ItemScale;
    additional_parts?:EmojiItem[];
  }

export interface FaceData{
  //split url into type and base, then get items to inherit?
  category : string;
  eyes? : EmojiItem;
  mouth? : EmojiItem;
}

export class ItemScale{
  x : number = 0;
  y : number = 0;
  width : number = 300;
  height : number = 300;
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