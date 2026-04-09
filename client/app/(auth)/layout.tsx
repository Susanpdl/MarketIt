export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="center min-h-screen p-8">
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  );
}
