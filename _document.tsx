// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" data-theme="felena">
        <Head>
          {/* App identity */}
          <meta charSet="utf-8" />
          <meta name="application-name" content="Felena Theory" />
          <meta name="apple-mobile-web-app-title" content="Felena Theory" />
          <meta name="description" content="Multi‑Dimensional Quantum Arcade — Earnable XP → Cashout via Alpaca." />

          {/* Color & PWA */}
          <meta name="theme-color" content="#00ff99" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

          {/* Icons (ensure these files exist under /public) */}
          <link rel="icon" href="/felena-brand-kit/favicon.ico" />
          <link rel="apple-touch-icon" href="/felena-brand-kit/felena-logo-icon-192.png" sizes="192x192" />
          <link rel="apple-touch-icon" href="/felena-brand-kit/felena-logo-icon-256.png" sizes="256x256" />
          <link rel="apple-touch-icon" href="/felena-brand-kit/felena-logo-icon-512.png" sizes="512x512" />

          {/* Manifest for installable PWA */}
          <link rel="manifest" href="/manifest.json" />

          {/* Optional iOS splash (only include if file exists) */}
          {/* <link rel="apple-touch-startup-image" href="/splash/apple-launch-750x1334.png"
                media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" /> */}

          {/* Performance hints (safe to remove if not needed) */}
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          {/* Example font preload (uncomment if you actually use the file) */}
          {/* <link rel="preload" href="/fonts/Orbitron-Variable.woff2" as="font" type="font/woff2" crossOrigin="" /> */}

          {/* Third‑party origins you hit often (tweak as needed) */}
          <link rel="preconnect" href="https://kmalqsuhphfghgnizt.supabase.co" crossOrigin="" />
          <link rel="preconnect" href="https://api.stripe.com" crossOrigin="" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <noscript>
            <div style={{ color: '#0f0', textAlign: 'center', padding: 12 }}>
              Felena Theory requires JavaScript enabled.
            </div>
          </noscript>
        </body>
      </Html>
    );
  }
}

export default MyDocument;