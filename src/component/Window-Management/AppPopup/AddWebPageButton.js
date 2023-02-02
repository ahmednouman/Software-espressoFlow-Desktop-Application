import React, { useState } from 'react';
import { baseImagePath } from '../../../utils/utility';
import AddWebPageModal from './AddWebPageModal';

const AddWebPageButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      {modalVisible && <AddWebPageModal setModalVisible={setModalVisible} />}
      <div>
        <button
          className="add-webpage-btn"
          onClick={() => setModalVisible(!modalVisible)}
        >
          <img
            src={baseImagePath('icons/add.svg')}
            alt="add new webpage or tab"
          />
          <span>Add a new webpage or tabs </span>
        </button>
      </div>
    </>
  );
};

export default AddWebPageButton;
