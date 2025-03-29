import { Avatar, Box, Button, ResponsiveContext } from "grommet";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useTranslation } from "next-i18next";
import { Session } from "next-auth";

interface PageActionsProps {
  serverSession?: Session | null;
  deviceType?: string;
}

export default function PageActions(props: PageActionsProps): JSX.Element {
  const { serverSession, deviceType } = props;
  const size = useContext(ResponsiveContext);
  const { push, locale } = useRouter();
  const { t } = useTranslation("layout");
  
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
          data-umami-event="dashboard-add-dream"
          label={t("dashboard:add-dream")}
          onClick={() => {
            push(`/${locale}/publish`);
          }}
        />
      </Box>
    );
  }
  
  return (
    <Box direction="row-responsive" gap="small">
      <Button
        data-umami-event="home-signin"
        label={t("login")}
        onClick={() => {
          const callbackUrl = `${window.location.origin}/${locale}/dreams`;
          const encodedURI = encodeURIComponent(callbackUrl);
          push(`/${locale}/auth/signin?callbackUrl=${encodedURI}`);
        }}
      />
    </Box>
  );
}