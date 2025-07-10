import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#00FF99" />
        <meta name="description" content="Felena Theory - Real XP. Real Markets. Real Wins." />
      </Head>
      <body className="bg-black text-white font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
