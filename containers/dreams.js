import { Box, Button, Heading, Layer, Spinner, Text } from "grommet";
import { Edit, Trash, View } from "grommet-icons";
import { useRouter } from "next/router";
import Dashboard from "../components/dashboard";
import Tip from "../components/tip";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { truncate } from "../lib/strings";
import VisibilityIcon from "../components/visbility-icon";
import { BRAND_HEX } from "../lib/config";
import { deleteDream } from "../lib/api";
import { useState } from "react";
import "dayjs/locale/pt-br";
import Empty from "../components/empty";

dayjs.extend(LocalizedFormat);

export default function DreamsContainer(props) {
  const { serverSession, data, title, empty, deviceType } = props;
  const { push, reload, locale } = useRouter();
  const [open, setOpen] = useState(false);
  const [dreamIdToDelete, setDreamIdToDelete] = useState();
  const [deleting, setDeleting] = useState(false);

  const delDream = async () => {
    setDeleting(true);
    await deleteDream(dreamIdToDelete);
    setDeleting(false);
    onClose();

    // TODO: refetch data
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
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
      <Box pad="medium">
        <Heading size="small">{title}</Heading>
        <div>
          {data.length === 0 ? <Empty empty={empty} /> : null}
          {data.map((item, index) => {
            return (
              <MyDream
                key={item.createdAt}
                item={item}
                index={index}
                data={data}
                deleting={deleting}
                open={open}
                onOpen={onOpen}
                delDream={delDream}
                onClose={onClose}
                push={push}
                locale={locale}
              />
            );
          })}
        </div>
      </Box>
    </Dashboard>
  );
}

function MyDream(props) {
  const {
    item,
    index,
    data,
    deleting,
    open,
    onOpen,
    delDream,
    onClose,
    push,
    locale,
  } = props;

  return (
    <Box
      key={item.createdAt}
      direction="column"
      style={{
        borderBottom:
          index + 1 === data.length ? "unset" : `1px solid ${BRAND_HEX}`,
      }}
    >
      <Box justify="center" align="center" pad="small" gap="small">
        <VisibilityIcon option={item.visibility} />
        <Text size="xsmall">
          {dayjs(item.createdAt).locale("pt-br").format("LL")}
        </Text>
      </Box>
      <Box direction="row" justify="between" align="center">
        <Box
          direction="row"
          align="center"
          pad="medium"
          style={{
            maxWidth: "calc(100% - 3rem)",
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html:
                item.dream.html.length > 400
                  ? truncate(item.dream.html, 400, true)
                  : item.dream.html,
            }}
          />
        </Box>
        <Box direction={"column"}>
          <Tip content="Ver sonho">
            <Button
              icon={<View />}
              hoverIndicator
              onClick={() => push(`/${locale}/dreams/${item._id}`)}
            />
          </Tip>
          <Tip content="Editar sonho">
            <Button
              icon={<Edit />}
              hoverIndicator
              onClick={() => push(`/${locale}/publish/${item._id}`)}
            />
          </Tip>
          <Tip content="Deletar sonho">
            <Button
              icon={deleting ? <Spinner size="small" /> : <Trash />}
              hoverIndicator
              disabled={deleting}
              onClick={() => onOpen(item._id)}
            />
          </Tip>
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
                <Text>Tem certeza que deseja deletar este sonho?</Text>
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
}
