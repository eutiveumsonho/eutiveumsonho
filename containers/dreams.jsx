import { Box, Button, Heading, Layer, Spinner, Text } from "grommet";
import { Edit, Trash, View, Mail } from "grommet-icons";
import { useRouter } from "next/router";
import Dashboard from "../components/dashboard";
import Tip from "../components/tip";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { truncate } from "../lib/strings";
import VisibilityIcon from "../components/visbility-icon";
import { BRAND_HEX } from "../lib/config";
import { deletePost, exportDreamsToEmail } from "../lib/api";
import { useState } from "react";
import Empty from "../components/empty";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";

dayjs.extend(LocalizedFormat);

export default function DreamsContainer(props) {
  const { serverSession, data, title, empty, deviceType } = props;
  const { push, reload, locale } = useRouter();
  const [open, setOpen] = useState(false);
  const [dreamIdToDelete, setDreamIdToDelete] = useState();
  const [deleting, setDeleting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const delDream = async () => {
    setDeleting(true);
    await deletePost(dreamIdToDelete);
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

  const exportDreams = async () => {
    setExporting(true);
    try {
      const result = await exportDreamsToEmail(locale);
      if (result.success) {
        setExportOpen(false);
      }
    } catch (error) {
      console.error("Error exporting dreams:", error);
    }
    setExporting(false);
  };

  const onExportOpen = () => {
    setExportOpen(true);
  };

  const onExportClose = () => {
    setExportOpen(false);
  };

  return (
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
      <Box pad="medium">
        <Box
          direction="row"
          justify="between"
          align="center"
          margin={{ bottom: "medium" }}
        >
          <Heading size="small">{title}</Heading>
          {data.length > 0 && (
            <Tip content={getExportTooltip(locale)}>
              <Button
                icon={<Mail />}
                label={getExportLabel(locale)}
                onClick={onExportOpen}
                size="small"
                secondary
              />
            </Tip>
          )}
        </Box>
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

        {exportOpen && (
          <Layer
            id="export-modal"
            position="center"
            onClickOutside={onExportClose}
            onEsc={onExportClose}
          >
            <Box pad="medium" gap="small" width="medium">
              <Heading level={3} margin="none">
                {getExportModalTitle(locale)}
              </Heading>
              <Text>{getExportModalText(locale, data.length)}</Text>
              <Box
                as="footer"
                gap="small"
                direction="row"
                align="center"
                justify="end"
                pad={{ top: "medium", bottom: "small" }}
              >
                <Button
                  label={getCancelLabel(locale)}
                  onClick={onExportClose}
                  disabled={exporting}
                />
                <Button
                  icon={exporting ? <Spinner size="xsmall" /> : <Mail />}
                  label={
                    <Text color="white">
                      <strong>
                        {exporting
                          ? getExportingLabel(locale)
                          : getExportConfirmLabel(locale)}
                      </strong>
                    </Text>
                  }
                  onClick={exportDreams}
                  primary
                  disabled={exporting}
                  color="brand"
                />
              </Box>
            </Box>
          </Layer>
        )}
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
          {dayjs(item.createdAt).locale(locale).format("LL")}
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

// Localization helper functions
function getExportLabel(locale) {
  const labels = {
    en: "Export to Email",
    pt: "Exportar por Email",
    es: "Exportar por Email",
    fr: "Exporter par Email",
  };
  return labels[locale] || labels.en;
}

function getExportTooltip(locale) {
  const tooltips = {
    en: "Send all your dreams to your email",
    pt: "Enviar todos os seus sonhos para seu email",
    es: "Enviar todos tus sueños a tu email",
    fr: "Envoyer tous vos rêves à votre email",
  };
  return tooltips[locale] || tooltips.en;
}

function getExportModalTitle(locale) {
  const titles = {
    en: "Export Dreams to Email",
    pt: "Exportar Sonhos por Email",
    es: "Exportar Sueños por Email",
    fr: "Exporter Rêves par Email",
  };
  return titles[locale] || titles.en;
}

function getExportModalText(locale, count) {
  const texts = {
    en: `We will send all ${count} of your dreams to your email address. This may take a few moments.`,
    pt: `Enviaremos todos os seus ${count} sonhos para seu endereço de email. Isso pode levar alguns instantes.`,
    es: `Enviaremos todos tus ${count} sueños a tu dirección de email. Esto puede tomar unos momentos.`,
    fr: `Nous enverrons tous vos ${count} rêves à votre adresse email. Cela peut prendre quelques instants.`,
  };
  return texts[locale] || texts.en;
}

function getCancelLabel(locale) {
  const labels = {
    en: "Cancel",
    pt: "Cancelar",
    es: "Cancelar",
    fr: "Annuler",
  };
  return labels[locale] || labels.en;
}

function getExportConfirmLabel(locale) {
  const labels = {
    en: "Send to Email",
    pt: "Enviar por Email",
    es: "Enviar por Email",
    fr: "Envoyer par Email",
  };
  return labels[locale] || labels.en;
}

function getExportingLabel(locale) {
  const labels = {
    en: "Sending...",
    pt: "Enviando...",
    es: "Enviando...",
    fr: "Envoi...",
  };
  return labels[locale] || labels.en;
}
