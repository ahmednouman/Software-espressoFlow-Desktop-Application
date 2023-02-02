import React, { useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import useStore from '../../../store';
import { baseImagePath } from '../../../utils/utility';
import Button from '../../shared/Button';
import ReactTooltip from 'react-tooltip';

const AddWebPageModal = ({ setModalVisible, webpageData, editMode = false }) => {
  const saveWebpages = useStore(state => state.saveWebpages);
  const { addToast } = useToasts();
  const [webpageGroup, setWebpageGroup] = useState(
    webpageData || {
      id: null,
      name: '',
      icon: baseImagePath('icons/tabGroup.svg'),
      urls: [''],
      checked: 'false',
    },
  );

  const handleInputChange = e => {
    e.stopPropagation();
    setWebpageGroup(prevState => {
      return {
        ...prevState,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleUrlChange = (e, index) => {
    e.stopPropagation();
    const updatedUrls = [
      ...webpageGroup.urls.slice(0, index),
      e.target.value,
      ...webpageGroup.urls.slice(index + 1),
    ];
    setWebpageGroup(prevState => {
      return {
        ...prevState,
        urls: updatedUrls,
      };
    });
  };

  const handleUrlBlur = (e, index) => {
    e.stopPropagation();
    if (!e.target.value.includes('https://')) {
      const updatedUrls = [
        ...webpageGroup.urls.slice(0, index),
        'https://' + e.target.value,
        ...webpageGroup.urls.slice(index + 1),
      ];
      setWebpageGroup(prevState => {
        return {
          ...prevState,
          urls: updatedUrls,
        };
      });
    }
  };

  const handleAddWebsite = () => {
    setWebpageGroup(prevState => {
      return {
        ...prevState,
        urls: [...webpageGroup.urls, ''],
      };
    });
  };

  const handleRemoveWebsite = index => {
    setWebpageGroup(prevState => {
      return {
        ...prevState,
        urls: webpageGroup.urls.filter((url, i) => i !== index),
      };
    });
  };

  const handleSave = async () => {
    try {
      if (webpageGroup.name === '') {
        addToast('Page name cannot be empty', {
          autoDismiss: true,
          appearance: 'error',
          id: 'webpage-error',
        });
        return;
      }
      if (webpageGroup.urls.length === 0) {
        addToast('There must be at least one page', {
          autoDismiss: true,
          appearance: 'error',
          id: 'webpage-error',
        });
        return;
      }
      let urlError = false;
      for (let i = 0; i < webpageGroup.urls.length; i++) {
        let valid = /^(ftp|http|https):\/\/[^ "]+$/.test(webpageGroup.urls[i]);
        if (!valid || webpageGroup.urls[i] === '') {
          urlError = true;
          break;
        }
      }
      if (urlError) {
        addToast('Website URL is not valid', {
          autoDismiss: true,
          appearance: 'error',
          id: 'webpage-error',
        });
        return;
      }

      await saveWebpages({
        ...webpageGroup,
        checked: 'true'
      });

      addToast('Page group saved', {
        autoDismiss: true,
        appearance: 'success',
        id: 'webpage-saved-success',
      });

      setModalVisible(state => {
        return (state = !state);
      });
    } catch (error) {
      addToast(error.message, {
        autoDismiss: true,
        appearance: 'error',
        id: 'webpage-error',
      });
    }
  };

  return (
    <>
    <div className="webpage-popup">
      <div className="menu-toolbar">
        <p>{!editMode ? "Add a new webpage or tabs" : "Edit webpage or tabs"}</p>
        <img
          onClick={() => setModalVisible(false)}
          src={baseImagePath('icons/close.svg')}
          alt="close"
        />
      </div>

      <div className="webpage-add-data">
        <label className="input-with-label">
          Name this page or tab group
          <input
            name="name"
            type="text"
            placeholder="name"
            maxlength="30"
            onChange={handleInputChange}
            value={webpageGroup.name || ''}
          />
        </label>

        {webpageGroup.urls.map((url, index) => {
          return (
            <div key={`url-${index}`} className="input-website-container">
              <label className="input-with-label">
                {index === 0 ? 'Website Address' : 'New Tab'}
                <input
                  name={`website-${index}`}
                  type="url"
                  placeholder="paste url"
                  onChange={e => handleUrlChange(e, index)}
                  value={url}
                  onBlur={e => handleUrlBlur(e, index)}
                />
              </label>

              <img
                onClick={() => handleRemoveWebsite(index)}
                className="input-website-delete-icon"
                src={baseImagePath('icons/bin.svg')}
                alt="delete website"
                data-tip="Delete" 
              />
            </div>
          );
        })}

        <button
          type="button"
          className="add-webpage-btn"
          onClick={handleAddWebsite}
        >
          <img
            src={baseImagePath('icons/add.svg')}
            alt="add new webpage or tab"
          />
          <span>Add another page in a tab</span>
        </button>
        <Button
          label={!editMode ? "Add" : "Save"}
          style={{
            width: '70px',
            alignSelf: 'flex-end',
            marginTop: '30px',
          }}
          handleClick={handleSave}
        />
      </div>
    </div>
    <ReactTooltip place="bottom" effect="solid" className="screen3-tooltip" arrowColor="transparent" backgroundColor="rgba(90, 90, 90, 1)" />
    </>
  );
};

export default AddWebPageModal;
