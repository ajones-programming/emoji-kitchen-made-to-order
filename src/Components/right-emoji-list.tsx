import { Dispatch } from "react";
import { getEmojiData, getNotoEmojiUrl, getSupportedEmoji } from "../Custom/utils";
import { ImageListItem } from "@mui/material";

export default function RightEmojiList({
  rightSearchResults,
  selectedLeftEmoji,
  selectedRightEmoji,
  handleRightEmojiClicked,
}: {
  rightSearchResults: Array<string>;
  selectedLeftEmoji: string;
  selectedRightEmoji: string;
  handleRightEmojiClicked: Dispatch<string>;
}) {
  var knownSupportedEmoji = getSupportedEmoji();

  // If we have search results, filter the top-level items down
  if (rightSearchResults.length > 0) {
    knownSupportedEmoji = knownSupportedEmoji.filter((emoji) =>
      rightSearchResults.includes(emoji)
    );
  }
  const canSelect = true;

  // If we have a selectedLeftEmoji, save the valid combinations for that emoji
  return knownSupportedEmoji.map((emojiCodepoint) => {
    const data = getEmojiData(emojiCodepoint);
    // Every right-hand emoji is valid unless we have a selected left-hand emoji
    // In which case, we need to explicitly check if it's a valid combination
    //remove this!

    return (
      <div key={data?.twemoji_name}>
        <ImageListItem
          onClick={(event) =>
            canSelect
              ? handleRightEmojiClicked(emojiCodepoint)
              : null
          }
          sx={{
            p: 0.5,
            borderRadius: 2,
            opacity: (theme) => {
              return canSelect ? 1 : 0.1;
            },
            backgroundColor: (theme) =>
              selectedRightEmoji === emojiCodepoint
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
}
