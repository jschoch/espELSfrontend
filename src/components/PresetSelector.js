import React from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { t } from '../translation.js';
import { viewPitch } from '../util.js';

/**
 * PresetSelector - Dropdown component for selecting presets
 * @param {Array} presets - Array of preset objects
 * @param {string} selectedPresetId - Currently selected preset ID
 * @param {function} onSelect - Callback when preset is selected (presetId)
 * @param {Object} state - App state (for metric conversion)
 */
export default function PresetSelector({ presets, selectedPresetId, onSelect, state }) {
  // Find currently selected preset
  const selectedPreset = presets.find(p => p.id === selectedPresetId);

  // Build dropdown title
  let title;
  if (selectedPreset) {
    const displayPitch = viewPitch(state, selectedPreset.movePitch);
    title = `${selectedPreset.label} (${displayPitch}mm)`;
  } else {
    title = t("No Preset");
  }

  return (
    <DropdownButton
      id="preset-selector"
      title={title}
      variant="outline-primary"
      onSelect={onSelect}
      className="w-100"
    >
      {presets.length === 0 ? (
        <Dropdown.Item disabled>
          {t("No presets available")}
        </Dropdown.Item>
      ) : (
        presets.map(preset => (
          <Dropdown.Item
            key={preset.id}
            eventKey={preset.id}
            active={preset.id === selectedPresetId}
          >
            <div>
              <strong>{preset.label}</strong>
              <br />
              <small>
                Move: {viewPitch(state, preset.movePitch)}mm,
                Rapid: {viewPitch(state, preset.rapidPitch)}mm
              </small>
            </div>
          </Dropdown.Item>
        ))
      )}
    </DropdownButton>
  );
}
