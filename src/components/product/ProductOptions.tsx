"use client";

import { useMemo, useState } from "react";
import { whatsappUrl } from "@/lib/whatsapp";

type VariantOption = {
  attributeId: string;
  name: string;
  value: string;
};

type ProductVariant = {
  options: VariantOption[];
  priceText: string;
};

type ProductOptionsProps = {
  productName: string;
  priceText: string;
  sku: string;
  description: string;
  sizes: string;
  color: string;
  fabric: string;
  variants: ProductVariant[];
  whatsapp: string;
};

const SWATCHES: Record<string, string> = {
  black: "#171717",
  white: "#fafafa",
  red: "#b91c1c",
  maroon: "#7f1d1d",
  blue: "#1d4ed8",
  navy: "#1e3a5f",
  yellow: "#eab308",
  green: "#166534",
  olive: "#4d5c2e",
  pink: "#db2777",
  beige: "#d6c4a8",
  gold: "#c9ae78",
  indigo: "#312e81",
  orange: "#c2410c",
  brown: "#78350f",
  grey: "#78716c",
  gray: "#78716c",
  cream: "#f3eadf",
  purple: "#6b21a8",
};

function groupsFromVariants(variants: ProductVariant[]) {
  const groups = new Map<string, { id: string; name: string; values: string[] }>();

  for (const variant of variants) {
    for (const option of variant.options) {
      const group = groups.get(option.attributeId) || {
        id: option.attributeId,
        name: option.name,
        values: [],
      };

      if (!group.values.includes(option.value)) {
        group.values.push(option.value);
      }

      groups.set(option.attributeId, group);
    }
  }

  return [...groups.values()];
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function swatchColor(value: string) {
  const key = value.toLowerCase();
  if (SWATCHES[key]) {
    return SWATCHES[key];
  }

  const match = Object.keys(SWATCHES).find((name) => key.includes(name));
  return match ? SWATCHES[match] : "#d6d3d1";
}

function isColourGroup(name: string) {
  return /colou?r/i.test(name);
}

export default function ProductOptions({
  productName,
  priceText,
  sku,
  description,
  sizes,
  color,
  fabric,
  variants,
  whatsapp,
}: ProductOptionsProps) {
  const groups = useMemo(() => groupsFromVariants(variants), [variants]);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = variants[0];
    const initial: Record<string, string> = {};

    if (!first) {
      return initial;
    }

    for (const option of first.options) {
      initial[option.attributeId] = option.value;
    }

    return initial;
  });
  const sizeChoices = splitList(sizes);
  const [pickedSize, setPickedSize] = useState(sizeChoices[0] || "");
  const colourChoices = splitList(color);
  const [pickedColour, setPickedColour] = useState(colourChoices[0] || color);

  const matched = variants.find((variant) =>
    variant.options.every((option) => selected[option.attributeId] === option.value)
  );
  const shownPrice = matched?.priceText || priceText;
  const sizeGroup = groups.find((group) => /size/i.test(group.name));
  const colourGroup = groups.find((group) => isColourGroup(group.name));
  const otherGroups = groups.filter((group) => group !== sizeGroup && group !== colourGroup);
  const shownSize = sizeGroup ? selected[sizeGroup.id] : pickedSize;
  const shownColour = colourGroup ? selected[colourGroup.id] : pickedColour;

  const chosen = [
    ...groups
      .map((group) => {
        const value = selected[group.id];
        return value ? `${group.name}: ${value}` : "";
      })
      .filter(Boolean),
    !sizeGroup && shownSize ? `Size: ${shownSize}` : "",
    !colourGroup && shownColour ? `Colour: ${shownColour}` : "",
    fabric ? `Fabric: ${fabric}` : "",
  ].filter(Boolean);

  const message = [
    `Hi, I want to order ${productName}.`,
    chosen.length ? `${chosen.join(", ")}.` : "",
    shownPrice ? `Price: ${shownPrice}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const quoteUrl = whatsapp ? whatsappUrl(whatsapp, message) : "/contact";

  function selectGroup(id: string, value: string) {
    setSelected((previous) => ({ ...previous, [id]: value }));
  }

  return (
    <div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-stone-950">{shownPrice}</p>

      {sku ? (
        <p className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-stone-400 uppercase">
          SKU {sku}
        </p>
      ) : null}

      {description ? (
        <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">{description}</p>
      ) : null}

      {fabric ? (
        <p className="mt-2 text-sm text-stone-500">Fabric · {fabric}</p>
      ) : null}

      {colourGroup ? (
        <OptionLabel label={colourGroup.name} value={selected[colourGroup.id]} />
      ) : shownColour ? (
        <OptionLabel label="Colour" value={shownColour} />
      ) : null}

      {colourGroup ? (
        <Swatches
          values={colourGroup.values}
          selected={selected[colourGroup.id]}
          onSelect={(value) => selectGroup(colourGroup.id, value)}
        />
      ) : colourChoices.length > 1 ? (
        <Swatches values={colourChoices} selected={pickedColour} onSelect={setPickedColour} />
      ) : shownColour ? (
        <Swatches values={[shownColour]} selected={shownColour} onSelect={setPickedColour} />
      ) : null}

      {otherGroups.map((group) => (
        <div key={group.id}>
          <OptionLabel label={group.name} value={selected[group.id]} />
          <ChoiceRow
            values={group.values}
            selected={selected[group.id]}
            onSelect={(value) => selectGroup(group.id, value)}
          />
        </div>
      ))}

      {sizeGroup ? (
        <>
          <OptionLabel label={sizeGroup.name} value={selected[sizeGroup.id]} />
          <ChoiceRow
            values={sizeGroup.values}
            selected={selected[sizeGroup.id]}
            onSelect={(value) => selectGroup(sizeGroup.id, value)}
          />
        </>
      ) : sizeChoices.length > 0 ? (
        <>
          <OptionLabel label="Size" value={shownSize} />
          <ChoiceRow values={sizeChoices} selected={pickedSize} onSelect={setPickedSize} />
        </>
      ) : null}

      <a
        href={quoteUrl}
        target={whatsapp ? "_blank" : undefined}
        rel={whatsapp ? "noreferrer" : undefined}
        className="mt-8 flex w-full items-center justify-center rounded-xl bg-stone-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-stone-800"
      >
        {whatsapp ? "Order on WhatsApp" : "Contact the store"}
      </a>
    </div>
  );
}

function OptionLabel({ label, value }: { label: string; value?: string }) {
  return (
    <p className="mt-8 text-[11px] font-semibold tracking-[0.16em] text-stone-500 uppercase">
      {label}
      {value ? <span className="text-stone-300"> — </span> : null}
      {value ? <span className="text-stone-950">{value}</span> : null}
    </p>
  );
}

function Swatches({
  values,
  selected,
  onSelect,
}: {
  values: string[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {values.map((value) => {
        const active = selected === value;

        return (
          <button
            key={value}
            type="button"
            aria-label={value}
            aria-pressed={active}
            onClick={() => onSelect(value)}
            className={`h-9 w-9 rounded-full border ${
              active ? "border-stone-950 ring-2 ring-stone-950 ring-offset-2" : "border-stone-300"
            }`}
            style={{ backgroundColor: swatchColor(value) }}
          />
        );
      })}
    </div>
  );
}

function ChoiceRow({
  values,
  selected,
  onSelect,
}: {
  values: string[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {values.map((value) => {
        const active = selected === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(value)}
            className={`inline-flex h-11 min-w-12 items-center justify-center rounded-lg border px-3 text-sm font-medium ${
              active
                ? "border-stone-950 bg-stone-950 text-white"
                : "border-stone-200 bg-white text-stone-800 hover:border-stone-400"
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
