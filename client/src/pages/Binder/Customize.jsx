import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { updatePreferences } from "../../lib/api";
import "./Customize.css";

const PALETTES = [
  {
    name: "Default",
    background: "#0B1220",
    binderColor: "#172235",
    accentColor: "#3368A0",
    theme: "midnight",
    gridSize: 3,
  },
  {
    name: "Ocean",
    background: "#091E2B",
    binderColor: "#0F2F40",
    accentColor: "#3AA3A8",
    theme: "midnight",
  },
  {
    name: "Forest",
    background: "#0C1A14",
    binderColor: "#142B21",
    accentColor: "#4A8561",
    theme: "midnight",
  },
  {
    name: "Ember",
    background: "#1C1311",
    binderColor: "#2D1C18",
    accentColor: "#BA5635",
    theme: "midnight",
  },
];

const GRID_SIZES = [2, 3, 4];

function Customize({
  preferences,
  draft,
  onDraftChange,
  onSaved,
  onClose,
  onAddSpread,
  isCreatingSpread,
  onDeleteSpread,
  isDeletingSpread,
  canDeleteSpread
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [activePicker, setActivePicker] = useState(null);
  const [forceCustomMode, setForceCustomMode] = useState(false);

  function handleOpenPicker(pickerName) {
    if (activePicker === pickerName) {
      setActivePicker(null);
      return;
    }
    setActivePicker(pickerName);
    if (!isCustomPalette) {
      setForceCustomMode(true);
      onDraftChange({ ...draft, accentColor: "#3368A0" });
    }
  }

  const isGridSizeChanging = draft.gridSize !== preferences.gridSize;

  function updateDraft(field, value) {
    onDraftChange({ ...draft, [field]: value });
  }

  function applyPalette(palette) {
    setForceCustomMode(false);
    setActivePicker(null);
    onDraftChange({
      ...draft,
      background: palette.background,
      binderColor: palette.binderColor,
      accentColor: palette.accentColor,
      theme: palette.theme,
      ...(palette.gridSize ? { gridSize: palette.gridSize } : {})
    });
  }

  // To determine active palette, check if draft matches all properties
  const activePaletteName = PALETTES.find(
    (p) =>
      p.background.toLowerCase() === draft.background.toLowerCase() &&
      p.binderColor.toLowerCase() === draft.binderColor.toLowerCase() &&
      p.accentColor.toLowerCase() === draft.accentColor.toLowerCase() &&
      p.theme === draft.theme
  )?.name;

  const isCustomPalette = !activePaletteName || forceCustomMode;

  function handleResetToDefault() {
    onDraftChange({
      ...draft,
      background: "#0B1220",
      binderColor: "#172235",
      accentColor: "#3368A0",
      theme: "midnight",
      gridSize: 3
    });
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveError(null);

      const updated = await updatePreferences(draft);

      onSaved(updated);
      onClose();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="customize-panel" role="region" aria-label="Binder customization">
      <div className="customize-header">
        <h3 className="customize-title">Binder Appearance</h3>
        <button
          type="button"
          className="customize-close-btn"
          onClick={onClose}
          aria-label="Close customization panel"
        >
          ✕
        </button>
      </div>

      <div className="customize-scroll-area">
        <div className="customize-field">
          <span className="customize-label">Colors</span>

        <div className="custom-color-grid">
          <div className="custom-color-col">
            <span className="custom-color-label">Folio Background</span>
            <button
              className={`custom-color-btn ${activePicker === "background" ? "active" : ""}`}
              onClick={() => handleOpenPicker("background")}
            >
              <div className="custom-color-swatch" style={{ backgroundColor: draft.background }} />
              <span className="custom-color-hex">{draft.background.toUpperCase()}</span>
            </button>

            {activePicker === "background" && (
              <div className="custom-picker-popover">
                <div className="custom-picker-header">
                  <h4 className="custom-picker-title">CHOOSE FOLIO BACKGROUND</h4>
                  <button 
                    type="button"
                    className="custom-picker-close-btn" 
                    onClick={() => setActivePicker(null)}
                    aria-label="Close color picker"
                  >✕</button>
                </div>
                <HexColorPicker color={draft.background} onChange={(val) => updateDraft("background", val)} />
                <div className="custom-picker-input">
                  <span className="custom-picker-prefix">HEX</span>
                  <HexColorInput color={draft.background} onChange={(val) => updateDraft("background", val)} prefixed />
                </div>
              </div>
            )}
          </div>

          <div className="custom-color-col">
            <span className="custom-color-label">Binder Surface</span>
            <button
              className={`custom-color-btn ${activePicker === "binderColor" ? "active" : ""}`}
              onClick={() => handleOpenPicker("binderColor")}
            >
              <div className="custom-color-swatch" style={{ backgroundColor: draft.binderColor }} />
              <span className="custom-color-hex">{draft.binderColor.toUpperCase()}</span>
            </button>

            {activePicker === "binderColor" && (
              <div className="custom-picker-popover">
                <div className="custom-picker-header">
                  <h4 className="custom-picker-title">CHOOSE BINDER SURFACE</h4>
                  <button 
                    type="button"
                    className="custom-picker-close-btn" 
                    onClick={() => setActivePicker(null)}
                    aria-label="Close color picker"
                  >✕</button>
                </div>
                <HexColorPicker color={draft.binderColor} onChange={(val) => updateDraft("binderColor", val)} />
                <div className="custom-picker-input">
                  <span className="custom-picker-prefix">HEX</span>
                  <HexColorInput color={draft.binderColor} onChange={(val) => updateDraft("binderColor", val)} prefixed />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="customize-field">
        <span className="customize-label">Quick Styles</span>
        <div className="customize-palettes">
          {PALETTES.map((palette) => {
            const isActive = activePaletteName === palette.name;
            return (
              <button
                key={palette.name}
                type="button"
                aria-pressed={isActive}
                className={`customize-palette-btn ${isActive ? "customize-palette-active" : ""}`}
                onClick={() => applyPalette(palette)}
              >
                <div
                  className="palette-preview-bg"
                  style={{ backgroundColor: palette.background }}
                >
                  <div
                    className="palette-preview-binder"
                    style={{
                      backgroundColor: palette.binderColor,
                      borderColor: palette.theme === "midnight" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                    }}
                  >
                    <div
                      className="palette-preview-accent"
                      style={{ backgroundColor: palette.accentColor }}
                    />
                  </div>
                </div>
                <span className="palette-name">{palette.name}</span>
              </button>
            );
          })}
        </div>
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
              <div className={`grid-icon grid-icon-${size}`}>
                {Array.from({ length: size * size }).map((_, i) => (
                  <div key={i} className="grid-icon-cell" />
                ))}
              </div>
              <span className="grid-icon-label">{size}×{size}</span>
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

      <div className="customize-field">
        <span className="customize-label">Spread Management</span>
        <div className="customize-spread-actions">
          <button
            type="button"
            className="customize-btn-secondary"
            onClick={onAddSpread}
            disabled={isCreatingSpread || isSaving}
          >
            {isCreatingSpread ? "Adding..." : "+ Add Spread"}
          </button>
          <button
            type="button"
            className="customize-btn-text-danger"
            onClick={onDeleteSpread}
            disabled={isDeletingSpread || isSaving || !canDeleteSpread}
            title={!canDeleteSpread ? "Cannot delete the only spread" : "Delete spread"}
          >
            Delete Spread
          </button>
        </div>
      </div>

      <div className="customize-actions">
        <div className="customize-actions-primary">
          <button
            className="customize-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? isGridSizeChanging
                ? "Rearranging binder..."
                : "Saving..."
              : "Save Changes"}
          </button>
          <button
            className="customize-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel Changes
          </button>
        </div>
        <button
          className="customize-reset"
          onClick={handleResetToDefault}
          disabled={isSaving}
        >
          Reset to Default
        </button>
      </div>

        {saveError && <p className="customize-error">{saveError}</p>}
      </div>
    </div>
  );
}

export default Customize;
