import { Box, Button, Text } from "grommet";
import { useRouter } from "next/router";

export default function Empty(props) {
  const { empty } = props;
  const { push } = useRouter();

  return (
    <Box gap="small" pad="xlarge" align="center">
      <Text
        style={{
          textAlign: "center",
        }}
      >
        {empty.description}
      </Text>
      <Box>
        <Button
          label={empty.label}
          primary
          onClick={() => push(empty.actionRoute)}
        />
      </Box>
    </Box>
  );
}
