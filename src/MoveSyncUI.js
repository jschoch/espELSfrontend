import React, { Component, useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { ArrowBarLeft, ArrowLeft, ArrowRight, ArrowBarRight } from 'react-bootstrap-icons';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Moving from './Moving.js';
import Bounce from './Bounce.js';
import { distanceToSteps, inToMM, mmOrImp, mmToIn, send, viewPitch } from './util.js';
import ShowMoveOptions from './ShowMoveOptions.js';
import { t, setLang } from './translation.js';
import MaxPitch from './MaxPitch.js';
import { useCookies } from 'react-cookie';
import Accordion from 'react-bootstrap/Accordion';
import PresetSelector from './components/PresetSelector.js';
import PresetManagerModal from './components/PresetManagerModal.js';
import { loadPresetsFromCookie, savePresetsToCookie, DEFAULT_PRESETS } from './utils/presetUtils.js';



export default function MoveSyncUI({ state, machineConfig, set_machineConfig, nvConfig, moveConfig, set_moveConfig }) {
    // enable flag for rapid left
    const [enRL, setEnRL] = useState(true);
    // enable flag for enable rapid right
    const [enRR, setEnRR] = useState(true);
    const [showModalMove, set_showModalMove] = useState(false);
    const [feedingLeft, set_feedingLeft] = useState(true);
    const [startSync, set_startSync] = useState(true);
    const [last_distance, set_last_distance] = useState(0);
    const [activeTab, setActiveTab] = useState("syncMove");

    const distanceRef = useRef();
    const movePitchRef = useRef();
    const rapidPitchRef = useRef();

    // Preset management state
    const [cookies, setCookie] = useCookies(['moveSyncPresets']);
    const [presets, setPresets] = useState([]);
    const [selectedPresetId, setSelectedPresetId] = useState(null);
    const [defaultPresetId, setDefaultPresetId] = useState(null);
    const [movePitch, setMovePitch] = useState(0.2);
    const [rapidPitch, setRapidPitch] = useState(0.2);
    const [showPresetManager, setShowPresetManager] = useState(false);

    const colW = 5;

    // Initialize presets from cookie on mount
    useEffect(() => {
        const loaded = loadPresetsFromCookie(cookies);
        if (loaded) {
            setPresets(loaded.presets);
            const defaultId = loaded.defaultPresetId || loaded.selectedPresetId;
            setDefaultPresetId(defaultId);

            // Load the default preset on startup
            const defaultPreset = loaded.presets.find(p => p.id === defaultId);
            if (defaultPreset) {
                setSelectedPresetId(defaultId);
                setMovePitch(defaultPreset.movePitch);
                setRapidPitch(defaultPreset.rapidPitch);
                // Update refs for display
                if (movePitchRef.current) {
                    movePitchRef.current.value = viewPitch(state, defaultPreset.movePitch);
                }
                if (rapidPitchRef.current) {
                    rapidPitchRef.current.value = viewPitch(state, defaultPreset.rapidPitch);
                }
            }
        } else {
            // Initialize with defaults
            setPresets(DEFAULT_PRESETS.presets);
            setSelectedPresetId(DEFAULT_PRESETS.selectedPresetId);
            setDefaultPresetId(DEFAULT_PRESETS.defaultPresetId);
            // Load Finishing preset (0.08mm) as default
            const defaultPreset = DEFAULT_PRESETS.presets.find(p => p.id === DEFAULT_PRESETS.defaultPresetId);
            if (defaultPreset) {
                setMovePitch(defaultPreset.movePitch);
                setRapidPitch(defaultPreset.rapidPitch);
            }
            savePresetsToCookie(setCookie, DEFAULT_PRESETS);
        }
    }, []); // Run once on mount

    // Preset selection handler
    const handlePresetSelect = (presetId) => {
        setSelectedPresetId(presetId);
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            setMovePitch(preset.movePitch);
            setRapidPitch(preset.rapidPitch);
            // Update refs for display
            if (movePitchRef.current) {
                movePitchRef.current.value = viewPitch(state, preset.movePitch);
            }
            if (rapidPitchRef.current) {
                rapidPitchRef.current.value = viewPitch(state, preset.rapidPitch);
            }
        }
        // Save to cookie
        savePresetsToCookie(setCookie, { presets, selectedPresetId: presetId, defaultPresetId });
    };

    // Preset save handler (from modal)
    const handlePresetSave = (updatedPresets, updatedDefaultPresetId) => {
        setPresets(updatedPresets);
        setDefaultPresetId(updatedDefaultPresetId);
        savePresetsToCookie(setCookie, {
            presets: updatedPresets,
            selectedPresetId,
            defaultPresetId: updatedDefaultPresetId
        });
        // Verify selected preset still exists
        if (!updatedPresets.find(p => p.id === selectedPresetId)) {
            if (updatedPresets.length > 0) {
                // Select the default preset if current selection was deleted
                const newSelectedId = updatedDefaultPresetId || updatedPresets[0].id;
                handlePresetSelect(newSelectedId);
            } else {
                setSelectedPresetId(null);
            }
        }
        setShowPresetManager(false);
    };

    // Manual pitch change handler
    const handleManualPitchChange = () => {
        setSelectedPresetId(null); // Deselect when manually edited

        // Update state from refs - convert to mm for storage
        if (movePitchRef.current) {
            let value = parseFloat(movePitchRef.current.value);
            if (!isNaN(value) && value > 0) {
                // Convert from display units to mm (for consistency with presets)
                if (state.metric !== true) {
                    value = inToMM(value);
                }
                setMovePitch(value); // Store in mm
            }
        }

        if (rapidPitchRef.current) {
            let value = parseFloat(rapidPitchRef.current.value);
            if (!isNaN(value) && value > 0) {
                // Convert from display units to mm (for consistency with presets)
                if (state.metric !== true) {
                    value = inToMM(value);
                }
                setRapidPitch(value); // Store in mm
            }
        }
    };

    function moveSync(modifier) {
        /*

            WHy?  it seems you want to set jog pitch and rapid pitch differently in "new jog" vs "old jog" but why?
            Seems like heavy refactor is needed

        */
        console.log("distance", distanceRef.current.value, state);
        var c = moveConfig;
        // TODO: add these to the UI
        c.f = feedingLeft;
        c.feeding_ccw = true;
        c.startSync = startSync;
        c.useStops = true;

        // Read from state (always stored in mm, consistent with presets)
        c.movePitch = movePitch;
        c.rapidPitch = rapidPitch;
        // No conversion needed - state is always mm
        // sets direction
        c.movePitch = Math.abs(c.movePitch)
        set_last_distance(Math.abs(distanceRef.current.value))
        var d = Math.abs(distanceRef.current.value) * modifier;
        c.moveSteps = distanceToSteps(state, nvConfig, d);
        //c.feeding_ccw = (c.moveSteps > 0);
        var d = { cmd: "moveSync", moveConfig: c }
        send(d);
    }
    function rapid(modifier) {
        var c = moveConfig;
        //c.f = feedingLeft;
        c.feeding_ccw = true;
        c.startSync = startSync;
        // Read from state (always stored in mm, consistent with presets)
        c.rapidPitch = rapidPitch;
        c.movePitch = movePitch;
        // No conversion needed - state is always mm
        // sets direction
        c.rapidPitch = Math.abs(c.rapidPitch)
        // this is for the UI state
        set_last_distance(Math.abs(distanceRef.current.value))
        var d = Math.abs(distanceRef.current.value) * modifier;
        c.moveSteps = distanceToSteps(state, nvConfig, d);
        console.log("rapid: ", c, state);
        var d = { cmd: "rapid", moveConfig: c }
        send(d);
    }

    const handleJogClick = (id) => {
        console.log("Jog or Rapid Clicked", id, distanceRef.current.value);
        if (distanceRef.current.value === 0 || distanceRef.current.value === "0") {
            console.log("unf");
            state.me.setModalErrorMsg("Can't Move 0 ");
            state.me.setShowModalError(true);
        } else {
            if (id === "rrapid") {
                console.log("right rapid", distanceRef.current.value);
                rapid(1);
            } else if (id === "lrapid") {
                console.log("left rapid", distanceRef.current.value);
                rapid(-1);
            }
            else if (id === "ljog") {
                moveSync(-1);
            } else if (id === "rjog") {
                moveSync(1);
            } else {
                console.log("WTF", id)
            }
        }
    }


    return (
        <div>
            {(machineConfig.m === 2 || machineConfig.m === 6) &&
                <div>
                    {/* Dropdown selector for all screen sizes */}
                    <div className="mb-3">
                        <Form.Select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            size="lg"
                        >
                            <option value="syncMove">Move slaved to spindle</option>
                            <option value="bounce">Bounce</option>
                            <option value="FreeJog">Jog (non sync)</option>
                        </Form.Select>
                    </div>

                    {/* Content based on selected option */}
                    {activeTab === "syncMove" && (
                        <div>
                        {
                            // hides controls when pos_feeding is true
                            !state.stats["pos_feed"] && !state.stats["sw"] &&
                            <div>
                                {/* Primary Controls - Distance Input at Top */}
                                <Row className="mb-3">
                                    <Col>
                                        <InputGroup size="lg">
                                            <InputGroup.Text id="move-distance-label">
                                                ( {mmOrImp(state)} )
                                                {t("Move Distance")}</InputGroup.Text>
                                            <FormControl
                                                placeholder="0.0"
                                                aria-label="Distance to Move"
                                                aria-describedby="move-distance-label"
                                                defaultValue={last_distance}
                                                inputMode="decimal"
                                                step="any"
                                                type="number"
                                                ref={distanceRef}
                                                style={{ minHeight: '50px', fontSize: '1.1rem' }}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Row>

                                {/* Enable Rapid Buttons */}
                                <Row className="mb-3">
                                    <Col xs={6}>
                                        <Button
                                            variant={enRL ? "outline-primary" : "primary"}
                                            onClick={() => { setEnRL(!enRL) }}
                                            className="w-100"
                                        >
                                            {t("Enable Rapid Left")}
                                        </Button>
                                    </Col>
                                    <Col xs={6}>
                                        <Button
                                            variant={enRR ? "outline-primary" : "primary"}
                                            onClick={() => { setEnRR(!enRR) }}
                                            className="w-100"
                                        >
                                            {t("Enable Rapid Right")}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* Primary Controls - Move Buttons */}
                                <Row className="mb-3 g-2">
                                    <Col xs={6}>
                                        <ButtonGroup
                                            vertical={true}
                                            size='lg'
                                            className="w-100"
                                        >
                                            {!enRL && (
                                                <Button
                                                    type="button"
                                                    className="btn btn-danger move-button-large"
                                                    id="lrapid"
                                                    onClick={() => handleJogClick("lrapid")}
                                                >
                                                    <ArrowBarLeft />Rapid Z-
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                className="btn btn-outline-dark move-button-large"
                                                id="ljog"
                                                onClick={() => handleJogClick("ljog")}
                                            >
                                                <ArrowBarLeft />
                                                {t("Move")}
                                            </Button>
                                        </ButtonGroup>
                                    </Col>

                                    <Col xs={6}>
                                        <ButtonGroup
                                            vertical={true}
                                            className="w-100"
                                            size='lg'
                                        >
                                            {!enRR && (
                                                <Button
                                                    type="button"
                                                    className="btn btn-danger move-button-large"
                                                    id="rrapid"
                                                    onClick={() => handleJogClick("rrapid")}
                                                >
                                                    <ArrowBarRight />Rapid Z+
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                className="btn btn-outline-dark move-button-large"
                                                id="rjog"
                                                onClick={() => handleJogClick("rjog")}
                                            >
                                                <ArrowBarRight />{t("Move")}
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>

                                {/* Preset Selector Section */}
                                <Row className="mb-3">
                                    <Col xs={12} md={7} className="mb-2 mb-md-0">
                                        <PresetSelector
                                            presets={presets}
                                            selectedPresetId={selectedPresetId}
                                            onSelect={handlePresetSelect}
                                            state={state}
                                        />
                                    </Col>
                                    <Col xs={12} md={5}>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPresetManager(true)}
                                            className="w-100"
                                        >
                                            {t("Manage Presets")}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* Collapsible Manual Pitch Settings */}
                                <Accordion className="mb-3">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Manual Pitch Settings</Accordion.Header>
                                        <Accordion.Body>
                                            <Row>
                                                <Col>
                                                    <MaxPitch
                                                        state={state}
                                                        nvConfig={nvConfig} />
                                                    <hr />

                                                    {machineConfig.dbg &&
                                                        <div>
                                                            <span> Current Pitch: {machineConfig.movePitch}</span>
                                                            <span> Rapid: {machineConfig.rapidPitch} </span>
                                                        </div>
                                                    }
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <InputGroup className="mb-3">
                                                        <FormControl
                                                            aria-label="Move Pitch"
                                                            inputMode='numeric' step='any' type="number"
                                                            defaultValue={viewPitch(state, moveConfig.movePitch)}
                                                            ref={movePitchRef}
                                                            onChange={handleManualPitchChange}
                                                        />
                                                        <InputGroup.Text id="unf">
                                                            {mmOrImp(state)}
                                                            {t("Move Pitch")}</InputGroup.Text>
                                                    </InputGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <InputGroup className="mb-1">
                                                        <FormControl
                                                            aria-label="Rapid Pitch"
                                                            defaultValue={viewPitch(state, moveConfig.rapidPitch)}
                                                            inputMode='numeric' step='any' type="number"
                                                            ref={rapidPitchRef}
                                                            onChange={handleManualPitchChange}
                                                        />
                                                        <InputGroup.Text id="rp">
                                                            {mmOrImp(state)}
                                                            {t("Rapid Pitch")}
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                </Col>
                                            </Row>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                {/* Preset Manager Modal */}
                                <PresetManagerModal
                                    show={showPresetManager}
                                    onHide={() => setShowPresetManager(false)}
                                    presets={presets}
                                    defaultPresetId={defaultPresetId}
                                    onSave={handlePresetSave}
                                    state={state}
                                />
                            </div>
                        }
                        <Row>
                            <Moving
                                nvConfig={nvConfig}
                                machineConfig={machineConfig}
                                state={state} />

                        </Row>
                        </div>
                    )}

                    {activeTab === "bounce" && (
                        <Bounce
                            state={state}
                            machineConfig={machineConfig}
                            set_machineConfig={set_machineConfig}
                            moveConfig={moveConfig}
                            set_moveConfig={set_moveConfig}
                            nvConfig={nvConfig}
                        />
                    )}

                    {activeTab === "FreeJog" && (
                        <ShowMoveOptions
                            state={state}
                            machineConfig={machineConfig}
                            set_machineConfig={set_machineConfig}
                            moveConfig={moveConfig}
                            set_moveConfig={set_moveConfig}
                            nvConfig={nvConfig}
                        />
                    )}
                </div>
            }
        </div>
    )
}
