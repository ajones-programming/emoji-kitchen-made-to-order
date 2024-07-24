export interface EmojiMetadata {
    knownSupportedEmoji: Array<string>;
    data: {
      [emojiCodepoint: string]: EmojiData;
    };
  }

export interface EmojiData{
    alt: string;
    emoji : string;
    emojiCodepoint: string;
    data : CustomEmojiData;
    sourceURL : string;
    resize? : ItemScale;

  }

export interface CustomEmojiData{
    base_url? : string;
    _id? : string;
    face? : FaceData;
    resize? : ItemScale;
  }

export class FaceData{
  eyes? : EmojiItem;
  mouth? : EmojiItem;
}

export class ItemScale{
  x : number = 0;
  y : number = 0;
  width : number = 300;
  height : number = 300;
}

export class EmojiItem{
  url : string = "";
  isDominant? : boolean = false;
  offset_x? : number;
  offset_y? : number;
  scale_x? : number;
  scale_y? : number;
  auto_scale? : boolean;
  proportionate? : boolean;
}

export class ItemAnchor{
  x : number = 0;
  y : number = 0;
}


  export interface MouseCoordinates {
  mouseX: number;
  mouseY: number;
}