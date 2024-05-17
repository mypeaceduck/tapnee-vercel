import { SDKProvider } from "@tma.js/sdk-react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useMemo } from "react";

export default function Provider({ children }: any) {
  const manifestUrl = useMemo(() => {
    return typeof window === "undefined"
      ? ""
      : new URL("/tonconnect-manifest.json", window.location.href).toString();
  }, []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <SDKProvider acceptCustomStyles>{children}</SDKProvider>
    </TonConnectUIProvider>
  );
}
