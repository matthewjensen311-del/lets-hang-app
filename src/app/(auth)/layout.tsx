export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-[400px] w-full overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC]" />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
