/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from 'react';
import { ROUTES } from '../../utils/RouterPath';
import { baseImagePath, osFinder } from '../../utils/utility';
import useStore from '../../store/index';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

const requestPermissionSelector = state => state.requestPermissions;
const pollPermissionSelector = state => state.pollPermission;
//const startFlowHelperSelector = state => state.startFlowHelper;

const ScreensPermissions = () => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const permission = useStore(state => state.permission);
  const version = useStore(state => state.version);
  const tutorialDone = useStore(state => state.tutorialDone);
  const flowWindowPermissions = useStore(state => state.flowWindowPermissions);
  const theme = useStore(state => state.theme);
  const requestPermissions = useStore(requestPermissionSelector);
  //const startFlowHelper = useStore(startFlowHelperSelector);
  const pollPermission = useStore(pollPermissionSelector);
  const store = useStore();
  
  const promptFlowWindowAccessibility = useStore(
    state => state.promptFlowWindowAccessibility,
  );
  const onFlowWindowPermissions = useStore(
    state => state.onFlowWindowPermissions,
  );
  const checkFlowWindowPermissions = useStore(
    state => state.checkFlowWindowPermissions,
  );

  const checkFlowWindowPermissionsPoll = useStore(
    state => state.checkFlowWindowPermissionsPoll
  )
  const flowWindowPollInterval = useStore(state => state.flowWindowPollInterval)
  const workspaceEnabled = useStore(state => state.workspaceEnabled);


  useEffect(() => {
    if (!permission) {
      requestPermissions();
      pollPermission();
    }


    onFlowWindowPermissions();
    if (!flowWindowPermissions && osFinder("Mac") && workspaceEnabled) {
      checkFlowWindowPermissions();
      promptFlowWindowAccessibility();
      checkFlowWindowPermissionsPoll()
    }

    return () => {
      clearInterval(flowWindowPollInterval)
    }
  }, []);

  useEffect(() => {
    if (!workspaceEnabled) {
      closeModal();
      store.cancelPermissions = true;
    }
  }, [workspaceEnabled]);

  const cancelPermissions = () => {
    store.cancelPermissions = true;
  };

  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {permission && (flowWindowPermissions || !workspaceEnabled) ? (
        <>
          <div className="es_message_success">
            <img
              src={baseImagePath('icons/tick.svg')}
              alt="tick"
              className="es_mobile"
            />
            <span style={{ fontSize: "16px" }}> Permissions successfully enabled </span>
          </div>

          <Link
            to={
              tutorialDone.completed && tutorialDone.version === version
                ? ROUTES.SCREEN_THREE_PATH
                : ROUTES.SCREEN_TWO_PATH
            }
            className="es_next_button2"
          >
            <img
              src={
                theme === 'light'
                  ? baseImagePath('icons/next_arrow.svg')
                  : baseImagePath('icons/next-arrow-white.svg')
              }
              alt="next arrow"
            />
          </Link>
        </>
      ) : (
        <>
          <div className="es_slider_item_permis">
            <div className="es_drag_cont">
              <p className={theme === 'dark' ? 'text-white' : ''} style={{ gridColumn: "1/span 3" }}>
                espressoFlow needs accessibility enabled
              </p>
            </div>

            <div className="es_inst_first_slide_content es_inst_first_slide_content_permis">
              <div className="es_first_slide_device_cols">
                <div className="imgss permis_img">
                  <img
                    src={
                      theme === 'light'
                        ? baseImagePath('thumbnails/permission_light.svg')
                        : baseImagePath('thumbnails/permission_dark.svg')
                    }
                    alt="thumbnails-img"
                    className="es_mobile_width"
                    width="60%"
                  />
                </div>

                <div className="es_first_slide_device_content_perm">
                  <h6 className={theme === 'dark' ? 'text-white' : ''}>
                    Need help with accessibility?
                  </h6>
                  <span
                    className={
                      theme === 'dark'
                        ? 'cursor-pointer text-white'
                        : 'cursor-pointer'
                    }
                    onClick={() => {
                      window.open(
                        'https://support.espres.so/hc/en-us/articles/4432502702873-espressoFlow-permissions',
                        'modal',
                      );
                    }}
                  >
                    How to grant espressoFlow permissions{' '}
                    <img
                      src={
                        theme === 'light'
                          ? baseImagePath('icons/link_out.svg')
                          : baseImagePath('icons/link_out_white.svg')
                      }
                      alt="icon"
                      className="link_out_img"
                    />
                  </span>
                </div>
              </div>
              <div className="es_slider_device_inner_wrap">
                <div className="es_slider_device_wrapper">
                  <span
                    className={
                      theme === 'dark'
                        ? 'es_slider_skip_btn_dark'
                        : 'es_slider_skip_btn'
                    }
                    onClick={openModal}
                  >
                    Skip
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
            className="es_skip_model_wrapper"
          >
            <div className="es_skip_model">
              <p>
                Not enabling permissions for espressoFlow
                <br />
                disables some features on your display
              </p>
              <div className='modal-btn-group'>
                <button className="es_skip_back_btn" onClick={closeModal}>
                  Go back
                </button>
                <Link
                  className="es_skip_und_btn"
                  to={tutorialDone.completed && tutorialDone.version === version
                    ? ROUTES.SCREEN_THREE_PATH : ROUTES.SCREEN_TWO_PATH
                  }
                  onClick={cancelPermissions}
                >
                  I understand
                </Link>
              </div>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default ScreensPermissions;
