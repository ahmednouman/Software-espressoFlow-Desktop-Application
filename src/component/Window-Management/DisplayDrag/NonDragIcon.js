import React, { useRef, useState } from 'react'
import useStore from '../../../store'
import { baseImagePath, TextTruncate } from '../../../utils/utility'

const NonDragIcon = ({ appIcon, appName, rotation, urls }) => {
    const [toggle, setToggle] = useState(false)
    const iconRef = useRef(null)
    const setAppDragOn = useStore(state => state.setAppDragOn);


    return (
        <>
            <img
                className="app-icon-drag"
                style={{
                    transform:
                        rotation === 90
                            ? 'rotate(-90deg)'
                            : rotation === 270
                                ? 'rotate(-270deg)' : rotation === 180 ? 'rotate(-180deg)'
                                    : 'rotate(0)',
                }}
                // src={appIcon !== '' ? appIcon : baseImagePath('icons/add.svg')}
                src={appIcon !== '' ? appIcon.search("tabGroup") > -1 ? baseImagePath('icons/tabGroup.svg') : appIcon : baseImagePath('icons/emptyState.svg')}
                alt={appName}
                ref={iconRef}
                onMouseEnter={() => {
                    setAppDragOn(true)
                    setToggle(true)
                }}
                onMouseLeave={() => {
                    setToggle(false)
                    setAppDragOn(false)
                }}

                onDragEnd={() => {
                    setAppDragOn(false)
                }}
            />

            {toggle && appName !== '' && <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: `translateX(-50%)`,
                color: 'black',
                width: '100px',
                minHeight: '25px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99,
                fontSize: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '10px',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',


            }}
                className="app-icon-detail">
                {urls.length > 0
                    ? urls.map((url, i) => {
                        if (i < 3) {
                            return (
                                <p key={`${url}-${i}`} className="tooltip-url">
                                    {TextTruncate(url.split("https://")[1], 12)}
                                </p>
                            );
                        }

                    })

                    : TextTruncate(appName, 12)}

            </div>}

        </>
    )
}

export default NonDragIcon