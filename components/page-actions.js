import { Avatar, Box, Button, ResponsiveContext } from "grommet";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useContext } from "react";

export default function PageActions(props) {
  const { serverSession } = props;
  const size = useContext(ResponsiveContext);

  if (serverSession) {
    return (
      <Box direction="row" gap="small">
        {size === "small" ? null : (
          <Avatar
            src={
              serverSession.user.image ||
              `https://avatars.dicebear.com/v2/jdenticon/${serverSession.user.email}.svg`
            }
          />
        )}
        <Link href="/publicar">
          <Button primary label="Adicionar sonho" />
        </Link>
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
