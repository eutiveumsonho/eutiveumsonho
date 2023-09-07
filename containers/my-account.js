import { Box, Button, Heading, Layer, Spinner, Text } from "grommet";
import { useRouter } from "next/router";
import { useState } from "react";
import { deleteAccount } from "../lib/api";
import Dashboard from "../components/dashboard";
import { useTranslation } from "next-i18next";

export default function MyAccountPage(props) {
  const { serverSession, data: rawData, deviceType } = props;
  const [open, setOpen] = useState(false);
  const { push } = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation("dashboard");
  const { locale } = useRouter();

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  const delAccount = async () => {
    setDeleting(true);
    const response = await deleteAccount();

    if (response?.success) {
      push(`/${locale}`);
      return;
    }

    setDeleting(false);
  };

  return (
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
      <Box pad="medium">
        <Heading size="small">{t("delete-account")}</Heading>
        <Text>{t("delete-account-description")}</Text>
        <Box align="start" pad={{ top: "medium" }}>
          <Button
            label={t("delete-account")}
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
                {t("confirm")}
              </Heading>
              <Text>{t("confirm-account-deletion")}</Text>
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
                        <strong>{t("deleting")}</strong>
                      ) : (
                        <strong>{t("yes-delete")}</strong>
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
