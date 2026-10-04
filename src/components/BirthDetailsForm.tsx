import { useEffect, useRef, useState } from "react";
import { autocompletePlaces, resolvePlace } from "../api";
import type {
  Ayanamsha,
  Gender,
  KundaliRequest,
  Meridiem,
  PlaceSuggestion,
  Precision,
  ResolvedPlace,
  Source
} from "../types";
import { effectivePrecision, isValidTime12h } from "../utils";

type BirthDetailsFormProps = {
  /** Shown as the panel heading, e.g. "Groom" or "Bride". */
  title: string;
  eyebrow?: string;
  defaultGender: Gender;
  /**
   * Called with the assembled request whenever the form is complete, and with
   * null whenever it is not. Must be stable (useCallback) or this re-emits on
   * every parent render.
   */
  onChange: (value: KundaliRequest | null) => void;
};

/**
 * One person's birth details, including its own place lookup.
 *
 * The generator page keeps its form in App state; this component owns
 * everything itself so that two of them can sit side by side on the
 * match-making page without sharing a single autocomplete.
 */
export function BirthDetailsForm({
  title,
  eyebrow = "Birth Details",
  defaultGender,
  onChange
}: BirthDetailsFormProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>(defaultGender);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime12h, setBirthTime12h] = useState("");
  const [meridiem, setMeridiem] = useState<Meridiem>("AM");
  const [ayanamsha] = useState<Ayanamsha>("LAHIRI");

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<ResolvedPlace | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [timezone, setTimezone] = useState("");
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const [error, setError] = useState("");

  const debounceRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const suppressRef = useRef(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useRef(`places-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const trimmed = query.trim();
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(async () => {
      const id = ++requestRef.current;
      try {
        setLoading(true);
        const next = await autocompletePlaces(trimmed);
        if (id !== requestRef.current) {
          return;
        }
        setSuggestions(next);
        setIsOpen(true);
      } catch {
        if (id === requestRef.current) {
          setSuggestions([]);
        }
      } finally {
        if (id === requestRef.current) {
          setLoading(false);
        }
      }
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
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  // Emit upward whenever the assembled value changes.
  useEffect(() => {
    const nextLat = Number(lat);
    const nextLng = Number(lng);
    const complete =
      name.trim() !== "" &&
      birthDate !== "" &&
      isValidTime12h(birthTime12h) &&
      selectedPlace !== null &&
      timezone.trim() !== "" &&
      Number.isFinite(nextLat) &&
      Number.isFinite(nextLng);

    if (!complete || !selectedPlace) {
      onChange(null);
      return;
    }

    onChange({
      name: name.trim(),
      gender,
      birthDate,
      birthTime12h,
      meridiem,
      ayanamsha,
      place: {
        ...selectedPlace,
        lat: nextLat,
        lng: nextLng,
        timezone: timezone.trim(),
        precision: effectivePrecision(selectedPlace.precision as Precision, manuallyEdited),
        source: manuallyEdited ? ("manual" as Source) : selectedPlace.source
      }
    });
  }, [
    name,
    gender,
    birthDate,
    birthTime12h,
    meridiem,
    ayanamsha,
    selectedPlace,
    lat,
    lng,
    timezone,
    manuallyEdited,
    onChange
  ]);

  const pickPlace = async (suggestion: PlaceSuggestion) => {
    try {
      setResolving(true);
      setError("");
      const resolved = await resolvePlace(suggestion.provider, suggestion.providerId);
      setSelectedPlace(resolved);
      suppressRef.current = true;
      setQuery(resolved.label);
      setSuggestions([]);
      setIsOpen(false);
      setLat(resolved.lat.toString());
      setLng(resolved.lng.toString());
      setTimezone(resolved.timezone);
      setManuallyEdited(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resolve that place.");
    } finally {
      setResolving(false);
    }
  };

  const showSuggestions = isOpen && query.trim().length >= 2 && (loading || suggestions.length > 0);

  return (
    <section className="panel form-panel match-form">
      <div className="panel-header">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      <div className="kundali-form">
        <label>
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter full name"
          />
        </label>

        <label>
          <span>Gender</span>
          <select value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Prefer not to say</option>
          </select>
        </label>

        <div className="place-search" ref={boxRef}>
          <label htmlFor={`${listboxId.current}-input`}>
            <span>Place of Birth</span>
          </label>
          <input
            id={`${listboxId.current}-input`}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedPlace(null);
              setIsOpen(true);
            }}
            placeholder="Search city, town, state, or country"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={listboxId.current}
          />
          {showSuggestions && (
            <div className="suggestions" role="listbox" id={listboxId.current}>
              {loading && <div className="suggestion-item muted">Searching places...</div>}
              {!loading &&
                suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.provider}-${suggestion.providerId}`}
                    className="suggestion-item"
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      void pickPlace(suggestion);
                    }}
                  >
                    <strong>{suggestion.label}</strong>
                    <span>{suggestion.precision.toUpperCase()}</span>
                  </button>
                ))}
              {!loading && suggestions.length === 0 && (
                <div className="suggestion-item muted">No matching places found.</div>
              )}
            </div>
          )}
        </div>

        <div className="two-col">
          <label>
            <span>Date of Birth</span>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </label>
          <label>
            <span>Time of Birth</span>
            <div className="time-row">
              <input
                value={birthTime12h}
                onChange={(event) => setBirthTime12h(event.target.value)}
                placeholder="07:35"
              />
              <select
                value={meridiem}
                onChange={(event) => setMeridiem(event.target.value as Meridiem)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </label>
        </div>

        <div className="manual-grid">
          <label>
            <span>Latitude</span>
            <input
              value={lat}
              onChange={(event) => {
                setLat(event.target.value);
                setManuallyEdited(true);
              }}
              placeholder="23.1701"
              disabled={!selectedPlace && !resolving}
            />
          </label>
          <label>
            <span>Longitude</span>
            <input
              value={lng}
              onChange={(event) => {
                setLng(event.target.value);
                setManuallyEdited(true);
              }}
              placeholder="79.9324"
              disabled={!selectedPlace && !resolving}
            />
          </label>
          <label className="full-span">
            <span>Timezone</span>
            <input
              value={timezone}
              onChange={(event) => {
                setTimezone(event.target.value);
                setManuallyEdited(true);
              }}
              placeholder="Asia/Kolkata"
              disabled={!selectedPlace && !resolving}
            />
          </label>
        </div>

        {selectedPlace && (
          <div className="place-summary">
            <strong>Resolved:</strong> {selectedPlace.label}
            <span>Precision: {manuallyEdited ? "MANUAL" : selectedPlace.precision.toUpperCase()}</span>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}
      </div>
    </section>
  );
}

export default BirthDetailsForm;
