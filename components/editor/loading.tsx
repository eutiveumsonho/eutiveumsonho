import { Box, Spinner, Text } from "grommet";
import { Favorite } from "grommet-icons";
import styled from "styled-components";
import { BRAND_HEX } from "../../lib/config";
import { useTranslation } from "next-i18next";

const FavoriteFilled = styled(Favorite)`
  path[fill="none"] {
    fill: ${BRAND_HEX};
  }
`;

export default function Loading(): JSX.Element {
  const { t } = useTranslation("editor");
  
  return (
    <Box fill>
      <Box margin="large" align="center">
        <Box direction="row" gap="large" pad="small">
          <Spinner
            animation={{ type: "pulse", duration: 650, size: "medium" }}
            justify="center"
          >
            <FavoriteFilled color={BRAND_HEX} size="large" />
          </Spinner>
          <Text margin={{ horizontal: "small" }}>{t("loading-with-love")}</Text>
        </Box>
      </Box>
    </Box>
  );
}