import { Avatar, Box, Button, ResponsiveContext } from "grommet";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useTranslation } from "next-i18next";

export default function PageActions(props) {
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
          label={t("add-dream")}
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
