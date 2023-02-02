import React, { useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import useStore from '../../../store';
import { baseImagePath } from '../../../utils/utility';
import AddWebPageModal from './AddWebPageModal';
import WebPageItem from './WebPageItem';

const WebPageList = () => {
  const { addToast } = useToasts();
  const removeWebpage = useStore(state => state.removeWebpage);
  const webpagesList = useStore(state => state.webpagesList);
  const saveWebpages = useStore(state => state.saveWebpages);
  const [modalVisible, setModalVisible] = useState(false);
  const [webpageData, setWebpageData] = useState(null);

  const handleChecked = async (e, id) => {
    e.stopPropagation();
    const index = webpagesList.findIndex(page => page.id === id);
    if (index === -1) return;
    const updatedWebpage = {
      ...webpagesList[index],
      checked: e.target.checked ? 'true' : 'false',
    };

    await saveWebpages(updatedWebpage);
  };

  const handleToggle = index => {
    setWebpageData(webpagesList[index]);
    setModalVisible(!modalVisible);
  };

  const handleRemove = async id => {
    try {
      await removeWebpage(id);
      addToast('Page group successfully removed.', {
        appearance: 'success',
        autoDismiss: true,
        id: 'webpage-success',
      });
    } catch (error) {
      addToast(error.message, {
        appearance: 'error',
        autoDismiss: true,
        id: 'webpage-error',
      });
    }
  };

  return (
    <div>
      {webpagesList.map((pages, index) => {
        return (
          <WebPageItem
            id={pages.id}
            index={index}
            key={pages.id}
            name={pages.name}
            icon={
              pages.icon === '' ? baseImagePath('icons/add.svg') : pages.icon
            }
            checked={pages.checked === 'true' ? true : false}
            handleChecked={handleChecked}
            handleToggle={handleToggle}
            handleRemove={handleRemove}
          />
        );
      })}

      {modalVisible && (
        <AddWebPageModal
          setModalVisible={setModalVisible}
          webpageData={webpageData}
          editMode={true}
        />
      )}
    </div>
  );
};

export default WebPageList;
