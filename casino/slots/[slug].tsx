// src/pages/casino/slots/[slug].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import SlotRenderer from "@/components/SlotRenderer";
import { getSlotBySlug } from "@/lib/casino/registry";
import styles from "@/styles/slots/slots.module.css";

export default function SlotPage() {
  const { query, isReady } = useRouter();
  const slug = (query.slug as string) || "";
  const slot = isReady && slug ? getSlotBySlug(slug) : undefined;

  if (!isReady) return null;

  // pick a theme class from the css (fallback to themeDefault)
  const themeClass =
    (slot?.theme && (styles as any)[slot.theme]) || styles.themeDefault;

  return (
    <>
      <Head>
        <title>
          {slot ? `${slot.title} — Felena Theory` : "Slot — Felena Theory"}
        </title>
        <meta
          name="description"
          content={
            slot
              ? `${slot.title}: ${slot.theme ?? "default"} • ${
                  slot.payways ?? "—"
                } ways`
              : "Felena Theory Slot"
          }
        />
      </Head>

      <div className={`${styles.page} ${themeClass}`}>
        <div className={styles.backdrop} />

        <nav className={styles.nav}>
          <Link href="/casino">← Back to Casino</Link>
        </nav>

        <header className={styles.hero}>
          <h1 className={styles.title}>{slot?.title ?? "Unknown Slot"}</h1>
          {slot?.tagline && (
            <p className={styles.tagline}>{slot.tagline}</p>
          )}
        </header>

        <section className={styles.zone}>
          <div className={styles.cabinet}>
            {slot ? (
              <SlotRenderer slug={slug} />
            ) : (
              <div className={styles.card}>Unknown slot: {slug}</div>
            )}
          </div>
        </section>

        {slot?.rules && (
          <section className={styles.rules}>
            <h3>Rules & Info</h3>
            <div dangerouslySetInnerHTML={{ __html: slot.rules }} />
          </section>
        )}
      </div>
    </>
  );
}
