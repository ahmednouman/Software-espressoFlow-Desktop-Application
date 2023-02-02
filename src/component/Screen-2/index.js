/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/RouterPath';
import { baseImagePath } from '../../utils/utility';
import useStore from '../../store/index';
import SidebarPlaceholder from './SidebarPlaceholder';

const ScreenTwoComponent = () => {
  const sliderRef = useRef();
  const history = useStore(state => state.history)
  const setTutorialDone = useStore(state => state.setTutorialDone)
  const [menuVisible, setMenuVisible] = useState(true)
  const [slideNumber, setSlideNumber] = useState(1)
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    draggable: false,
    touchMove: false,
    slidesToScroll: 1,
    arrows: false
  };

  const store = useStore();
  const theme = useStore(state => state.theme);

  const [isLastSlider, setIsLastSlider] = useState(false);
  const osFinder = platform => {
    return navigator.platform.indexOf(platform) > -1;
  };

  let silderCount;
  if (osFinder('Mac')) {
    silderCount = 9;
  } else {
    silderCount = 4;
  }
  const handleSlider = (_, newIndex) => {
    if (newIndex === 0) {
      setMenuVisible(true)
    }
    if (newIndex === 1) {
      setMenuVisible(false)
    }
    if (newIndex === silderCount - 1 && theme === 'dark') {
      setIsLastSlider(true);
    }
    else if (newIndex === silderCount) setIsLastSlider(true)
    else setIsLastSlider(false);
  };

  const handleTutorial = () => {
    // if (isLastSlider) {
    //   store.setTutorialDone(true);
    // }
  };

  const goBack = () => {
    if (slideNumber === 1) return
    sliderRef.current.slickPrev();
    setSlideNumber(prevState => prevState - 1)
  }

  const goNext = () => {
    if (slideNumber === 2) {
      history.push(ROUTES.SCREEN_THREE_PATH)
      store.setTutorialDone(true);
    } else {
      sliderRef.current.slickNext();
      setSlideNumber(prevState => prevState + 1)
    }
  }

  return (

    <div className="es_device_main_wrap es_device_main_wrap_screen2">
      <div className="es_slider_device_inner_wrap">
        <div
          className={
            theme === 'light'
              ? 'es_slider_device_wrapper'
              : 'es_slider_device_wrapper_dark'
          }
        >
          <>
            <SidebarPlaceholder menuVisible={menuVisible} />
            {slideNumber > 1 && <img src={theme === 'light' ? baseImagePath("icons/back-arrow.svg") : baseImagePath("icons/prev-arrow-white.svg")}
              alt="previous" className="slider-back-arrow" onClick={goBack} />}
            {slideNumber < 3 && <img src={theme === 'light' ? baseImagePath("icons/back-arrow.svg") : baseImagePath("icons/prev-arrow-white.svg")}
              alt="previous" className="slider-next-arrow" onClick={goNext} />}

            <Slider {...settings} beforeChange={handleSlider} ref={sliderRef}>
              <div className="item es_slider_item">
                <div className="es_drag_cont">
                  <p className={theme === 'dark' ? 'text-white' : ''} style={{ gridColumn: "1/span 3" }}>
                    Connect your displays to your device
                  </p>
                </div>
                <div className="es_inst_first_slide_content">
                  <div className="es_first_slide_device_cols">
                    <ul>
                      <li>
                        <div className="es_first_slide_device_box">
                          <img
                            src={
                              theme === 'light'
                                ? baseImagePath('thumbnails/tablet-img1.svg')
                                : baseImagePath('thumbnails/espresso-white.svg')
                            }
                            alt="thumbnails-img"
                            className="es_mobile_width"
                          />
                        </div>
                      </li>
                      <li>
                        <div className="es_first_slide_device_box">
                          {theme === 'light' ? (
                            <img
                              src={baseImagePath('icons/usb.png')}
                              alt="thumbnails-img"
                              className="es_mobile_width es_usb_width"
                            />
                          ) : (
                            <div>
                              <img
                                src={baseImagePath('thumbnails/cable_white.svg')}
                                alt="thumbnails-img"
                                className="es_mobile_width es_usb_width"
                              />
                              <img
                                style={{ transform: 'scaleX(-1)' }}
                                src={baseImagePath('thumbnails/cable_white.svg')}
                                alt="thumbnails-img"
                                className="es_mobile_width es_usb_width"
                              />
                            </div>
                          )}
                        </div>
                      </li>
                      <li>
                        <div className="es_first_slide_device_box">
                          <img
                            src={
                              theme === 'light'
                                ? baseImagePath('thumbnails/laptop.svg')
                                : baseImagePath(
                                  'thumbnails/laptop_graphic_white.svg',
                                )
                            }
                            alt="thumbnails-img"
                            className="es_mobile_width"
                          />
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="es_first_slide_device_content">
                    <h6 className={theme === 'dark' ? 'text-white' : ''}>
                      Need help finding the right cable for your device?
                    </h6>
                    {osFinder('Mac') ? (
                      <span
                        className={
                          theme === 'dark'
                            ? 'text-white cursor-pointer'
                            : 'cursor-pointer'
                        }
                        onClick={() => {
                          window.open(
                            'https://espres.zendesk.com/hc/en-us/articles/4421950475801-Setup-with-Apple-Mac',
                            'modal',
                          );
                        }}
                      >
                        Set up with Apple Mac{' '}
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
                    ) : (
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          window.open(
                            'https://espres.zendesk.com/hc/en-us/articles/4421953918489-Setup-with-Windows-PC',
                            'modal',
                          );
                        }}
                      >
                        Set up with Windows PC{' '}
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
                    )}
                  </div>
                </div>
              </div>

              {/* <div className="item es_slider_item">
                  <div className="es_drag_cont" >
                    <p className={theme === 'dark' ? 'text-white' : ''} style={{ gridColumn: '1/span 3' }}>
                      Displays will appear here as you connect them
                      <br />
                      Drag displays to the correct position for your workspace
                    </p>
                  </div>
                  <div className="es_inst_first_slide_content">
                    <div className="es_first_slide_device_cols">
                      <div className="es_second_slide_top_arrow">
                        <img
                          src={baseImagePath(
                            theme === 'light'
                              ? 'icons/instructions.svg'
                              : 'thumbnails/Instructions.svg',
                          )}
                          alt="img"
                          className="es_mobile_width"
                        />
                      </div>
                      <ul>
                        <li>
                          <div className="es_second_slide_device_box">
                            <img
                              style={{ maxWidth: '135px' }}
                              src={baseImagePath(
                                theme === 'light'
                                  ? 'thumbnails/tablet-img1.svg'
                                  : 'thumbnails/espresso-white.svg',
                              )}
                              alt="thumbnails-img"
                              className="es_mobile_width"
                            />
                            <p className={theme === 'dark' ? 'text-white' : ''}>
                              espresso
                            </p>
                          </div>
                        </li>
                        <li>
                          <div className="es_second_slide_device_box">
                            <img
                              src={baseImagePath(
                                theme === 'light'
                                  ? 'thumbnails/laptop.svg'
                                  : 'thumbnails/laptop_graphic_white.svg',
                              )}
                              alt="thumbnails-img"
                              className="es_mobile_width"
                            />
                            <p className={theme === 'dark' ? 'text-white' : ''}>
                              laptop
                            </p>
                          </div>
                        </li>
                        <li>
                          <div className="es_second_slide_device_box">
                            <img
                              src={baseImagePath(
                                theme === 'light'
                                  ? 'thumbnails/external.svg'
                                  : 'thumbnails/external-white.svg',
                              )}
                              alt="thumbnails-img"
                              className="es_mobile_width"
                            />
                            <p className={theme === 'dark' ? 'text-white' : ''}>
                              other external display
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div> */}
              {/* <div className="item es_slider_item">
                  <div className="es_drag_cont">
                    <p className={theme === 'dark' ? 'text-white' : ''} style={{ gridColumn: '1/span 3' }}>
                      Click your espresso display to access the controls
                    </p>
                  </div>
                  <div className="es_inst_first_slide_content">
                    <div className="es_first_slide_device_cols es_control_info_img">
                      <img
                        src={baseImagePath(
                          theme === 'light'
                            ? 'thumbnails/control-info-img.svg'
                            : 'thumbnails/control-info-img-white.png',
                        )}
                        alt="thumbnails-img"
                      />
                    </div>
                  </div>
                </div>
                <div className="item es_slider_item">
                  <div className="es_drag_cont">
                    <p className={theme === 'dark' ? 'text-white' : ''}>
                      Rotating your display
                    </p>
                  </div>
                  <div className="es_inst_first_slide_content">
                    <div className="es_first_slide_device_cols">
                      <div className="imgss imgss-rotate-img">
                        <img
                          src={baseImagePath(
                            theme === 'light'
                              ? 'thumbnails/rotate-info-img.svg'
                              : 'thumbnails/rotate-info-img-white.png',
                          )}
                          alt="thumbnails-img"
                          className="es_mobile_width"
                        />
                      </div>

                      <div className="es_first_slide_device_content pd-10">
                        <h6 className={theme === 'dark' ? 'text-white' : ''}>
                          Need help?
                        </h6>
                        <span
                          className={
                            theme === 'dark'
                              ? 'text-white cursor-pointer'
                              : 'cursor-pointer'
                          }
                          onClick={() => {
                            window.open(
                              'https://espres.zendesk.com/hc/en-us/articles/5103121872409',
                              'modal',
                            );
                          }}
                        >
                          Which version do i have?{' '}
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
                  </div>
                </div> */}

              <div className="item es_slider_item display-setting-bg">
                <div className="es_drag_cont">

                </div>
                <div className="es_gif_info_wrapper">
                  <div className="es_gif_info_inner">
                    <div className="es_gif_info_cols">
                      <div className="es_gif_info_box">
                        <h6 className={theme === 'dark' ? 'text-white' : ''}>
                          On screen controls
                        </h6>
                        <p className={theme === 'dark' ? 'text-white' : ''}>
                          swipe up with 2 fingers from the edge of the display
                        </p>
                        <div className="es_gif_img">
                          <img
                            src={baseImagePath('thumbnails/osd-gif.gif')}
                            alt="thumbnails-img"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="es_gif_info_cols">
                      <div className="es_gif_info_box">
                        <h6 className={theme === 'dark' ? 'text-white' : ''}>
                          Scrolling
                        </h6>
                        <p className={theme === 'dark' ? 'text-white' : ''}>
                          use 2 fingers to scroll
                        </p>
                        <div className="es_gif_img">
                          <img
                            src={baseImagePath('thumbnails/osd-gif2.gif')}
                            alt="thumbnails-img"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="es_gif_info_cols">
                      <div className="es_gif_info_box">
                        <h6 className={theme === 'dark' ? 'text-white' : ''}>
                          Right click
                        </h6>
                        <p className={theme === 'dark' ? 'text-white' : ''}>
                          single tap to locate cursor then 2 finger tap
                        </p>
                        <div className="es_gif_img">
                          <img
                            src={baseImagePath('thumbnails/osd-gif3.gif')}
                            alt="thumbnails-img"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="es_gif_info_cols">
                      <div className="es_gif_info_box es_gif_info_box_bot pd-10">
                        {osFinder("Mac") ?
                          <h6 className={theme === 'dark' ? 'text-white' : ''}>
                            Spaces
                          </h6> :
                          <h6 className={theme === 'dark' ? 'text-white' : ''}>
                            Switch desktops
                          </h6>}
                        {osFinder("Mac") ?
                          <p className={theme === 'dark' ? 'text-white' : ''}>
                            Swipe 3 fingers to switch desktops
                          </p> :
                          <p className={theme === 'dark' ? 'text-white' : ''}>
                            Swipe with 4 fingers to the left or right of the display
                          </p>
                        }
                        {osFinder("Mac") ?
                          <div className="es_gif_img">
                            <img
                              src={baseImagePath('thumbnails/osd-gif4.gif')}
                              alt="thumbnails-img"
                            />
                          </div> :
                          <div className="es_gif_img_win1">
                            <img
                              src={baseImagePath('thumbnails/osd-gif4.gif')}
                              alt="thumbnails-img"
                            />
                          </div>}
                      </div>
                    </div>
                    <div className="es_gif_info_cols">
                      <div className="es_gif_info_box es_gif_info_box_bot pd-10">
                        {osFinder("Mac") ?
                          <>
                            <h6 className={theme === 'dark' ? 'text-white' : ''}>
                              Launchpad
                            </h6>
                            <p className={theme === 'dark' ? 'text-white' : ''}>
                              Pinch in with all fingers to reveal launchpad
                            </p> </> :
                          <>
                            <h6 className={theme === 'dark' ? 'text-white' : ''}>
                              Show open windows
                            </h6>
                            <p className={theme === 'dark' ? 'text-white' : ''}>
                              Swipe with three fingers up on the display
                            </p>    </>}
                        {osFinder("Mac") ?
                          <div className="es_gif_img">
                            <img
                              src={baseImagePath('thumbnails/osd-gif5.gif')}
                              alt="thumbnails-img"
                            /> </div> :
                          <div className="es_gif_img_win">
                            <img
                              src={baseImagePath('thumbnails/showOpenWindows.gif')}
                              alt="thumbnails-img"
                            /> </div>
                        }

                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* <div className="item es_slider_item">
                  <div className="es_drag_cont">
                    <p className={theme === 'dark' ? 'text-white' : ''}>
                      Tutorial Finished
                    </p>
                  </div>
                  <div className="es_message_success">
                    <img
                      src={baseImagePath(
                        theme === 'light'
                          ? 'icons/tick.svg'
                          : 'icons/green-tick.svg',
                      )}
                      alt="tick"
                      className="es_mobile"
                    />
                    <span className={theme === 'dark' ? 'text-white' : ''}>
                      {' '}
                      You are ready to start arranging your display
                    </span>
                  </div>
                </div> */}
            </Slider>
            {isLastSlider ? (
              <Link to={ROUTES.SCREEN_THREE_PATH} className="es_slider_next_btn">
                <img
                  onClick={handleTutorial}
                  src={
                    theme === 'light'
                      ? baseImagePath('icons/next_arrow.svg')
                      : baseImagePath('icons/next-arrow-white.svg')
                  }
                  alt="next"
                />
              </Link>
            ) : null}
            <Link
              to={ROUTES.SCREEN_THREE_PATH}
              onClick={() => store.setTutorialDone(true)}
              className={
                theme === 'light'
                  ? 'es_slider_skip_btn'
                  : 'es_slider_skip_btn_dark'
              }
            >
              Skip
            </Link>

          </>


        </div>
      </div>
    </div>
  );
};

export default ScreenTwoComponent;
