import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Button, Header, Layer, Spinner, Text } from "grommet";

import dynamic from "next/dynamic";
import { createDream, saveDream } from "../../lib/api";
import { useRouter } from "next/router";
import { stripHtml } from "../../lib/strings";
import { BRAND_HEX } from "../../lib/config";
import { Logo } from "../logo";
import { StatusCritical, StatusGood } from "grommet-icons";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";

dayjs.extend(LocalizedFormat);

const Editor = dynamic(() => import("../editor"), {
  ssr: false,
  loading: () => <Spinner message="Carregando editor de texto..." />,
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
        Salvo pela ultima vez as{" "}
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
  const [syncStatus, setSyncStatus] = useState(
    data?.createdAt ? (
      <LastSyncedAt lastSynced={data?.updatedAt || data.createdAt} />
    ) : null
  );

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
    }
  }, [data, router.query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      sync();
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [html]);

  const sync = async () => {
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
          <Box direction="row" gap="small" justify="center" align="center">
            <Button primary label="Publicar" />
          </Box>
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
    </>
  );
}
