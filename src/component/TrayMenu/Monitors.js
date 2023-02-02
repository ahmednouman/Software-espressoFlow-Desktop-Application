import useStore from '../../store/index';
import { baseImagePath } from '../../utils/utility';
import MonitorItem from './MonitorItem';

const Monitors = () => {
  const theme = useStore(state => state.theme);
  const storeDisplays = useStore(state => state.displays);

  let espressoV2Exists = storeDisplays.findIndex(
    display => display.type === 'espresso v2',
  );

  let espressoV1Exists = storeDisplays.findIndex(
    display => display.type === 'espresso v1',
  );

  if (espressoV2Exists === -1 && espressoV1Exists === -1) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <p
          style={{
            fontSize: '14px',
            fontFamily: 'GTAmerica-Regular',
            color: theme === 'light' ? '#5A5A5A' : '#F0F0F0',
          }}
        >
          Connect your espresso
        </p>
        <img
          className="connect-your-espresso-image"
          src={
            theme === 'light'
              ? baseImagePath('thumbnails/ConnectYourespresso_light.svg')
              : baseImagePath('thumbnails/ConnectYourespresso.svg')
          }
          alt="connect your espresso"
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', margin: '0.3em 0' }}>
      {storeDisplays.map(display => {
        if (display.type === 'espresso v2' || display.type === 'espresso v1') {
          return <MonitorItem key={display.id} display={display} />;
        } else
        {
          return '';
        }
      })}
    </div>
  );
};

export default Monitors;
