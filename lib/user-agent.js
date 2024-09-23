import useragent from "express-useragent";
import { logError } from "./o11y/log";

export function getUserAgentProps(context) {
  try {
    const userAgent = context.req.headers["user-agent"];

    if (!userAgent) {
      return {
        deviceType: "",
      };
    }

    const useragentInfo = useragent.parse(userAgent);

    let deviceType = "desktop";

    if (useragentInfo.isMobile) {
      deviceType = "mobile";
    } else if (useragentInfo.isTablet) {
      deviceType = "tablet";
    }

    return {
      deviceType,
    };
  } catch (error) {
    logError(error, {
      component: "getUserAgentProps",
    });

    return {
      deviceType: "",
    };
  }
}
