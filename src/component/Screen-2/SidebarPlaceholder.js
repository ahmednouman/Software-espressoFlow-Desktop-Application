import React from 'react';
import { baseImagePath } from '../../utils/utility';
import { Link } from 'react-router-dom';
import { osFinder } from '../../utils/utility';
import useStore from '../../store';

const SidebarPlaceholder = ({ menuVisible }) => {
    const theme = useStore(state => state.theme)
    const activeNav = useStore(state => state.activeNav)

    return (
        <div
            className="es_sidebar_wrapper"
            style={{
                width: menuVisible ? '210px' : '70px',
                backgroundColor:
                    menuVisible && theme === 'dark' && 'rgba(0, 0, 0, 0.5)',
                background:
                    menuVisible &&
                    theme === 'light' &&
                    'linear-gradient(350.59deg, #4EA00D 5.73%, rgba(204, 255, 51, 0.376727) 50.02%, rgba(204, 255, 51, 0) 79.28%)',
                filter: menuVisible && 'drop-shadow(15px 15px 20px rgba(0, 0, 0, 0.1))',
                backdropFilter: menuVisible && 'blur(4px)',
                transition: 'all 0.15s ease-in-out',

            }}
        >
            <ul className="sidebar_ul" style={{ marginLeft: "10px", width: '100%' }}>

                <li className="sidebar_li" style={{
                    backgroundColor: menuVisible && theme === 'light' ? "#C2F056" : activeNav === '/screen-three' ? "rgba(86, 0, 86, 1.0)" : "",
                    borderRadius: '4px',
                    paddingLeft: "2px"
                }}
                >
                    <Link to={"#"} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: '5px', alignItems: 'center', margin: '0.5rem 0' }}>
                        <img
                            src={
                                theme === 'light'
                                    ? baseImagePath('icons/productivity_icon.svg')
                                    : baseImagePath('icons/productivity_icon_light.svg')
                            }

                            alt="arrangement icon"
                        />
                        {menuVisible && (
                            <span
                                className="sidebar_nav_text_placeholder"
                                style={{ color: theme === 'light' ? '#303030' : '#FFFFFF' }}
                            >
                                Arrange displays
                            </span>
                        )}
                    </Link>
                </li>

                    <li className="sidebar_li workspace-nav" style={{
                        backgroundColor: activeNav === "/window-management" && theme === 'light' ? "#C2F056" : activeNav === '/window-management' ? "rgba(86, 0, 86, 1.0)" : "",
                        paddingLeft: "2px"
                    }} >
                        <Link
                            to={"#"}
                            style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: '5px', alignItems: 'center', margin: '1rem 0' }}
                        >
                            <img
                                src={
                                    theme === 'light'
                                        ? baseImagePath('icons/windowManage.svg')
                                        : baseImagePath('icons/workspace_icon_light.svg')
                                }

                                alt="workspace icon"
                                style={{ width: '28px !important' }}
                            />

                            {menuVisible && (
                                <span
                                    className="sidebar_nav_text_placeholder"
                                    style={{ color: theme === 'light' ? '#303030' : '#FFFFFF' }}
                                >
                                    Manage workspaces
                                </span>
                            )}
                        </Link>
                    </li>

{/*
                <li className="sidebar_li" style={{
                    backgroundColor: activeNav === "/pen" && theme === 'light' ? "#C2F056" : activeNav === '/pen' ? "rgba(86, 0, 86, 1.0)" : "",
                    paddingLeft: "2px"
                }}>
                    <Link to={"#"} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: '5px', alignItems: 'center', margin: '1rem 0' }}>
                        <img
                            src={
                                theme === 'light'
                                    ? baseImagePath('icons/menu_pen.svg')
                                    : baseImagePath('icons/pen_icon_light.svg')
                            }
                            style={{

                                height: '20px'
                            }}
                            alt="pen icon"
                        />
                        {menuVisible && (
                            <span
                                className="sidebar_nav_text_placeholder"
                                style={{ color: theme === 'light' ? '#303030' : '#FFFFFF' }}
                            >
                                Pen customise
                            </span>
                        )}
                    </Link>
                </li>
*/}
            </ul>
        </div>
    );
};

export default SidebarPlaceholder;
