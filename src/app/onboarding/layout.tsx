export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="flex-1 w-full max-w-lg mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
