import React from 'react';
import { ARRANGEMENTS } from '../../../interfaces/arranagement.interface';
import { baseImagePath } from '../../../utils/utility';
import ArrangementIcon from './ArrangementIcon';

const ArrangementIcons = ({
  theme,
  display,
  arrangement,
  handleArrangementClick,
}) => {
  return (
    <div
      style={{
        display: display ? 'flex' : 'none',
        flexDirection: 'column',
        zIndex: 2,
        position: 'absolute',
        right: '-40px',
        top: 0,
      }}
    >
      <ArrangementIcon
        theme={theme}
        handleClick={e => handleArrangementClick(e, ARRANGEMENTS.MAXIMIZE)}
        active={arrangement === ARRANGEMENTS.MAXIMIZE}
      >
        <img
          className="arrangement-icon"
          src={
            arrangement === 'maximize'
              ? baseImagePath('icons/arrange_full_dark.svg')
              : baseImagePath('icons/arrange_full_light.svg')
          }
          alt="arrange full"
        />
      </ArrangementIcon>
      <ArrangementIcon
        theme={theme}
        handleClick={e => handleArrangementClick(e, ARRANGEMENTS.VERTICALSPLIT)}
        active={arrangement === ARRANGEMENTS.VERTICALSPLIT}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <img
            className="arrangement-icon"
            src={
              arrangement === 'verticalSplit'
                ? baseImagePath('icons/arrange_vertical_dark.svg')
                : baseImagePath('icons/arrange_vertical_light.svg')
            }
            alt="arrange"
          />
          <img
            className="arrangement-icon"
            src={
              arrangement === 'verticalSplit'
                ? baseImagePath('icons/arrange_vertical_dark.svg')
                : baseImagePath('icons/arrange_vertical_light.svg')
            }
            alt="arrange vertical"
          />
        </div>
      </ArrangementIcon>
      <ArrangementIcon
        theme={theme}
        handleClick={e =>
          handleArrangementClick(e, ARRANGEMENTS.HORIZONTALSPLIT)
        }
        active={arrangement === ARRANGEMENTS.HORIZONTALSPLIT}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <img
            className="arrangement-icon"
            src={
              arrangement === 'horizontalSplit'
                ? baseImagePath('icons/arrange_horizontal_dark.svg')
                : baseImagePath('icons/arrange_horizontal_light.svg')
            }
            alt="arrange horizontal"
          />
          <img
            className="arrangement-icon"
            src={
              arrangement === 'horizontalSplit'
                ? baseImagePath('icons/arrange_horizontal_dark.svg')
                : baseImagePath('icons/arrange_horizontal_light.svg')
            }
            alt="arrange horizontal"
          />
        </div>
      </ArrangementIcon>
    </div>
  );
};

export default ArrangementIcons;
