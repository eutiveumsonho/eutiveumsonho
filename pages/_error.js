import { logError } from "../lib/o11y";

function Error({ statusCode }) {
  logError({
    error_name: "error_component_rendered",
    error_message: statusCode,
    service: "web",
    component: "Error",
  });

  return (
    <p>
      {statusCode
        ? `Um erro de status ${statusCode} ocorreu no servidor`
        : "Um erro ocorreu no cliente."}
    </p>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
