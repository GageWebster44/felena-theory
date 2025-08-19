import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/index.module.css";
import { getTableBySlug } from "@/lib/casino/tables";

export default function TableGamePage() {
const { query } = useRouter();
const cfg = typeof query.slug === "string" ? getTableBySlug(query.slug) : undefined;

return (
<div className={styles.page}>
<Head>
<title>{cfg ? cfg.title : "Table"} — Felena Casino</title>
</Head>
<main className={styles.wrap}>
<header className={styles.hero}>
<h1 className={styles.title}>{cfg?.title ?? "Table Game"}</h1>
<p className={styles.sub}>{cfg?.blurb ?? "Loading…"}</p>
</header>

<article className={styles.card}>
<h3>Demo Shell</h3>
<p className={styles.tag}>
This is a placeholder for the full {cfg?.title ?? "table"} implementation.
Wire your actual game logic/UI here.
</p>
{cfg?.spec && <p className={styles.tag}>Spec: {cfg.spec}</p>}
<div className={styles.ctaRow}>
<Link href="/casino" className={styles.cardCta}>← Back to Casino</Link>
</div>
</article>
</main>
</div>
);
}