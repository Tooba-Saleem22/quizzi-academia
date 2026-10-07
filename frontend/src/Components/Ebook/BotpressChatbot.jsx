import React, { useEffect } from "react";

const BotpressChatbot = () => {
  useEffect(() => {
    const injectScript = document.createElement("script");

    injectScript.src = "https://cdn.botpress.cloud/webchat/v3.7/inject.js";
    injectScript.async = true;

    injectScript.onload = async () => {
      const response = await fetch(
        "https://files.bpcontent.cloud/2026/10/06/13/20261006132124-RA0QXM91.json"
      );

      const config = await response.json();

      window.botpress.init(config);
    };

    document.body.appendChild(injectScript);

    return () => {
      injectScript.remove();
    };
  }, []);

  return null;
};

export default BotpressChatbot;
