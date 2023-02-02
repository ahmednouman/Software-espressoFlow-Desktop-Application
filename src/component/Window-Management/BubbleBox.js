import React from 'react';
import useStore from '../../store';
import { TextTruncate } from '../../utils/utility';

const BubbleBox = (prop) => {

  if (prop.show) {
    if(prop.location == 1){
        return (
            <div className="box arrow-bottom">
            <p>Press the Windows Logo Key + Up Arrow until the window maximises</p>
           </div>
        )
    }else if(prop.location ==2){
        return (
            <div className="box2 arrow-bottom">
            <p>To get the window into the desired corner, first the window should either be in the top half, left or right side of the display. Then press the Windows Logo Key + Up Arrow or the Windows Logo Key + Down Arrow</p>
           </div>
        )
    }else if(prop.location ==3){
      return (
          <div className="box3 arrow-bottom">
          <p>To minimise the windows, first press the Windows Logo Key + Down Arrow to restore the window size and then repeat this step to minimise</p>
         </div>
      )
  }
  }

  return <></>;
};

export default BubbleBox;
