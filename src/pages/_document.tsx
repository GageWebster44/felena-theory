 import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* App Identity */}
        <meta name="application-name" content="Felena Theory" />
        <meta name="apple-mobile-web-app-title" content="Felena Theory" />
        <meta name="description" content="Multi-Dimensional Quantum Arcade" />
        <meta name="theme-color" content="#00ff99" />

        {/* Icons */}
        <link rel="icon" href="/felena-brand-kit/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/felena-brand-kit/felena-logo-icon-256.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS Splash Screen (Optional) */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-launch-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}