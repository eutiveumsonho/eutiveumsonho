import React from "react";
import {
  Box,
  Heading,
  Text,
  Avatar,
  Card,
  CardBody,
} from "grommet";
import Layout from "../components/layout";
import { useTranslation } from "next-i18next";
import { User, Calendar } from "grommet-icons";

export default function PublicProfilePage(props) {
  const { profile, deviceType } = props;
  const { t } = useTranslation("dashboard");

  if (!profile) {
    return (
      <Layout deviceType={deviceType}>
        <Box align="center" justify="center" height="medium" pad="large">
          <Heading level={2}>{t("profile-not-found")}</Heading>
          <Text>{t("profile-not-found-description")}</Text>
        </Box>
      </Layout>
    );
  }

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Layout deviceType={deviceType}>
      <Box pad="large" align="center">
        <Card width="large" background="light-1">
          <CardBody pad="large">
            <Box align="center" gap="medium">
              <Avatar 
                src={profile.image} 
                size="xlarge"
                background="light-3"
              />
              
              <Box align="center" gap="small">
                <Heading level={2} margin="none">
                  {profile.name || profile.username}
                </Heading>
                
                <Box direction="row" align="center" gap="small">
                  <User size="small" />
                  <Text size="medium" color="dark-4">
                    @{profile.username}
                  </Text>
                </Box>
                
                {profile.createdAt && (
                  <Box direction="row" align="center" gap="small">
                    <Calendar size="small" />
                    <Text size="small" color="dark-4">
                      {t("member-since", { date: formatDate(profile.createdAt) })}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
}