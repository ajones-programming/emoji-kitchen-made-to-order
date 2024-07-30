import emojiMetadata from "./metadata.json";
import { EmojiData, EmojiMetadata } from "./types";

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
    const url =  data.name + "_" + (data.emojiCodepoint ?? "");
    return  "https://em-content.zobj.net/source/twitter/376/" + url + ".png";
}

export function getEmojiData(emojiCodepoint: string): EmojiData {
  const emoji = (emojiMetadata as EmojiMetadata).data[emojiCodepoint];
  emoji.emojiCodepoint = emojiCodepoint;
  return emoji;
}

export function getSupportedEmoji(): Array<string> {
  return (emojiMetadata as EmojiMetadata).knownSupportedEmoji;
}