import React from 'react'
import useStore from '../../store';
import SwitchItem from './SwitchItem';


const SyncSettings = ({theme}) => {
    const brightnessSync = useStore(state => state.brightnessSync)
    const setBrightnessSync = useStore(state => state.setBrightnessSync);
    const touchEnabled = useStore(state => state.touchEnabled);
    const setTouchEnabled = useStore(state => state.setTouchEnabled);
    const storeDisplays = useStore(state => state.displays)

    let espressoV2Exists = storeDisplays.findIndex(
        display => display.type === 'espresso v2',
    );

    let espressoV1Exists = storeDisplays.findIndex(
        display => display.type === 'espresso v1',
    );

    if (espressoV2Exists === -1 && espressoV1Exists === -1) {
        return (
            <></>
          )
    }
    
    return ( 
        <div className="tray-sync-settings">
            <SwitchItem
            label="Brightness Sync"
            initialState={brightnessSync}
            toggleFunction={() => {
            setBrightnessSync({ value: !brightnessSync, window: 'tray' });
            }}
            labelColor={theme === 'light' ? '#404040' : 'white'}
            />

            <SwitchItem
                label="Touch enabled"
                initialState={touchEnabled}
                toggleFunction={() =>
                setTouchEnabled({ value: !touchEnabled, window: 'tray' })
                }
                labelColor={theme === 'light' ? '#404040' : 'white'}
                style={{ marginTop: '10px' }}
            />
        </div>
        )
  
}

export default SyncSettings