 import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function GlobalLayout({ children }: Props) {
  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh", color: "lime" }}>
      {children}
    </div>
  );
}