import { useState, useRef, ReactNode } from "react";
import { FormClose } from "grommet-icons";
import { Box, Button, Keyboard, Text, TextInput, BoxProps, TextInputProps } from "grommet";
import { useTranslation } from "next-i18next";

interface TagProps extends BoxProps {
  children: ReactNode;
  onRemove?: () => void;
}

const Tag = ({ children, onRemove, ...rest }: TagProps) => {
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

interface TagInputProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  value?: string[];
  onAdd?: (tag: string) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: (tag: string) => void;
}

const TagInput = ({ value = [], onAdd, onChange, onRemove, ...rest }: TagInputProps) => {
  const [currentTag, setCurrentTag] = useState<string>("");
  const boxRef = useRef<HTMLDivElement>(null);

  const updateCurrentTag = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTag(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  const onAddTag = (tag: string) => {
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
        onRemove={() => onRemove?.(v)}
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
            data-umami-event="search-input"
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

interface SearchProps {
  suggestions: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

export default function Search(props: SearchProps): JSX.Element {
  const { suggestions: allSuggestions, selectedTags, setSelectedTags } = props;
  const [suggestions, setSuggestions] = useState<string[]>(allSuggestions);
  const { t } = useTranslation("dashboard");

  const onRemoveTag = (tag: string) => {
    const removeIndex = selectedTags.indexOf(tag);
    const newTags = [...selectedTags];
    if (removeIndex >= 0) {
      newTags.splice(removeIndex, 1);
    }
    setSelectedTags(newTags);
  };

  const onAddTag = (tag: string) => setSelectedTags([...selectedTags, tag]);

  const onFilterSuggestion = (value: string) =>
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