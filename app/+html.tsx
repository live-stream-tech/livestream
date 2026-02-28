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
        <meta name="application-name" content="LiveStock" />
        <meta name="description" content="ライブ配信・有料動画プラットフォーム" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LiveStock" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root {
            height: 100%;
            max-height: 100%;
            overflow: hidden;
            background-color: #1B2838;
          }
          * { box-sizing: border-box; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
