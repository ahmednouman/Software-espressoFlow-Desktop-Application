import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';
import Slider from 'rc-slider';
import './slider.css';

const TraySlider = ({ display }) => {
  const store = useStore();
  const setBrightnessAPI = store.setBrightness;

  const handleBrightness = value => {
    setBrightnessAPI('tray', display.id, Number(value));
  };

  return (
    <span
      style={{ width: '100%', margin: '0 2em', alignSelf: 'center' }}
      className="es_dv_set_ft_brightness_dynamic cursor-pointer es_brightness_panel_bar"
    >
      <img
        src={baseImagePath(
          display.brightness > 50
            ? 'icons/brightness-dark.svg'
            : 'icons/brightness.svg',
        )}
        className="pointer-events panel-brightness-icon unselectable"
        alt="brightness icon"
      />
      <Slider
        className="slider-height"
        value={display.brightness}
        onChange={handleBrightness}
        trackStyle={{ backgroundColor: '#DCDCDC', height: 27, borderRadius: 4 }}
        railStyle={{ backgroundColor: '#494949', height: 27, borderRadius: 4 }}
        handleStyle={{
          height: 27,
          width: 30,
          borderRadius: 0,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          borderWidth: 0,
          marginTop: 3,
        }}
      />
    </span>
  );
};

export default TraySlider;
