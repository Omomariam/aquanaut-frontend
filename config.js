// Public local/preview defaults. GitHub repository variables override these on publish.
window.AQUA_CONFIG = {
  "TOKEN_CA": ""
};

// These browser scripts use no private configuration or wallet credentials.
document.addEventListener("DOMContentLoaded", () => {
  const loadScript = (src, marker) => {
    if (document.querySelector(`script[${marker}]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.setAttribute(marker, "true");
    document.head.append(script);
  };

  loadScript("./wallet-provider.js?v=20260329-3", "data-aquanaut-wallet");
  loadScript("./no-demo.js?v=20260329-1", "data-aquanaut-copy");
});
