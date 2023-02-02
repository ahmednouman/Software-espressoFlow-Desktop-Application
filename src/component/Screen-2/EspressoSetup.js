import React from 'react'
import useStore from '../../store'
import { baseImagePath } from '../../utils/utility'

const EspressoSetup = ({ setEspressoConfirm }) => {
    const setEspressoSetup = useStore(state => state.setEspressoSetup)

    return (
        <div className="espresso-setup-container">
            <p className="text">Are you setting up an espressoDisplay?</p>
            <div className="espresso-setup-image-container">
                <img className="espresso-setup-thumbnail" src={baseImagePath('thumbnails/espresso_graphic.svg')} alt="espresso display" />
            </div>

            <div className="button-container">
                <button className="link-button" onClick={() => {
                    setEspressoConfirm(false)
                }}>Nope</button>
                <button className="primary-btn" onClick={() => {
                    setEspressoSetup(true)
                    setEspressoConfirm(false)
                }}> Yes</button>
            </div>

        </div >
    )
}

export default EspressoSetup