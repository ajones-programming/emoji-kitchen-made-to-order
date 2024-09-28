import React, { useState } from "react";
import {
  ImageListItem,
  Box,
  Container,
  Typography,
  IconButton,
  Menu,
  Fab,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { imageListItemClasses } from "@mui/material/ImageListItem";
import { Download, ContentCopy, Margin } from "@mui/icons-material";
import JSZip from "jszip";
import saveAs from "file-saver";
import { v4 as uuidv4 } from "uuid";
import { MouseCoordinates } from "../Custom/types";
import { getEmojiData, getNotoEmojiUrl, getSupportedEmoji } from "../Custom/utils";
import Search from "./search";
import RightEmojiList from "./right-emoji-list";
import LeftEmojiList from "./left-emoji-list";
import { CustomEmojiObject} from "../Custom/customEmojiObject";

export default function Kitchen() {
  // Selection helpers
  const [selectedLeftEmoji, setSelectedLeftEmoji] = useState("");
  const [selectedRightEmoji, setSelectedRightEmoji] = useState("");

  // Downloading helpers
  const [bulkDownloadMenu, setBulkDownloadMenu] = useState<
    MouseCoordinates | undefined
  >();
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  // Search helpers
  const [leftSearchResults, setLeftSearchResults] = useState<Array<string>>([]);
  const [rightSearchResults, setRightSearchResults] = useState<Array<string>>(
    []
  );
  const [leftMobileSearchIsOpen, setLeftMobileSearchIsOpen] = useState(false);
  const [rightMobileSearchIsOpen, setRightMobileSearchIsOpen] = useState(false);

  // Hacks to get the search bar to update when I need it to
  const [leftUuid, setLeftUuid] = useState<string>(uuidv4());
  const [rightUuid, setRightUuid] = useState<string>(uuidv4());

  /**
   * 👈 Handler when an emoji is selected from the left-hand list
   */
  const handleLeftEmojiClicked = (clickedEmoji: string) => {
    // If we're unsetting the left column, clear the right column too
    if (selectedLeftEmoji === clickedEmoji) {
      setSelectedLeftEmoji("");
    }
    // Else we clicked another left emoji while both are selected, set the left column as selected and clear right column
    else if (selectedLeftEmoji !== "" && selectedRightEmoji !== "") {
      setSelectedLeftEmoji(clickedEmoji);
    } else {
      setSelectedLeftEmoji(clickedEmoji);
    }
  };

  /**
   * 🎲 Handler when left-hand randomize button clicked
   */
  const handleLeftEmojiRandomize = () => {
    var possibleEmoji: Array<string>;

    // Pick a random emoji from all possible emoji
    possibleEmoji = getSupportedEmoji().filter(
      (codepoint) => codepoint !== selectedLeftEmoji
    );

    const randomEmoji =
      possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)];

    // Since we're selecting a new left emoji, clear out the right emoji
    setSelectedLeftEmoji(randomEmoji);
    //setSelectedRightEmoji("");
  };

  /**
   * 👉 Handler when an emoji is selected from the right-hand list
   */
  const handleRightEmojiClicked = (clickedEmoji: string) => {
    setSelectedRightEmoji(
      clickedEmoji === selectedRightEmoji ? "" : clickedEmoji
    );
  };

  /**
   * 🎲 Handle right-hand randomize button clicked
   */
  const handleRightEmojiRandomize = () => {
    // var emojiToPick: Array<string>;
    // const possibleEmoji = Object.keys(data.combinations).filter(
    //   (codepoint) =>
    //     codepoint !== selectedLeftEmoji && codepoint !== selectedRightEmoji
    // );
    const possibleEmoji = getSupportedEmoji().filter(
      (codepoint) => codepoint !== selectedLeftEmoji && codepoint !== selectedRightEmoji
    );

    const randomEmoji =
      possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)];

    setSelectedRightEmoji(randomEmoji);
  };

  /**
   * 🎲 Handle full randomize button clicked
   */
  const handleFullEmojiRandomize = () => {
    const knownSupportedEmoji = getSupportedEmoji();
    const randomLeftEmoji =
      knownSupportedEmoji[
        Math.floor(Math.random() * knownSupportedEmoji.length)
      ];

    //const data = getEmojiData(randomLeftEmoji);
    // const possibleRightEmoji = Object.keys(data.combinations).filter(
    //   (codepoint) => codepoint !== randomLeftEmoji
    // );
    const possibleRightEmoji = getSupportedEmoji().filter(
      (codepoint) => codepoint !== selectedLeftEmoji
    );


    const randomRightEmoji =
      possibleRightEmoji[Math.floor(Math.random() * possibleRightEmoji.length)];

    setSelectedLeftEmoji(randomLeftEmoji);
    setLeftUuid(uuidv4());
    setLeftSearchResults([]);
    setSelectedRightEmoji(randomRightEmoji);
    setRightUuid(uuidv4());
    setRightSearchResults([]);
  };

  /**
   * 💭 Helper function to open the bulk download menu
   */
  const handleBulkImageDownloadMenuOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setBulkDownloadMenu(
      bulkDownloadMenu === undefined
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : undefined
    );
  };

  /**
   * 💾 Handle bulk combination downloads
   */
  const handleBulkImageDownload = async () => {
    console.log("BULK DOWNLOAD UNIMPLEMENTED");
    return;
    // try {
    //   // See: https://github.com/Stuk/jszip/issues/369
    //   // See: https://github.com/Stuk/jszip/issues/690
    //   const currentDate = new Date();
    //   const dateWithOffset = new Date(
    //     currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
    //   );
    //   (JSZip as any).defaults.date = dateWithOffset;

    //   const zip = new JSZip();
    //   const data = getEmojiData(selectedLeftEmoji);
    //   const photoZip = zip.folder(data.alt)!;

    //   setIsBulkDownloading(true);

    //   const combinations = Object.values(data.combinations)
    //     .flat()
    //     .filter((c) => c.isLatest);
    //   for (var i = 0; i < combinations.length; i++) {
    //     const combination = combinations[i];
    //     const image = await fetch(combination.gStaticUrl);
    //     const imageBlob = await image.blob();
    //     photoZip.file(`${combination.alt}.png`, imageBlob);
    //   }

    //   const archive = await zip.generateAsync({ type: "blob" });
    //   saveAs(archive, data.alt);

    //   setBulkDownloadMenu(undefined);
    //   setIsBulkDownloading(false);
    // } catch (e) {
    //   setBulkDownloadMenu(undefined);
    //   setIsBulkDownloading(false);
    // }
  };

  /**
   * 💾 Handle single combination downloads
   */
  const handleImageDownload = () => {
    console.log("IMAGE DOWNLOAD UNIMPLEMENTED");
    return;
    // var combination = getEmojiData(selectedLeftEmoji).combinations[
    //   selectedRightEmoji
    // ].filter((c) => c.isLatest)[0];

    // saveAs(combination.gStaticUrl, combination.alt);
  };

  /**
   * 💾 Handle single image copy-to-clipboard
   */
  const handleImageCopy = async () => {
    console.log("UNIMPLEMENTED IMAGE COPY");
    // var combination = getEmojiData(selectedLeftEmoji).combinations[
    //   selectedRightEmoji
    // ].filter((c) => c.isLatest)[0];

    // const fetchImage = async () => {
    //   const image = await fetch(combination.gStaticUrl);
    //   return await image.blob();
    // };

    // navigator.clipboard
    //   .write([
    //     new ClipboardItem({
    //       "image/png": fetchImage(),
    //     }),
    //   ])
    //   .then(function () {})
    //   .catch(function (error) {
    //     console.log(error);
    //   });
  };

  // See: https://caniuse.com/async-clipboard
  var hasClipboardSupport = "write" in navigator.clipboard;
  //THIS IS WHAT WE NEED TO CHANGE
  var middleList;
  var showOneCombo = false;

  // Neither are selected, show left list, empty middle list, and disable right list
  if (selectedLeftEmoji === "" || selectedRightEmoji === "") {
    middleList = <div></div>;
  }
  else {
    showOneCombo = true;

    const leftEmojiData = getEmojiData(selectedLeftEmoji);
    const rightEmojiData = getEmojiData(selectedRightEmoji);
    const leftEmoji = new CustomEmojiObject(selectedLeftEmoji,leftEmojiData?.data,leftEmojiData?.char);
    const rightEmoji = new CustomEmojiObject(selectedRightEmoji,rightEmojiData?.data,rightEmojiData?.char);
    const leftEmojiURL = getNotoEmojiUrl(selectedLeftEmoji);
    const rightEmojiURL = getNotoEmojiUrl(selectedRightEmoji);

    var renderLR = false;
    var renderLLR = false;
    var renderRL = false;
    var renderRRL = false;

    leftEmoji.render();
    rightEmoji.render();
    var combined_lr : CustomEmojiObject | undefined;
    var combined_llr : CustomEmojiObject | undefined;
    var combined_rl : CustomEmojiObject | undefined;
    var combined_rrl : CustomEmojiObject | undefined;
    if (leftEmoji != undefined && rightEmoji != undefined){
      combined_lr = leftEmoji.inherit_traits(rightEmoji);
      combined_llr = leftEmoji.inherit_traits(rightEmoji,false,false);
      combined_rl = rightEmoji.inherit_traits(leftEmoji);
      combined_rrl = rightEmoji.inherit_traits(leftEmoji,false,false);

      renderLR = !combined_lr.isEqual(leftEmoji) && !combined_lr.isEqual(rightEmoji);
      renderLLR = !combined_llr.isEqual(leftEmoji) && !combined_llr.isEqual(rightEmoji) && !combined_llr.isEqual(combined_lr);
      renderRL = !combined_rl.isEqual(leftEmoji) && !combined_rl.isEqual(rightEmoji)
            && !combined_rl.isEqual(combined_lr) && !combined_rl.isEqual(combined_llr);
      renderRRL = !combined_rrl.isEqual(leftEmoji) && !combined_rrl.isEqual(rightEmoji)
            && !combined_rrl.isEqual(combined_lr) && !combined_rrl.isEqual(combined_llr) && !combined_rrl.isEqual(combined_rl);

      if (!renderLR && !renderLLR && !renderRL && !renderRRL){
        combined_lr = leftEmoji.inherit_traits(rightEmoji,true);
        combined_llr = leftEmoji.inherit_traits(rightEmoji,true,false);
        combined_rl = rightEmoji.inherit_traits(leftEmoji,true);
        combined_rrl = rightEmoji.inherit_traits(leftEmoji,true,false);

        renderLR = !combined_lr.isEqual(leftEmoji) && !combined_lr.isEqual(rightEmoji);
        renderLLR = !combined_llr.isEqual(leftEmoji) && !combined_llr.isEqual(rightEmoji) && !combined_llr.isEqual(combined_lr);
        renderRL = !combined_rl.isEqual(leftEmoji) && !combined_rl.isEqual(rightEmoji)
              && !combined_rl.isEqual(combined_lr) && !combined_rl.isEqual(combined_llr);
        renderRRL = !combined_rrl.isEqual(leftEmoji) && !combined_rrl.isEqual(rightEmoji)
              && !combined_rrl.isEqual(combined_lr) && !combined_rrl.isEqual(combined_llr) && !combined_rrl.isEqual(combined_rl);
      }

      if (renderLR){combined_lr?.render();}
      if (renderLLR){combined_llr?.render();}
      if (renderRL){combined_rl?.render();}
      if (renderRRL){combined_rrl?.render();}

    }

    const style1 = {
        margin: "20px",
        fontSize : "200%",
        "text-align" : "center",
        backgroundColor : "coral"
    };
    const style2 = {
      margin: "20px",
      fontSize : "200%",
      "text-align" : "center",
      backgroundColor : "pink"
  };


    const imgStyle = {
      margin: "20px"
    }

    middleList = (
      <div>
        <div dir="horizontal" style={style1}>
          <img alt={leftEmojiData?.twemoji_name} id={leftEmoji.id()} src={leftEmojiURL} width="100px" height="100px" style={imgStyle}/>
          +
          <img alt={rightEmojiData?.twemoji_name} id={rightEmoji.id()} src={rightEmojiURL} width="100px" height="100px" style={imgStyle}/>
        </div>
        <div dir="horizontal" style={style2}>
            {renderLR && combined_lr != undefined &&
              <img alt={combined_lr.id()} id={combined_lr.id()} width="150px" height="150px" style={imgStyle}/>
            }
            {renderLLR && combined_llr != undefined &&
              <img alt={combined_llr.id()} id={combined_llr.id()} width="150px" height="150px" style={imgStyle}/>
            }
            {renderRL && combined_rl != undefined &&
              <img alt={combined_rl.id()} id={combined_rl?.id()} width="150px" height="150px" style={imgStyle}/>
            }
            {renderRRL && combined_rrl != undefined &&
              <img alt={combined_rrl.id()} id={combined_rrl.id()} width="150px" height="150px" style={imgStyle}/>
            }
            {!renderRL && !renderLR &&
              <div>
                Cannot render, result is same as a source emoji
              </div>
            }
        </div>
      </div>

    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        flexGrow: "1",
        display: "flex",
        flexDirection: "row",
        overflowY: "auto",
        mt: 1,
        position: "relative",
      }}
    >
      {/* Left Emoji Column */}
      <Box
        sx={{
          overflowY: "auto",
          justifyItems: "center",
          flexGrow: "1",
          width: "33%",
        }}
      >
        {/* Left Search */}
        <Search
          setSearchResults={setLeftSearchResults}
          setMobileSearchIsOpen={setLeftMobileSearchIsOpen}
          handleRandomize={handleLeftEmojiRandomize}
          selectedEmoji={selectedLeftEmoji}
          uuid={leftUuid}
        />

        {/* Left Emoji List */}
        <Box
          sx={{
            marginTop: leftMobileSearchIsOpen ? "64px" : 0,
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(3, 1fr)",
              sm: "repeat(5, 1fr)",
              md: "repeat(7, 1fr)",
              lg: "repeat(9, 1fr)",
              xl: "repeat(10, 1fr)",
            },
            [`& .${imageListItemClasses.root}`]: {
              display: "flex",
            },
          }}
        >
          <LeftEmojiList
            leftSearchResults={leftSearchResults}
            selectedLeftEmoji={selectedLeftEmoji}
            handleLeftEmojiClicked={handleLeftEmojiClicked}
            handleBulkImageDownloadMenuOpen={handleBulkImageDownloadMenuOpen}
          />
        </Box>

        {/* Bulk Download Menu */}
        {selectedLeftEmoji !== "" ? (
          <Menu
            open={bulkDownloadMenu !== undefined}
            onClose={() => setBulkDownloadMenu(undefined)}
            anchorReference="anchorPosition"
            anchorPosition={
              bulkDownloadMenu !== undefined
                ? {
                    top: bulkDownloadMenu.mouseY,
                    left: bulkDownloadMenu.mouseX,
                  }
                : undefined
            }
          >
            <LoadingButton
              sx={{ mx: 1 }}
              loading={isBulkDownloading}
              loadingPosition="start"
              startIcon={<Download fontSize="small" />}
              onClick={handleBulkImageDownload}
            >
              Bulk Download
            </LoadingButton>
          </Menu>
        ) : undefined}
      </Box>

      {/* Middle Emoji Column */}
      <Fab
        color="primary"
        onClick={handleFullEmojiRandomize}
        sx={{
          position: "absolute",
          bottom: 20,
          right: "35%",
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "Noto Emoji, Apple Color Emoji, sans-serif",
            height: "24px",
          }}
        >
          🎲
        </Typography>
      </Fab>
      <Box
        sx={{
          mx: 3,
          overflowY: "auto",
          justifyItems: "center",
          flexGrow: "1",
          width: "33%",
          position: "relative",
          display: showOneCombo ? "flex" : null,
          alignItems: showOneCombo ? "center" : null,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: showOneCombo ? "repeat(1, 1fr)" : "repeat(2, 1fr)",
              md: showOneCombo ? "repeat(1, 1fr)" : "repeat(3, 1fr)",
            },
            [`& .${imageListItemClasses.root}`]: {
              display: "flex",
            },
          }}
        >
          {middleList}
          {showOneCombo && hasClipboardSupport ? (
            <Container
              sx={{ display: "flex", justifyContent: "center", pt: 2 }}
            >
              <IconButton onClick={handleImageCopy}>
                <ContentCopy />
              </IconButton>
            </Container>
          ) : null}

          {showOneCombo && !hasClipboardSupport ? (
            <Container
              sx={{ display: "flex", justifyContent: "center", pt: 2 }}
            >
              <IconButton onClick={handleImageDownload}>
                <Download />
              </IconButton>
            </Container>
          ) : null}
        </Box>
      </Box>

      {/* Right Emoji Column */}
      <Box
        sx={{
          overflowY: "auto",
          justifyItems: "center",
          flexGrow: "1",
          width: "33%",
        }}
      >
        {/* Right Search */}
        <Search
          setSearchResults={setRightSearchResults}
          setMobileSearchIsOpen={setRightMobileSearchIsOpen}
          handleRandomize={handleRightEmojiRandomize}
          selectedEmoji={selectedRightEmoji}
          uuid={rightUuid}
          isRightSearch={true}
          disabled={selectedLeftEmoji === ""}
        />

        {/* Right Emoji List */}
        <Box
          sx={{
            marginTop: rightMobileSearchIsOpen ? "64px" : 0,
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(3, 1fr)",
              sm: "repeat(5, 1fr)",
              md: "repeat(7, 1fr)",
              lg: "repeat(9, 1fr)",
              xl: "repeat(10, 1fr)",
            },
            [`& .${imageListItemClasses.root}`]: {
              display: "flex",
            },
          }}
        >
          <RightEmojiList
            rightSearchResults={rightSearchResults}
            selectedLeftEmoji={selectedLeftEmoji}
            selectedRightEmoji={selectedRightEmoji}
            handleRightEmojiClicked={handleRightEmojiClicked}
          />
        </Box>
      </Box>
    </Container>
  );

}
