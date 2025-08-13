import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import withAdminGate from "@/components/withRoleGate"; // must export withAdminGate
import supabase from "@/utils/supabaseClient";
import styles from "@/styles/crtLaunch.module.css";

type Result =
  | { ok: true; mode: "pdf"; downloadUrl: string; path: string }
  | { ok: true; mode: "text-fallback" | "stored-no-signed-url"; message: string; path?: string; ndaText?: string }
  | { ok: false; error: string };

function AgreementsAdmin() {
  const [me, setMe] = useState<{ id: string; email: string } | null>(null);

  // form
  const [counterpartyName, setCounterpartyName] = useState("");
  const [counterpartyEmail, setCounterpartyEmail] = useState("");
  const [counterpartyRole, setCounterpartyRole] = useState("Employee");
  const [effectiveDate, setEffectiveDate] = useState<string>("");

  // ui
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  // recent activity
  const [recent, setRecent] = useState<
    { ts: string; actor: string; target: string; path?: string; url?: string }[]
  >([]);

  useEffect(() => {
    // Load current user (admin enforced by HOC, but we use it to mark actor, etc.)
    (async () => {
      const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } as any }));
      if (data?.user) setMe({ id: data.user.id, email: data.user.email! });
    })();
  }, []);

  useEffect(() => {
    // Pull last 25 NDA audit entries
    (async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("action, timestamp, user_id")
        .ilike("action", "%NDA generated for%")
        .order("timestamp", { ascending: false })
        .limit(25);

      const items =
        data?.map((row) => {
          // Parse a little context out of our action string
          const targetMatch = row.action.match(/NDA generated for (.+?) <(.+?)>/i);
          const pathMatch = row.action.match(/ at (ndas\/.+\.pdf)/i);
          return {
            ts: row.timestamp,
            actor: row.user_id,
            target: targetMatch ? `${targetMatch[1]} <${targetMatch[2]}>` : "—",
            path: pathMatch ? pathMatch[1] : undefined,
          };
        }) ?? [];
      setRecent(items);
    })();
  }, [busy, toast]);

  const valid = useMemo(() => {
    return counterpartyName.trim().length > 1 && /\S+@\S+\.\S+/.test(counterpartyEmail);
  }, [counterpartyName, counterpartyEmail]);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 6000);
  };

  const onGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return notify("Fill name & a valid email.");

    setBusy(true);
    setResult(null);

    try {
      const res = await fetch("/api/legal/nda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counterpartyName,
          counterpartyEmail,
          counterpartyRole,
          effectiveDate: effectiveDate || undefined,
        }),
      });

      const json = (await res.json()) as any;

      if (!res.ok || json?.error) {
        setResult({ ok: false, error: json?.error || "Failed to generate NDA." });
        notify("❌ Failed to generate NDA.");
      } else {
        // success flavors from our endpoint
        if (json.mode === "pdf" && json.downloadUrl) {
          setResult({ ok: true, mode: "pdf", downloadUrl: json.downloadUrl, path: json.path });
          notify("✅ NDA PDF generated.");
        } else {
          setResult({
            ok: true,
            mode: json.mode || "text-fallback",
            message: json.message || "Generated (non-PDF mode).",
            path: json.path,
            ndaText: json.ndaText,
          });
          notify("⚠️ Stored without signed URL (or text fallback). Check bucket or copy text.");
        }
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || "Network error." });
      notify("❌ Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Felena — Admin / Agreements</title>
        <meta name="description" content="Generate, store and track legal agreements (admin only)." />
      </Head>

      <div className={styles.crtScreen} style={{ minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #00ff99",
              boxShadow: "0 0 12px rgba(0,255,153,.45)",
            }}
          >
            <img
              src="/felena-brand-kit/felena-logo-final.png"
              alt="Felena"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <div style={{ color: "#00ff99", fontSize: 22, fontWeight: 800 }}>AGREEMENTS CONTROL</div>
            <div style={{ color: "#aaffde", fontSize: 12 }}>
              Generate NDA → store in private bucket → signed URL (10 min)
            </div>
          </div>
          <div style={{ marginLeft: "auto", color: "#8fffd5", fontSize: 12 }}>
            Admin: {me?.email || "—"}
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            border: "1px solid #00ff99",
            borderRadius: 10,
            padding: 16,
            background: "rgba(0,0,0,.55)",
            boxShadow: "0 0 14px rgba(0,255,153,.25)",
            marginBottom: 16,
          }}
        >
          <div style={{ color: "#00ff99", fontWeight: 700, marginBottom: 10 }}>📄 Generate Mutual NDA</div>
          <form onSubmit={onGenerate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              className={styles.crtInput}
              placeholder="Counterparty Full Name"
              value={counterpartyName}
              onChange={(e) => setCounterpartyName(e.target.value)}
              required
            />
            <input
              className={styles.crtInput}
              placeholder="Counterparty Email"
              type="email"
              value={counterpartyEmail}
              onChange={(e) => setCounterpartyEmail(e.target.value)}
              required
            />
            <select
              className={styles.crtInput}
              value={counterpartyRole}
              onChange={(e) => setCounterpartyRole(e.target.value)}
            >
              <option>Employee</option>
              <option>Contractor</option>
              <option>Advisor</option>
              <option>Vendor</option>
            </select>
            <input
              className={styles.crtInput}
              placeholder="Effective Date (YYYY-MM-DD) — optional"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
              <button
                type="submit"
                className={styles.crtButton}
                disabled={!valid || busy}
                style={{ minWidth: 180 }}
              >
                {busy ? "Generating…" : "Generate NDA"}
              </button>
              <a href="/admin" className={styles.crtButton}>
                Admin Home
              </a>
            </div>
          </form>

          {toast && (
            <div style={{ marginTop: 10, color: "#c8ffe9", fontSize: 12 }}>
              {toast}
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{ marginTop: 12, borderTop: "1px solid #044", paddingTop: 12 }}>
              {result.ok ? (
                <>
                  <div style={{ color: "#00ff99", marginBottom: 6 }}>
                    ✅ NDA generated ({result.mode})
                  </div>
                  {"downloadUrl" in result && result.downloadUrl ? (
                    <a className={styles.crtButton} href={result.downloadUrl} target="_blank" rel="noreferrer">
                      Download Signed PDF (10 min)
                    </a>
                  ) : (
                    <div style={{ color: "#aaffde", fontSize: 12 }}>
                      {("message" in result && result.message) || "Stored without signed URL."}
                    </div>
                  )}
                  {"path" in result && result.path && (
                    <div style={{ color: "#8fffd5", marginTop: 6, fontSize: 12 }}>Path: {result.path}</div>
                  )}
                  {"ndaText" in result && result.ndaText && (
                    <details style={{ marginTop: 8 }}>
                      <summary className={styles.crtButton} style={{ display: "inline-block" }}>
                        View NDA Text (fallback)
                      </summary>
                      <pre
                        style={{
                          marginTop: 8,
                          maxHeight: 240,
                          overflow: "auto",
                          border: "1px dashed #0f0",
                          padding: 8,
                          background: "#000",
                          color: "#0f0",
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {result.ndaText}
                      </pre>
                    </details>
                  )}
                </>
              ) : (
                <div style={{ color: "#ff7676" }}>❌ {result.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Recent log list */}
        <div
          style={{
            border: "1px solid #00ff99",
            borderRadius: 10,
            padding: 16,
            background: "rgba(0,0,0,.4)",
            boxShadow: "0 0 12px rgba(0,255,153,.15)",
          }}
        >
          <div style={{ color: "#00ff99", fontWeight: 700, marginBottom: 10 }}>🧾 Recent NDA Activity</div>
          {recent.length === 0 ? (
            <div style={{ color: "#aaffde", fontSize: 12 }}>No NDA generation activity yet.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 1fr",
                gap: 8,
                fontSize: 12,
                alignItems: "center",
              }}
            >
              <div style={{ color: "#8fffd5" }}>Timestamp</div>
              <div style={{ color: "#8fffd5" }}>Target</div>
              <div style={{ color: "#8fffd5" }}>Stored Path</div>

              {recent.map((r, i) => (
                <FragmentRow key={i} ts={r.ts} target={r.target} path={r.path} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.scanlines} />
      </div>
    </>
  );
}

function FragmentRow({ ts, target, path }: { ts: string; target: string; path?: string }) {
  return (
    <>
      <div style={{ color: "#c8ffe9" }}>{new Date(ts).toLocaleString()}</div>
      <div style={{ color: "#c8ffe9" }}>{target}</div>
      <div style={{ color: "#c8ffe9" }}>{path || "—"}</div>
    </>
  );
}

export default withAdminGate(AgreementsAdmin);