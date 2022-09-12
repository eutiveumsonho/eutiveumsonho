import { Box, Button, Heading, Layer, Paragraph, Spinner, Text } from "grommet";
import { Edit, Trash } from "grommet-icons";
import { useRouter } from "next/router";
import Dashboard from "../components/dashboard";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { truncate } from "../lib/strings";
import VisibilityIcon from "../components/visbility-icon";
import { BRAND_HEX } from "../lib/config";
import { deleteDream } from "../lib/api";
import { useState } from "react";
import "dayjs/locale/pt-br";

dayjs.extend(LocalizedFormat);

export default function MyDreamsPage(props) {
  const { serverSession, data } = props;
  const { push, reload } = useRouter();
  const [open, setOpen] = useState(false);
  const [dreamIdToDelete, setDreamIdToDelete] = useState();
  const [deleting, setDeleting] = useState(false);

  const delDream = async () => {
    setDeleting(true);
    await deleteDream(dreamIdToDelete);
    setDeleting(false);
    onClose();

    reload(window.location.pathname);
  };

  const onOpen = (dreamId) => {
    setOpen(true);
    setDreamIdToDelete(dreamId);
  };
  const onClose = () => {
    setOpen(false);
    setDreamIdToDelete(undefined);
  };

  return (
    <Dashboard serverSession={serverSession}>
      <Box pad="medium">
        <div>
          {data.length === 0 ? (
            <Box gap="small" pad="xlarge" align="center">
              <Text>Os seus sonhos serão listados aqui.</Text>
              <Box>
                <Button
                  label="Adicione seu primeiro sonho"
                  primary
                  onClick={() => push("/publicar")}
                />
              </Box>
            </Box>
          ) : null}
          {data.map((item) => {
            return (
              <Box
                key={item.createdAt}
                direction="row"
                justify="between"
                style={{
                  borderBottom: `1px solid ${BRAND_HEX}`,
                }}
              >
                <Box direction="row" justify="center" align="center">
                  <VisibilityIcon
                    option={item.visibility}
                    style={{
                      marginRight: "1rem",
                    }}
                  />
                  <Paragraph>
                    <span
                      dangerouslySetInnerHTML={{
                        __html:
                          item.dream.text.length > 100
                            ? truncate(item.dream.text, 100, true)
                            : item.dream.text,
                      }}
                    />
                  </Paragraph>
                </Box>
                <Box justify="center" align="center">
                  <Text size="xsmall">
                    {dayjs(item.createdAt).locale("pt-br").format("LL")}
                  </Text>
                  <div
                    style={{
                      height: "0.2rem",
                    }}
                  />
                  <Box direction="row">
                    <Button
                      icon={<Edit />}
                      hoverIndicator
                      onClick={() => push(`/publicar/${item._id}`)}
                    />
                    <Button
                      icon={deleting ? <Spinner size="small" /> : <Trash />}
                      hoverIndicator
                      disabled={deleting}
                      onClick={() => onOpen(item._id)}
                    />
                    {open ? (
                      <Layer
                        id="account-deletion-modal"
                        position="center"
                        onClickOutside={onClose}
                        onEsc={onClose}
                      >
                        <Box pad="medium" gap="small" width="medium">
                          <Heading level={3} margin="none">
                            Confirmar
                          </Heading>
                          <Text>
                            Tem certeza que deseja deletar este sonho?
                          </Text>
                          <Box
                            as="footer"
                            gap="small"
                            direction="row"
                            align="center"
                            justify="end"
                            pad={{ top: "medium", bottom: "small" }}
                          >
                            <Button
                              icon={deleting ? <Spinner size="xsmall" /> : null}
                              label={
                                <Text color="white">
                                  {deleting ? (
                                    <strong>Deletando...</strong>
                                  ) : (
                                    <strong>Sim, deletar</strong>
                                  )}
                                </Text>
                              }
                              onClick={delDream}
                              primary
                              disabled={deleting}
                              color="status-critical"
                            />
                          </Box>
                        </Box>
                      </Layer>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </div>
      </Box>
    </Dashboard>
  );
}
