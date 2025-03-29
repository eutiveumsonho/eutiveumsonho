import { Tip as BaseTip, TipProps as BaseTipProps } from "grommet";
import { ReactNode } from "react";

interface TipProps extends Omit<BaseTipProps, 'plain' | 'dropProps'> {
  content?: ReactNode;
  children: ReactNode;
}

export default function Tip(props: TipProps): JSX.Element {
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