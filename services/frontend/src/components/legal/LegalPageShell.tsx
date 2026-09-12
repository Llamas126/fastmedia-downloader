interface LegalPageShellProps {
  children: React.ReactNode;
}

export default function LegalPageShell({ children }: LegalPageShellProps) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}