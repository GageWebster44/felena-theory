// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import GlobalProvider from "../context/GlobalProvider";
import AuthGuard from "../context/AuthGuard";

// These live under src/components, so @ alias works
import GlobalWinnerBar from "@/components/GlobalWinnerBar";
import SeasonCountdownBar from "@/components/SeasonCountdownBar";
import CRTBootFX from "@/components/CRTBootFX";
import ConsentBanner from "@/components/ConsentBanner"; // NEW — global consent banner

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [booted, setBooted] = useState(false);

  // Optional: capture referral code on first load/route change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) localStorage.setItem("referralCode", ref);
  }, [router.asPath]);

  // Boot FX gate (first paint only)
  if (!booted) {
    return <CRTBootFX onComplete={() => setBooted(true)} />;
  }

  return (
    <>
      <Head>
        <title>Felena Theory</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <GlobalProvider>
        <SeasonCountdownBar />
        <GlobalWinnerBar />
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </GlobalProvider>

      {/* Consent banner runs last so it overlays all content */}
      <ConsentBanner />
    </>
  );
}

