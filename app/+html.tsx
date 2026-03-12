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
        <link rel="icon" type="image/png" href="/fav.png" />
        <link rel="apple-touch-icon" href="/fav.png" />
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
