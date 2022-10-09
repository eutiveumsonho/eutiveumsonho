import Head from "next/head";
import {
  Box,
  Button,
  Heading,
  Layer,
  PageContent,
  ResponsiveContext,
  Text,
  WorldMap,
} from "grommet";
import Layout from "../components/layout";
import { useRouter } from "next/router";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useContext, useEffect, useState } from "react";
import NoSSR from "../components/no-ssr";
import dynamic from "next/dynamic";
import Loading from "../components/editor/loading";
import { Close } from "grommet-icons";
import styles from "./invite.module.css";

const Editor = dynamic(() => import("../components/editor"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function Invite() {
  const { push } = useRouter();
  const control = useAnimation();
  const [ref, inView] = useInView();
  const size = useContext(ResponsiveContext);
  const [openSignIn, setOpenSignIn] = useState(false);

  const titleVariant = {
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.9 },
    },
    hidden: { opacity: 0, scale: 0 },
  };

  const boxVariant = {
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
    hidden: { opacity: 0, scale: 0, x: 100 },
  };

  const boxVariant2 = {
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
    hidden: { opacity: 0, scale: 0, x: -40 },
  };

  const boxVariant3 = {
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
    hidden: { opacity: 0, scale: 0, x: 0 },
  };

  useEffect(() => {
    if (inView) {
      control.start("visible");
    }
  }, [control, inView]);

  return (
    <Layout>
      <Head>
        <title>Eu tive um sonho</title>
        <meta name="description" content="O seu repositório de sonhos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContent
        justify="center"
        align="center"
        flex
        pad="xlarge"
        style={{
          minHeight: "calc(90vh - 11.75rem)",
        }}
      >
        <Box
          style={{
            position: "absolute",
            zIndex: 0,
            overflow: "hidden",
          }}
          flex
          align="center"
          justify="center"
        >
          <WorldMap
            style={{
              height: "100%",
              width: "auto",
            }}
          />
        </Box>
        <Heading
          level={2}
          size="large"
          style={{
            zIndex: 1,
            textAlign: size === "small" ? "center" : "start",
          }}
        >
          Vamos construir a maior comunidade de pessoas sonhadoras do Brasil e
          do mundo?
        </Heading>
        <Box
          style={{
            zIndex: 1,
          }}
        >
          <div>
            <Button
              primary
              label="Quero fazer parte"
              onClick={() => push("/auth/signin")}
            />
          </div>
        </Box>
      </PageContent>
      <PageContent
        justify="center"
        align="center"
        flex
        background={"brand"}
        className={styles.wave}
        style={{
          position: "relative",
          paddingRight: 0,
          paddingLeft: 0,
          overflow: "hidden",
          zIndex: -1,
        }}
      >
        <Box pad="large">
          <Box
            ref={ref}
            gap="large"
            style={{
              position: "relative",
            }}
          >
            <Box pad="xsmall" justify="center" align="center">
              <NoSSR>
                <Box
                  direction={size === "large" ? "row" : "column"}
                  align="center"
                  justify="center"
                >
                  <motion.span
                    variants={titleVariant}
                    animate={control}
                    style={{
                      position: "relative",
                      marginBottom: "2rem",
                    }}
                  >
                    <Heading
                      size="xxlarge"
                      color="white"
                      style={{
                        textAlign: size === "small" ? "center" : "start",
                      }}
                    >
                      Compartilhe os seus sonhos e veja o que outras pessoas
                      estão sonhando
                    </Heading>
                  </motion.span>
                  <motion.img
                    variants={boxVariant}
                    initial="hidden"
                    animate={control}
                    style={{
                      maxWidth: "40rem",
                      border: "1px solid rgb(126, 76, 219)",
                      borderRadius: "0.5rem",
                      boxShadow: "rgb(0 0 0 / 20%) 0px 8px 16px",
                      marginBottom: "2rem",
                    }}
                    src="/images/home/descubra.png"
                  />
                </Box>
              </NoSSR>
            </Box>
          </Box>

          <Box pad="xsmall" direction="row">
            <NoSSR>
              <Box
                direction={size === "small" ? "column-reverse" : "row"}
                align="center"
                justify="center"
              >
                <motion.img
                  variants={boxVariant2}
                  initial="hidden"
                  animate={control}
                  style={{
                    maxWidth: size === "small" ? "30rem" : "40rem",
                    border: "1px solid rgb(126, 76, 219)",
                    borderRadius: "0.5rem",
                    boxShadow: "rgb(0 0 0 / 20%) 0px 8px 16px",
                    marginBottom: "2rem",
                  }}
                  src="/images/home/pesquisar.png"
                />
                <motion.span
                  variants={titleVariant}
                  animate={control}
                  style={{
                    position: "relative",
                    marginBottom: "2rem",
                  }}
                >
                  <Heading
                    size="xxlarge"
                    color="white"
                    style={{
                      textAlign: size === "small" ? "center" : "start",
                    }}
                  >
                    Encontre sonhos de outras pessoas baseado em termos que são
                    relevantes para você
                  </Heading>
                </motion.span>
              </Box>
            </NoSSR>
          </Box>

          <Box pad="xsmall" direction="row">
            <NoSSR>
              <Box
                direction={size === "large" ? "row" : "column"}
                align="center"
                justify="center"
              >
                <motion.span
                  variants={titleVariant}
                  animate={control}
                  style={{
                    position: "relative",
                    marginBottom: "2rem",
                  }}
                >
                  <Heading
                    size="xxlarge"
                    color="white"
                    style={{
                      textAlign: size === "small" ? "center" : "start",
                      marginRight: "30px",
                    }}
                  >
                    Armazene os seus sonhos em segurança, e visualize os seus
                    padrões
                  </Heading>
                </motion.span>
                <motion.img
                  variants={boxVariant3}
                  initial="hidden"
                  animate={control}
                  style={{
                    maxWidth: "15rem",
                    border: "1px solid rgb(126, 76, 219)",
                    borderRadius: "0.5rem",
                    boxShadow: "rgb(0 0 0 / 20%) 0px 8px 16px",
                    marginBottom: "2rem",
                  }}
                  src="/images/home/insights.png"
                />
              </Box>
            </NoSSR>
          </Box>
        </Box>
      </PageContent>
      <PageContent
        justify="start"
        align="center"
        flex
        style={{
          position: "relative",
          paddingRight: 0,
          paddingLeft: 0,
          minHeight: "100vh",
        }}
      >
        <Box direction="column" align="center">
          <Box
            pad="large"
            align="center"
            background="dark-1"
            style={{
              width: "100%",
            }}
          >
            <Heading
              size="xxlarge"
              style={{
                textAlign: "center",
              }}
            >
              Quer fazer parte da maior comunidade de pessoas sonhadoras do
              Brasil?
            </Heading>
            <Text
              size="xxlarge"
              style={{
                textAlign: size === "small" ? "center" : "start",
                marginBottom: "2rem",
              }}
            >
              Compartilhe seu sonho!
            </Text>
          </Box>
          <Editor
            placeholder="Eu tive um sonho..."
            defaultValue={
              typeof window !== "undefined"
                ? localStorage.getItem("eutiveumsonho__publicEditorData") ??
                  "<p></p>"
                : "<p></p>"
            }
            save={(html) => {
              if (
                html === localStorage.getItem("eutiveumsonho__publicEditorData")
              ) {
                return;
              }

              if (typeof window !== "undefined") {
                localStorage.setItem("eutiveumsonho__publicEditorData", html);
              }

              setOpenSignIn(true);
            }}
            style={{
              width: "100%",
            }}
          />
          {openSignIn ? (
            <Layer
              position="center"
              onClickOutside={() => setOpenSignIn(false)}
              onEsc={() => setOpenSignIn(false)}
              modal
            >
              <Box
                pad="medium"
                gap="small"
                width="large"
                overflow="auto"
                justify="center"
                align="center"
              >
                <Box direction="row" justify="between" width="100%">
                  <Heading
                    level={2}
                    margin="none"
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    Entrar
                  </Heading>
                  <Button
                    icon={<Close />}
                    onClick={() => setOpenSignIn(false)}
                  />
                </Box>
                <Heading
                  level={3}
                  margin="none"
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  Entre para salvar seu sonho 🌟
                </Heading>
                <Heading
                  level={4}
                  fill
                  margin="none"
                  style={{
                    textAlign: "center",
                  }}
                >
                  Venha construir a maior comunidade de pessoas sonhadoras do
                  Brasil, e do mundo!
                </Heading>
                <Button
                  primary
                  label="Entrar"
                  onClick={() => push("/auth/signin")}
                />
              </Box>
            </Layer>
          ) : null}
        </Box>
      </PageContent>
    </Layout>
  );
}
