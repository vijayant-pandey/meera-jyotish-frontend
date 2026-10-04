import { useEffect, useRef, useState } from "react";
import { autocompletePlaces, resolvePlace } from "../api";
import type { PlaceSuggestion } from "../types";

export type PickedPlace = {
  label: string;
  lat: number;
  lng: number;
  timezone: string;
};

export const DEFAULT_PLACE: PickedPlace = {
  label: "Jabalpur, India",
  lat: 23.170152,
  lng: 79.932451,
  timezone: "Asia/Kolkata"
};

const STORAGE_KEY = "kundali.place";

/**
 * The place the almanac pages are calculated for, remembered across pages.
 *
 * Browser storage can be empty or throw outright (private window, blocked site
 * data), so every access is guarded and falls back to the default rather than
 * leaving a page unable to render.
 */
export function loadStoredPlace(): PickedPlace {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PLACE;
    }
    const parsed = JSON.parse(raw) as Partial<PickedPlace>;
    if (
      typeof parsed.label === "string" &&
      typeof parsed.timezone === "string" &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng)
    ) {
      return parsed as PickedPlace;
    }
  } catch {
    // Ignore and use the default.
  }
  return DEFAULT_PLACE;
}

export function storePlace(place: PickedPlace): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
  } catch {
    // A page that cannot persist the choice still works for this visit.
  }
}

type PlacePickerProps = {
  value: PickedPlace;
  onChange: (place: PickedPlace) => void;
  label?: string;
};

export function PlacePicker({ value, onChange, label = "Location" }: PlacePickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(`place-picker-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      const id = ++requestRef.current;
      void autocompletePlaces(term)
        .then((next) => {
          if (id === requestRef.current) {
            setSuggestions(next);
            setOpen(true);
          }
        })
        .catch(() => {
          if (id === requestRef.current) {
            setSuggestions([]);
          }
        });
    }, 350);
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const pick = async (suggestion: PlaceSuggestion) => {
    setBusy(true);
    setError("");
    try {
      const resolved = await resolvePlace(suggestion.provider, suggestion.providerId);
      const next: PickedPlace = {
        label: resolved.label,
        lat: resolved.lat,
        lng: resolved.lng,
        timezone: resolved.timezone
      };
      storePlace(next);
      onChange(next);
      setQuery("");
      setSuggestions([]);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resolve that place.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="place-picker" ref={boxRef}>
      <label htmlFor={idRef.current}>
        <span>{label}</span>
      </label>
      <div className="place-picker-row">
        <strong className="place-picker-current" title={value.timezone}>
          {value.label}
        </strong>
        <input
          id={idRef.current}
          type="text"
          value={query}
          placeholder={busy ? "Resolving…" : "Change location"}
          aria-label="Search for a location"
          onChange={(event) => setQuery(event.target.value)}
          disabled={busy}
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="place-picker-suggestions" role="listbox">
          {suggestions.map((item) => (
            <li key={`${item.provider}-${item.providerId}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => {
                  event.preventDefault();
                  void pick(item);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

export default PlacePicker;
