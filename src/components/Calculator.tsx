"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPricingData, type PricingData } from "@/lib/pricing";

const MAX_COLORS = 4;
const WA_NUMBER = "6283174145415";

type Position = "front" | "back" | "both";

type CalcState = {
  product: string;
  fabric: string;
  cut: string;
  bagSize: string;
  method: string;
  colors: number;
  position: Position;
  size: string;
  sizeFront: string;
  sizeBack: string;
  qty: number;
};

function fmt(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export default function Calculator() {
  const [data, setData] = useState<PricingData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<CalcState | null>(null);

  useEffect(() => {
    fetchPricingData()
      .then((d) => {
        setData(d);
        const firstProduct = d.products[0];
        const fabricsForFirstProduct = d.fabrics.filter(
          (f) => f.product_slug === firstProduct.slug
        );
        const firstFabric =
          fabricsForFirstProduct.find((f) => f.value === "combed24s") ??
          fabricsForFirstProduct[0];
        const firstMethod = d.printMethods[0];
        const firstDesignSize =
          d.designSizes.find((s) => s.slug === "medium") ?? d.designSizes[0];
        const firstCut = d.cuts.find((c) => c.slug === "basic") ?? d.cuts[0];
        const firstBagSize =
          d.bagSizes.find((b) => b.slug === "medium") ?? d.bagSizes[0];

        setState({
          product: firstProduct.slug,
          fabric: firstFabric ? firstFabric.value : "",
          cut: firstCut?.slug ?? "",
          bagSize: firstBagSize?.slug ?? "",
          method: firstMethod.slug,
          colors: 1,
          position: "front",
          size: firstDesignSize?.slug ?? "",
          sizeFront: firstDesignSize?.slug ?? "",
          sizeBack: firstDesignSize?.slug ?? "",
          qty: 12,
        });
      })
      .catch((err) => setLoadError(err.message ?? String(err)));
  }, []);

  const product = useMemo(
    () => data?.products.find((p) => p.slug === state?.product) ?? null,
    [data, state?.product]
  );

  const fabricsForProduct = useMemo(
    () =>
      data?.fabrics.filter((f) => f.product_slug === state?.product) ?? [],
    [data, state?.product]
  );

  // Make sure the selected fabric is always valid for the current product.
  useEffect(() => {
    if (!state || !data) return;
    const stillValid = fabricsForProduct.some((f) => f.value === state.fabric);
    if (!stillValid && fabricsForProduct.length > 0) {
      setState((s) => (s ? { ...s, fabric: fabricsForProduct[0].value } : s));
    }
  }, [fabricsForProduct, state, data]);

  // Enforce per-product MOQ on quantity.
  useEffect(() => {
    if (!state || !product) return;
    const moq = product.moq || 1;
    if (state.qty < moq) {
      setState((s) => (s ? { ...s, qty: moq } : s));
    }
  }, [product, state]);

  // If the active method falls below its own MOQ at the current quantity, fall back to the first DTF-type method.
  useEffect(() => {
    if (!state || !data) return;
    const method = data.printMethods.find((m) => m.slug === state.method);
    if (method && state.qty < method.moq) {
      const fallback = data.printMethods.find((m) => m.type === "dtf");
      if (fallback && fallback.slug !== state.method) {
        setState((s) => (s ? { ...s, method: fallback.slug } : s));
      }
    }
  }, [state, data]);

  if (!data || !state) {
    return (
      <section
        id="calculator"
        style={{ background: "var(--paper-deep)" }}
      >
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="section-head__title">Price it yourself.</h2>
            <p className="section-head__intro">
              {loadError
                ? `Couldn't load live pricing (${loadError}). Please refresh, or message us directly on WhatsApp.`
                : "Loading current pricing…"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <CalculatorReady
      data={data}
      state={state}
      setState={setState}
      product={product!}
      fabricsForProduct={fabricsForProduct}
    />
  );
}

function CalculatorReady({
  data,
  state,
  setState,
  product,
  fabricsForProduct,
}: {
  data: PricingData;
  state: CalcState;
  setState: (s: CalcState) => void;
  product: import("@/lib/pricing").Product;
  fabricsForProduct: import("@/lib/pricing").Fabric[];
}) {
  const isScreenMethod = useMemo(() => {
    const m = data.printMethods.find((x) => x.slug === state.method);
    return m?.type === "screen";
  }, [data, state.method]);

  const methodsForProduct = useMemo(
    () =>
      data.printMethods.filter(
        (m) => !m.applicable_products || m.applicable_products.includes(product.slug)
      ),
    [data, product.slug]
  );

  // If the active method isn't offered for the current product, switch to the first one that is.
  useEffect(() => {
    if (methodsForProduct.length === 0) return;
    if (!methodsForProduct.some((m) => m.slug === state.method)) {
      setState({ ...state, method: methodsForProduct[0].slug });
    }
  }, [methodsForProduct, state, setState]);

  const result = useMemo(() => {
    const cut = data.cuts.find((c) => c.slug === state.cut);
    const bagSize = data.bagSizes.find((b) => b.slug === state.bagSize);
    const fabric = fabricsForProduct.find((f) => f.value === state.fabric);
    const method = data.printMethods.find((m) => m.slug === state.method);
    const sizeSingle = data.designSizes.find((s) => s.slug === state.size);
    const sizeFront = data.designSizes.find((s) => s.slug === state.sizeFront);
    const sizeBack = data.designSizes.find((s) => s.slug === state.sizeBack);

    if (!fabric || !method) return null;

    let fabricCost = fabric.price;
    if (product.has_cut_option && cut) fabricCost *= cut.multiplier;
    if (product.has_bag_size_option && bagSize) fabricCost *= bagSize.multiplier;

    function dtfPrintCost(areaCm2: number) {
      const filmCost = areaCm2 * (method!.film_rate_per_cm2 ?? 0);
      return filmCost * (method!.press_margin ?? 1) + (method!.press_flat_cost ?? 0);
    }

    function sidedScreenCost(designSize: import("@/lib/pricing").DesignSize | undefined, printPerSide: number) {
      if (!designSize) return 0;
      return printPerSide * designSize.multiplier;
    }

    let printCost: number;
    let methodLabel = method.label;
    const colors = Math.min(state.colors, MAX_COLORS);

    if (method.type === "screen") {
      const baseCost = method.base_cost ?? 0;
      const perExtraColor = method.per_extra_color ?? 0;
      const setupPerColor = method.setup_per_color ?? 0;
      const printPerSide = baseCost + (colors - 1) * perExtraColor;
      let setupTotal = colors * setupPerColor;

      if (state.position === "both") {
        setupTotal = setupTotal * 2;
        printCost =
          sidedScreenCost(sizeFront, printPerSide) +
          sidedScreenCost(sizeBack, printPerSide);
      } else {
        printCost = sidedScreenCost(sizeSingle, printPerSide);
      }
      const setupPerPc = setupTotal / state.qty;
      printCost += setupPerPc;
    } else {
      if (state.position === "both") {
        printCost =
          dtfPrintCost(sizeFront?.area_cm2 ?? 0) +
          dtfPrintCost(sizeBack?.area_cm2 ?? 0);
      } else {
        printCost = dtfPrintCost(sizeSingle?.area_cm2 ?? 0);
      }
    }

    const perPc = fabricCost + printCost;
    const total = perPc * state.qty;

    const breakdown: [string, string][] = [];
    breakdown.push(["Fabric", fmt(fabricCost) + "/pc"]);
    if (product.has_cut_option && cut) breakdown.push(["Cut", cut.label]);
    if (product.has_bag_size_option && bagSize)
      breakdown.push(["Bag size", `${bagSize.label} (${bagSize.dim})`]);
    breakdown.push([`Printing (${methodLabel})`, fmt(printCost) + "/pc"]);
    if (method.type === "screen") {
      breakdown.push([
        "Colors",
        `${colors} color${colors > 1 ? "s" : ""} per side (max ${MAX_COLORS})`,
      ]);
    }
    const posLabel =
      state.position === "front"
        ? "Front only"
        : state.position === "back"
        ? "Back only"
        : "Front and back";
    breakdown.push(["Placement", posLabel]);
    if (state.position === "both") {
      breakdown.push([
        "Front size",
        sizeFront ? `${sizeFront.label} (${sizeFront.dim})` : "",
      ]);
      breakdown.push([
        "Back size",
        sizeBack ? `${sizeBack.label} (${sizeBack.dim})` : "",
      ]);
    } else {
      breakdown.push([
        "Design size",
        sizeSingle ? `${sizeSingle.label} (${sizeSingle.dim})` : "",
      ]);
    }

    let note: string;
    const productMoq = product.moq || 1;
    if (state.qty < method.moq) {
      note = `// ${methodLabel} needs ${method.moq}+ pcs. Showing an alternative, or raise your quantity.`;
    } else if (productMoq > 1) {
      note = `// Bags are quoted from ${productMoq} pcs minimum. Ballpark only. Final price confirmed on WhatsApp.`;
    } else {
      note =
        "// Ballpark only. Final price depends on your design and finishing. We'll confirm everything on WhatsApp.";
    }

    const cutText =
      product.has_cut_option && cut ? `, ${cut.label} cut` : "";
    const bagSizeText =
      product.has_bag_size_option && bagSize
        ? `, ${bagSize.label} bag (${bagSize.dim})`
        : "";
    const sizeText =
      state.position === "both"
        ? `front ${sizeFront?.label}, back ${sizeBack?.label}`
        : `${sizeSingle?.label} design`;
    const colorsText = method.type === "screen" ? `, ${colors} color(s)` : "";
    const detailText = `, ${posLabel}, ${sizeText}${colorsText}`;
    const waText =
      `Hi, I'd like a rough quote for: ${state.qty} x ${product.label}${cutText}${bagSizeText}` +
      ` (${fabric.label}), ${methodLabel}${detailText}. Ballpark estimate: ${fmt(
        total
      )}. Can we sort out the design details?`;
    const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

    return { total, perPc, breakdown, note, waLink };
  }, [data, state, product, fabricsForProduct]);

  function set<K extends keyof CalcState>(key: K, value: CalcState[K]) {
    setState({ ...state, [key]: value });
  }

  return (
    <section id="calculator" style={{ background: "var(--paper-deep)" }}>
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">Price it yourself.</h2>
          <p className="section-head__intro">
            Pick your product, fabric, and print method for a ballpark
            estimate. We&apos;ll confirm the exact price and design details
            with you on WhatsApp.
          </p>
        </div>

        <div className="calc">
          <div className="calc__form">
            <div className="calc-field">
              <label className="calc-field__label">01 / Product</label>
              <div className="calc-options">
                {data.products.map((p) => (
                  <div
                    key={p.slug}
                    className={`calc-opt${p.slug === state.product ? " active" : ""}`}
                    onClick={() => set("product", p.slug)}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="calc-field">
              <label className="calc-field__label">02 / Fabric</label>
              <div className="calc-options">
                {fabricsForProduct.map((f) => (
                  <div
                    key={f.value}
                    className={`calc-opt${f.value === state.fabric ? " active" : ""}`}
                    onClick={() => set("fabric", f.value)}
                  >
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            {product.has_bag_size_option && (
              <div className="calc-field">
                <label className="calc-field__label">03 / Bag size</label>
                <div className="calc-options">
                  {data.bagSizes.map((b) => (
                    <div
                      key={b.slug}
                      className={`calc-opt${b.slug === state.bagSize ? " active" : ""}`}
                      onClick={() => set("bagSize", b.slug)}
                    >
                      {b.label}
                      <small>{b.dim}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.has_cut_option && (
              <div className="calc-field">
                <label className="calc-field__label">03 / Cut</label>
                <div className="calc-options">
                  {data.cuts.map((c) => (
                    <div
                      key={c.slug}
                      className={`calc-opt${c.slug === state.cut ? " active" : ""}`}
                      onClick={() => set("cut", c.slug)}
                    >
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="calc-field">
              <label className="calc-field__label">04 / Print method</label>
              <div className="calc-options">
                {methodsForProduct.map((m) => {
                  const disabled = state.qty < m.moq;
                  return (
                    <div
                      key={m.slug}
                      className={`calc-opt${m.slug === state.method ? " active" : ""}${
                        disabled ? " disabled" : ""
                      }`}
                      onClick={() => !disabled && set("method", m.slug)}
                    >
                      {m.label}
                      <small>{m.moq > 1 ? `${m.moq} pcs min` : "No minimum"}</small>
                    </div>
                  );
                })}
              </div>
            </div>

            {isScreenMethod && (
              <div className="calc-field">
                <label className="calc-field__label">
                  05 / Colors{" "}
                  <small style={{ textTransform: "none", letterSpacing: 0, opacity: 0.7 }}>
                    (per side)
                  </small>
                </label>
                <div className="calc-stepper">
                  <input
                    type="range"
                    min={1}
                    max={MAX_COLORS}
                    step={1}
                    value={state.colors}
                    onChange={(e) => set("colors", parseInt(e.target.value, 10))}
                  />
                  <span className="calc-stepper__val">{state.colors}</span>
                </div>
              </div>
            )}

            <div className="calc-field">
              <label className="calc-field__label">06 / Placement</label>
              <div className="calc-options">
                {(["front", "back", "both"] as Position[]).map((pos) => (
                  <div
                    key={pos}
                    className={`calc-opt${state.position === pos ? " active" : ""}`}
                    onClick={() => set("position", pos)}
                  >
                    {pos === "front"
                      ? "Front only"
                      : pos === "back"
                      ? "Back only"
                      : "Front and back"}
                  </div>
                ))}
              </div>
            </div>

            <div className="calc-field">
              <label className="calc-field__label">07 / Design size</label>
              {state.position === "both" ? (
                <div>
                  <label className="calc-field__sublabel">Front</label>
                  <div className="calc-options">
                    {data.designSizes.map((s) => (
                      <div
                        key={s.slug}
                        className={`calc-opt${s.slug === state.sizeFront ? " active" : ""}`}
                        onClick={() => set("sizeFront", s.slug)}
                      >
                        {s.label}
                        <small>{s.dim}</small>
                      </div>
                    ))}
                  </div>
                  <label className="calc-field__sublabel" style={{ marginTop: 16 }}>
                    Back
                  </label>
                  <div className="calc-options">
                    {data.designSizes.map((s) => (
                      <div
                        key={s.slug}
                        className={`calc-opt${s.slug === state.sizeBack ? " active" : ""}`}
                        onClick={() => set("sizeBack", s.slug)}
                      >
                        {s.label}
                        <small>{s.dim}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="calc-options">
                  {data.designSizes.map((s) => (
                    <div
                      key={s.slug}
                      className={`calc-opt${s.slug === state.size ? " active" : ""}`}
                      onClick={() => set("size", s.slug)}
                    >
                      {s.label}
                      <small>{s.dim}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="calc-field">
              <label className="calc-field__label">
                08 / Quantity{" "}
                <small style={{ textTransform: "none", letterSpacing: 0, opacity: 0.7 }}>
                  {product.moq > 1 ? `(min ${product.moq} pcs)` : ""}
                </small>
              </label>
              <div className="calc-stepper">
                <input
                  type="range"
                  min={product.moq || 1}
                  max={300}
                  step={1}
                  value={state.qty}
                  onChange={(e) => set("qty", parseInt(e.target.value, 10))}
                />
                <span className="calc-stepper__val">{state.qty}</span>
              </div>
            </div>
          </div>

          <div className="calc__result">
            {result && (
              <>
                <div>
                  <div className="calc__result-label">Rough estimate</div>
                  <div className="calc__result-total">{fmt(result.total)}</div>
                  <div className="calc__result-perpc">
                    {fmt(result.perPc)} / pc · {state.qty} pcs
                  </div>
                </div>

                <ul className="calc__breakdown">
                  {result.breakdown.map(([label, value]) => (
                    <li key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </li>
                  ))}
                </ul>

                <div className="calc__note">{result.note}</div>

                <div className="calc__cta">
                  <a href={result.waLink} target="_blank" rel="noopener" className="btn">
                    Chat us this estimate →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
