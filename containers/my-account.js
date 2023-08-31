import { Box, Button, Heading, Layer, Spinner, Text } from "grommet";
import { useRouter } from "next/router";
import { useState } from "react";
import { deleteAccount } from "../lib/api";
import Dashboard from "../components/dashboard";

export default function MyAccountPage(props) {
  const { serverSession, data: rawData, deviceType } = props;
  const [open, setOpen] = useState(false);
  const { push } = useRouter();
  const [deleting, setDeleting] = useState(false);

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
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
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
                  icon={deleting ? <Spinner size="xsmall" /> : null}
                  label={
                    <Text color="white">
                      {deleting ? (
                        <strong>Deletando...</strong>
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
