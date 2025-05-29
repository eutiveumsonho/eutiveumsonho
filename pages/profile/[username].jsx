import Head from "next/head";
import PublicProfilePage from "../../containers/public-profile";
import { getUserAgentProps } from "../../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getProfileByUsername } from "../../lib/db/profiles/reads";
import { logError } from "../../lib/o11y/log";

/**
 * This component represents a public profile page.
 * Users can view public profiles of other users.
 *
 * @param {{ profile, deviceType }} props
 * @returns {JSX.Element}
 */
export default function PublicProfile(props) {
  const { profile: rawProfile, deviceType } = props;

  const { t } = useTranslation("dashboard");
  const profile = rawProfile ? JSON.parse(rawProfile) : null;

  return (
    <>
      <Head>
        <title>{profile ? `${profile.name || profile.username} - ${t("profile")}` : t("profile-not-found")}</title>
      </Head>
      <PublicProfilePage profile={profile} deviceType={deviceType} />
    </>
  );
}

export async function getServerSideProps(context) {
  const { username } = context.params;

  try {
    const profile = await getProfileByUsername(username);

    return {
      props: {
        profile: profile ? JSON.stringify(profile) : null,
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  } catch (error) {
    logError(error, {
      service: "db",
      pathname: "/profile/[username]",
      component: "PublicProfile",
    });

    return {
      props: {
        profile: null,
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  }
}