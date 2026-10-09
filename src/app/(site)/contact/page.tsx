import { getSiteSettings } from "@/lib/db/queries";
import { defaultSettings } from "@/lib/site";

export const metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const address = settings?.address || defaultSettings.address;
  const hours = settings?.hours || defaultSettings.hours;
  const phone1 = settings?.phone1 || "";
  const phone2 = settings?.phone2 || "";
  const email = settings?.email || "";
  const whatsapp = settings?.whatsapp || "";
  const socials = [
    { label: "Facebook", href: settings?.facebook || "" },
    { label: "Instagram", href: settings?.instagram || "" },
    { label: "LinkedIn", href: settings?.linkedin || "" },
  ].filter((item) => item.href);

  return (
    <main>
      <section className="bg-white py-10 sm:py-20">
        <div className="container-aw max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-500">Contact</p>
          <h1 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">Talk to the store</h1>
          <p className="mt-4 text-base leading-7 text-stone-600 sm:mt-5 sm:text-lg sm:leading-8">
            Ask about a size, fabric or delivery. These details come from the admin settings page.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="container-aw grid grid-cols-2 gap-3 sm:gap-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-bold sm:text-xl">Visit</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600 sm:mt-3 sm:text-base sm:leading-7">{address}</p>
            {hours ? <p className="mt-3 font-semibold">{hours}</p> : null}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-bold sm:text-xl">Phone</h2>
            <div className="mt-3 space-y-2">
              {phone1 ? <a href={`tel:${phone1}`} className="block break-all text-sm font-semibold sm:text-base">{phone1}</a> : null}
              {phone2 ? <a href={`tel:${phone2}`} className="block break-all text-sm font-semibold sm:text-base">{phone2}</a> : null}
              {!phone1 && !phone2 ? <p className="text-stone-500">Add a phone number in admin settings.</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-bold sm:text-xl">Email</h2>
            {email ? (
              <a href={`mailto:${email}`} className="mt-3 block break-all font-semibold">{email}</a>
            ) : (
              <p className="mt-3 text-stone-500">Add an email in admin settings.</p>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-bold sm:text-xl">WhatsApp</h2>
            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex max-w-full rounded-xl bg-blush px-3 py-2.5 text-center text-sm font-bold text-stone-800 sm:px-5 sm:py-3"
              >
                Chat on WhatsApp
              </a>
            ) : (
              <p className="mt-3 text-stone-500">Add a WhatsApp number in admin settings.</p>
            )}
          </div>

          {socials.length > 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-paper p-5 text-stone-800 sm:col-span-2 sm:p-7">
              <h2 className="text-xl font-bold">Social</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {socials.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-bold"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
