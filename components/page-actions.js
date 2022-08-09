import { Avatar, Box, Button } from "grommet";
import { signIn, signOut } from "next-auth/react";

export default function PageActions(props) {
  const { serverSession } = props;

  if (serverSession) {
    return (
      <Box direction="row" gap="small">
        <Avatar src={serverSession.user.image} />
        <Button label="Sair" onClick={signOut} />
      </Box>
    );
  }

  return (
    <Box direction="row-responsive" gap="small">
      <Button label="Entrar" onClick={signIn} />
    </Box>
  );
}
