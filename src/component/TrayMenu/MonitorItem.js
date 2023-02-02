import useStore from '../../store';
import { baseImagePath, osFinder } from '../../utils/utility';
import RotateDisplay from './RotateDisplay';
import TraySlider from './Slider';

const MonitorItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '0.5rem 0',
  cursor: 'pointer',
};

const buttonStyle = {
  border: 'none',
  borderRadius: '6px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const MonitorItem = ({ display }) => {
  const store = useStore();
  const setMirrorMode = store.setMirrorMode;
  const setLockedRotation = store.setLockedRotation;

  const toggleAutoLock = async () => {
    await setLockedRotation('tray', display.id, !display.is_locked);
  };

  const toggleMirror = async () => {
    await setMirrorMode('tray', display.id, !display.is_mirror);
  };

  return (
    <div style={MonitorItemStyle}>
      <RotateDisplay display={display} />
      {display.type === 'espresso v2' || display.type === 'espresso v1' ? (
        <TraySlider display={display} />
      ) : (
        ''
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {display.type === 'espresso v2' ? (
            <button
              style={{
                ...buttonStyle,
                backgroundColor: display.is_locked ? '#DCDCDC' : '#4E4E4E',
                marginRight: '1rem',
              }}
              onClick={() => toggleAutoLock()}
            >
              <img
                src={baseImagePath(
                  display.is_locked ? 'icons/lock-dark.svg' : 'icons/lock.svg',
                )}
                alt="rotate lock"
              />
            </button>
          ) : (
            ''
          )}

          {(display.type === 'espresso v2' || display.type === 'espresso v1') && osFinder('Mac') ? (
            <button
              style={{
                ...buttonStyle,
                backgroundColor: display.is_mirror ? '#DCDCDC' : '#4E4E4E',
              }}
              onClick={() => toggleMirror()}
            >
              <img
                src={baseImagePath(
                  display.is_mirror
                    ? 'icons/mirror-dark.svg'
                    : 'icons/mirror.svg',
                )}
                alt="mirror"
              />
            </button>
          ) : ''}
        </div>
      </div>
    </div>
  );
};

export default MonitorItem;
