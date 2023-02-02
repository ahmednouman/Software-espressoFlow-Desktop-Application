import React from 'react'
import Joyride from 'react-joyride';
import useStore from '../../../store';
import { baseImagePath } from '../../../utils/utility';
import NoEspresso from './NoEspresso';


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

const Display = () => {
    const activeNav = useStore(state => state.activeNav)
    const stepIndex = useStore(state => state.displayOnboardingStep)
    const setStepIndex = useStore(state => state.setDisplayOnboardingStep)
    const espressoFound = useStore(state => state.espressoFound)
    const nonEspressoFound = useStore(state => state.nonEspressoFound)
    const endDisplayOnboarding = useStore(state => state.endDisplayOnboarding)
    const startDisplayWalkthrough = useStore(state => state.startDisplayWalkthrough)
    const showNoEspressoModal = useStore(state => state.showNoEspressoModal)

    const steps = [
        {
            target: '.display-walkthrough-1',
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '5px' }}>
                        <div>
                            <p className="onboarding-text">Displays will appear here as you connect them</p>
                            <p className="onboarding-text">Drag displays to the correct position for your workspace</p>
                        </div>
                        <button type="button" className="onboarding-next-button" onClick={() => {
                            if (espressoFound.found) {
                                setStepIndex(1);
                            }
                            else {
                                setStepIndex(2);
                            }
                        }
                        }>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />
                        </button>
                    </div>
                </>
            ),
            placement: 'top',
            disableBeacon: true,
        },
        {
            target: '.display-walkthrough-1',
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '5px' }}>
                        <div>
                            <p className="onboarding-text">Clicking on the espressoDisplay icon shows the available options</p>
                        </div>
                        <button type="button" className="onboarding-next-button" onClick={() => {
                            if (nonEspressoFound.found) {
                                setStepIndex(2)
                            } else {
                                endDisplayOnboarding()
                            }
                        }
                        }>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />
                        </button>
                    </div>
                </>
            ),
            placement: 'top',
            disableBeacon: true,
        },
        {
            target: '.display-walkthrough-1',
            content: (
                <>
                    <div style={{ display: 'flex', alignItems: "center", gap: '5px' }}>
                        <div>
                            <p className="onboarding-text">Clicking on the external display shows the available options</p>
                        </div>
                        <button type="button" className="onboarding-next-button" onClick={() => {
                            endDisplayOnboarding()
                        }
                        }>
                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />
                        </button>
                    </div>
                </>
            ),
            placement: 'top',
            disableBeacon: true,
        },
    ]


    const handleJoyrideCallback = (data) => { };

    return (
        <>
            <Joyride
                tooltipComponent={Tooltip}
                callback={handleJoyrideCallback}
                continuous
                hideCloseButton
                hideBackButton
                autoStart
                run={startDisplayWalkthrough}
                steps={steps}
                stepIndex={stepIndex}
                disableCloseOnEsc={true}
                disableOverlayClose={true}
                spotlightClicks={true}
                spotlightPadding={0}
                floaterProps={{
                    styles: {
                        arrow: {
                            length: 10,
                            spread: 20
                        },
                    },
                }}
                styles={{
                    overlayColor: "rgba(79, 26, 0, 1)",
                    backgroundColor: "#FFF"
                }}

            />


            {activeNav === "/screen-three" && showNoEspressoModal && <NoEspresso items={[espressoFound, nonEspressoFound]} />}


        </>

    )
}

export default Display