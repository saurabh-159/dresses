import Container from "@/components/ui/Container";

export default function Loading() {
  return (
    <section className="py-16">
      <Container>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#E2E8F0]"
              >
                <div className="h-64 bg-slate-200" />

                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}