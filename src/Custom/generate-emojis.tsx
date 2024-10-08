import { CustomEmojiObject } from "./customEmojiObject";
import { getEmojiData } from "./utils";

var selectedEmoji : CustomEmojiObject | undefined;

export function additionalEmojiInUse(){
    return selectedEmoji != undefined;
}

export interface lr_emojis{
    left?: CustomEmojiObject,
    right?: CustomEmojiObject
}

export function getSelectedEmojis(selectedLeftEmoji : string, selectedRightEmoji : string):lr_emojis{
    var leftEmoji, rightEmoji : CustomEmojiObject | undefined;

    if (selectedEmoji){
        leftEmoji = selectedEmoji;
    }
    else if (!(selectedLeftEmoji === "")){
        const leftEmojiData = getEmojiData(selectedLeftEmoji);
        leftEmoji = new CustomEmojiObject(selectedLeftEmoji,leftEmojiData?.data,leftEmojiData?.char);
    }

    if (!(selectedRightEmoji === "")){
        const rightEmojiData = getEmojiData(selectedRightEmoji);
        rightEmoji = new CustomEmojiObject(selectedRightEmoji,rightEmojiData?.data,rightEmojiData?.char);
    }
    return {left: leftEmoji, right: rightEmoji}
}

export function getRenderList(leftEmoji : CustomEmojiObject, rightEmoji : CustomEmojiObject, ignoreTags = false){
    const toRender : CustomEmojiObject[] = [];
    const allEmojiCombinations : CustomEmojiObject[] = [
        leftEmoji.inherit_traits(rightEmoji, ignoreTags),
        leftEmoji.inherit_traits(rightEmoji,ignoreTags,false),
        rightEmoji.inherit_traits(leftEmoji, ignoreTags),
        rightEmoji.inherit_traits(leftEmoji,ignoreTags,false)
    ];
    allEmojiCombinations.forEach(emoji =>{
        if (!emoji.isEqual(leftEmoji) && !emoji.isEqual(rightEmoji)){
            var equal = false;
            toRender.forEach(other => {
                if (emoji.isEqual(other)){
                    equal = true;
                }
            });
            if (!equal){
                toRender.push(emoji);
            }
        }

    })
    return toRender;
}

export function EmojiSelected(emoji : CustomEmojiObject){
    selectedEmoji = emoji;
}

export function ClearSelected(){
    selectedEmoji = undefined;
    console.log("CLEARED");
}