import React from 'react'
import useStore from '../../../store'

const NoEspresso = ({ items }) => {
    const endDisplayOnboarding = useStore(state => state.endDisplayOnboarding)
    const setDisplayWalkthrough = useStore(state => state.setDisplayWalkthrough)
    const setShowNoEspressoModal = useStore(state => state.setShowNoEspressoModal)

    const espressoFound = items[0];
    const nonEspressoFound = items[1];

    return (
        <div className="no-espresso-modal">
            < div >
                <div>
                    <p className="onboarding-text">Are all of your displays connected?</p>
                    <p className="onboarding-text">Take a moment to connect your displays before continuing with the walkthrough.</p>
                </div>
                <div className="display-walkthrough-button-container">
                    <button type="button" className="link-button" onClick={() => {
                        setShowNoEspressoModal(false)
                        setDisplayWalkthrough(false)
                        endDisplayOnboarding()
                    }}>Go back</button>
                    <button type="button"
                        disabled={!espressoFound.found && !nonEspressoFound.found}
                        className={espressoFound.found || nonEspressoFound.found ? "primary-btn" : "disabled-btn"} onClick={() => {
                            setShowNoEspressoModal(false)
                            setDisplayWalkthrough(true)
                        }}>Continue</button>
                </div>

            </div>


        </div>
    )
}

export default NoEspresso