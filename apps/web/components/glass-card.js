import clsx from "clsx";

export default function GlassCard({ className, children }) {
  return <section className={clsx("glass-card", className)}>{children}</section>;
}
