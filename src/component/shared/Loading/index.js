import React from 'react';
import { baseImagePath } from '../../../utils/utility';

const Loading = ({loading}) => {
    return loading && (
        <div className="loading-animation-canvas">
            <div className="loading1">
                {/* We put the top of the logo on the bottom and bottom on the top */}
                <img src={baseImagePath("icons/bottom-e-green.svg")} alt="loading..." />
                <img src={baseImagePath("icons/top-e-green.svg")} alt="loading..." />
            </div>
            <div className="loading2">
                <img src={baseImagePath("icons/bottom-e-grey.svg")} alt="loading..." />
                <img src={baseImagePath("icons/top-e-grey.svg")} alt="loading..." />
            </div>
            <div className="loading3">
                <img src={baseImagePath("icons/top-e-grey.svg")} alt="loading..." />
            </div>
        </div>
    );
};

export default Loading;
