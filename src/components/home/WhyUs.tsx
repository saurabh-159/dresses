const reasons = [
  {
    number: "01",
    title: "Clear product details",
    description: "Each piece shows price, fabric, colour and the sizes the store has listed.",
  },
  {
    number: "02",
    title: "Categories you control",
    description: "Dresses, kurtis, sarees and any other type are added from the admin panel.",
  },
  {
    number: "03",
    title: "Photos from the store",
    description: "Homepage banners and product photos are uploaded by the admin.",
  },
  {
    number: "04",
    title: "Order on WhatsApp",
    description: "Customers can send a product to the store number saved in settings.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-aw">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-500">
              The store
            </p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-stone-900 md:text-4xl">
              Clothes, listed simply.
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-600 sm:mt-5 sm:text-base">
              Browse the collection, open a piece for size and fabric, and message the store when you want to buy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {reasons.map((reason) => (
              <div key={reason.number} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
                <div className="text-sm font-bold text-stone-400">{reason.number}</div>
                <h3 className="mt-2 text-sm font-bold text-stone-900 sm:mt-3 sm:text-lg">{reason.title}</h3>
                <p className="mt-2 text-xs leading-5 text-stone-600 sm:mt-3 sm:text-sm sm:leading-6">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
