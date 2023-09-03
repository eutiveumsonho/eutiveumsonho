import { useState, useRef } from "react";
import { FormClose } from "grommet-icons";
import { Box, Button, Keyboard, Text, TextInput } from "grommet";
import { useTranslation } from "react-i18next";

const Tag = ({ children, onRemove, ...rest }) => {
  const tag = (
    <Box
      direction="row"
      align="center"
      background="brand"
      pad={{ horizontal: "xsmall", vertical: "xxsmall" }}
      margin={{ vertical: "xxsmall" }}
      round="medium"
      {...rest}
    >
      <Text size="xsmall" margin={{ right: "xxsmall" }}>
        {children}
      </Text>
      {onRemove && <FormClose size="small" color="white" />}
    </Box>
  );

  if (onRemove) {
    return <Button onClick={onRemove}>{tag}</Button>;
  }
  return tag;
};

const TagInput = ({ value = [], onAdd, onChange, onRemove, ...rest }) => {
  const [currentTag, setCurrentTag] = useState("");
  const boxRef = useRef();

  const updateCurrentTag = (event) => {
    setCurrentTag(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  const onAddTag = (tag) => {
    if (onAdd) {
      onAdd(tag);
    }
  };

  const onEnter = () => {
    if (currentTag.length) {
      onAddTag(currentTag);
      setCurrentTag("");
    }
  };

  const renderValue = () =>
    value.map((v, index) => (
      <Tag
        margin="xxsmall"
        key={`${v}${index + 0}`}
        onRemove={() => onRemove(v)}
      >
        {v}
      </Tag>
    ));

  return (
    <Keyboard onEnter={onEnter}>
      <Box
        direction="row"
        align="center"
        pad={{ horizontal: "xsmall" }}
        border="all"
        ref={boxRef}
        wrap
      >
        {value.length > 0 && renderValue()}
        <Box flex style={{ minWidth: "px" }}>
          <TextInput
            type="search"
            plain
            dropTarget={boxRef.current}
            {...rest}
            onChange={updateCurrentTag}
            value={currentTag}
            onSuggestionSelect={(event) => onAddTag(event.suggestion)}
          />
        </Box>
      </Box>
    </Keyboard>
  );
};

export default function Search(props) {
  const { suggestions: allSuggestions, selectedTags, setSelectedTags } = props;
  const [suggestions, setSuggestions] = useState(allSuggestions);
  const { t } = useTranslation("dashboard");

  const onRemoveTag = (tag) => {
    const removeIndex = selectedTags.indexOf(tag);
    const newTags = [...selectedTags];
    if (removeIndex >= 0) {
      newTags.splice(removeIndex, 1);
    }
    setSelectedTags(newTags);
  };

  const onAddTag = (tag) => setSelectedTags([...selectedTags, tag]);

  const onFilterSuggestion = (value) =>
    setSuggestions(
      allSuggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().indexOf(value.toLowerCase()) >= 0
      )
    );

  return (
    <TagInput
      placeholder={t("search-by")}
      suggestions={suggestions}
      value={selectedTags}
      onRemove={onRemoveTag}
      onAdd={onAddTag}
      onChange={({ target: { value } }) => onFilterSuggestion(value)}
    />
  );
}
