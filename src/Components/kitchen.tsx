import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Download from "@mui/icons-material/Download";
import Fab from "@mui/material/Fab";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import { imageListItemClasses } from "@mui/material/ImageListItem";
import ImageListItem from "@mui/material/ImageListItem";
import LoadingButton from "@mui/lab/LoadingButton";
import Menu from "@mui/material/Menu";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import JSZip from "jszip";
import saveAs from "file-saver";
import { v4 as uuidv4 } from "uuid";
import { MouseCoordinates } from "../Custom/types";
import { getEmojiData, getNotoEmojiUrl, getSupportedEmoji } from "../Custom/utils";
import Search from "./search";
import RightEmojiList from "./right-emoji-list";
import LeftEmojiList from "./left-emoji-list";
import MobileEmojiList from "./mobile-emoji-list";
import { additionalEmojiInUse, getSelectedEmojis } from "../Custom/generate-emojis";
import { createMiddleList, createMobilePreviewList } from "./kitchen-display-generated-emojis";
import { getSvgIconUtilityClass } from "@mui/material";

export default function Kitchen() {
  // Selection helpers
  var [selectedLeftEmoji, setSelectedLeftEmoji] = useState("");
  var [selectedRightEmoji, setSelectedRightEmoji] = useState("");

  // Mobile helpers
  const [leftEmojiSelected, setLeftEmojiSelected] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedMode, setSelectedMode] = useState("combine");
  const [combinationCopied, setCombinationCopied] = useState(false);

  // Downloading helpers
  const [bulkDownloadMenu, setBulkDownloadMenu] = useState<
    MouseCoordinates | undefined
  >();
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  // Search results helpers
  const [leftSearchResults, setLeftSearchResults] = useState<Array<string>>([]);
  const [rightSearchResults, setRightSearchResults] = useState<Array<string>>(
    []
  );
  const [mobileSearchResults, setMobileSearchResults] = useState<Array<string>>(
    []
  );

  // Search terms helpers
  const [leftUuid, setLeftUuid] = useState<string>(uuidv4());
  const [rightUuid, setRightUuid] = useState<string>(uuidv4());
  const [mobileUuid, setMobileUuid] = useState<string>(uuidv4());

  /**
   * 📱 Mobile handler to naively detect if we're on a phone or not
   */
  function handleWindowSizeChange() {
    window.innerWidth <= 768 ? setIsMobile(true) : setIsMobile(false);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  /**
   * 📱 Mobile handler to set a random combination on load
   */
  useEffect(() => {
    if (isMobile) {
      handleFullEmojiRandomize();
    }
  }, []);

  /**
   * 📱 Mobile handler to reset state when resizing window smaller to trigger mobile view
   */
  useEffect(() => {
    if (!isMobile) {
      // Leaving mobile view should always be a subset of desktop functionality
      return;
    }

    if (selectedLeftEmoji === "" && selectedRightEmoji !== "") {
      handleLeftEmojiRandomize();
    } else if (selectedLeftEmoji !== "" && selectedRightEmoji === "") {
      handleRightEmojiRandomize();
    } else if (selectedLeftEmoji === "" && selectedRightEmoji === "") {
      handleFullEmojiRandomize();
    }
  }, [isMobile]);

  /**
   * 🖨️ Handler to show the little chip when copying a combination on mobile from the browse tab
   */
  useEffect(() => {
    if (combinationCopied) {
      setTimeout(() => {
        setCombinationCopied(false);
      }, 1000);
    }
  }, [combinationCopied]);

  /**
   * 👈 Handler when an emoji is selected from the left-hand list
   */
  const handleLeftEmojiClicked = (clickedEmoji: string) => {
    if (isMobile) {
      // Don't allow columns unselect on mobile
      if (selectedLeftEmoji !== clickedEmoji) {
        setSelectedLeftEmoji(clickedEmoji);
      }
    }
    else
    {
      // If we're unsetting the left column, clear the right column too
      if (selectedLeftEmoji === clickedEmoji) {
        setSelectedLeftEmoji("");
      }
      else {
        setSelectedLeftEmoji(clickedEmoji);
      }
    }
  };

  const clearSelectedEmoji = () => {
    setSelectedLeftEmoji("");
    setSelectedRightEmoji("");
    if (isMobile){
      setLeftEmojiSelected(false);
      setSelectedMode("combine");
    }
  };

  /**
   * 🎲 Handler when left-hand randomize button clicked
   */
  const handleLeftEmojiRandomize = () => {
    if (additionalEmojiInUse()){
      return;
    }
    if (isMobile) {
      // On mobile, use the right emoji as a base and select a random left emoji from the supported list
      const possibleLeftEmoji = getSupportedEmoji();

      const randomLeftEmoji =
        possibleLeftEmoji[Math.floor(Math.random() * possibleLeftEmoji.length)];

      setSelectedLeftEmoji(randomLeftEmoji);
      setLeftEmojiSelected(true); // If you click random on the left emoji, select that one
    } else {
      // Since we're selecting a new left emoji, clear out the right emoji
      var possibleEmoji: Array<string>;

      // Pick a random emoji from all possible emoji
      possibleEmoji = getSupportedEmoji().filter(
        (codepoint) => codepoint !== selectedLeftEmoji
      );

      const randomEmoji =
        possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)];
      setSelectedLeftEmoji(randomEmoji);
    }
  };

  /**
   * 👉 Handler when an emoji is selected from the right-hand list
   */
  const handleRightEmojiClicked = (clickedEmoji: string) => {
    if (isMobile) {
      // Don't allow column unselect on mobile
      if (selectedRightEmoji !== clickedEmoji) {
        setSelectedRightEmoji(clickedEmoji);
      }
    } else {
      setSelectedRightEmoji(
        clickedEmoji === selectedRightEmoji ? "" : clickedEmoji
      );
    }
  };

  /**
   * 🎲 Handle right-hand randomize button clicked
   */
  const handleRightEmojiRandomize = () => {
    const possibleEmoji = getSupportedEmoji();
    const randomEmoji =
      possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)];

    setSelectedRightEmoji(randomEmoji);

    if (isMobile) {
      setLeftEmojiSelected(false);
    }
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

    const possibleRightEmoji = getSupportedEmoji();

    const randomRightEmoji =
      possibleRightEmoji[Math.floor(Math.random() * possibleRightEmoji.length)];

    if (!additionalEmojiInUse()){
      setSelectedLeftEmoji(randomLeftEmoji);
    }

    setSelectedRightEmoji(randomRightEmoji);

    if (isMobile) {
      setMobileSearchResults([]);
      setMobileUuid(uuidv4());
    } else {
      setLeftSearchResults([]);
      setLeftUuid(uuidv4());
      setRightSearchResults([]);
      setRightUuid(uuidv4());
    }
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
  };

  /**
   * 💾 Handle single image copy-to-clipboard
   */
  const handleImageCopy = async () => {
    console.log("UNIMPLEMENTED IMAGE COPY");
  };

  // See: https://caniuse.com/async-clipboard
  var hasClipboardSupport = "write" in navigator.clipboard;
  //THIS IS WHAT WE NEED TO CHANGE

  var middleList : JSX.Element = createMiddleList(selectedLeftEmoji, selectedRightEmoji, clearSelectedEmoji, () => setSelectedMode("combine"), isMobile);
  // var middleList;
  var showOneCombo = !(selectedLeftEmoji === "" || selectedRightEmoji === "");

  if (isMobile && !additionalEmojiInUse() && selectedLeftEmoji === ""){
    setSelectedLeftEmoji(getSupportedEmoji()[0]);
  }
  if (isMobile && selectedRightEmoji === ""){
    setSelectedRightEmoji(getSupportedEmoji()[0]);
  }

  var {left, right} = getSelectedEmojis(selectedLeftEmoji, selectedRightEmoji);
  if (isMobile) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: "1",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          mt: 1,
          position: "relative",
          height: "100dvh",
          minWidth: "320px",
        }}
      >
        {/* Entire Emoji Column */}
        <Box
          sx={{
            overflowY: "auto",
            flexGrow: "1",
            width: "100%",
          }}
        >
          {/* Top Section */}
          <Paper
            sx={{
              position: "sticky",
              top: 3,
              zIndex: 2,
              mx: 1.5,
              mb: 1,
              p: "16px",
              justifyContent: "center",
            }}
          >
            <Stack direction="column" spacing={1} alignItems="center">
              {/* Mode switcher */}
              <ToggleButtonGroup
                color="primary"
                exclusive
                onChange={(_, value) => setSelectedMode(value)}
                size="small"
                value={selectedMode}
              >
                <ToggleButton value="combine">Combine</ToggleButton>
                <ToggleButton value="browse">Browse</ToggleButton>
              </ToggleButtonGroup>

              {selectedMode === "combine" ? (
                <div style={{width: "-webkit-fill-available"}}>
                <Grid container columns={9} spacing={2}>
                  {/* Left Emoji */}
                  <Grid size={4}>
                    <Stack direction="column">
                      <Paper
                        elevation={0}
                        onClick={(() => {
                          if (!additionalEmojiInUse()) { setLeftEmojiSelected(true); }
                        })}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          flexShrink: 0,
                          marginBottom: "4px",
                          backgroundColor: (theme) =>
                            additionalEmojiInUse()
                              ? "#d7f8fa"//theme.palette.action.disabledBackground
                              : ( leftEmojiSelected ?theme.palette.action.selected :theme.palette.background.default),
                          "&:hover": {
                            backgroundColor: (theme) =>
                              additionalEmojiInUse() ? "#d7f8fa" : theme.palette.action.hover,
                          },
                        }}
                      >
                        {left ? (
                          <img
                            style={{
                              aspectRatio: 1,
                              padding: "8px",
                            }}
                            id={left?.id() ?? ""}
                            loading="lazy"
                            alt={left.emoji()}
                            src={left.url()}
                          />
                        ) : null}
                      </Paper>
                      {additionalEmojiInUse() ?
                      (
                        <Typography
                            sx={{
                              textAlign: "center",
                              fontFamily:
                                "Noto Emoji, Apple Color Emoji, sans-serif",
                              height: "24px",
                              width: "24px",
                              color: "#ddd",
                              marginX: "auto"
                            }}
                          >
                            🔒
                          </Typography>) :
                      (
                        <IconButton
                        onClick={handleLeftEmojiRandomize}
                        sx={{
                          width: "fit-content",
                          marginX: "auto",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontFamily:
                              "Noto Emoji, Apple Color Emoji, sans-serif",
                            height: "24px",
                            width: "24px",
                          }}
                        >
                          🎲
                        </Typography>
                      </IconButton>)
                      }


                    </Stack>
                  </Grid>

                  {/* Plus sign */}
                  <Grid
                    alignItems="center"
                    display="flex"
                    justifyContent="center"
                    paddingBottom="45px"
                    size={1}
                    textAlign="center"
                  >
                    <Typography>+</Typography>
                  </Grid>

                  {/* Right Emoji */}
                  <Grid size={4}>
                    <Stack direction="column" justifyContent="center">
                      <Paper
                        elevation={0}
                        onClick={() => setLeftEmojiSelected(false)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "4px",
                          backgroundColor: (theme) =>
                            leftEmojiSelected
                              ? theme.palette.background.default
                              : theme.palette.action.selected,
                          "&:hover": {
                            backgroundColor: (theme) =>
                              theme.palette.action.hover,
                          },
                        }}
                      >
                        {right ? (
                          <img
                            style={{
                              aspectRatio: 1,
                              padding: "8px",
                            }}
                            loading="lazy"
                            id={right?.id() ?? ""}
                            alt={right.emoji()}
                            src={right.url()}
                          />
                        ) : null}
                      </Paper>
                      <IconButton
                        onClick={handleRightEmojiRandomize}
                        sx={{
                          width: "fit-content",
                          marginX: "auto",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontFamily:
                              "Noto Emoji, Apple Color Emoji, sans-serif",
                            height: "24px",
                            width: "24px",
                          }}
                        >
                          🎲
                        </Typography>
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
                {
                createMobilePreviewList(selectedLeftEmoji, selectedRightEmoji,() => setSelectedMode("browse"))
                }
                </div>
              ) : (

                middleList
              )}

              <Fade in={combinationCopied} timeout={250}>
                <Chip
                  sx={{ position: "absolute", bottom: 20 }}
                  label="Copied"
                  size="small"
                  color="primary"
                />
              </Fade>
            </Stack>
          </Paper>

          {/* Search */}
          <Search
            isMobile={isMobile}
            setSearchResults={setMobileSearchResults}
            uuid={mobileUuid}
          />

          {/* Emoji List */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(8, 1fr)",
                sm: "repeat(8, 1fr)",
                md: "repeat(8, 1fr)",
                lg: "repeat(9, 1fr)",
                xl: "repeat(10, 1fr)",
              },
              [`& .${imageListItemClasses.root}`]: {
                display: "flex",
              },
            }}
          >
            <MobileEmojiList
              handleEmojiClicked={
                leftEmojiSelected
                  ? handleLeftEmojiClicked
                  : handleRightEmojiClicked
              }
              searchResults={mobileSearchResults}
              selectedEmoji={
                leftEmojiSelected ? selectedLeftEmoji : selectedRightEmoji
              }
              selectedOtherEmoji={
                leftEmojiSelected ? selectedRightEmoji : selectedLeftEmoji
              }
              selectedMode={selectedMode}
            />
          </Box>

          {/* Full randomizer */}
          <Fab
            color="primary"
            onClick={handleFullEmojiRandomize}
            sx={{
              position: "absolute",
              bottom: 20,
              right: "10%",
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
        </Box>
      </Container>
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
          width: "30%",
        }}
      >
        {/* Left Search */}
        <Search
          handleRandomize={handleLeftEmojiRandomize}
          isMobile={isMobile}
          selectedEmoji={selectedLeftEmoji}
          setSearchResults={setLeftSearchResults}
          uuid={leftUuid}
        />

        {/* Left Emoji List */}
        <Box
          sx={{
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
            handleBulkImageDownloadMenuOpen={handleBulkImageDownloadMenuOpen}
            handleLeftEmojiClicked={handleLeftEmojiClicked}
            leftSearchResults={leftSearchResults}
            selectedLeftEmoji={selectedLeftEmoji}
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
              loading={isBulkDownloading}
              loadingPosition="start"
              onClick={handleBulkImageDownload}
              startIcon={<Download fontSize="small" />}
              sx={{ mx: 1 }}
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
          width: "min-content",
          position: "relative",
          //display: showOneCombo ? "flex" : null,
          //alignItems: showOneCombo ? "center" : null,
        }}
      >
          {middleList}
          { /*{showOneCombo && hasClipboardSupport ? (
            <Container
              sx={{ display: "flex", justifyContent: "center", pt: 2 }}
            >
               <IconButton onClick={handleImageCopy}>
                <ContentCopy />
              </IconButton>
            </Container>
          ) : null} */}

          {/* {showOneCombo && !hasClipboardSupport ? (
            <Container
              sx={{ display: "flex", justifyContent: "center", pt: 2 }}
            >
              <IconButton onClick={handleImageDownload}>
                <Download />
              </IconButton>
            </Container>
          ) : null} */}
      </Box>



      {/* Right Emoji Column */}
      <Box
        sx={{
          overflowY: "auto",
          justifyItems: "center",
          // flexGrow: "1",
          width: "30%",
        }}
      >
        {/* Right Search */}
        <Search
          disabled={selectedLeftEmoji === ""}
          handleRandomize={handleRightEmojiRandomize}
          isMobile={isMobile}
          selectedEmoji={selectedRightEmoji}
          setSearchResults={setRightSearchResults}
          uuid={rightUuid}
        />

        {/* Right Emoji List */}
        <Box
          sx={{
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
            handleRightEmojiClicked={handleRightEmojiClicked}
            rightSearchResults={rightSearchResults}
            selectedLeftEmoji={selectedLeftEmoji}
            selectedRightEmoji={selectedRightEmoji}
          />
        </Box>
      </Box>
    </Container>
  );

}
