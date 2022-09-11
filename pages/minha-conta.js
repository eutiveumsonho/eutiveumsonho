import { Box, Button, Heading, Layer, Spinner, Text } from "grommet";
import { useRouter } from "next/router";
import { useState } from "react";
import Dashboard from "../components/dashboard";
import { deleteAccount } from "../lib/api";
import { getAuthProps } from "../lib/auth";
import { getUserByEmail } from "../lib/db/reads";

export default function MyAccount(props) {
  const { serverSession, data: rawData } = props;
  const [open, setOpen] = useState(false);
  const { push } = useRouter();
  const [deleting, setDeleting] = useState(false);

  // TODO: Edit account/profile details
  const data = JSON.parse(rawData);

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  const delAccount = async () => {
    setDeleting(true);
    const response = await deleteAccount();

    if (response?.success) {
      push("/");
      return;
    }

    setDeleting(false);
  };

  return (
    <Dashboard serverSession={serverSession}>
      <Box pad="medium">
        <Heading size="small">Deletar conta</Heading>
        <Text>
          Ao deletar a sua conta, todo o conteúdo associado a ela será removido,
          e não será possível recuperá-lo.
        </Text>
        <Box align="start" pad={{ top: "medium" }}>
          <Button
            label="Deletar conta"
            color="status-critical"
            primary
            onClick={onOpen}
          />
        </Box>
        {open && (
          <Layer
            id="account-deletion-modal"
            position="center"
            onClickOutside={onClose}
            onEsc={onClose}
          >
            <Box pad="medium" gap="small" width="medium">
              <Heading level={3} margin="none">
                Confirmar
              </Heading>
              <Text>Tem certeza que deseja deletar sua conta?</Text>
              <Box
                as="footer"
                gap="small"
                direction="row"
                align="center"
                justify="end"
                pad={{ top: "medium", bottom: "small" }}
              >
                <Button
                  label={
                    <Text color="white">
                      {deleting ? (
                        <strong>
                          <Spinner size="small" /> Deletando...
                        </strong>
                      ) : (
                        <strong>Sim, deletar</strong>
                      )}
                    </Text>
                  }
                  onClick={delAccount}
                  primary
                  color="status-critical"
                />
              </Box>
            </Box>
          </Layer>
        )}
      </Box>
    </Dashboard>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession) {
    const { res } = context;
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  const { email } = authProps.props.serverSession.user;

  const data = await getUserByEmail(email);

  return { props: { ...authProps.props, data: JSON.stringify(data) } };
}
