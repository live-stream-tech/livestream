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
        <meta name="application-name" content="RawStock" />
        <meta name="description" content="ライブ配信・有料動画プラットフォーム" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RawStock" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favi.png" />
        <link rel="apple-touch-icon" href="/favi.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600;800&family=DM+Serif+Display:ital@0;1&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
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
