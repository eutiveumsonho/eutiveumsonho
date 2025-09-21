import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Spinner,
  TextInput,
  ResponsiveContext,
} from "grommet";
import { Search as SearchIcon } from "grommet-icons";
import { useContext } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { truncate } from "../lib/strings";

export default function PublicDreamsSection({ deviceType }) {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const size = useContext(ResponsiveContext);
  const { locale, push } = useRouter();
  const { t } = useTranslation("layout");

  const isSmall = deviceType === "mobile" || size === "small";

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async (query = "") => {
    try {
      setLoading(true);
      const url = query
        ? `/api/public-dreams?query=${encodeURIComponent(query)}&limit=15`
        : "/api/public-dreams?limit=15";

      const response = await fetch(url);
      const data = await response.json();
      setDreams(data || []);
    } catch (error) {
      console.error("Error fetching dreams:", error);
      setDreams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      fetchDreams();
      return;
    }

    setSearching(true);
    await fetchDreams(query);
    setSearching(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  return (
    <Box
      pad={{ horizontal: "large", vertical: "xlarge" }}
      background="light-1"
      style={{ minHeight: "80vh", width: "100%" }}
    >
      <Box
        align="center"
        gap="large"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <Box align="center" gap="medium">
          <Heading level={2} size="large" textAlign="center">
            {t("discover-dreams") || "Discover Dreams"}
          </Heading>
          <Text size="medium" textAlign="center" color="dark-4">
            {t("explore-public-dreams") ||
              "Explore dreams shared by our community"}
          </Text>
        </Box>

        {/* Search Section */}
        <Box
          direction={isSmall ? "column" : "row"}
          gap="small"
          align="center"
          width={{ max: "600px" }}
        >
          <TextInput
            placeholder={t("search-dreams") || "Search dreams..."}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyPress={handleKeyPress}
            icon={<SearchIcon />}
            style={{ flex: 1 }}
          />
          <Button
            primary
            label={
              searching ? <Spinner size="small" /> : t("search") || "Search"
            }
            onClick={() => handleSearch(searchQuery)}
            disabled={searching}
          />
        </Box>
        {/* Dreams List */}
        <Box width="100%" gap="medium">
          {loading ? (
            <Box align="center" pad="large">
              <Spinner size="medium" />
              <Text>{t("loading-dreams") || "Loading dreams..."}</Text>
            </Box>
          ) : dreams.length === 0 ? (
            <Box align="center" pad="large">
              <Text>{t("no-dreams-found") || "No dreams found"}</Text>
            </Box>
          ) : (
            <Box gap="medium">
              {dreams.map((dream, index) => (
                <PublicDreamCard
                  key={dream._id || index}
                  dream={dream}
                  locale={locale}
                  push={push}
                  isSmall={isSmall}
                  t={t}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Call to Action */}
        <Box align="center" gap="medium" pad="large">
          <Heading level={3} size="medium" textAlign="center">
            {t("want-to-share") || "Want to share your dreams?"}
          </Heading>
          <Button
            primary
            label={t("join-community") || "Join Community"}
            onClick={() => {
              const callbackUrl = `${window.location.origin}/${locale}/dreams`;
              const encodedURI = encodeURIComponent(callbackUrl);
              push(`/${locale}/auth/signin?callbackUrl=${encodedURI}`);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

function PublicDreamCard({ dream, locale, push, isSmall, t }) {
  const maxLength = isSmall ? 200 : 300;
  const dreamText = dream.dream?.html || dream.dream?.text || "";
  const truncatedText =
    dreamText.length > maxLength
      ? truncate(dreamText, maxLength, true)
      : dreamText;

  return (
    <Box
      background="white"
      border={{ color: "border", size: "small" }}
      round="small"
      pad="medium"
      gap="small"
      hoverIndicator={{
        background: "background-contrast",
        elevation: "small",
      }}
      onClick={() => {
        // If user exists, this dream is viewable
        if (dream.user || dream.visibility === "public") {
          push(`/${locale}/dreams/${dream._id}`);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Dream Header */}
      <Box direction="row" justify="between" align="start" gap="small">
        <Box>
          {dream.user ? (
            <Text size="small" color="dark-4">
              {t("by")} @{dream.user.username}
            </Text>
          ) : (
            <Text size="small" color="dark-4">
              {t("anonymous-dream") || "Anonymous"}
            </Text>
          )}
        </Box>
        <Text size="xsmall" color="dark-4">
          {new Date(dream.createdAt).toLocaleDateString()}
        </Text>
      </Box>

      {/* Dream Content */}
      <Box>
        <div
          dangerouslySetInnerHTML={{
            __html: truncatedText,
          }}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
        {dreamText.length > maxLength && (
          <Text size="small" color="dark-4">
            {t("click-to-read-more") || "Click to read more..."}
          </Text>
        )}
      </Box>

      {/* Dream Footer */}
      <Box direction="row" gap="small" align="center">
        {dream.starCount > 0 && (
          <Text size="small" color="dark-4">
            ⭐ {dream.starCount}
          </Text>
        )}
        {dream.commentCount > 0 && (
          <Text size="small" color="dark-4">
            💬 {dream.commentCount}
          </Text>
        )}
      </Box>
    </Box>
  );
}
