import Link from "next/link";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
};

export default function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-extrabold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-xl bg-blush px-4 py-2.5 text-sm font-bold text-[var(--theme-on-accent)] transition hover:bg-blush-dark"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
