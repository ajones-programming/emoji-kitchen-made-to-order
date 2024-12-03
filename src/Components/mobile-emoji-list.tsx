import React, { Dispatch } from "react";
import { getEmojiData, getNotoEmojiUrl, getSupportedEmoji } from "../Custom/utils";
import { ImageListItem } from "@mui/material";

export default function MobileEmojiList({
  handleEmojiClicked,
  searchResults,
  selectedEmoji,
  selectedOtherEmoji,
  selectedMode,
}: {
  handleEmojiClicked: Dispatch<string>;
  searchResults: Array<string>;
  selectedEmoji: string;
  selectedOtherEmoji: string;
  selectedMode: string;
}) {
  var knownSupportedEmoji = getSupportedEmoji();

  // if (selectedEmoji === "" || selectedOtherEmoji === "") {
  //   return;
  // }

  // If we have search results, filter the top-level items down
  if (searchResults.length > 0) {
    knownSupportedEmoji = knownSupportedEmoji.filter((emoji) =>
      searchResults.includes(emoji)
    );
  }

  if (selectedMode === "combine") {
    var possibleEmoji = getSupportedEmoji();

    return knownSupportedEmoji.map((emojiCodepoint) => {
      const data = getEmojiData(emojiCodepoint);

      const isValidCombo = possibleEmoji.includes(emojiCodepoint);

      return (
        <div key={data?.emoji_codepoint}>
          <ImageListItem
            onClick={(_) => {
              // On mobile, only return this if it's a valid combination
              return isValidCombo ? handleEmojiClicked(emojiCodepoint) : null;
            }}
            sx={{
              p: 0.5,
              borderRadius: 2,
              opacity: (_) => {
                return isValidCombo ? 1 : 0.1;
              },
              backgroundColor: (theme) =>
                selectedEmoji === emojiCodepoint
                  ? theme.palette.action.selected
                  : theme.palette.background.default,
              "&:hover": {
                backgroundColor: (theme) => {
                  return theme.palette.action.hover;
                },
              },
            }}
          >
            <img
              loading="lazy"
              width="32px"
              height="32px"
              alt={data?.twemoji_name}
              src={getNotoEmojiUrl(emojiCodepoint)}
            />
          </ImageListItem>
        </div>
      );
    });
  } else {
    return knownSupportedEmoji.map((emojiCodepoint) => {
      const data = getEmojiData(emojiCodepoint);

      return (
        <div key={data?.twemoji_name}>
          <ImageListItem
            //onClick={(_) => handleEmojiClicked(emojiCodepoint)}
            sx={{
              p: 0.5,
              borderRadius: 2,
              opacity: 0.1,
              backgroundColor: (theme) =>
                selectedEmoji === emojiCodepoint
                  ? theme.palette.action.selected
                  : theme.palette.background.default,
              "&:hover": {
                backgroundColor: (theme) => {
                  return theme.palette.action.hover;
                },
              },
            }}
          >
            <img
              loading="lazy"
              width="32px"
              height="32px"
              alt={data?.emoji_codepoint}
              src={getNotoEmojiUrl(emojiCodepoint)}
            />
          </ImageListItem>
        </div>
      );
    });
  }
}