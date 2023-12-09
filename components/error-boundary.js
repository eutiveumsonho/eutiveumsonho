import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error({ error, errorInfo });
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
