import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/index';
import { baseImagePath } from '../../utils/utility';
import { osFinder } from '../../utils/utility';
import ReactTooltip from 'react-tooltip';

const HelpMenu = () => {
  const theme = useStore(state => state.theme);
  const version = useStore(state => state.version);
  const signOut = useStore(state => state.signout);
  const saveOnboarding = useStore(state => state.saveOnboarding);
  const startFirmwareUpdateTool = useStore(
    state => state.startFirmwareUpdateTool,
  );
  const setNewFirmwareFlag = useStore(state => state.setNewFirmwareFlag);

  const espressoV2Found = useStore(state => state.espressoV2Found);
  const selectedToggle = useStore(state => state.selectedToggle)
  const setSelectedToggle = useStore(state => state.setSelectedToggle)

  const toggle = (id) => {
    let visible = false
    if (selectedToggle.id === id) {
      visible = !selectedToggle.visible
    } else {
      visible = true
    }

    setSelectedToggle({ id, visible })
  }


  useEffect(() => {
    document.addEventListener("click", function (event) {
      onClick(event);
    })

    return () => {
      document.removeEventListener("click", function (event) {
        onClick(event);
      })
    };
  }, []);

  const onClick = (e) => {
    if (e.target.closest(".es_help_dropdown_show") || e.target.closest(".es_help_toggle_btn")) return
  };

  return (
    <div className="es_help_wrapper">
      <span
        className="es_help_toggle_btn cursor-pointer"
        onClick={() => toggle('menu')}
      >
        <img
          src={
            theme === 'light'
              ? baseImagePath('icons/menu.svg')
              : baseImagePath('icons/menu-white.svg')
          }
          alt="help-icon"
          data-tip="Get help"
        />
      </span>
      {selectedToggle.id === 'menu' && selectedToggle.visible &&
        <div className="fixed-modal-transparent-background" onClick={toggle}></div>
      }
      <div
        className={`es_help_dropdown ${selectedToggle.visible && selectedToggle.id === 'menu' ? 'es_help_dropdown_show' : ''
          }`}
      >

        <div className="es_help_close">
          <span
            className="es_help_toggle_btn cursor-pointer"
            onClick={() => toggle('menu')}
          >
            <img src={baseImagePath('icons/close-white.svg')} alt="close-img" />
          </span>
        </div>
        <div className="es_help_list">
          <ul>
            <li>
              <Link
                to="#"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  window.electron.captureEvent('Menu-Click', 'Get Support');
                  window.open('https://support.espres.so', 'modal');
                  toggle('menu')
                }}
              >
                Get support
              </Link>
            </li>
            <li>
              <Link
                to="#"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  window.electron.captureEvent('Menu-Click', 'Visit espres.so');
                  window.open('https://espres.so', 'modal');
                  toggle('menu');
                }}
              >
                Visit espres.so
              </Link>
            </li>
            {!osFinder('Mac') && (
              <>
                <li>
                  <Link
                    to="#"
                    onClick={() => {
                      window.electron.captureEvent(
                        'Menu-Click',
                        'Restart Tutorial',
                      );
                      saveOnboarding({
                        initial: false,
                        display: false,
                        workspace: false,
                        pen: false,
                      });
                      toggle(false)
                    }}
                  >
                    Restart tutorial
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="#"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  window.electron.captureEvent(
                    'Menu-Click',
                    'License and Agreement',
                  );
                  window.open(
                    'https://espres.so/software-license-agreement/',
                    'modal',
                  );
                  toggle('menu');
                }}
              >
                View licence agreement
              </Link>
            </li>
            <li>
              <Link
                to="#"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  signOut();
                  toggle('menu');
                }}
              >
                Sign out
              </Link>
            </li>
            {osFinder('Mac') && (
              <>
                {espressoV2Found === true && (
                  <>
                    <li> &nbsp;</li>
                    <li>
                      <Link
                        to="#"
                        style={{ color: '#2F80ED' }}
                        onClick={() => {
                          //Call espresso Firmware Update Tool
                          setNewFirmwareFlag(true);
                          startFirmwareUpdateTool();
                          toggle(false)
                        }}
                      >
                        Check for firmware update
                      </Link>
                    </li>
                  </>)}
              </>
            )}
          </ul>
        </div>
        <div className="es_help_list_bottom">
          Version
          <p>espressoFlow v{version}</p>
        </div>
      </div>
    </div>
  );
};

export default HelpMenu;
