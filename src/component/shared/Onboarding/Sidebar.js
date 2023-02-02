import React from 'react'
import Joyride from 'react-joyride';
import useStore from '../../../store';
import SNAPPING_WALKTHROUGH from '../../../utils/utility';

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


const Sidebar = () => {

    const startSidebarWalkthrough = useStore(state => state.startSidebarWalkthrough)

    const steps = [
        {
            target: '.sidebar_ul',
            content: (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: "center" }}>
                        <p className="onboarding-text">Click on any menu option to learn more</p>
                    </div>
                </>
            ),
            placement: 'right',
            disableBeacon: true,
        },
    ]


    const handleJoyrideCallback = (data) => { };


    return (
        <Joyride
            tooltipComponent={Tooltip}
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            hideBackButton
            autoStart
            run={startSidebarWalkthrough}
            steps={steps}
            stepIndex={SNAPPING_WALKTHROUGH.START}
            disableOverlayClose={true}
            spotlightClicks={true}
            disableCloseOnEsc={true}
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

export default Sidebar