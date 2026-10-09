import Link from "next/link";

type MeetingCtaProps = {
  phone: string;
  whatsapp: string;
};

export default function MeetingCta({ phone, whatsapp }: MeetingCtaProps) {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="container-aw">
        <div className="rounded-3xl border border-stone-200 bg-blush px-4 py-8 text-stone-800 sm:px-10 sm:py-12 lg:px-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-500">
                Need a size?
              </p>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">
                Ask the store before you order.
              </h2>
              <p className="mt-4 leading-7 text-stone-600">
                Share the dress name, your size and city. The store replies on the number saved in admin settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-white px-6 py-3.5 font-bold text-stone-800"
                >
                  WhatsApp
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className="rounded-xl border border-stone-300 bg-white px-6 py-3.5 font-bold text-stone-800">
                  Call
                </a>
              ) : null}
              <Link href="/contact" className="rounded-xl border border-stone-300 bg-white px-6 py-3.5 font-bold text-stone-800">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
