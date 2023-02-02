import React, { useState, useEffect } from 'react'
import useStore from '../../store'
import { baseImagePath } from '../../utils/utility'
import SwitchItem from '../TrayMenu/SwitchItem'
import ModalTitle from './ModalTitle'
import { osFinder } from '../../utils/utility';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

const ToggleSettings = () => {
    const theme = useStore(state => state.theme);
    const history = useStore(state => state.history)
    const displays = useStore(state => state.displays)
    const [isEspressoConnected, setEspressoConnected] = useState(false)
    const selectedToggle = useStore(state => state.selectedToggle)
    const setSelectedToggle = useStore(state => state.setSelectedToggle)
    const brightnessSync = useStore(state => state.brightnessSync);
    const setBrightnessSync = useStore(state => state.setBrightnessSync);
    const touchEnabled = useStore(state => state.touchEnabled);
    const setTouchEnabled = useStore(state => state.setTouchEnabled);
    const [helpTouch, setHelpTouch] = useState(false);
    const [helpBrightness, setHelpBrightness] = useState(false);
    const [helpWorkspace, setHelpWorkspace] = useState(false);
    const saveOnboarding = useStore(state => state.saveOnboarding);

    const workspaceEnabled = useStore(state => state.workspaceEnabled);
    const setWorkspaceEnabled = useStore(state => state.setWorkspaceEnabled);

    useEffect(() => {
        if (displays.length > 0) {
            let espressoFound = false
            for (const display of displays) {
                if (display.type === 'espresso v2' || display.type === 'espresso v1') {
                    espressoFound = true
                    break
                }
            }
            setEspressoConnected(espressoFound)
        }
    }, [displays])

    useEffect(() => {}, [brightnessSync])


    const toggle = (id) => {
        let visible = false
        if (selectedToggle.id === id) {
            visible = !selectedToggle.visible
        } else {
            visible = true
        }

        setSelectedToggle({ id, visible })
    }

    const handleGestures = () => {
        setSelectedToggle({ id: selectedToggle.id, visible: false })
        history.push("/gesture")
    }

    return (
        <>
            {osFinder('Mac') && (
                <>
                    <div className="es_toggle_wrapper" style={{ right: '40px !important' }}>
                        <span
                            className="cursor-pointer"
                            onClick={() => toggle("settings")}
                        >
                            <img
                                className="toggle-icon"
                                src={
                                    theme === 'light'
                                        ? baseImagePath('icons/toggles.svg')
                                        : baseImagePath('icons/toggles-white.svg')
                                }
                                alt="Toggle Icon"
                                data-tip="Settings"
                            />
                        </span>
                        {selectedToggle.id === 'settings' && selectedToggle.visible &&
                            <div className="fixed-modal-transparent-background" onClick={toggle}></div>
                        }
                        <div
                            className={`es_help_dropdown ${selectedToggle.id === 'settings' && selectedToggle.visible ? 'es_help_dropdown_show' : ''
                                }`}
                        >
                            <div className="es_help_close">
                                <span
                                    className="es_help_toggle_btn cursor-pointer"
                                    onClick={() => toggle("settings")}
                                >
                                    <img src={baseImagePath('icons/close-white.svg')} alt="close-img" />
                                </span>
                            </div>
                            <div className="setting-container">
                                <ul className="setting-list"
                                    style={{ paddingTop: "30px" }}>
                                    <li>
                                        <SwitchItem
                                            label={`<span>Touch</span><img height='17' width='17' src='${baseImagePath('icons/help-white.svg')}' style='margin-left:6px;' />`}
                                            initialState={isEspressoConnected ? touchEnabled : false}
                                            disabled={!isEspressoConnected}
                                            toggleFunction={() => {
                                                if (!isEspressoConnected) return
                                                setTouchEnabled({
                                                    value: !touchEnabled,
                                                    window: 'main',
                                                })
                                            }

                                            }
                                            labelColor={'#FFFFFF'}
                                        >
                                            <span>Touch</span>
                                            <img onClick={() => {
                                                toggle()
                                                setHelpTouch(true)
                                            }} alt="touch help" height='17' width='17' src={baseImagePath('icons/help-white.svg')} className="cursor-pointer" style={{ marginLeft: "6px" }} />
                                        </SwitchItem>
                                    </li>
                                    <li>
                                        <SwitchItem
                                            initialState={isEspressoConnected ? brightnessSync : false}
                                            disabled={!isEspressoConnected}
                                            toggleFunction={() => {
                                                if (!isEspressoConnected) return

                                                setBrightnessSync({
                                                    value: !brightnessSync,
                                                    window: 'main',
                                                })
                                            }

                                            }
                                            labelColor={'#FFFFFF'}
                                        >
                                            <span>Sync brightness</span>
                                            <img onClick={() => {
                                                toggle()
                                                setHelpBrightness(true)
                                            }} alt="brightness sync help" height='17' width='17' src={baseImagePath('icons/help-white.svg')} className="cursor-pointer" style={{ marginLeft: "6px" }} />
                                        </SwitchItem>
                                    </li>
                                    <div style={{paddingBottom: '15px'}}></div>
                                    <div className="white_line" style={{ marginLeft: '5px' }}></div>
                                    <div style={{paddingBottom: '10px'}}></div>
                                    <li>
                                        <SwitchItem
                                            initialState={workspaceEnabled}
                                            disabled={false}
                                            toggleFunction={() => {
                                                toggle()
                                                setWorkspaceEnabled({value: !workspaceEnabled})
                                            }}

                                            labelColor={'#FFFFFF'}
                                        >
                                            <span>Snap and Workspace</span>
                                            <img onClick={() => {
                                                toggle()
                                                setHelpWorkspace(true)
                                            }} alt="Snap and Workspace Help" height='17' width='17' src={baseImagePath('icons/help-white.svg')} className="cursor-pointer" style={{ marginLeft: "6px" }} />
                                        </SwitchItem>
                                    </li>
                                    <div style={{paddingBottom: '10px'}}></div>
                                    <div className="white_line" style={{ marginLeft: '5px' }} ></div>
                                </ul>
                                <div
                                    className="es_toggle_list"
                                    style={{ paddingLeft: "5px", paddingTop: "20px", paddingBottom: "10px", color: "#FFFFFF" }}
                                >
                                    <ul>
                                        <li style={{ paddingBottom: '15px' }}>
                                            <Link
                                                to="#"
                                                onClick={() => {
                                                    handleGestures();
                                                    toggle();
                                                }}
                                            >
                                                <span
                                                    className="es_toggle_list"
                                                >
                                                    Learn gestures
                                                </span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="#"
                                                onClick={() => {
                                                    window.electron.captureEvent(
                                                        'Menu-Click',
                                                        'Restart Tutorial',
                                                    );
                                                    saveOnboarding({
                                                        initial: false,
                                                        display: false,
                                                        workspace: false,
                                                        pen: false,
                                                    });
                                                    toggle()
                                                }}
                                            >
                                                <span
                                                    className="es_toggle_list"
                                                >
                                                    Restart tutorial
                                                </span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>


                        </div>

                        {helpTouch && <ModalTitle title="Touch functionality" onClose={() => setHelpTouch(false)}>
                            <div>
                                <p style={{ textAlign: 'left', fontFamily: "GTAmerica-STD-Regular", lineHeight: '18px', fontSize: '14px', color: "#FFFFFF", paddingBottom: "42px" }}>When you turn off the touch feature, you'll be able to write more accurately with your espressoPen and avoid any accidental finger touches.</p>
                                <button onClick={() => setHelpTouch(false)} className="primary-btn-purple" style={{ position: "absolute", bottom: "24px"}}>Ok, got it</button>
                            </div>

                        </ModalTitle>}

                        {helpBrightness && <ModalTitle title="Brightness Sync" onClose={() => setHelpBrightness(false)}>
                            <div>
                                <p style={{ textAlign: 'left', fontFamily: "GTAmerica-STD-Regular", lineHeight: '18px', fontSize: '14px', color: "#FFFFFF", paddingBottom: "42px" }}>Flow matches the brightness on your espressoDisplay with your laptop, so that they are in sync.</p>
                                <button onClick={() => setHelpBrightness(false)} className="primary-btn-purple" style={{ position: "absolute", bottom: "24px"}}>Ok, got it</button>
                            </div>
                        </ModalTitle>}

                        {helpWorkspace && <ModalTitle title="Snap and Workspace" onClose={() => setHelpWorkspace(false)}>
                            <div>
                                <p style={{ textAlign: 'left', fontFamily: "GTAmerica-STD-Regular", lineHeight: '18px', fontSize: '14px', color: "#FFFFFF", paddingBottom: "42px" }}>Boost productivity with shortcuts and workspaces.</p>
                                <button onClick={() => setHelpWorkspace(false)} className="primary-btn-purple" style={{ position: "absolute", bottom: "24px" }}>Ok, got it</button>
                            </div>
                        </ModalTitle>}
                    </div>
                </>
            )}
        </>
    )
}

export default ToggleSettings