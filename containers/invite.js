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
  const control2 = useAnimation();
  const control3 = useAnimation();
  const control4 = useAnimation();
  const [ref, inView] = useInView();
  const [ref2, inView2] = useInView();
  const [ref3, inView3] = useInView();
  const [ref4, inView4] = useInView();

  const size = useContext(ResponsiveContext);
  const [openSignIn, setOpenSignIn] = useState(false);

  const variant = {
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
    hidden: { opacity: 0, scale: 0, x: 0 },
  };

  useEffect(() => {
    if (inView) {
      control.start("visible");
    }
  }, [control, inView]);

  useEffect(() => {
    if (inView2) {
      control2.start("visible");
    }
  }, [control2, inView2]);

  useEffect(() => {
    if (inView3) {
      control3.start("visible");
    }
  }, [control3, inView3]);

  useEffect(() => {
    if (inView4) {
      control4.start("visible");
    }
  }, [control4, inView4]);

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
          minHeight: "70vh",
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
              onClick={() => {
                push("/auth/signin");
              }}
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
                  gap="medium"
                >
                  <Heading
                    size="xxlarge"
                    color="white"
                    style={{
                      textAlign: size === "large" ? "start" : "center",
                    }}
                  >
                    Compartilhe os seus sonhos e veja o que outras pessoas estão
                    sonhando
                  </Heading>
                  <motion.img
                    variants={variant}
                    initial="hidden"
                    animate={control}
                    style={{
                      maxWidth: size === "small" ? "22rem" : "40rem",
                      border: "1px solid rgb(126, 76, 219)",
                      borderRadius: "0.5rem",
                      boxShadow: "rgb(0 0 0 / 20%) 0px 8px 16px",
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
                ref={ref2}
                direction={size === "large" ? "row" : "column-reverse"}
                align="center"
                justify="center"
                gap="medium"
              >
                <motion.img
                  variants={variant}
                  initial="hidden"
                  animate={control2}
                  style={{
                    maxWidth: size === "small" ? "20rem" : "40rem",
                    border: "1px solid rgb(126, 76, 219)",
                    borderRadius: "0.5rem",
                    boxShadow: "rgb(0 0 0 / 20%) 0px 8px 16px",
                  }}
                  src="/images/home/pesquisar.png"
                />

                <Heading
                  size="xxlarge"
                  color="white"
                  style={{
                    textAlign: size === "large" ? "start" : "center",
                  }}
                >
                  Encontre sonhos de outras pessoas baseado em termos que são
                  relevantes para você
                </Heading>
              </Box>
            </NoSSR>
          </Box>

          <Box pad="xsmall" direction="row">
            <NoSSR>
              <Box
                ref={ref3}
                direction={size === "large" ? "row" : "column"}
                align="center"
                justify="center"
                gap="medium"
              >
                <Heading
                  size="xxlarge"
                  color="white"
                  style={{
                    textAlign: size === "large" ? "start" : "center",
                  }}
                >
                  Armazene os seus sonhos em segurança e visualize os seus
                  padrões
                </Heading>
                <motion.img
                  variants={variant}
                  initial="hidden"
                  animate={control3}
                  style={{
                    maxWidth: "15rem",
                    border: "1px solid rgb(126, 76, 219)",
                    borderRadius: "0.5rem",
                    boxShadow: "rgb(0 0 0 / 20%) 0px 8px 16px",
                  }}
                  src="/images/home/insights.png"
                />
              </Box>
            </NoSSR>
          </Box>

          <Box pad="xsmall" direction="row">
            <NoSSR>
              <Box
                ref={ref4}
                direction={size === "large" ? "row" : "column"}
                align="center"
                justify="center"
                gap="medium"
              >
                <Heading
                  size="xxlarge"
                  color="white"
                  style={{
                    textAlign: size === "large" ? "start" : "center",
                  }}
                >
                  Desfrute do poder de Sonio, nossa I.A., para aprofundar sua
                  relação com seus sonhos
                </Heading>
                <motion.img
                  variants={variant}
                  initial="hidden"
                  animate={control4}
                  style={{
                    maxWidth: "18rem",
                    border: "1px solid rgb(126, 76, 219)",
                    borderRadius: "0.5rem",
                    boxShadow: "rgb(0 0 0 / 20%) 0px 8px 16px",
                  }}
                  src="/images/home/ai.png"
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
