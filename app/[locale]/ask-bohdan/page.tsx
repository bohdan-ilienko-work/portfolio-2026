const AskBohdanPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-24 sm:px-10">
      <section className="rounded-2xl border border-white/10 bg-[--surface-2] p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-[--foreground]">Ask Bohdan</h1>
        <p className="mt-3 text-sm text-[--foreground-muted]">
          The RAG assistant is now available as a floating chat widget in the bottom-right corner.
          On mobile, it opens in an adaptive panel for comfortable typing.
        </p>
      </section>
    </main>
  );
};

export default AskBohdanPage;
