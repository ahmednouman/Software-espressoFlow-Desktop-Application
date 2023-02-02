import React from 'react';
import { ARRANGEMENTS } from '../../../interfaces/arranagement.interface';
import HorizontalSplit from './DropLayout.js/HorizontalSplit';
import Maximize from './DropLayout.js/Maximize';
import VerticalSplit from './DropLayout.js/VerticalSplit';

const ArrangementDragArea = ({ data }) => {
  if (data.arrangement === ARRANGEMENTS.MAXIMIZE) {
    return <Maximize data={data} />;
  }

  if (
    (data.rotation === 90 || data.rotation === 270) &&
    data.arrangement === ARRANGEMENTS.VERTICALSPLIT
  ) {
    return <HorizontalSplit data={data} />;
  }

  if (
    (data.rotation === 90 || data.rotation === 270) &&
    data.arrangement === ARRANGEMENTS.HORIZONTALSPLIT
  ) {
    return <VerticalSplit data={data} />;
  }

  if (data.arrangement === ARRANGEMENTS.VERTICALSPLIT) {
    return <VerticalSplit data={data} />;
  }

  if (data.arrangement === ARRANGEMENTS.HORIZONTALSPLIT) {
    return <HorizontalSplit data={data} />;
  }

  return <></>;
};

export default ArrangementDragArea;
