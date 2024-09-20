import emojiMetadata from "./metadata.json";
import { EmojiData, EmojiMetadata } from "./types";

var map : Map<string, EmojiData> | undefined;
var supportedEmoji : Array<string> | undefined;

function createEmojiData(){
  if (map && supportedEmoji){
    return;
  }
  supportedEmoji = new Array<string>();
  map = new Map<string, EmojiData>();

  // Object.keys((emojiMetadata as EmojiMetadata).data).forEach(element => supportedEmoji?.push(element));
  Object.values((emojiMetadata as EmojiMetadata).data).forEach(value => {
    supportedEmoji?.push(value.emojiCodepoint ?? "");
    map?.set(value.emojiCodepoint??"",value);
  });
  // Object.entries((emojiMetadata as EmojiMetadata).data).forEach(value => {map?.set(value[0],value[1]);});
}

/**
 * Converts an emoji codepoint into a printable emoji used for log statements
 */
export function toPrintableEmoji(emojiCodepoint: string): string {
  return String.fromCodePoint(
    ...emojiCodepoint.split("-").map((p) => parseInt(`0x${p}`))
  );
}

/**
 * Converts an emoji codepoint into a static github reference image url
 */
export function getNotoEmojiUrl(emojiCodepoint: string): string {
    const data = getEmojiData(emojiCodepoint);
    const url =  data?.name + "_" + (data?.emojiCodepoint ?? "");
    return  "https://em-content.zobj.net/source/twitter/376/" + url + ".png";
}

export function getEmojiData(emojiCodepoint: string): EmojiData  | undefined{
  createEmojiData();
  return map?.get(emojiCodepoint);
}

export function getSupportedEmoji(): Array<string> {
  createEmojiData();
  return supportedEmoji ?? new Array<string>();
}