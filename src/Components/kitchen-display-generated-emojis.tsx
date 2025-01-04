import { Container, IconButton, ImageList, ImageListItem, Typography } from "@mui/material";
import { CustomEmojiObject } from "../Custom/customEmojiObject";
import { additionalEmojiInUse, ClearSelected, EmojiSelected, getRenderList, getSelectedEmojis } from "../Custom/generate-emojis";
import { imageInfo } from "../Custom/mergeImages";

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
                <>{leftEmoji != undefined &&
                    <img
                    id={leftEmoji.id()}
                    src={leftEmoji.url()}
                    className={leftEmoji?.id()}
                    width="100px"
                    height="100px"
                    style={imgStyle}
                    />
                }</>
                <>{rightEmoji != undefined}{
                    <img
                    id={rightEmoji?.id()}
                    src={rightEmoji?.url()}
                    className={rightEmoji?.id()}
                    width="100px"
                    height="100px"
                    style={imgStyle}
                />
                }</>
            </Container>
        }
        </div>;
}

function TopEmojisMobile(leftEmoji : CustomEmojiObject | undefined, rightEmoji : CustomEmojiObject | undefined, combineView : () => void){
    if (!leftEmoji || !rightEmoji){
        return <></>
    }
    return <ImageList sx={{justifyContent: "center", pt: 2, marginY: 0, padding: 0, width: "40%"}} cols={3} rowHeight={"auto"} id="preview_image_list" onClick={combineView}>
        <ImageListItem key={"left"}>
            <img
                src={leftEmoji.url()}
                alt={leftEmoji.emoji()}
                id={leftEmoji.id()}
                className={leftEmoji.id()}
                loading="lazy"
            />
        </ImageListItem>
        <ImageListItem key={"+"}>
            <Typography textAlign={"center"}>+</Typography>
        </ImageListItem>
        <ImageListItem key={"right"}>
            <img
                src={rightEmoji.url()}
                alt={rightEmoji.emoji()}
                id={rightEmoji.id()}
                className={rightEmoji.id()}
                loading="lazy"
            />
        </ImageListItem>
        </ImageList>;
}

function displayAllEmojis(toRender : CustomEmojiObject[]){
    return <ImageList sx={{justifyContent: "center", pt: 2 }} cols={3} rowHeight={"auto"}>
            {toRender.map((emoji,index) => (
                <ImageListItem key={index}>
                    <img
                        src={emoji.url()}
                        alt={emoji.emoji()}
                        id={emoji.id()}
                        className={emoji.id()}
                        loading="lazy"
                    />
                </ImageListItem>
            ))}
            </ImageList>
}

function displayAllEmojisPreview(toRender : CustomEmojiObject[], onClick : () => void){
    return <ImageList sx={{justifyContent: "center", pt: 2, margin: 0, padding: 0}} cols={9} rowHeight={"auto"} id="preview_image_list" onClick={onClick}>
            {toRender.slice(0,Math.min(8,toRender.length)).map(
                (emoji,index) => (
                <ImageListItem key={index}>
                    <img
                        src={emoji.url()}
                        alt={emoji.emoji()}
                        id={emoji.id()}
                        className={emoji.id()}
                        loading="lazy"
                    />
                </ImageListItem>
            ))}
            {toRender.length > 8 &&
                <ImageListItem key={"+"}>
                    <Typography textAlign={"center"}>+</Typography>
                </ImageListItem>
            }
            </ImageList>
}


function DisplayAllEmojis_Mobile(toRender : CustomEmojiObject[]){
    return <ImageList cols={3} rowHeight={"auto"}>
        {toRender.map((emoji) => (
            <ImageListItem>
                <img
                    src={emoji.url()}
                    alt={emoji.emoji()}
                    id={emoji.id()}
                    className={emoji.id()}
                    loading="lazy"
                    width="256px"
                    height="256px"
                />
            </ImageListItem>
        ))}
        </ImageList>
}


function displayCopies(toRender : CustomEmojiObject[], onClick : () => void){
    return (
        <>
            <Container sx={{paddingX: 0}}>
                <Typography
                    sx={{
                        fontFamily: "Noto Emoji, Apple Color Emoji, sans-serif",
                        height: "24px",
                        p: 0.5,
                        borderRadius: 2,
                        color: (theme) => theme.palette.action.active

                    }}>reiterate
                </Typography>
                <ImageList sx={{justifyContent: "center", pt: 2, margin: 0, padding: 0}} cols={9} rowHeight={"auto"} id="preview_image_list">
                    {toRender.map(
                        (emoji,index) => (
                        <ImageListItem key={index} onClick={() => selectedEmoji(emoji, onClick)}>
                            <img
                                src={emoji.url()}
                                alt={emoji.emoji()}
                                id={emoji.id()}
                                className={emoji.id()}
                                loading="lazy"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Container>
            {additionalEmojiInUse() &&
            <Container
                sx={{
                    color: (theme) => theme.palette.action.active,
                    padding: 0,
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "center"
                }}
            >
                <IconButton
                    onClick={() => clearEmoji(onClick)}
                    sx={{
                        color: (theme) => theme.palette.action.active,
                    }}>
                    <Typography sx={{
                        fontSize: "20pt"
                        }}>
                        CLEAR
                    </Typography>
                </IconButton>
            </Container>

            }
        </>

    )
}


async function renderEmojiList( emojiList : CustomEmojiObject[]){
    for (const emoji of emojiList){
        await emoji.render();
    }
    imageInfo.updateCache();
}

export function createMobilePreviewList(selectedLeftEmoji : string, selectedRightEmoji : string, onClick : () => void) : JSX.Element{



        const emojis = getSelectedEmojis(selectedLeftEmoji, selectedRightEmoji);
        const leftEmoji = emojis.left;
        const rightEmoji = emojis.right;

        if (!leftEmoji || !rightEmoji){
            return <></>;
        }
        //leftEmoji?.render();
        //rightEmoji?.render();

        var toRender = getRenderList(leftEmoji, rightEmoji);
        if (toRender.length == 0){
            toRender = getRenderList(leftEmoji, rightEmoji, true);
        }


        renderEmojiList(toRender);

        return(
            displayAllEmojisPreview(toRender, onClick)
        )
    }


export function createMiddleList(selectedLeftEmoji : string, selectedRightEmoji : string,
    clearSelectedEmoji : () => void, backToCombineViewMobile : () => void, isMobile : boolean) : JSX.Element{


    const emojis = getSelectedEmojis(selectedLeftEmoji, selectedRightEmoji);
    const leftEmoji = emojis.left;
    const rightEmoji = emojis.right;

    //leftEmoji?.render();
    //rightEmoji?.render();

    const topEmojis = TopEmojis(leftEmoji, rightEmoji);

    if (!leftEmoji || !rightEmoji){
        return topEmojis;
    }

    var toRender = getRenderList(leftEmoji, rightEmoji);
    if (toRender.length == 0){
        toRender = getRenderList(leftEmoji, rightEmoji, true);
    }


    renderEmojiList(toRender);

    //figure out what the hell to do about mobile?

    if (isMobile){
        return(
            <Container>
                {TopEmojisMobile(leftEmoji, rightEmoji, backToCombineViewMobile)}
                {DisplayAllEmojis_Mobile(toRender)}
                {displayCopies(toRender, clearSelectedEmoji)}
            </Container>);
    }

    return <Container sx={{width: "fit-content", paddingTop: 0}}>
        {topEmojis}
        {displayAllEmojis(toRender)}
        {displayCopies(toRender, clearSelectedEmoji)}

    </Container>
}