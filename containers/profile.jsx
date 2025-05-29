import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Text,
  TextInput,
  RadioButtonGroup,
  Spinner,
  Layer,
} from "grommet";
import Dashboard from "../components/dashboard";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function ProfilePage(props) {
  const { serverSession, deviceType } = props;
  const { t } = useTranslation("dashboard");
  const { locale } = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    profileVisibility: "private",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          username: data.profile.username || "",
          name: data.profile.name || "",
          profileVisibility: data.profile.profileVisibility || "private",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = async (username) => {
    if (!username || username === profile?.username) {
      setUsernameError("");
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch("/api/profile/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (!data.available) {
        setUsernameError(data.error || t("username-taken"));
      } else {
        setUsernameError("");
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (event) => {
    const username = event.target.value;
    setFormData({ ...formData, username });
    
    // Debounce username checking
    clearTimeout(window.usernameTimeout);
    window.usernameTimeout = setTimeout(() => {
      checkUsername(username);
    }, 500);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (usernameError) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        // Show success message or redirect
      } else {
        const error = await response.json();
        alert(error.error || t("profile-update-error"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t("profile-update-error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dashboard serverSession={serverSession} deviceType={deviceType}>
        <Box align="center" justify="center" height="medium">
          <Spinner size="large" />
        </Box>
      </Dashboard>
    );
  }

  return (
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
      <Box pad="medium">
        <Heading size="small">{t("profile")}</Heading>
        
        <Form onSubmit={handleSubmit}>
          <FormField
            label={t("username")}
            error={usernameError}
            help={t("username-help")}
          >
            <Box direction="row" align="center" gap="small">
              <TextInput
                name="username"
                value={formData.username}
                onChange={handleUsernameChange}
                placeholder={t("username-placeholder")}
              />
              {checkingUsername && <Spinner size="small" />}
            </Box>
          </FormField>

          <FormField label={t("display-name")} help={t("display-name-help")}>
            <TextInput
              name="name"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              placeholder={t("display-name-placeholder")}
            />
          </FormField>

          <FormField label={t("profile-visibility")} help={t("profile-visibility-help")}>
            <RadioButtonGroup
              name="profileVisibility"
              value={formData.profileVisibility}
              onChange={(event) =>
                setFormData({ ...formData, profileVisibility: event.target.value })
              }
              options={[
                { label: t("profile-private"), value: "private" },
                { label: t("profile-public"), value: "public" },
              ]}
            />
          </FormField>

          <Box direction="row" gap="small" margin={{ top: "medium" }}>
            <Button
              type="submit"
              primary
              label={saving ? t("saving") : t("save-profile")}
              disabled={saving || checkingUsername || !!usernameError}
              icon={saving ? <Spinner size="small" /> : undefined}
            />
            {profile?.username && profile?.profileVisibility === "public" && (
              <Button
                label={t("view-public-profile")}
                href={`/${locale}/profile/${profile.username}`}
                target="_blank"
              />
            )}
          </Box>
        </Form>
      </Box>
    </Dashboard>
  );
}