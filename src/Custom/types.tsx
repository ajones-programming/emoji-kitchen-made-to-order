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

  }

export interface CustomEmojiData{
    base_url? : string;
    _id? : string;
    face? : FaceData;
  }

export class FaceData{
  eyes? : EmojiItem;
  mouth? : EmojiItem;
}

export class EmojiItem{
  url : string = "";
  isDominant? : boolean = false;
  offset_x? : number;
  offset_y? : number;
}


  export interface MouseCoordinates {
  mouseX: number;
  mouseY: number;
}