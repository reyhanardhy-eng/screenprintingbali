"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  fetchPricingData,
  type BagSize,
  type Cut,
  type DesignSize,
  type Fabric,
  type PricingData,
  type PrintMethod,
  type Product,
} from "@/lib/pricing";
import { fetchPortfolioItems, type PortfolioItem } from "@/lib/portfolio";
import { revalidateHome } from "@/app/actions";

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<PricingData | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetchPricingData().then(setData);
  }, []);

  function flash(msg: string) {
    setStatus(msg);
    setTimeout(() => setStatus(""), 3000);
  }

  async function saveTable(table: string, rows: unknown[]) {
    const supabase = createClient();
    const { error } = await supabase.from(table).upsert(rows);
    flash(error ? `Error saving ${table}: ${error.message}` : `Saved ${table}.`);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (!data) {
    return (
      <div className="admin-page">
        <h1>Pricing admin</h1>
        <p className="admin-sub">Loading…</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>Pricing admin</h1>
        <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
          <a href="/admin/chat" className="admin-sub" style={{ textDecoration: "underline" }}>
            Live chat →
          </a>
          <button className="admin-save-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
      <p className="admin-sub">Edit calculator numbers directly.</p>
      {status && <p className="admin-status">{status}</p>}

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

      <PortfolioManager flash={flash} />
    </div>
  );
}

function PortfolioManager({ flash }: { flash: (msg: string) => void }) {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    fetchPortfolioItems().then(setItems).catch(() => setItems([]));
  }, []);

  function update(i: number, patch: Partial<PortfolioItem>) {
    if (!items) return;
    setItems(items.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function persist(row: PortfolioItem) {
    const supabase = createClient();
    const { id, ...rest } = row;
    const isNew = id < 0;
    const { data, error } = isNew
      ? await supabase.from("portfolio_items").insert(rest).select("*").single()
      : await supabase.from("portfolio_items").update(rest).eq("id", id).select("*").single();

    if (error || !data) {
      flash(`Gagal menyimpan: ${error?.message ?? "unknown error"}`);
      return null;
    }
    return data as PortfolioItem;
  }

  async function handleUpload(i: number, file: File) {
    if (!items) return;
    const row = items[i];
    setBusyId(row.id);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file);

    if (uploadError) {
      flash(`Gagal upload foto: ${uploadError.message}`);
      setBusyId(null);
      return;
    }

    const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);
    const saved = await persist({ ...row, image_url: pub.publicUrl });
    if (saved) {
      const refreshed = await fetchPortfolioItems();
      setItems(refreshed);
      await revalidateHome();
      flash("Foto tersimpan dan langsung tampil di website.");
    }
    setBusyId(null);
  }

  async function handleCaptionSave(i: number) {
    if (!items) return;
    const row = items[i];
    setBusyId(row.id);
    const saved = await persist(row);
    if (saved) {
      const refreshed = await fetchPortfolioItems();
      setItems(refreshed);
      await revalidateHome();
      flash("Keterangan tersimpan dan langsung tampil di website.");
    }
    setBusyId(null);
  }

  async function handleDelete(row: PortfolioItem) {
    if (row.id < 0) {
      setItems((items ?? []).filter((r) => r !== row));
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("portfolio_items").delete().eq("id", row.id);
    if (error) {
      flash(`Gagal menghapus: ${error.message}`);
      return;
    }
    setItems((items ?? []).filter((r) => r.id !== row.id));
    await revalidateHome();
  }

  function addCard() {
    const newRow: PortfolioItem = {
      id: -((items?.length ?? 0) + 1),
      title_line1: "",
      title_line2: "",
      meta: "",
      image_url: null,
      sort_order: items?.length ?? 0,
    };
    setItems([...(items ?? []), newRow]);
  }

  if (!items) {
    return <p className="admin-sub">Memuat portfolio…</p>;
  }

  return (
    <div className="portfolio-manager">
      <p className="admin-sub" style={{ marginTop: -24 }}>
        Foto yang muncul di bagian &quot;Some things we&apos;ve printed&quot; di halaman utama.
      </p>
      <div className="portfolio-grid">
        {items.map((r, i) => (
          <div key={r.id} className="portfolio-card">
            <div className="portfolio-card__photo">
              {r.image_url ? (
                <img src={r.image_url} alt="" />
              ) : (
                <span className="portfolio-card__placeholder">Belum ada foto</span>
              )}
            </div>
            <label className="portfolio-card__upload">
              {busyId === r.id ? "Menyimpan…" : r.image_url ? "Ganti foto" : "Upload foto"}
              <input
                type="file"
                accept="image/*"
                disabled={busyId !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(i, file);
                }}
                hidden
              />
            </label>
            <input
              className="portfolio-card__caption"
              placeholder="Keterangan singkat, mis. Brand drop · 36 pcs · Plastisol"
              value={r.meta}
              onChange={(e) => update(i, { meta: e.target.value })}
            />
            <button
              type="button"
              className="portfolio-card__save"
              disabled={busyId !== null}
              onClick={() => handleCaptionSave(i)}
            >
              {busyId === r.id ? "Menyimpan…" : "Simpan"}
            </button>
            <button
              type="button"
              className="portfolio-card__delete"
              onClick={() => handleDelete(r)}
            >
              Hapus
            </button>
          </div>
        ))}
        <button type="button" className="portfolio-card portfolio-card--add" onClick={addCard}>
          + Tambah foto
        </button>
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
