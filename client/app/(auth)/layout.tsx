export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="center">
      <div style={{ width: "100%", maxWidth: 360 }}>{children}</div>
    </div>
  );
}
