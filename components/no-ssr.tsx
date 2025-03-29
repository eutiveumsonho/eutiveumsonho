import React, { ReactNode } from "react";

const DefaultOnSSR = () => <></>;

interface NoSSRProps {
  children: ReactNode;
  onSSR?: ReactNode;
}

interface NoSSRState {
  canRender: boolean;
}

class NoSSR extends React.Component<NoSSRProps, NoSSRState> {
  constructor(props: NoSSRProps) {
    super(props);
    this.state = {
      canRender: false,
    };
  }

  componentDidMount() {
    this.setState({ canRender: true });
  }

  render() {
    const { children, onSSR = <DefaultOnSSR /> } = this.props;
    const { canRender } = this.state;

    return canRender ? children : onSSR;
  }
}

export default NoSSR;