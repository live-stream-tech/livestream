import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1B2838" />
        <meta name="application-name" content="LiveStage" />
        <meta name="description" content="ライブ配信・有料動画プラットフォーム" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LiveStage" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`data:image/svg+xml,${encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1B2838"/><text x="6" y="22" font-family="system-ui,Arial,sans-serif" font-size="18" font-weight="800" fill="#FFFFFF">L</text><text x="16" y="22" font-family="system-ui,Arial,sans-serif" font-size="18" font-weight="800" fill="#29B6CF">S</text></svg>'
          )}`}
        />
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root {
            height: 100%;
            overflow: hidden;
            background-color: #1B2838;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
