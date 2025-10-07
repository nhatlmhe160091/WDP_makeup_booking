import Link from "next/link";
import { Box, styled } from "@mui/material";
import Image from "next/image";
import { WEB_NAME } from "@muahub/constants/MainContent";

const LinkStyled = styled(Link)(() => ({
  height: "70px",
  width: "180px",
  overflow: "hidden",
  display: "block"
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src="/img/MuaHub.png" alt="MuaHub" height={180} width={180} priority style={{ objectFit: "contain", mixBlendMode: "darken", backgroundColor: "transparent" }} />
      </Box>
    </LinkStyled>
  );
};

export default Logo;
