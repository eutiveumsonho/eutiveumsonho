import { logError } from "../lib/o11y";

function Error({ statusCode }) {
  logError({
    error_name: "ErrorComponentRendered",
    error_message: statusCode,
    service: "web",
    component: "Error",
  });

  return (
    <p>
      Oooops! Ocorreu um erro! Nós fomos notificados, mas sinta-se a vontade
      para recarregar a página e tentar novamente!
    </p>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
