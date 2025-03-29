import { Box, Button, Text } from "grommet";
import { useRouter } from "next/router";

interface EmptyProps {
  empty: {
    description: string;
    label: string;
    actionRoute: string;
  };
}

export default function Empty(props: EmptyProps) {
  const { empty } = props;
  const { push, route } = useRouter();
  
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
          data-umami-event={`empty-${route}-to-${empty.actionRoute}`}
          label={empty.label}
          primary
          onClick={() => push(empty.actionRoute)}
        />
      </Box>
    </Box>
  );
}