import { Avatar, Box, Button, ResponsiveContext } from "grommet";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";

export default function PageActions(props) {
  const { serverSession, deviceType } = props;
  const size = useContext(ResponsiveContext);
  const { push } = useRouter();

  const isSmall =
    deviceType === "mobile" || deviceType === "tablet" || size === "small";

  if (serverSession) {
    return (
      <Box direction="row" gap="small">
        {isSmall ? null : (
          <Avatar
            src={
              serverSession.user.image ||
              `https://avatars.dicebear.com/v2/jdenticon/${serverSession.user.email}.svg`
            }
          />
        )}
        <Button
          primary
          label="Adicionar sonho"
          onClick={() => {
            push("/publish");
          }}
        />
      </Box>
    );
  }

  return (
    <Box direction="row-responsive" gap="small">
      <Button label="Entrar" onClick={signIn} />
    </Box>
  );
}
