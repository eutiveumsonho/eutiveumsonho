import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Header,
  Heading,
  Layer,
  ResponsiveContext,
  Spinner,
  Text,
} from "grommet";
import dynamic from "next/dynamic";
import {
  createAICompletion,
  createPost,
  savePost,
  updatePostVisibility,
} from "../lib/api";
import { useRouter } from "next/router";
import { stripHtml } from "../lib/strings";
import { BRAND_HEX } from "../lib/config";
import { Logo } from "../components/logo";
import { Close, StatusCritical, StatusGood, Location } from "grommet-icons";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import VisibilityIcon from "../components/visbility-icon";
import Loading from "../components/editor/loading";
import { useGeolocation } from "../lib/hooks/use-geolocation";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import { useTranslation } from "next-i18next";
import { logError } from "../lib/o11y/log";

dayjs.extend(LocalizedFormat);

const Editor = dynamic(() => import("../components/editor"), {
  ssr: false,
  loading: () => <Loading />,
});

function Syncing() {
  const { t } = useTranslation("editor");

  return (
    <>
      <Spinner size="xsmall" />
      <Text
        size="small"
        style={{
          paddingLeft: "0.5rem",
        }}
      >
        {t("syncing")}
      </Text>
    </>
  );
}

function LastSyncedAt(props) {
  const { lastSynced } = props;
  const { locale } = useRouter();
  const { t } = useTranslation("editor");

  if (!lastSynced) {
    return null;
  }

  return (
    <>
      <StatusGood />
      <Text
        size="small"
        style={{
          paddingLeft: "0.5rem",
        }}
      >
        {t("saved-last-time")} {dayjs(lastSynced).locale(locale).format("LTS")}
      </Text>
    </>
  );
}

function SyncFailed(props) {
  const { error } = props;
  const { t } = useTranslation("editor");

  return (
    <>
      <StatusCritical />
      <Text
        size="small"
        style={{
          paddingLeft: "0.5rem",
        }}
      >
        {error ? error : t("errored")}
      </Text>
    </>
  );
}

function VisiblityOption(props) {
  const {
    updatingVisibility,
    visibility,
    setVisibility,
    option,
    title,
    description,
  } = props;

  const active = visibility === option;

  return (
    <Button
      disabled={updatingVisibility}
      onClick={() => {
        setVisibility(option);
      }}
      fill="horizontal"
      active={active}
      style={{
        padding: 0,
      }}
    >
      {({ hover }) => {
        return (
          <Box
            background={active ? "brand" : "white"}
            style={{
              borderRadius: "0.88rem",
            }}
            fill
          >
            <Box
              background={"brand"}
              pad="xsmall"
              direction="row"
              style={{
                borderTopRightRadius: "0.88rem",
                borderTopLeftRadius: "0.88rem",
                boxShadow:
                  hover && visibility !== option
                    ? `0px -2px 0px 2px ${BRAND_HEX}`
                    : "unset",
              }}
            >
              <VisibilityIcon option={option} />
              <Text>
                <strong
                  style={{
                    marginLeft: "0.6rem",
                  }}
                >
                  {title}
                </strong>
              </Text>
            </Box>
            <Box pad="small">
              <Text>{description}</Text>
            </Box>
          </Box>
        );
      }}
    </Button>
  );
}

