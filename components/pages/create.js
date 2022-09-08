import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Header,
  Heading,
  Layer,
  RadioButtonGroup,
  Spinner,
  Text,
} from "grommet";

import dynamic from "next/dynamic";
import { createDream, saveDream, updateDreamVisibility } from "../../lib/api";
import { useRouter } from "next/router";
import { stripHtml, VISIBILITY_TRANSLATIONS } from "../../lib/strings";
import { BRAND_HEX } from "../../lib/config";
import { Logo } from "../logo";
import { StatusCritical, StatusGood } from "grommet-icons";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";
import VisibilityIcon from "../visbility-icon";

dayjs.extend(LocalizedFormat);

const Editor = dynamic(() => import("../editor"), {
  ssr: false,
  loading: () => <Spinner message="Carregando editor de texto..." />,
});

const SYNC_DELAY = 3000;

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

export default function Create(props) {
  const { data } = props;
  const [html, setHtml] = useState();
  const router = useRouter();
  const [openVisibilitySettings, setOpenVisibilitySettings] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [visibility, setVisibility] = useState(data?.visbility || "private");
  const [syncStatus, setSyncStatus] = useState(
    data?.createdAt ? (
      <LastSyncedAt lastSynced={data?.updatedAt || data.createdAt} />
    ) : null
  );

  const { postId } = router.query;

  const sync = useCallback(async () => {
    if (!html) {
      return;
    }

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
        console.error(error);
      }
    }
  }, [html, router]);

  useEffect(() => {
    const { postId } = router.query;

    if (postId && !data) {
      const storedHtmlKey = `created-dream-${postId}-html`;
      const storedHtml = sessionStorage.getItem(storedHtmlKey);

      if (storedHtml) {
        setHtml(storedHtml);
        sessionStorage.removeItem(storedHtmlKey);
      }
    } else if (data) {
      setHtml(data.dream.html);
      setVisibility(data.visibility);
    }
  }, [data, router.query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      sync();
    }, SYNC_DELAY);

    return () => clearTimeout(delayDebounceFn);
  }, [html, sync]);

  const saveVisibility = async () => {
    const { postId } = router.query;
    setUpdatingVisibility(true);

    await updateDreamVisibility(postId, visibility);

    setUpdatingVisibility(false);
  };

  return (
    <>
      <Head>
        <title>Eu tive um sonho</title>
        <meta name="description" content="O seu repositório de sonhos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
                  visibility === "public" ? "Alterar visibilidade" : "Publicar"
                }
                onClick={() => setOpenVisibilitySettings(true)}
              />
            </Box>
          ) : null}
        </Box>
      </Header>
      <Editor
        placeholder="Eu tive um sonho..."
        onChange={setHtml}
        // See https://github.com/zenoamaro/react-quill/issues/311
        // for the hacks below (defaultValue and value)
        defaultValue={data?.dream?.html ?? html}
        style={{
          width: "100%",
        }}
      />
      {syncStatus ? (
        <Layer
          position="bottom-right"
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
          <Box pad="medium" gap="small" width="medium">
            <Heading level={3} margin="none">
              Configurações de visibilidade
            </Heading>
            <Text>
              <Box background={"brand"} pad="xsmall" direction="row">
                <VisibilityIcon option={"public"} />
                <strong
                  style={{
                    marginLeft: "0.6rem",
                  }}
                >
                  Público
                </strong>
              </Box>
              O seu sonho fica disponível para todas as pessoas logadas na
              plataforma, junto às informacoes de seu perfil.
            </Text>
            <hr />
            <Text>
              <Box background={"brand"} pad="xsmall" direction="row">
                <VisibilityIcon option={"anonymous"} />
                <strong
                  style={{
                    marginLeft: "0.6rem",
                  }}
                >
                  Anônimo
                </strong>
              </Box>
              O seu sonho fica disponível para todas as pessoas logadas na
              plataforma, porem as informacoes de seu perfil não são exibidas.
            </Text>
            <hr />
            <Text>
              <Box background={"brand"} pad="xsmall" direction="row">
                <VisibilityIcon option={"private"} />
                <strong
                  style={{
                    marginLeft: "0.6rem",
                  }}
                >
                  Privado
                </strong>
              </Box>
              O seu sonho fica disponível apenas para você.
            </Text>
            <hr />
            <Box
              as="footer"
              gap="xsmall"
              direction="row"
              align="center"
              justify="end"
            >
              <RadioButtonGroup
                name="radio"
                direction="row"
                gap="xsmall"
                options={["public", "anonymous", "private"]}
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
              >
                {(option, { checked, focus, hover }) => {
                  let background;
                  if (checked) background = "brand";
                  else if (hover) background = "light-4";
                  else if (focus) background = "light-4";
                  else background = "light-2";

                  return (
                    <Box background={background} pad="xsmall">
                      <VisibilityIcon option={option} />
                    </Box>
                  );
                }}
              </RadioButtonGroup>
            </Box>
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
