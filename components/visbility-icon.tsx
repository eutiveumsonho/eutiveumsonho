import { Group, Hide, Key } from "grommet-icons";
import { IconProps } from "grommet-icons/icons";

interface VisibilityIconProps extends Omit<IconProps, "color"> {
  option: "private" | "public" | "anonymous";
}

export default function VisibilityIcon(props: VisibilityIconProps) {
  const { option, ...iconProps } = props;
  
  switch (option) {
    case "private":
      return <Key {...iconProps} />;
    case "public":
      return <Group {...iconProps} />;
    case "anonymous":
      return <Hide {...iconProps} />;
    default:
      return <Key {...iconProps} />; // Added explicit return to fix default case
  }
}