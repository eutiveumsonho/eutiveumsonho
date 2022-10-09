import { Box, Spinner, Text } from "grommet";
import { Favorite } from "grommet-icons";
import styled from "styled-components";
import { BRAND_HEX } from "../../lib/config";

const FavoriteFilled = styled(Favorite)`
  path[fill="none"] {
    fill: ${BRAND_HEX};
  }
`;

export default function Loading() {
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
          <Text margin={{ horizontal: "small" }}>Carregando com amor...</Text>
        </Box>
      </Box>
    </Box>
  );
}
