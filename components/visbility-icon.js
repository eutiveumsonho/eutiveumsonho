import { Group, Hide, Key } from "grommet-icons";

export default function VisibilityIcon(props) {
  const { option, ...iconProps } = props;

  switch (option) {
    case "private":
      return <Key {...iconProps} />;
    case "public":
      return <Group {...iconProps} />;
    case "anonimous":
      return <Hide {...iconProps} />;
    default:
      <Key {...iconProps} />;
  }
}
