import React, { useState } from 'react'
import { baseImagePath, isDialogOpen } from '../../utils/utility'

const Swip = () => {
    const defaultOption = {
        open: false,
        ConfirmText: 'Ok, got it',
        onConfirm: () => {}
    }

    const [ dialogOptions, setDialogOptions ] = useState(defaultOption)

    isDialogOpen.subscribe(data => {
        if (data && !dialogOptions.open) setDialogOptions(data);
        else if (!data && dialogOptions.open) setDialogOptions(defaultOption);
    });

    const { open, ConfirmText, onConfirm } = dialogOptions

    const handleConfirm = () => {
        setDialogOptions({...dialogOptions, open: false})
        onConfirm(false)
    }

    return (
        <>
        {open ?
            <div className="es_swipe_popup_wrapper">
            <div className="es_swipe_popup_inner">
                <h6>Swipe up on your espressoDisplay to access picture controls</h6>
                <div className="es_swipe_gif_wrapper">
                <img src={baseImagePath('icons/ots.gif')} alt="ss"/>
                </div>
                <div className="es_swipe_got_btn">
                <span onClick={() => handleConfirm(false)} className="cursor-pointer">{ConfirmText}</span>
                </div>
            </div>
            </div> : null
        }

        </>
    )
}

export default Swip