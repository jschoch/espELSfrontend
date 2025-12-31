import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { t } from '../translation.js';
import { viewPitch, inToMM } from '../util.js';
import { validatePreset, generatePresetId, isDuplicateLabel } from '../utils/presetUtils.js';

/**
 * PresetManagerModal - Modal for managing presets (CRUD operations)
 * @param {boolean} show - Whether to show the modal
 * @param {function} onHide - Callback to close modal
 * @param {Array} presets - Array of preset objects
 * @param {string} defaultPresetId - ID of the default preset
 * @param {function} onSave - Callback with updated presets array and defaultPresetId
 * @param {Object} state - App state (for metric conversion)
 */
export default function PresetManagerModal({ show, onHide, presets, defaultPresetId, onSave, state }) {
  const [localPresets, setLocalPresets] = useState([]);
  const [localDefaultPresetId, setLocalDefaultPresetId] = useState(defaultPresetId);
  const [editingId, setEditingId] = useState(null);
  const [newPreset, setNewPreset] = useState({ label: '', movePitch: '', rapidPitch: '' });
  const [error, setError] = useState('');

  // Sync local presets with props when modal opens
  useEffect(() => {
    if (show) {
      setLocalPresets([...presets]);
      setLocalDefaultPresetId(defaultPresetId);
      setEditingId(null);
      setNewPreset({ label: '', movePitch: '', rapidPitch: '' });
      setError('');
    }
  }, [show, presets, defaultPresetId]);

  // Handle adding new preset
  const handleAdd = () => {
    setError('');

    // Validate label
    if (!newPreset.label || newPreset.label.trim() === '') {
      setError(t("Preset Name") + ' ' + t("cannot be empty"));
      return;
    }

    // Check for duplicate label
    if (isDuplicateLabel(localPresets, newPreset.label)) {
      setError(t("A preset with this name already exists"));
      return;
    }

    // Parse and validate pitches
    let movePitch = parseFloat(newPreset.movePitch);
    let rapidPitch = parseFloat(newPreset.rapidPitch);

    // Convert from imperial to mm if needed
    if (state.metric !== true) {
      movePitch = inToMM(movePitch);
      rapidPitch = inToMM(rapidPitch);
    }

    // Create preset object
    const preset = {
      id: generatePresetId(newPreset.label, localPresets),
      label: newPreset.label.trim(),
      movePitch: movePitch,
      rapidPitch: rapidPitch
    };

    // Validate
    const validationError = validatePreset(preset);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Add to local presets
    setLocalPresets([...localPresets, preset]);
    setNewPreset({ label: '', movePitch: '', rapidPitch: '' });
  };

  // Handle editing preset
  const handleEdit = (presetId, field, value) => {
    setLocalPresets(localPresets.map(p => {
      if (p.id === presetId) {
        if (field === 'label') {
          return { ...p, label: value };
        } else if (field === 'movePitch' || field === 'rapidPitch') {
          let numValue = parseFloat(value);
          // Convert from imperial if needed
          if (state.metric !== true && !isNaN(numValue)) {
            numValue = inToMM(numValue);
          }
          return { ...p, [field]: numValue };
        }
      }
      return p;
    }));
  };

  // Handle deleting preset
  const handleDelete = (presetId) => {
    if (window.confirm(t("Are you sure?") + ' ' + t("Delete this preset?"))) {
      const newPresets = localPresets.filter(p => p.id !== presetId);
      setLocalPresets(newPresets);

      // If deleting the default preset, set a new default
      if (presetId === localDefaultPresetId && newPresets.length > 0) {
        setLocalDefaultPresetId(newPresets[0].id);
      }
    }
  };

  // Handle save button
  const handleSave = () => {
    setError('');

    // Validate all presets
    for (const preset of localPresets) {
      const validationError = validatePreset(preset);
      if (validationError) {
        setError(`${preset.label}: ${validationError}`);
        return;
      }
    }

    // Check for duplicate labels
    const labels = localPresets.map(p => p.label.toLowerCase());
    const uniqueLabels = new Set(labels);
    if (labels.length !== uniqueLabels.size) {
      setError(t("Duplicate preset names found"));
      return;
    }

    // Ensure default preset exists in the list
    if (!localPresets.find(p => p.id === localDefaultPresetId) && localPresets.length > 0) {
      setLocalDefaultPresetId(localPresets[0].id);
    }

    // Call parent callback with updated presets and default
    onSave(localPresets, localDefaultPresetId);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t("Manage Presets")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Existing Presets List */}
        <h6>{t("Current Presets")}:</h6>
        {localPresets.length === 0 ? (
          <p className="text-muted">{t("No presets yet")}</p>
        ) : (
          <ListGroup className="mb-3">
            {localPresets.map(preset => (
              <ListGroup.Item key={preset.id}>
                {editingId === preset.id ? (
                  // Edit mode
                  <Row>
                    <Col xs={12} md={4} className="mb-2 mb-md-0">
                      <Form.Control
                        size="sm"
                        type="text"
                        value={preset.label}
                        onChange={(e) => handleEdit(preset.id, 'label', e.target.value)}
                        placeholder={t("Preset Name")}
                      />
                    </Col>
                    <Col xs={6} md={3} className="mb-2 mb-md-0">
                      <InputGroup size="sm">
                        <Form.Control
                          type="number"
                          step="any"
                          value={viewPitch(state, preset.movePitch)}
                          onChange={(e) => handleEdit(preset.id, 'movePitch', e.target.value)}
                          placeholder="Move"
                        />
                        <InputGroup.Text>mm</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col xs={6} md={3} className="mb-2 mb-md-0">
                      <InputGroup size="sm">
                        <Form.Control
                          type="number"
                          step="any"
                          value={viewPitch(state, preset.rapidPitch)}
                          onChange={(e) => handleEdit(preset.id, 'rapidPitch', e.target.value)}
                          placeholder="Rapid"
                        />
                        <InputGroup.Text>mm</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col xs={12} md={2}>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => setEditingId(null)}
                        className="w-100"
                      >
                        {t("Save")}
                      </Button>
                    </Col>
                  </Row>
                ) : (
                  // View mode
                  <Row className="align-items-center">
                    <Col xs={12} md={4}>
                      <strong>{preset.label}</strong>
                      {preset.id === localDefaultPresetId && (
                        <span className="badge bg-success ms-2">Default</span>
                      )}
                    </Col>
                    <Col xs={12} md={3}>
                      <small>
                        Move: {viewPitch(state, preset.movePitch)}mm,
                        Rapid: {viewPitch(state, preset.rapidPitch)}mm
                      </small>
                    </Col>
                    <Col xs={4} md={2}>
                      {preset.id !== localDefaultPresetId && (
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => setLocalDefaultPresetId(preset.id)}
                          className="w-100"
                        >
                          Set Default
                        </Button>
                      )}
                    </Col>
                    <Col xs={4} md={1}>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setEditingId(preset.id)}
                        className="w-100"
                      >
                        {t("Edit")}
                      </Button>
                    </Col>
                    <Col xs={4} md={2}>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(preset.id)}
                        className="w-100"
                      >
                        {t("Delete")}
                      </Button>
                    </Col>
                  </Row>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <hr />

        {/* Add New Preset Form */}
        <h6>{t("Add Preset")}:</h6>
        <Row className="g-2">
          <Col xs={12} md={4}>
            <Form.Control
              type="text"
              placeholder={t("Preset Name")}
              value={newPreset.label}
              onChange={(e) => setNewPreset({ ...newPreset, label: e.target.value })}
            />
          </Col>
          <Col xs={6} md={3}>
            <InputGroup>
              <Form.Control
                type="number"
                step="any"
                placeholder={t("Move Pitch")}
                value={newPreset.movePitch}
                onChange={(e) => setNewPreset({ ...newPreset, movePitch: e.target.value })}
              />
              <InputGroup.Text>mm</InputGroup.Text>
            </InputGroup>
          </Col>
          <Col xs={6} md={3}>
            <InputGroup>
              <Form.Control
                type="number"
                step="any"
                placeholder={t("Rapid Pitch")}
                value={newPreset.rapidPitch}
                onChange={(e) => setNewPreset({ ...newPreset, rapidPitch: e.target.value })}
              />
              <InputGroup.Text>mm</InputGroup.Text>
            </InputGroup>
          </Col>
          <Col xs={12} md={2}>
            <Button
              variant="primary"
              onClick={handleAdd}
              className="w-100"
            >
              {t("Add Preset")}
            </Button>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("Cancel")}
        </Button>
        <Button variant="success" onClick={handleSave}>
          {t("Save")} {t("All")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
