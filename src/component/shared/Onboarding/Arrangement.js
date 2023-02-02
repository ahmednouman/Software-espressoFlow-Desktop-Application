import React, { useEffect, useState } from 'react';
import { baseImagePath } from '../../utils/utility';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/RouterPath';
import { osFinder, ARRANGEMENT_WALKTHROUGH } from '../../utils/utility';
import useStore from '../../store';

const ArrangementOnboarding = () => {

    const [stepIndex, setStepIndex] = useState(ARRANGEMENT_WALKTHROUGH.START)
    const onboarding = useStore(state => state.onboarding)


    const steps = [
        {
            target: '.arrangement-nav',
            content: (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: "center" }}>
                        <p className="onboarding-text">All your display arrangement tools are here</p>
                        <button className="onboarding-button" onClick={() => {
                            setStepIndex(ARRANGEMENT_WALKTHROUGH.CONNECT_ESPRESSO)
                            setMenuVisible(false);

                        }} style={{ marginTop: '15px' }}>Let's start</button>
                    </div>
                </>
            ),
            placement: 'right',
            disableBeacon: true
        },
        {
            target: '.es_device_screen3_wrap',
            content: (
	            <>
	                <div style={{ display: 'flex', alignItems: "center", gap: '20px' }}>
	                <div style={{ display: 'block'}}>
	                        <p className="onboarding-text">Displays will appear here as you connect them</p>
	                        <p className="onboarding-text">Drag displays to the correct position for your workspace</p>
	                    </div>
	                        <button className="onboarding-next-button" onClick={() => {
	                            setStepIndex(SNAPPING_WALKTHROUGH.CLICK_ON_ESPRESSO)

	                        }}>
	                            <img src={baseImagePath('icons/next-arrow.svg')} alt="next" />

	                        </button>
	                    </div>
	            </>
            ),
            placement: 'right',
            disableBeacon: true
        },
        {
            target: '.es_device_screen3_wrap',
            placement: 'top',
            disableBeacon: true,
            content: (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: "center", gap: '5px', maxWidth: "400px" }} >
                        <p className="onboarding-text">Click on any external display to access the settings</p>
                        <button className="onboarding-button" onClick={() => {
                            setWArrangementOnboardingRun(false)
                            setOnboardingArranagement(true)

                        }} style={{ marginTop: '5px' }}>Finish</button>
                    </div>
                </>
            )
        },

    ]


    const handleJoyrideCallback = (data) => {
        const { status, type } = data;

    };


    return (
        <Joyride
            tooltipComponent={Tooltip}
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            hideBackButton
            autoStart
            run={!onboarding.initial}
            steps={steps}
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
            styles={{
                overlayColor: "rgba(79, 26, 0, 1)",
                backgroundColor: "#FFF"
            }}

        />

    )
}

export default ArrangementOnboarding;