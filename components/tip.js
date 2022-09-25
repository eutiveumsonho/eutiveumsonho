import { Tip as BaseTip } from "grommet";

export default function Tip(props) {
  return (
    <BaseTip
      {...props}
      plain
      dropProps={{
        background: "white",
        elevation: "large",
        style: {
          padding: "0.4rem",
          borderRadius: "0.25rem",
        },
      }}
    />
  );
}
