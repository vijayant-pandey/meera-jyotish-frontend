import { useCallback, useEffect, useState } from "react";
import {
  createContent,
  deleteContent,
  listContent,
  reorderContent,
  updateContent,
  type ContentKind,
  type ContentRow
} from "../adminApi";
import { emptyRow, specFor, type FieldSpec } from "./fieldSpecs";
import ImageField from "./ImageField";

type Draft = Record<string, unknown>;

function labelFor(row: Draft, titleField: string): string {
  const value = row[titleField];
  return typeof value === "string" && value.trim() ? value : "(untitled)";
}

export function ContentEditor({ kind }: { kind: ContentKind }) {
  const spec = specFor(kind);
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setRows(await listContent(kind));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load content.");
    }
  }, [kind]);

  useEffect(() => {
    // Reset everything when switching content type, or a draft from the previous
    // type would be saved against the new one.
    setSelectedId(null);
    setDraft(null);
    setStatus("");
    void load();
  }, [kind, load]);

  const selectRow = (row: ContentRow) => {
    setSelectedId(row.id);
    setStatus("");
    setError("");
    const next: Draft = {};
    for (const field of spec.fields) {
      next[field.name] = row[field.name] ?? emptyRow(spec)[field.name];
    }
    setDraft(next);
  };

  const startNew = () => {
    setSelectedId(null);
    setStatus("");
    setError("");
    setDraft({ ...emptyRow(spec), position: rows.length });
  };

  const setField = (name: string, value: unknown) =>
    setDraft((current) => (current ? { ...current, [name]: value } : current));

  const save = async () => {
    if (!draft) {
      return;
    }
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const saved = selectedId
        ? await updateContent(kind, selectedId, draft)
        : await createContent(kind, draft);
      await load();
      setSelectedId(saved.id);
      setStatus("Saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selectedId) {
      return;
    }
    const row = rows.find((item) => item.id === selectedId);
    if (!window.confirm(`Delete "${labelFor(row ?? {}, spec.titleField)}"? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      await deleteContent(kind, selectedId);
      setSelectedId(null);
      setDraft(null);
      setStatus("Deleted.");
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) {
      return;
    }
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    try {
      await reorderContent(kind, next.map((row) => row.id));
      await load();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Could not reorder.");
    }
  };

  const renderField = (field: FieldSpec) => {
    const value = draft?.[field.name];
    if (field.type === "boolean") {
      return (
        <label className="admin-check" key={field.name}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => setField(field.name, event.target.checked)}
          />
          <span>{field.label}</span>
          {field.help && <small>{field.help}</small>}
        </label>
      );
    }
    return (
      <label className="admin-field" key={field.name}>
        <span>{field.label}</span>
        {field.type === "textarea" && (
          <textarea
            rows={4}
            value={String(value ?? "")}
            onChange={(event) => setField(field.name, event.target.value)}
          />
        )}
        {field.type === "image" && (
          <ImageField value={String(value ?? "")} onChange={(next) => setField(field.name, next)} />
        )}
        {field.type === "list" && (
          <input
            type="text"
            value={Array.isArray(value) ? (value as string[]).join(", ") : ""}
            onChange={(event) =>
              setField(
                field.name,
                event.target.value
                  .split(",")
                  .map((part) => part.trim())
                  .filter(Boolean)
              )
            }
          />
        )}
        {field.type === "number" && (
          <input
            type="number"
            value={Number(value ?? 0)}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(event) => setField(field.name, Number(event.target.value))}
          />
        )}
        {field.type === "text" && (
          <input
            type="text"
            value={String(value ?? "")}
            readOnly={Boolean(field.lockedAfterCreate && selectedId)}
            onChange={(event) => setField(field.name, event.target.value)}
          />
        )}
        {field.help && <small>{field.help}</small>}
      </label>
    );
  };

  return (
    <div className="admin-editor">
      <header className="admin-editor-head">
        <div>
          <h2>{spec.title}</h2>
          <p>{spec.description}</p>
        </div>
        <button type="button" className="primary-button" onClick={startNew}>
          Add new
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {status && <div className="success-banner">{status}</div>}

      <div className="admin-columns">
        <ul className="admin-list">
          {rows.length === 0 && <li className="admin-empty">Nothing here yet.</li>}
          {rows.map((row, index) => (
            <li key={row.id} className={row.id === selectedId ? "active" : ""}>
              <button type="button" onClick={() => selectRow(row)}>
                <strong>{labelFor(row, spec.titleField)}</strong>
                {!row.published && <em>hidden</em>}
              </button>
              <span className="admin-move">
                <button type="button" aria-label="Move up" onClick={() => void move(index, -1)}>
                  &#9650;
                </button>
                <button type="button" aria-label="Move down" onClick={() => void move(index, 1)}>
                  &#9660;
                </button>
              </span>
            </li>
          ))}
        </ul>

        <div className="admin-form">
          {!draft && <p className="admin-empty">Pick an item on the left, or add a new one.</p>}
          {draft && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              {spec.fields.map(renderField)}
              <div className="admin-form-actions">
                <button type="submit" className="primary-button" disabled={busy}>
                  {busy ? "Saving..." : selectedId ? "Save changes" : "Create"}
                </button>
                {selectedId && (
                  <button type="button" className="danger-button" onClick={() => void remove()} disabled={busy}>
                    Delete
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentEditor;
