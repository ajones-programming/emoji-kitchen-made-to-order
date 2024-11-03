import React, { Dispatch } from "react";
import { getEmojiData, getNotoEmojiUrl, getSupportedEmoji } from "../Custom/utils";
import { ImageListItem } from "@mui/material";
import { additionalEmojiInUse } from "../Custom/generate-emojis";

export default function LeftEmojiList({
  handleLeftEmojiClicked,
  handleBulkImageDownloadMenuOpen,
  leftSearchResults,
  selectedLeftEmoji,
}: {
  handleLeftEmojiClicked: Dispatch<string>;
  handleBulkImageDownloadMenuOpen: Dispatch<React.MouseEvent>;
  leftSearchResults: Array<string>;
  selectedLeftEmoji: string;
}) {
  var knownSupportedEmoji = getSupportedEmoji();

  // If we have search results, filter the top-level items down
  if (leftSearchResults.length > 0) {
    knownSupportedEmoji = knownSupportedEmoji.filter((emoji) =>
      leftSearchResults.includes(emoji)
    );
  }
  const canSelect = !additionalEmojiInUse();

  return knownSupportedEmoji.map((emojiCodepoint) => {
    const data = getEmojiData(emojiCodepoint);

    return (
      <div
        key={data?.twemoji_name}
        onContextMenu={
          selectedLeftEmoji === data?.emoji_codepoint
            ? handleBulkImageDownloadMenuOpen
            : () => {}
        }
      >
        <ImageListItem
          onClick={(event) => canSelect ? handleLeftEmojiClicked(emojiCodepoint) : null}
          sx={{
            p: 0.5,
            borderRadius: 2,
            opacity: (theme) => {
              return canSelect ? 1 : 0.1;
            },
            backgroundColor: (theme) =>
              selectedLeftEmoji === data?.emoji_codepoint
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
            src={getNotoEmojiUrl(data?.emoji_codepoint ?? "")}
          />
        </ImageListItem>
      </div>
    );
  });
}
