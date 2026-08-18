import { useState } from "react";
import { updatePreferences } from "../../lib/api";
import "./Customize.css";

const BACKGROUND_PRESETS = ["#f6f3ee", "#fef3c7", "#e0f2fe", "#f3e8ff", "#1f2028"];
const BINDER_COLOR_PRESETS = ["#ffffff", "#fde68a", "#bfdbfe", "#ddd6fe", "#111827"];
const ACCENT_COLOR_PRESETS = ["#d62828", "#2563eb", "#16a34a", "#d97706", "#aa3bff"];
const THEMES = ["classic", "midnight", "sunrise"];
const GRID_SIZES = [2, 3, 4];

function Customize({ preferences, onSaved }) {
  const [isOpen, setIsOpen] = useState(false);

  // Local draft state: edits only apply once "Save changes" is clicked,
  // so picking colors doesn't fire a request per click.
  const [draft, setDraft] = useState(preferences);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isGridSizeChanging = draft.gridSize !== preferences.gridSize;

  function updateDraft(field, value) {
    setSaveSuccess(false);
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleResetToDefault() {
    setDraft({
      background: "#f6f3ee",
      binderColor: "#ffffff",
      accentColor: "#d62828",
      theme: "classic",
      gridSize: 3,
    });
    setSaveSuccess(false);
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const updated = await updatePreferences(draft);

      setSaveSuccess(true);
      onSaved(updated);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="customize">
      <button
        className="customize-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "Hide customization" : "Customize binder"}
      </button>

      {isOpen && (
        <div className="customize-panel">
          <div className="customize-field">
            <span className="customize-label">Background</span>
            <div className="customize-swatches">
              {BACKGROUND_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Background ${color}`}
                  aria-pressed={draft.background === color}
                  className={
                    "customize-swatch" +
                    (draft.background === color ? " customize-swatch-active" : "")
                  }
                  style={{ backgroundColor: color }}
                  onClick={() => updateDraft("background", color)}
                >
                  {draft.background === color ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="customize-field">
            <span className="customize-label">Binder color</span>
            <div className="customize-swatches">
              {BINDER_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Binder color ${color}`}
                  aria-pressed={draft.binderColor === color}
                  className={
                    "customize-swatch" +
                    (draft.binderColor === color ? " customize-swatch-active" : "")
                  }
                  style={{ backgroundColor: color }}
                  onClick={() => updateDraft("binderColor", color)}
                >
                  {draft.binderColor === color ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="customize-field">
            <span className="customize-label">Accent color</span>
            <div className="customize-swatches">
              {ACCENT_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Accent color ${color}`}
                  aria-pressed={draft.accentColor === color}
                  className={
                    "customize-swatch" +
                    (draft.accentColor === color ? " customize-swatch-active" : "")
                  }
                  style={{ backgroundColor: color }}
                  onClick={() => updateDraft("accentColor", color)}
                >
                  {draft.accentColor === color ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="customize-field">
            <label className="customize-label" htmlFor="customize-theme">
              Theme
            </label>
            <select
              id="customize-theme"
              value={draft.theme}
              onChange={(event) => updateDraft("theme", event.target.value)}
            >
              {THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>

          <div className="customize-field">
            <span className="customize-label">Grid size</span>
            <div className="customize-grid-options">
              {GRID_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={draft.gridSize === size}
                  className={
                    "customize-grid-option" +
                    (draft.gridSize === size ? " customize-grid-option-active" : "")
                  }
                  onClick={() => updateDraft("gridSize", size)}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
            {isGridSizeChanging && (
              <p className="customize-reflow-notice">
                Changing grid size will rearrange your existing cards to fit
                the new layout. No cards will be lost.
              </p>
            )}
          </div>

          <div className="customize-actions">
            <button
              className="customize-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? isGridSizeChanging
                  ? "Rearranging binder..."
                  : "Saving..."
                : "Save changes"}
            </button>
            <button
              className="customize-reset"
              onClick={handleResetToDefault}
              disabled={isSaving}
            >
              Reset to default
            </button>
          </div>

          {saveError && <p className="customize-error">{saveError}</p>}
          {saveSuccess && !saveError && (
            <p className="customize-success">Saved.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Customize;
