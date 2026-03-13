export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="center"
      style={{
        background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
    </div>
  );
}
