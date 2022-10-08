import { Box, Text } from "grommet";
import Image from "next/image";
import Link from "next/link";

export function Logo(props) {
  const { color = "purple", noTitle = false } = props;

  return (
    <Link href={noTitle ? "/meus-sonhos" : "/"}>
      <Box align="center" gap="medium">
        <Image
          src={`/${color}-cloud.svg`}
          height={50}
          width={50}
          alt={"Logo"}
        />
        {noTitle ? null : (
          <Text
            alignSelf="center"
            color={color === "purple" ? "brand" : color}
            weight="bold"
            style={{
              whiteSpace: "nowrap",
            }}
          >
            Eu tive um sonho
          </Text>
        )}
      </Box>
    </Link>
  );
}
