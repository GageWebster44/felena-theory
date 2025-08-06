 import { useRouter } from "next/router";

export default function CRTPanelTile({ label, route }: { label: string; route: string }) {
  const router = useRouter();

  return (
    <div className="crt-tile" onClick={() => router.push(route)}>
      <div className="crt-label">{label}</div>
    </div>
  );
}
