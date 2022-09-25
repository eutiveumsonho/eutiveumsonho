import { useCallback, useContext, useEffect, useState } from "react";
import Head from "next/head";
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
import { createDream, saveDream, updateDreamVisibility } from "../lib/api";
import { useRouter } from "next/router";
import { stripHtml, VISIBILITY_TRANSLATIONS } from "../lib/strings";
import { BRAND_HEX } from "../lib/config";
import { Logo } from "../components/logo";
import { Favorite, StatusCritical, StatusGood } from "grommet-icons";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import VisibilityIcon from "../components/visbility-icon";
import { logError } from "../lib/o11y";
import styled from "styled-components";
import "dayjs/locale/pt-br";

dayjs.extend(LocalizedFormat);

const FavoriteFilled = styled(Favorite)`
  path[fill="none"] {
    fill: ${BRAND_HEX};
  }
`;

const Editor = dynamic(() => import("../components/editor"), {
  ssr: false,
  loading: () => (
    <Box fill>
      <Box margin="large" align="center">
        <Box direction="row" gap="large" pad="small">
          <Spinner
            animation={{ type: "pulse", duration: 650, size: "medium" }}
            justify="center"
          >
            <FavoriteFilled color={BRAND_HEX} size="large" />
          </Spinner>
          <Text margin={{ horizontal: "small" }}>Carregando com amor...</Text>
        </Box>
      </Box>
    </Box>
  ),
});

function Syncing() {
  return (
    <>
      <Spinner size="xsmall" />
      <Text
        size="small"
        style={{
          paddingLeft: "0.5rem",
        }}
      >
        Sincronizando
      </Text>
    </>
  );
}

function LastSyncedAt(props) {
  const { lastSynced } = props;

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
        Salvo pela última vez às{" "}
        {dayjs(lastSynced).locale("pt-br").format("LTS")}
      </Text>
    </>
  );
}

function SyncFailed() {
  return (
    <>
      <StatusCritical />
      <Text
        size="small"
        style={{
          paddingLeft: "0.5rem",
        }}
      >
        Ocorreu um erro
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

export default function Create(props) {
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
  const size = useContext(ResponsiveContext);

  const { postId } = router.query;

  useEffect(() => {
    if (syncStatus) {
      const syncStatusTimer = setTimeout(() => {
        setSyncStatus(null);
      }, 3000);

      return () => clearTimeout(syncStatusTimer);
    }
  }, [syncStatus]);

  const save = async (html) => {
    setSyncStatus(<Syncing />);

    const { postId } = router.query;
    const dreamData = {
      dream: { html, text: stripHtml(html) },
    };

    if (!postId) {
      const { success, data } = await createDream(dreamData);

      if (!success && !data) {
        setSyncStatus(<SyncFailed />);
        return;
      }

      const url = `/publicar/${data.objectId}`;

      sessionStorage.setItem(`created-dream-${data.objectId}-html`, html);

      router.push(url);
    } else {
      try {
        await saveDream(postId, dreamData);
        setSyncStatus(<LastSyncedAt lastSynced={new Date()} />);
      } catch (error) {
        logError({ ...error, service: "web" });
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

    await updateDreamVisibility(postId, visibility);

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
                    ? "Alterar visibilidade"
                    : "Publicar"
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
          >
            <Heading level={3} margin="none">
              Configurações de visibilidade
            </Heading>
            <Heading level={4} fill margin="none">
              Selecione a caixa que define como as pessoas irão ver os seus
              sonhos.
            </Heading>
            <VisiblityOption
              title={"Público"}
              description={
                "O seu sonho fica disponível para todas as pessoas logadas na plataforma, junto às informacoes de seu perfil."
              }
              updatingVisibility={updatingVisibility}
              visibility={visibility}
              setVisibility={setVisibility}
              option="public"
            />
            <hr />
            <VisiblityOption
              title={"Anônimo"}
              description={
                "O seu sonho fica disponível para todas as pessoas logadas na plataforma, porem as informacoes de seu perfil não são exibidas."
              }
              updatingVisibility={updatingVisibility}
              visibility={visibility}
              setVisibility={setVisibility}
              option="anonymous"
            />
            <hr />
            <VisiblityOption
              title={"Privado"}
              description={"O seu sonho fica disponível apenas para você."}
              updatingVisibility={updatingVisibility}
              visibility={visibility}
              setVisibility={setVisibility}
              option="private"
            />
            <hr />
            <Text size="small">
              O seu sonho está salvo como{" "}
              {VISIBILITY_TRANSLATIONS[data.visibility]}
            </Text>
            <Button
              onClick={saveVisibility}
              disabled={updatingVisibility}
              icon={updatingVisibility ? <Spinner size="xsmall" /> : null}
              label={`Salvar visibilidade do sonho como ${VISIBILITY_TRANSLATIONS[visibility]}`}
            />
          </Box>
        </Layer>
      ) : null}
    </>
  );
}
