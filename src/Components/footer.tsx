import { Box, Link, Stack, Tooltip, Typography } from "@mui/material";
import {
  FileCodeIcon,
  LinkExternalIcon,
  MentionIcon,
} from "@primer/octicons-react";
import React from "react";

export default class Footer  extends React.Component {
  render() {
    return (
      <div>
        <Box component="footer" sx={{ py: 4 , paddingTop:0 , paddingBottom:0}}>
        <Stack spacing={4} direction="row" justifyContent="center">
            <Tooltip title="Contact Me - Anna Jones">
              <Link
                href="https://github.com/ajones-programming"
                color="textPrimary"
                aria-label="Contact Me"
                target="_blank"
                rel="noopener"
              >
                <MentionIcon size="small" verticalAlign="middle" />
              </Link>
            </Tooltip>
            <Tooltip title="Fork Source Code - Anna Jones">
              <Link
                href="https://github.com/ajones-programming/emoji-kitchen-made-to-order"
                color="textPrimary"
                aria-label="Source Code"
                target="_blank"
                rel="noopener"
              >
                <FileCodeIcon size="small" verticalAlign="middle" />
              </Link>
            </Tooltip>
            <Tooltip title="Learn More">
              <Link
                href="https://www.emojipedia.org/emoji-kitchen/"
                color="textPrimary"
                aria-label="Learn More"
                target="_blank"
                rel="noopener"
              >
                <LinkExternalIcon size="small" verticalAlign="middle" />
              </Link>
            </Tooltip>
          </Stack>
          <Typography sx={{ mt: 6 , fontSize: 14, marginTop: 0}} >
          This is an independent fork of <Link
                href="https://xsalazar.com/"
                color="textPrimary"
                aria-label="XSalazar's website"
                target="_blank"
                rel="noopener"
              >XSalazars</Link>
              's <Link
                href="https://emojikitchen.dev"
                color="textPrimary"
                aria-label="Original Emoji Kitchen"
                target="_blank"
                rel="noopener"
              >
                emojikitchen.dev
              </Link>. Please view the original.
          </Typography>
        </Box>
      </div>
    );
  }
}
