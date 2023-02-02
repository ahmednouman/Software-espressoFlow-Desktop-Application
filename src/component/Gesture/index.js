import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/RouterPath';
import { baseImagePath } from '../../utils/utility';
import useStore from '../../store/index';


const Index = () => {

    const store = useStore();
    const theme = useStore(state => state.theme);

    const osFinder = platform => {
        return navigator.platform.indexOf(platform) > -1;
    };

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


                </div>
            </div>
        </div>
    )
}

export default Index