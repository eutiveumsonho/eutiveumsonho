import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Button, Header, Spinner, Text } from "grommet";

import dynamic from "next/dynamic";
import { createDream, saveDream } from "../../lib/api";
import { useRouter } from "next/router";
import { stripHtml } from "../../lib/strings";
import { BRAND_HEX } from "../../lib/config";
import { Logo } from "../logo";

const Editor = dynamic(() => import("../editor"), {
  ssr: false,
  loading: () => <Spinner message="Carregando editor de texto..." />,
});

export default function Create(props) {
  const { data } = props;
  const [html, setHtml] = useState();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

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

    setSyncing(true);

    const { postId } = router.query;
    const dreamData = {
      dream: { html, text: stripHtml(html) },
    };

    if (!postId) {
      const { success, data } = await createDream(dreamData);

      if (!success && !data) {
        // display toast

        setSyncing(false);
        return;
      }

      const url = `/publicar/${data.objectId}`;

      sessionStorage.setItem(`created-dream-${data.objectId}-html`, html);

      router.push(url);
    } else {
      await saveDream(postId, dreamData);
    }

    setSyncing(false);
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
          <Box>
            <Text size="small">
              {syncing ? <Spinner size="xsmall" /> : null}
            </Text>
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
    </>
  );
}
