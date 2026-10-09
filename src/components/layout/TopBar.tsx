type TopBarProps = {
  tagline: string;
  hours: string;
  phone1: string;
  phone2: string;
};

export default function TopBar({ tagline, hours, phone1, phone2 }: TopBarProps) {
  return (
    <div className="hidden border-b border-stone-200 bg-blush text-stone-700 sm:block">
      <div className="container-aw flex h-9 items-center justify-between gap-6 text-[11px] font-medium tracking-wide">
        <p className="truncate">{tagline}</p>
        <div className="flex shrink-0 items-center gap-4">
          {hours ? <span>{hours}</span> : null}
          {phone1 ? (
            <a href={`tel:${phone1}`} className="transition-colors duration-200 hover:text-gold">
              {phone1}
            </a>
          ) : null}
          {phone2 ? (
            <a href={`tel:${phone2}`} className="transition-colors duration-200 hover:text-gold">
              {phone2}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