export default function CreateOrEdit(props) {
  const { data } = props;
  const [initialHtml, setInitialHtml] = useState();
  const router = useRouter();
  const [openVisibilitySettings, setOpenVisibilitySettings] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [visibility, setVisibility] = useState(data?.visbility || "private");
  const [syncStatus, setSyncStatus] = useState(
    data?.createdAt ? (
      <LastSyncedAt lastSynced={data?.lastUpdatedAt || data.createdAt} />
    ) : null
  );
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationCollected, setLocationCollected] = useState(false);
  const size = useContext(ResponsiveContext);
  const { t } = useTranslation("editor");
  
  // Location collection hook
  const { 
    location, 
    error: locationError, 
    isLoading: locationLoading, 
    hasPermission, 
    hasAskedPermission,
    isSupported,
    requestLocation,
    clearLocation 
  } = useGeolocation();

  const { postId } = router.query;

  useEffect(() => {
    const exitingFunction = async () => {
      await createAICompletion({ text: data?.dream?.text, dreamId: postId });
    };

    if (
      router.pathname === `/${router.locale}/publish/[postId]` ||
      router.pathname === "/publish/[postId]"
    ) {
      router.events.on("routeChangeStart", exitingFunction);
      window.onbeforeunload = exitingFunction;
    }

    return () => {
      if (
        router.pathname === `/${router.locale}/publish/[postId]` ||
        router.pathname === "/publish/[postId]"
      ) {
        router.events.off("routeChangeStart", exitingFunction);
      }
    };
  }, []);

  useEffect(() => {
    if (syncStatus) {
      const syncStatusTimer = setTimeout(() => {
        setSyncStatus(null);
      }, 3000);

      return () => clearTimeout(syncStatusTimer);
    }
  }, [syncStatus]);

  // Trigger location collection prompt when user starts creating content
  useEffect(() => {
    if (!postId && !hasAskedPermission && !locationCollected && isSupported) {
      // Show location prompt after a short delay to not interrupt initial typing
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [postId, hasAskedPermission, locationCollected, isSupported]);

  // Handle successful location collection
  useEffect(() => {
    if (location && !locationCollected) {
      setLocationCollected(true);
      setShowLocationPrompt(false);
    }
  }, [location, locationCollected]);

  const save = async (html) => {
    if (!html || data?.dream?.html === html || initialHtml === html) {
      return;
    }

    setSyncStatus(<Syncing />);

    const text = stripHtml(html);

    if (text.length > 10000) {
      setSyncStatus(
        <SyncFailed error={`${t("sync-failed")} ${text.length}`} />
      );
      return;
    }

    const { postId } = router.query;
    const dreamData = {
      dream: { html, text },
      ...(location && { location })
    };

    if (!postId) {
      const { success, data } = await createPost(dreamData);

      if (!success && !data) {
        setSyncStatus(<SyncFailed />);
        return;
      }

      const url = `${router.locale}/publish/${data.objectId}`;

      sessionStorage.setItem(`created-dream-${data.objectId}-html`, html);

      router.push(url);
    } else {
      try {
        await savePost(postId, dreamData);
        setSyncStatus(<LastSyncedAt lastSynced={new Date()} />);
      } catch (error) {
        logError(error, {
          service: "web",
          pathname: router.pathname,
          component: "CreateOrEdit",
        });
      }
    }
  };

  useEffect(() => {
    const { postId } = router.query;

    if (postId && !data) {
      const storedHtmlKey = `created-dream-${postId}-html`;
      const storedHtml = sessionStorage.getItem(storedHtmlKey);

      if (storedHtml) {
        setInitialHtml(storedHtml);
        sessionStorage.removeItem(storedHtmlKey);
      }
    } else if (data) {
      setInitialHtml(data.dream.html);
      setVisibility(data.visibility);
    }
  }, [data, router.query]);

  const saveVisibility = async () => {
    const { postId } = router.query;
    setUpdatingVisibility(true);

    await updatePostVisibility(postId, visibility);

    setUpdatingVisibility(false);
    setOpenVisibilitySettings(false);
    setSyncStatus(<LastSyncedAt lastSynced={new Date()} />);
  };

  return (
    <>
      <Header
        pad="small"
        style={{
          borderBottom: `1px solid ${BRAND_HEX}`,
        }}
      >
        <Box
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "auto",
            maxWidth: "96rem",
          }}
        >
          <Logo noTitle />
          {postId ? (
            <Box direction="row" gap="small" justify="center" align="center">
              <Button
                primary
                label={
                  data.dream.visibility === "public"
                    ? t("change-visiblity")
                    : t("publish")
                }
                onClick={() => setOpenVisibilitySettings(true)}
              />
            </Box>
          ) : null}
        </Box>
      </Header>
      <Editor
        placeholder="Eu tive um sonho..."
        defaultValue={data?.dream?.html ?? initialHtml}
        save={save}
        style={{
          width: "100%",
        }}
      />
      {syncStatus ? (
        <Layer
          position="bottom-left"
          modal={false}
          margin={{ vertical: "medium", horizontal: "small" }}
          responsive={false}
          plain
        >
          <Box
            align="center"
            direction="row"
            gap="small"
            justify="between"
            round="medium"
            elevation="medium"
            pad={{ vertical: "xsmall", horizontal: "small" }}
            background="light-2"
            width="19.5rem"
          >
            <Box align="center" direction="row" gap="xsmall">
              {syncStatus}
            </Box>
          </Box>
        </Layer>
      ) : null}
      {openVisibilitySettings ? (
        <Layer
          position="center"
          onClickOutside={() => setOpenVisibilitySettings(false)}
          onEsc={() => setOpenVisibilitySettings(false)}
        >
          <Box
            pad="medium"
            gap="small"
            width="medium"
            fill={size === "small" ? "horizontal" : "unset"}
            overflow="auto"
          >
            <Box direction="row" justify="between" width="100%">
              <Heading level={2} margin="none">
                {t("visibility-settings")}
              </Heading>
              <Button
                icon={<Close />}
                onClick={() => setOpenVisibilitySettings(false)}
              />
            </Box>
            <Heading
              level={4}
              fill
              margin="none"
              style={{
                textAlign: "center",
              }}
            >
              {t("visibility-settings-description")}
            </Heading>
            <VisiblityOption
              title={t("public")}
              description={t("public-description")}
              updatingVisibility={updatingVisibility}
              visibility={visibility}
              setVisibility={setVisibility}
              option="public"
            />
            <hr />
            <VisiblityOption
              title={t("anonymous")}
              description={t("anonymous-description")}
              updatingVisibility={updatingVisibility}
              visibility={visibility}
              setVisibility={setVisibility}
              option="anonymous"
            />
            <hr />
            <VisiblityOption
              title={t("private")}
              description={t("private-description")}
              updatingVisibility={updatingVisibility}
              visibility={visibility}
              setVisibility={setVisibility}
              option="private"
            />
            <hr />
            <Text size="small">
              {t("dream-saved-as")} {t(data.visibility)}
            </Text>
            <Button
              onClick={saveVisibility}
              disabled={updatingVisibility}
              icon={updatingVisibility ? <Spinner size="xsmall" /> : null}
              label={`${t("save-visibility-as")} ${t(visibility)}`}
            />
          </Box>
        </Layer>
      ) : null}
      {showLocationPrompt ? (
        <Layer
          position="center"
          onClickOutside={() => setShowLocationPrompt(false)}
          onEsc={() => setShowLocationPrompt(false)}
        >
          <Box
            pad="medium"
            gap="small"
            width="medium"
            fill={size === "small" ? "horizontal" : "unset"}
          >
            <Box direction="row" justify="between" align="center">
              <Location color="brand" />
              <Button
                icon={<Close />}
                onClick={() => setShowLocationPrompt(false)}
              />
            </Box>
            <Heading level={3} margin="none">
              {t("location-permission-title")}
            </Heading>
            <Text>
              {t("location-permission-description")}
            </Text>
            <Box direction="row" gap="small">
              <Button
                primary
                label={t("allow-location")}
                onClick={() => {
                  requestLocation();
                  setShowLocationPrompt(false);
                }}
                disabled={locationLoading}
                icon={locationLoading ? <Spinner size="xsmall" /> : null}
              />
              <Button
                label={t("skip")}
                onClick={() => {
                  setShowLocationPrompt(false);
                  setLocationCollected(true); // Mark as handled
                }}
              />
            </Box>
            {locationError && (
              <Text size="small" color="status-error">
                {locationError}
              </Text>
            )}
          </Box>
        </Layer>
      ) : null}
    </>
  );
}
