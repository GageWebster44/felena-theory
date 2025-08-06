 import { useRouter } from "next/router";
import styles from "@/styles/crtLaunch.module.css";
import playSound from "@/utils/playSound";

interface CRTPanelTileProps {
  label: string;
  locked?: boolean;
  route?: string;
  xpRequired?: number;
  adminOnly?: boolean;
}

export default function CRTPanelTile({
  label,
  locked = false,
  route = "/",
  xpRequired,
  adminOnly = false,
}: CRTPanelTileProps) {
  const router = useRouter();
const triggerSparkFX = () => {
  const spark = document.createElement("div");
  spark.className = styles.sparkFlash;
  document.body.appendChild(spark);

  // Auto-remove after animation
  setTimeout(() => {
    spark.remove();
  }, 600); // Match CSS animation duration
};

  const handleClick = () => {
    if (locked) {
  playSound("deny-glitch");
  // Optional: Add glitch animation
} else {
  playSound("tile-click");
  triggerSparkFX(); // ✅ Trigger HUD spark ring
  router.push(route);
}
  };

  return (
  <div
    className={`${styles.tile} ${locked ? styles.locked : ""}`}
    onClick={handleClick}
    onMouseEnter={() => playSound("hover")}
  >
    {/* 🔒 Locked glitch overlay */}
    {locked && <div className={styles.glitchOverlay}></div>}

    {/* ✅ Unlocked spark ring */}
    {!locked && <div className={styles.sparkRing}></div>}

    <div className={styles.tileLabel}>{label}</div>

    {locked && (
      <div className={styles.xpRequirement}>
        {adminOnly ? '🔒 ADMIN' : `🔒 ${xpRequired} XP`}
      </div>
    )}
  </div>
);
