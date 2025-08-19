// src/pages/dev/slot-ui.tsx
import SlotUI from "@/components/casino/SlotUI";

export default function DevSlotUI() {
return (
<div style={{ padding: 24 }}>
<SlotUI title="Toy Slot (Debug)" reels={5} rows={3} payways={25} defaultBet={5} />
</div>
);
}