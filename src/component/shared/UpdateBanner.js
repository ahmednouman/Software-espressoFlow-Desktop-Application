import useStore from '../../store/index';
import { baseImagePath } from '../../utils/utility';


const UpdateBanner = () => {
  const setNewFirmwareFlag = useStore(state => state.setNewFirmwareFlag);
  const startFirmwareUpdateTool = useStore(state => state.startFirmwareUpdateTool);

	return (
    <div className='updateBanner' style={{cursor: 'pointer'}}>
      <span onClick={() => {setNewFirmwareFlag(true); startFirmwareUpdateTool()}} >
        A new firmware update is available.
      </span>

      <img src={baseImagePath('icons/close-white.svg')} alt="close-img" height={13} onClick={() => setNewFirmwareFlag(true)} />

    </div>
  );
};

export default UpdateBanner;