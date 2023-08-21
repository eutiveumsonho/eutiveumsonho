import React from "react";
import { logError } from "../lib/o11y";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    logError({ error, error_message: errorInfo, service: "web" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Opa, houve um erro!</h2>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
          >
            Tente novamente?
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
