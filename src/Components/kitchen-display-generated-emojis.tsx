import { Container, IconButton, ImageList, ImageListItem, Typography } from "@mui/material";
import { CustomEmojiObject } from "../Custom/customEmojiObject";
import { ClearSelected, EmojiSelected, getRenderList, getSelectedEmojis } from "../Custom/generate-emojis";

function selectedEmoji(emoji : CustomEmojiObject | undefined, additional : () => void){
    if (emoji){
        EmojiSelected(emoji);
        additional();
    }
}

function clearEmoji(additional : () => void){
    ClearSelected();
    additional();
}

const imgStyle = {
    margin: "20px"
};

function TopEmojis(leftEmoji : CustomEmojiObject | undefined, rightEmoji : CustomEmojiObject | undefined){
    return <div>
        {(leftEmoji != undefined || rightEmoji != undefined) &&
            <Container sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                {leftEmoji != undefined &&
                    <img
                    id={leftEmoji.id()}
                    src={leftEmoji.url()}
                    width="100px"
                    height="100px"
                    style={imgStyle}
                    />
                }
                {rightEmoji != undefined}{
                    <img
                    id={rightEmoji?.id()}
                    src={rightEmoji?.url()}
                    width="100px"
                    height="100px"
                    style={imgStyle}
                />
                }
            </Container>
        }
        </div>;
}

function displayAllEmojis(toRender : CustomEmojiObject[]){
    return <Container>
            <ImageList sx={{ width: 360, height: 360 }} cols={2} rowHeight={164}>
            {toRender.map((emoji) => (
                <ImageListItem>
                    <img
                        alt={emoji.emoji()}
                        id={emoji.id()}
                        loading="lazy"
                        width="150px"
                        height="150px"
                    />
                </ImageListItem>
            ))}
            </ImageList>
        </Container>;
}

function displayCopies(toRender : CustomEmojiObject[], onClick : () => void){
    return <Container>
        <Typography
            sx={{
                fontFamily: "Noto Emoji, Apple Color Emoji, sans-serif",
                height: "24px",
                p: 0.5,
                borderRadius: 2,
                color: (theme) => theme.palette.action.active

            }}>copy
        </Typography>
        {toRender.map((emoji,index) => (
            <IconButton onClick={() => selectedEmoji(emoji, onClick)}>
            {index + 1}
            </IconButton>
        ))}
        <IconButton
            onClick={() => clearEmoji(onClick)}
            sx={{
                color: (theme) => theme.palette.action.active
            }}>
            CLEAR
        </IconButton>
    </Container>
}

export function createMiddleList(selectedLeftEmoji : string, selectedRightEmoji : string,
    clearSelectedEmoji : () => void) : JSX.Element{
    // Neither are selected, show left list, empty middle list, and disable right list

    const emojis = getSelectedEmojis(selectedLeftEmoji, selectedRightEmoji);
    const leftEmoji = emojis.left;
    const rightEmoji = emojis.right;

    leftEmoji?.render();
    rightEmoji?.render();

    const topEmojis = TopEmojis(leftEmoji, rightEmoji);

    if (!leftEmoji || !rightEmoji){
        return topEmojis;
    }

    var toRender = getRenderList(leftEmoji, rightEmoji);
    if (toRender.length == 0){
        toRender = getRenderList(leftEmoji, rightEmoji, true);
    }

    toRender.forEach(emoji => emoji.render());


    return <Container>
        {topEmojis}
        {displayAllEmojis(toRender)}
        {displayCopies(toRender, clearSelectedEmoji)}

    </Container>
}