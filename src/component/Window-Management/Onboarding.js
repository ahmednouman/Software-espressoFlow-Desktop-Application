import React, { useEffect, useState } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import useStore from '../../store';
import { baseImagePath, SNAPPING_WALKTHROUGH, osFinder } from '../../utils/utility';


const Tooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
}) => (
    <div className="onboarding-tooltip" {...tooltipProps}>
        <div className="onboarding-content">{step.content}</div>
    </div>
);


const Onboarding = () => {
    const setWorkspaceOnboardingRun = useStore(state => state.setWorkspaceOnboardingRun)
    const setWindowTabState = useStore(state => state.setWindowTabState)

    const modal = useStore(state => state.workspaceOnboardingModal)
    const setModal = useStore(state => state.setWorkspaceOnboardingModal)

    const stepIndex = useStore(state => state.workspaceOnboardingStep)
    const setStepIndex = useStore(state => state.setWorkspaceOnboardingStep)
    const workspaceName = useStore(state => state.workspaceName);
    const endWorkspaceOnboarding = useStore(state => state.endWorkspaceOnboarding)
    const setWorkspaceOnboardingStep = useStore(state => state.setWorkspaceOnboardingStep)
    const workspaceContainerRef = useStore(state => state.workspaceContainerRef)
    const onboarding = useStore(state => state.onboarding);
    const [menuVisible, setMenuVisible] = useState(onboarding.initial === false ? true : false);
    const startWorkspaceWalkthrough = useStore(state => state.startWorkspaceWalkthrough)
    const toggleAppPopupWindow = useStore(state => state.toggleAppPopupWindow);
    const setWorkspaceWalkthrough = useStore(state => state.setWorkspaceWalkthrough)
    const saveOnboarding = useStore(state => state.saveOnboarding)
    const setActiveNav = useStore(state => state.setActiveNav)


    useEffect(() => {
        setMenuVisible(false)
    }, [setMenuVisible])


    const steps = [
        {
            target: '.workspace-nav',
            content: (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: "center" }}>
                        <p className="onboarding-text">All your window snapping & workspace launcher tools are here</p>
                        <div className="link">
                            <button className="link-button" style={{ marginRight: '10px' }}
                                onClick={() => {
                                    endWorkspaceOnboarding()
                                }}
                            >
                                Cancel
                            </button>
                            <button className="onboarding-button" onClick={() => {
                                setStepIndex(SNAPPING_WALKTHROUGH.SNAPPING_GIF_KEYBOARD)
                                setModal({
                                    step: SNAPPING_WALKTHROUGH.SNAPPING_GIF_KEYBOARD,
                                    visible: true
                                })
                                setMenuVisible(false);

                                setWindowTabState('snap')
                            }} style={{ marginTop: '15px' }}>Let's start</button>
                        </div>
                    </div>
                </>
            ),
            placement: 'right',
            disableBeacon: true
        },
        {
            target: '.onboarding-workspace-step2',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px' }}>
                        <p className="onboarding-text">Get the perfect window layout with window snapping shortcuts</p>
                        <button className="onboarding-next-button" onClick={() => {
                            setModal({
                                ...modal,
                                visible: false
                            })
                            setStepIndex(SNAPPING_WALKTHROUGH.SNAPPING_KEYBOARD_SHORTCUTS)
                        }}>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

                        </button>
                    </div>

                </>
            )
        },
        {
            target: '.onboarding-workspace-step3',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px' }}>
                        <p className="onboarding-text">See and customise all the shortcuts here</p>
                        <button className="onboarding-next-button" onClick={() => {
                            setStepIndex(SNAPPING_WALKTHROUGH.SNAPPING_DRAG_GIF)
                            setModal({
                                ...modal,
                                step: SNAPPING_WALKTHROUGH.SNAPPING_DRAG_GIF,
                                visible: true
                            })

                        }}>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

                        </button>
                    </div>

                </>
            )
        },
        {
            target: '.onboarding-workspace-step2',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px' }}>
                        <div style={{ display: 'block' }}>
                            <p className="onboarding-text">Prefer the mouse to keyboard shortcuts?</p>
                            <p className="onboarding-text">Try dragging windows to the screen edges</p>
                            <p className="onboarding-text">for quickly arranging just as you want</p>
                        </div>
                        <button className="onboarding-next-button" onClick={() => {
                            setWindowTabState('workspace')
                            setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_START)
                            setModal({
                                ...modal,
                                visible: false
                            })

                        }}>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

                        </button>
                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step4',
            placement: 'bottom',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Workspaces lets you open all the apps you need for the task at hand with one click </p>
                        <button className="onboarding-next-button" onClick={() => {
                            setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_ADD_NEW_WORKSPACE)
                            workspaceContainerRef.scrollIntoView()
                        }}>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

                        </button>
                    </div>

                </>
            )
        },
        {
            target: '.onboarding-workspace-step5',
            placement: 'right',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Click to add a new workspace</p>
                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step6',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Your most used apps appear here, ready to add to workspaces</p>
                        <button className="onboarding-next-button" onClick={() => {
                            setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_ADD_BUTTON)
                        }}>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

                        </button>
                    </div>

                </>
            )
        },
        {
            target: '.onboarding-workspace-step7',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Click the add button to select an app to add</p>

                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step8',
            placement: 'left',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Check any app to add to your tray</p>
                        <button className="onboarding-next-button" onClick={() => {
                            toggleAppPopupWindow(false)
                            setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_DRAG_APP)
                        }}>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

                        </button>
                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step9',
            placement: 'top',
            disableBeacon: true,
            offset: -250,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Drag any app from below into your workspace</p>
                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step10',
            placement: 'right',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Enter name for workspace</p>
                        <button className="onboarding-next-button" onClick={() => {
                            if (workspaceName === "") return
                            setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_SAVE)
                        }}>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

                        </button>
                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step11',
            placement: 'right',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Then click save</p>
                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step12',
            placement: 'top',
            disableBeacon: true,
            content: ('')
        },
        {
            target: '.onboarding-workspace-step12',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '20px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Use the workspace icon to launch all your apps with just one click</p>

                    </div>
                </>
            )
        },
        {
            target: '.onboarding-workspace-step13',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: "center", gap: '5px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Create as many workspace as you need</p>
                        <p className="onboarding-text">Enjoy getting into your flow with new workspaces</p>
                        <button className="onboarding-button" onClick={() => {
                            setWorkspaceWalkthrough(false)
                            endWorkspaceOnboarding()

                            setActiveNav("/window-management");

                        }} style={{ marginTop: '5px' }}>Finish</button>
                    </div>
                </>
            )
        },
    ]


    const handleJoyrideCallback = (data) => {
        const { status, type } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setWorkspaceOnboardingRun(false)
        }

        if (stepIndex === SNAPPING_WALKTHROUGH.WORKSPACE_HOLDER) {
            setTimeout(() => { setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_LAUNCH_NEW) }, 200)
        }

    };

    return (
        <>
            <Joyride
                tooltipComponent={Tooltip}
                callback={handleJoyrideCallback}
                continuous
                hideCloseButton
                hideBackButton
                autoStart
                spotlightPadding = {0}
                run={startWorkspaceWalkthrough}
                steps={steps}
                disableCloseOnEsc={true}
                stepIndex={stepIndex}
                disableOverlayClose={true}
                spotlightClicks={true}
                floaterProps={{
                    styles: {
                        arrow: {
                            length: 10,
                            spread: 20
                        },
                    },

                }}

            />

            {modal.visible && modal.step === SNAPPING_WALKTHROUGH.SNAPPING_GIF_KEYBOARD && (
                <div className="onboarding-modal ">
                    <div className='onboarding-workspace-step2' >
                        <img height="300px" src={baseImagePath(osFinder("Mac") ? 'thumbnails/gif_snapping_workspace.gif' : "thumbnails/shortcutsSnap.gif")} alt="shortcut keypress" />
                    </div>

                </div>
            )}

            {modal.visible && modal.step === SNAPPING_WALKTHROUGH.SNAPPING_DRAG_GIF && (
                <div className="onboarding-modal ">
                    <div className='onboarding-workspace-step2' >
                        <img height="300px" src={baseImagePath(osFinder("Mac") ? 'thumbnails/gif_snapping_Onboarding03.gif' : "thumbnails/draggingSnap.gif")} alt="shortcut keypress" />
                    </div>

                </div>
            )}

        </>

    )
}

export default Onboarding
