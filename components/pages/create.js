import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Button, PageContent, Spinner, Avatar, Text } from "grommet";
import { signOut } from "next-auth/react";

import Layout from "../layout";
import dynamic from "next/dynamic";
import { createDream, getDreamById } from "../../lib/api";
import { useRouter } from "next/router";
import { stripHtml } from "../../lib/strings";

const Editor = dynamic(() => import("../editor"), {
  ssr: false,
  loading: () => <Spinner message="Carregando editor de texto..." />,
});

export default function Create(props) {
  const { serverSession } = props;
  const [html, setHtml] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingDream, setLoadingDream] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { dreamId } = router.query;

    if (dreamId) {
      const storedHtmlKey = `created-dream-${dreamId}-html`;
      const storedHtml = sessionStorage.getItem(storedHtmlKey);

      if (storedHtml) {
        setHtml(storedHtml);
        sessionStorage.removeItem(storedHtmlKey);
      } else {
        getDream(dreamId);
      }
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      sync();
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [html]);

  const getDream = async (id) => {
    const prevHtml = html;
    setHtml("<p>Carregando...</p>");
    const dreamData = await getDreamById(id);

    if (!dreamData?.success) {
      // display toast

      setHtml(prevHtml);
      return;
    }

    const { data } = dreamData;

    const newHtml = data.dream.html;

    setHtml(newHtml);
  };

  const sync = async () => {
    if (!html) {
      return;
    }

    setLoading(true);

    const { dreamId } = router.query;

    if (!dreamId) {
      const dreamData = {
        dream: { html, text: stripHtml(html) },
      };

      const { success, data } = await createDream(dreamData);

      if (!success && !data) {
        // display toast

        return;
      }

      const url = `/sonhos/${data.objectId}`;

      sessionStorage.setItem(`created-dream-${data.objectId}-html`, html);

      window.location.replace(url);
    }

    await new Promise((res) => {
      setTimeout(() => {
        res();
        console.log("save dream");
      }, 1000);
    });

    setLoading(false);
  };

  return (
    <Layout
      title="Eu tive um sonho"
      subtitle={`Olá${
        serverSession.user.name ? `, ${serverSession.user.name}` : "!"
      }`}
      pageHeaderActions={
        <Box direction="row" gap="small">
          {loading ? (
            <Box
              direction="column"
              gap="xsmall"
              align="center"
              justify="center"
            >
              <Spinner size="xsmall" message={"Sincronizando sonho..."} />
              <Text size="xsmall">Sincronizando sonho...</Text>
            </Box>
          ) : null}
          <Avatar src={serverSession.user.image} />
          <Button label="Sair" onClick={signOut} />
        </Box>
      }
    >
      <Head>
        <title>Eu tive um sonho</title>
        <meta name="description" content="O seu repositório de sonhos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContent
        style={{
          minHeight: "calc(90vh - 11.75rem)",
        }}
      >
        <Editor
          placeholder="Eu tive um sonho..."
          onChange={setHtml}
          // See https://github.com/zenoamaro/react-quill/issues/311
          defaultValue={html}
          style={{
            width: "100%",
          }}
        />
      </PageContent>
    </Layout>
  );
}
