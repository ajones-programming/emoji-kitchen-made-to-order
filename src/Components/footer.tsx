import { Box, Link, Stack, Tooltip, Typography } from "@mui/material";
import {
  FileCodeIcon,
  LinkExternalIcon,
  MentionIcon,
} from "@primer/octicons-react";
import React from "react";

export default class Footer extends React.Component {
  render() {
    return (
      <div>
        <Box component="footer" sx={{ py: 4 }}>
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
          <Typography sx={{ mt: 6 , fontSize: 10, marginTop: 0}} >
          This is an independent fork of XSalazar's emojikitchen.dev. Please view the original!
          </Typography>

          <Stack spacing={4} direction="row" justifyContent="center">
            <Tooltip title="Contact Original Developer - XSalazar">
              <Link
                href="https://xsalazar.com"
                color="textPrimary"
                aria-label="Contact Me"
                target="_blank"
                rel="noopener"
              >
                <MentionIcon size="small" verticalAlign="middle" />
              </Link>
            </Tooltip>
            <Tooltip title="Original Source Code\nBy XSalazar">
              <Link
                href="https://github.com/xsalazar/emoji-kitchen"
                color="textPrimary"
                aria-label="Source Code"
                target="_blank"
                rel="noopener"
              >
                <FileCodeIcon size="small" verticalAlign="middle" />
              </Link>
            </Tooltip>
          </Stack>
        </Box>
      </div>
    );
  }
}
