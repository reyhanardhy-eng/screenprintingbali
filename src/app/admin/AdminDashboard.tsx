"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type BagSize,
  type Cut,
  type DesignSize,
  type Fabric,
  type PricingData,
  type PrintMethod,
  type Product,
} from "@/lib/pricing-types";
import type { PortfolioItem } from "@/lib/portfolio-types";
import LivechatInbox from "./LivechatInbox";
import LivechatSettings from "./LivechatSettings";

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<PricingData | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/pricing", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load admin pricing.");
        return response.json() as Promise<PricingData>;
      })
      .then(setData)
      .catch(() => flash("Could not load the data. Please sign in again."));
  }, []);

  function flash(msg: string) {
    setStatus(msg);
    setTimeout(() => setStatus(""), 3000);
  }

  async function saveTable(table: string, rows: unknown[]) {
    const response = await fetch(`/api/admin/pricing/${encodeURIComponent(table)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    flash(response.ok ? `Saved ${table}.` : `Could not save ${table}.`);
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (!data) {
    return (
      <div className="admin-page">
        <h1>Website admin</h1>
        <p className="admin-sub">Loading…</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>Website admin</h1>
        <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
          <button className="admin-save-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
      <p className="admin-sub">Manage the price calculator, portfolio, and website chatbot from one Hostinger panel.</p>
      {status && <p className="admin-status">{status}</p>}

      <nav className="admin-nav" aria-label="Admin settings sections">
        <a href="#pricing-settings">Price calculator</a>
        <a href="#portfolio-settings">Portfolio</a>
        <a href="#chat-inbox">Live chat inbox</a>
        <a href="#chatbot-settings">AI chatbot &amp; API</a>
      </nav>

      <div id="pricing-settings" className="admin-settings-group">
        <ProductsTable
          rows={data.products}
          onChange={(rows) => setData({ ...data, products: rows })}
          onSave={(rows) => saveTable("products", rows)}
        />
        <FabricsTable
          rows={data.fabrics}
          products={data.products}
          onChange={(rows) => setData({ ...data, fabrics: rows })}
          onSave={(rows) => saveTable("fabrics", rows)}
        />
        <CutsTable
          rows={data.cuts}
          onChange={(rows) => setData({ ...data, cuts: rows })}
          onSave={(rows) => saveTable("cuts", rows)}
        />
        <BagSizesTable
          rows={data.bagSizes}
          onChange={(rows) => setData({ ...data, bagSizes: rows })}
          onSave={(rows) => saveTable("bag_sizes", rows)}
        />
        <PrintMethodsTable
          rows={data.printMethods}
          onChange={(rows) => setData({ ...data, printMethods: rows })}
          onSave={(rows) => saveTable("print_methods", rows)}
        />
        <DesignSizesTable
          rows={data.designSizes}
          onChange={(rows) => setData({ ...data, designSizes: rows })}
          onSave={(rows) => saveTable("design_sizes", rows)}
        />
      </div>

      <PortfolioManager flash={flash} />
      <LivechatInbox flash={flash} />
      <LivechatSettings flash={flash} />
    </div>
  );
}

function PortfolioManager({ flash }: { flash: (msg: string) => void }) {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | "new" | null>(null);

  useEffect(() => {
    fetch("/api/admin/portfolio", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load portfolio.");
        return response.json() as Promise<PortfolioItem[]>;
      })
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  function update(i: number, patch: Partial<PortfolioItem>) {
    if (!items) return;
    setItems(items.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function persist(row: PortfolioItem) {
    const response = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      flash("Could not save the portfolio item.");
      return null;
    }
    return (await response.json()) as PortfolioItem;
  }

  async function reloadItems() {
    const response = await fetch("/api/admin/portfolio", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to refresh portfolio.");
    return response.json() as Promise<PortfolioItem[]>;
  }

  async function handleUpload(row: PortfolioItem, file: File) {
    if (!items || busyId !== null) return;
    if (file.size < 1 || file.size > 5 * 1024 * 1024) {
      flash("Choose an image smaller than 5 MB.");
      return;
    }
    if (!/\.(?:jpe?g|png|webp)$/i.test(file.name)) {
      flash("Use a JPG, PNG, or WebP image.");
      return;
    }
    setBusyId(row.id);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const upload = await fetch("/api/admin/portfolio/upload", { method: "POST", body: formData });
      const uploaded = await upload.json().catch(() => ({})) as { image_url?: string; error?: string };
      if (!upload.ok || !uploaded.image_url) {
        flash(uploaded.error || "Upload failed. Use a JPG, PNG, or WebP image up to 5 MB.");
        return;
      }
      const saved = await persist({ ...row, image_url: uploaded.image_url });
      if (!saved) return;
      setItems(await reloadItems());
      flash("Image saved and published to the website.");
    } catch {
      flash("Could not upload or publish the image. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemoveImage(i: number) {
    if (!items) return;
    const row = items[i];
    if (!row.image_url) return;
    setBusyId(row.id);
    try {
      const saved = await persist({ ...row, image_url: null });
      if (!saved) return;
      setItems(await reloadItems());
      flash("Photo removed from the portfolio.");
    } catch {
      flash("Could not remove the photo. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCaptionSave(i: number) {
    if (!items) return;
    const row = items[i];
    setBusyId(row.id);
    try {
      const saved = await persist(row);
      if (!saved) return;
      setItems(await reloadItems());
      flash("Caption saved and published to the website.");
    } catch {
      flash("Could not save the portfolio item. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row: PortfolioItem) {
    if (row.id < 0) {
      setItems((items ?? []).filter((r) => r !== row));
      return;
    }
    setBusyId(row.id);
    try {
      const response = await fetch("/api/admin/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      if (!response.ok) {
        flash("Could not delete the portfolio item.");
        return;
      }
      setItems((items) => (items ?? []).filter((item) => item.id !== row.id));
    } catch {
      flash("Could not delete the portfolio item. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  function handleAddPhoto(file: File) {
    const newRow: PortfolioItem = {
      id: -Date.now(),
      title_line1: "Portfolio image",
      title_line2: "",
      meta: "",
      image_url: null,
      sort_order: items?.length ?? 0,
    };
    void handleUpload(newRow, file);
  }

  if (!items) {
    return <p className="admin-sub">Loading portfolio…</p>;
  }

  return (
    <div id="portfolio-settings" className="portfolio-manager">
      <p className="admin-sub" style={{ marginTop: -24 }}>
        Drop a JPG, PNG, or WebP onto a photo tile, or choose a photo below it. Use × to remove only the photo; “Delete entry” removes the whole portfolio card.
      </p>
      <div className="portfolio-grid">
        {items.map((r, i) => (
          <div key={r.id} className="portfolio-card">
            <div
              className={`portfolio-card__photo${dragOverId === r.id ? " portfolio-card__photo--dragging" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragOverId(r.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setDragOverId(r.id);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOverId(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverId(null);
                const files = Array.from(event.dataTransfer.files);
                if (files.length !== 1) {
                  flash("Drop one photo into each portfolio card.");
                  return;
                }
                void handleUpload(r, files[0]);
              }}
            >
              {r.image_url ? (
                <img src={r.image_url} alt={r.title_line1} draggable={false} />
              ) : (
                <span className="portfolio-card__placeholder">
                  <strong>No photo yet</strong>
                  <span>Drop a JPG, PNG, or WebP here</span>
                </span>
              )}
              {dragOverId === r.id && <span className="portfolio-card__drop-overlay">Drop to upload</span>}
              {r.image_url && (
                <button
                  type="button"
                  className="portfolio-card__remove-image"
                  aria-label="Remove photo from portfolio"
                  title="Remove photo"
                  disabled={busyId !== null}
                  onClick={() => void handleRemoveImage(i)}
                >
                  ×
                </button>
              )}
            </div>
            <label className="portfolio-card__upload">
              {busyId === r.id ? "Saving…" : r.image_url ? "Replace photo" : "Choose photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="portfolio-card__file-input"
                disabled={busyId !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(r, file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <input
              className="portfolio-card__caption"
              placeholder="Short caption, e.g. Brand drop · 36 pcs · Plastisol"
              value={r.meta}
              onChange={(e) => update(i, { meta: e.target.value })}
            />
            <button
              type="button"
              className="portfolio-card__save"
              disabled={busyId !== null}
              onClick={() => handleCaptionSave(i)}
            >
              {busyId === r.id ? "Saving…" : "Save caption"}
            </button>
            <button
              type="button"
              className="portfolio-card__delete"
              disabled={busyId !== null}
              onClick={() => handleDelete(r)}
            >
              Delete entry
            </button>
          </div>
        ))}
        <label
          className={`portfolio-card portfolio-card--add${dragOverId === "new" ? " portfolio-card--add-dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragOverId("new");
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setDragOverId("new");
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOverId(null);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragOverId(null);
            const files = Array.from(event.dataTransfer.files);
            if (files.length !== 1) {
              flash("Drop one photo at a time.");
              return;
            }
            handleAddPhoto(files[0]);
          }}
        >
          <span className="portfolio-card__add-title">+ Add portfolio photo</span>
          <span className="portfolio-card__add-hint">Drop a photo here or choose a file</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="portfolio-card__add-input"
            disabled={busyId !== null}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleAddPhoto(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

function ProductsTable({
  rows,
  onChange,
  onSave,
}: {
  rows: Product[];
  onChange: (rows: Product[]) => void;
  onSave: (rows: Product[]) => void;
}) {
  function update(i: number, patch: Partial<Product>) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  }
  return (
    <table className="admin-table">
      <caption>Products</caption>
      <thead>
        <tr>
          <th>Slug</th>
          <th>Label</th>
          <th>Has cut option</th>
          <th>Has bag size option</th>
          <th>MOQ</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.slug}>
            <td>{r.slug}</td>
            <td>
              <input
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </td>
            <td>
              <input
                type="checkbox"
                checked={r.has_cut_option}
                onChange={(e) => update(i, { has_cut_option: e.target.checked })}
              />
            </td>
            <td>
              <input
                type="checkbox"
                checked={r.has_bag_size_option}
                onChange={(e) =>
                  update(i, { has_bag_size_option: e.target.checked })
                }
              />
            </td>
            <td>
              <input
                type="number"
                value={r.moq}
                onChange={(e) => update(i, { moq: Number(e.target.value) })}
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5}>
            <button className="admin-save-btn" onClick={() => onSave(rows)}>
              Save products
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function FabricsTable({
  rows,
  products,
  onChange,
  onSave,
}: {
  rows: Fabric[];
  products: Product[];
  onChange: (rows: Fabric[]) => void;
  onSave: (rows: Fabric[]) => void;
}) {
  function update(i: number, patch: Partial<Fabric>) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  }
  return (
    <table className="admin-table">
      <caption>Fabrics</caption>
      <thead>
        <tr>
          <th>Product</th>
          <th>Value</th>
          <th>Label</th>
          <th>Price (Rp)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id}>
            <td>
              <select
                value={r.product_slug}
                onChange={(e) => update(i, { product_slug: e.target.value })}
              >
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.label}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                value={r.value}
                onChange={(e) => update(i, { value: e.target.value })}
              />
            </td>
            <td>
              <input
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </td>
            <td>
              <input
                type="number"
                value={r.price}
                onChange={(e) => update(i, { price: Number(e.target.value) })}
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4}>
            <button className="admin-save-btn" onClick={() => onSave(rows)}>
              Save fabrics
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function CutsTable({
  rows,
  onChange,
  onSave,
}: {
  rows: Cut[];
  onChange: (rows: Cut[]) => void;
  onSave: (rows: Cut[]) => void;
}) {
  function update(i: number, patch: Partial<Cut>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  return (
    <table className="admin-table">
      <caption>Cuts</caption>
      <thead>
        <tr>
          <th>Slug</th>
          <th>Label</th>
          <th>Multiplier</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.slug}>
            <td>{r.slug}</td>
            <td>
              <input
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </td>
            <td>
              <input
                type="number"
                step="0.01"
                value={r.multiplier}
                onChange={(e) => update(i, { multiplier: Number(e.target.value) })}
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3}>
            <button className="admin-save-btn" onClick={() => onSave(rows)}>
              Save cuts
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function BagSizesTable({
  rows,
  onChange,
  onSave,
}: {
  rows: BagSize[];
  onChange: (rows: BagSize[]) => void;
  onSave: (rows: BagSize[]) => void;
}) {
  function update(i: number, patch: Partial<BagSize>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  return (
    <table className="admin-table">
      <caption>Bag sizes</caption>
      <thead>
        <tr>
          <th>Slug</th>
          <th>Label</th>
          <th>Dimension</th>
          <th>Multiplier</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.slug}>
            <td>{r.slug}</td>
            <td>
              <input
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </td>
            <td>
              <input
                value={r.dim}
                onChange={(e) => update(i, { dim: e.target.value })}
              />
            </td>
            <td>
              <input
                type="number"
                step="0.01"
                value={r.multiplier}
                onChange={(e) => update(i, { multiplier: Number(e.target.value) })}
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4}>
            <button className="admin-save-btn" onClick={() => onSave(rows)}>
              Save bag sizes
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function PrintMethodsTable({
  rows,
  onChange,
  onSave,
}: {
  rows: PrintMethod[];
  onChange: (rows: PrintMethod[]) => void;
  onSave: (rows: PrintMethod[]) => void;
}) {
  function update(i: number, patch: Partial<PrintMethod>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  return (
    <table className="admin-table">
      <caption>Print methods</caption>
      <thead>
        <tr>
          <th>Slug</th>
          <th>Label</th>
          <th>Type</th>
          <th>MOQ</th>
          <th>Film rate / cm² (DTF)</th>
          <th>Press margin (DTF)</th>
          <th>Press flat cost (DTF)</th>
          <th>Base cost (screen)</th>
          <th>Per extra color (screen)</th>
          <th>Setup per color (screen)</th>
          <th>Applicable products (comma-separated, blank = all)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.slug}>
            <td>{r.slug}</td>
            <td>
              <input
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </td>
            <td>{r.type}</td>
            <td>
              <input
                type="number"
                value={r.moq}
                onChange={(e) => update(i, { moq: Number(e.target.value) })}
              />
            </td>
            <td>
              <input
                type="number"
                step="0.0001"
                value={r.film_rate_per_cm2 ?? ""}
                onChange={(e) =>
                  update(i, { film_rate_per_cm2: Number(e.target.value) })
                }
              />
            </td>
            <td>
              <input
                type="number"
                step="0.01"
                value={r.press_margin ?? ""}
                onChange={(e) => update(i, { press_margin: Number(e.target.value) })}
              />
            </td>
            <td>
              <input
                type="number"
                value={r.press_flat_cost ?? ""}
                onChange={(e) =>
                  update(i, { press_flat_cost: Number(e.target.value) })
                }
              />
            </td>
            <td>
              <input
                type="number"
                value={r.base_cost ?? ""}
                onChange={(e) => update(i, { base_cost: Number(e.target.value) })}
              />
            </td>
            <td>
              <input
                type="number"
                value={r.per_extra_color ?? ""}
                onChange={(e) =>
                  update(i, { per_extra_color: Number(e.target.value) })
                }
              />
            </td>
            <td>
              <input
                type="number"
                value={r.setup_per_color ?? ""}
                onChange={(e) =>
                  update(i, { setup_per_color: Number(e.target.value) })
                }
              />
            </td>
            <td>
              <input
                value={(r.applicable_products ?? []).join(",")}
                placeholder="e.g. totebag,paperbag"
                onChange={(e) =>
                  update(i, {
                    applicable_products: e.target.value.trim()
                      ? e.target.value.split(",").map((s) => s.trim())
                      : null,
                  })
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={11}>
            <button className="admin-save-btn" onClick={() => onSave(rows)}>
              Save print methods
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function DesignSizesTable({
  rows,
  onChange,
  onSave,
}: {
  rows: DesignSize[];
  onChange: (rows: DesignSize[]) => void;
  onSave: (rows: DesignSize[]) => void;
}) {
  function update(i: number, patch: Partial<DesignSize>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  return (
    <table className="admin-table">
      <caption>Design sizes</caption>
      <thead>
        <tr>
          <th>Slug</th>
          <th>Label</th>
          <th>Dimension</th>
          <th>Area (cm²)</th>
          <th>Multiplier (screen)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.slug}>
            <td>{r.slug}</td>
            <td>
              <input
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </td>
            <td>
              <input
                value={r.dim}
                onChange={(e) => update(i, { dim: e.target.value })}
              />
            </td>
            <td>
              <input
                type="number"
                value={r.area_cm2}
                onChange={(e) => update(i, { area_cm2: Number(e.target.value) })}
              />
            </td>
            <td>
              <input
                type="number"
                step="0.01"
                value={r.multiplier}
                onChange={(e) => update(i, { multiplier: Number(e.target.value) })}
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5}>
            <button className="admin-save-btn" onClick={() => onSave(rows)}>
              Save design sizes
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

