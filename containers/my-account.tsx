import { Box, Button, CheckBox, Heading, Layer, Spinner, Text } from "grommet";
import { useRouter } from "next/router";
import { useState } from "react";
import { deleteAccount, updateUser } from "../lib/api";
import Dashboard from "../components/dashboard";
import { useTranslation } from "next-i18next";

interface UserSettings {
  aiCommentsOnPrivatePosts?: boolean;
  [key: string]: any;
}

interface UserData {
  settings?: UserSettings;
  [key: string]: any;
}

interface ServerSession {
  user: {
    name: string;
    email: string;
    image: string;
  };
}

interface MyAccountPageProps {
  serverSession: ServerSession;
  data: UserData;
  deviceType?: string;
}

export default function MyAccountPage(props: MyAccountPageProps): JSX.Element {
  const { serverSession, data: rawData, deviceType } = props;
  const [open, setOpen] = useState<boolean>(false);
  const { push } = useRouter();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [updatingAiSettings, setUpdatingAiSettings] = useState<boolean>(false);
  const [user, setUser] = useState<UserData>(rawData);
  const { t } = useTranslation("dashboard");
  const { locale } = useRouter();
  
  const onOpen = (): void => setOpen(true);
  const onClose = (): void => setOpen(false);
  
  const delAccount = async (): Promise<void> => {
    setDeleting(true);
    const response = await deleteAccount();
    if (response?.success) {
      push(`/${locale}`);
      return;
    }
    setDeleting(false);
  };
  
  const updateAiSettings = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setUpdatingAiSettings(true);
    const aiCommentsOnPrivatePosts = event.target.checked;
    
    const success = await updateUser({
      settings: {
        ...rawData?.settings,
        aiCommentsOnPrivatePosts,
      },
    });
    
    if (!success) {
      alert(t("ai-settings-update-error"));
      return;
    }
    
    setUser({
      ...user,
      settings: {
        ...user?.settings,
        aiCommentsOnPrivatePosts,
      },
    });
    
    setUpdatingAiSettings(false);
  };
  
  return (
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
      <Box pad="medium">
        <Heading size="small">{t("delete-account")}</Heading>
        <Text>{t("delete-account-description")}</Text>
        <Box align="start" pad={{ top: "medium" }}>
          <Button
            data-umami-event="delete-account-open-modal"
            label={t("delete-account")}
            color="status-critical"
            primary
            onClick={onOpen}
          />
        </Box>
        <Heading size="small" margin={{ top: "medium" }}>
          {t("ai-settings")}
        </Heading>
        <Text>{t("ai-settings-description")}</Text>
        <Box align="start" pad={{ top: "medium" }}>
          <CheckBox
            label={t("ai-settings-short-description")}
            disabled={updatingAiSettings}
            checked={user?.settings?.aiCommentsOnPrivatePosts}
            onChange={updateAiSettings}
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
                  data-umami-event="delete-account-confirmation"
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