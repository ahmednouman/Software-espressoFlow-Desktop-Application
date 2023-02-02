import { baseImagePath, isDialogOpen } from '../../utils/utility';
import BlockIcon from '../shared/BlockIcon';
import Slider from 'react-rangeslider';
import useStore from '../../store/index';

const setColourPaletteSelector = state => state.setColourPalette;
const setContrastSelector = state => state.setContrast;

const Picture = ({
  display,
  pictureToggle,
  setPictureToggle,
  setRotateBlockToggle,
}) => {
  const setColourPalette = useStore(setColourPaletteSelector);
  const setContrast = useStore(setContrastSelector);

  const handleOnChange = value => {
    setContrast(display.id, value);
  };

  const setIsActive = (value, name) => {
    let colourValue;
    switch (name) {
      case 'document':
        colourValue = 0;
        break;
      case 'game':
        colourValue = 2;
        break;
      case 'pencil':
        colourValue = 1;
        break;
      case 'night':
        colourValue = 3;
        break;
      default:
        return;
    }
    setColourPalette(display.id, colourValue);
  };

  const checkPicture = () => {
    if (!display.ddc_enabled && ['espresso v2'].includes(display.type)) {
      isDialogOpen.onNext({
        open: true,
        ConfirmText: 'Ok, got it',
        onConfirm: () => {
          isDialogOpen.onNext(false);
        },
      });
    } else {
      setPictureToggle(!pictureToggle);
      setRotateBlockToggle(false);
    }
  };

  if (!display) {
    return <></>;
  }

  return (
    <>
      <span
        className={`es_dv_set_ft_osd cursor-pointer ${
          pictureToggle ? 'es_picture_active' : ''
        } ${display.type === 'non-espresso' ? 'disabled' : ''}`}
        onClick={checkPicture}
      >
        <img src={baseImagePath('icons/osd.svg')} alt="mirror-img" />
      </span>
      <div
        className={`es_osd_dropdown ${
          pictureToggle ? 'es_osd_dropdown_show' : ''
        }`}
      >
        <div className="es_osd_title">
          <p>Picture</p>
        </div>
        <div className="es_osd_row">
          <div className="es_osd_cols">
            <BlockIcon
              url="icons/document.svg"
              activeUrl="icons/document-dark.svg"
              text="Document"
              isActive={display.colour_preset === 6}
              setIsActive={setIsActive}
              keyName="document"
              tooltip="work"
              disabled={display.type !== 'espresso v1'}
            />
            <BlockIcon
              url="icons/game.svg"
              activeUrl="icons/game-dark.svg"
              text="game"
              isActive={display.colour_preset === 5}
              setIsActive={setIsActive}
              keyName="game"
              tooltip="play"
              disabled={display.type !== 'espresso v1'}
            />
          </div>
          <div className="es_osd_cols">
            <BlockIcon
              url="icons/pencil-light.svg"
              activeUrl="icons/pencil-dark.svg"
              text="pencil"
              isActive={display.colour_preset === 4}
              setIsActive={setIsActive}
              keyName="pencil"
              tooltip="create"
              disabled={display.type !== 'espresso v1'}
            />
            <BlockIcon
              url="icons/night.svg"
              activeUrl="icons/night-dark.svg"
              text="night"
              isActive={display.colour_preset === 8}
              setIsActive={setIsActive}
              keyName="night"
              tooltip="night"
              disabled={display.type !== 'espresso v1'}
            />
          </div>
          <div className="es_osd_cols">
            <span className="es_dv_set_ft_brightness_dynamic">
              <Slider
                min={0}
                max={100}
                step={1}
                value={display.contrast}
                tooltip={false}
                orientation="vertical"
                onChange={e => handleOnChange(e)}
              />
              <img
                src={baseImagePath(
                  display.contrast > 50
                    ? 'icons/contrast-dark.svg'
                    : 'icons/contrast.svg',
                )}
                alt="form"
                className="pointer-events"
              />
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Picture;
