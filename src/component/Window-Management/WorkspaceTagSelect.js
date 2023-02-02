import React, { useState, useRef } from 'react';
import useStore from '../../store';
import Select, { StylesConfig, components, Props, OptionProps } from 'react-select';
import WorkspaceTagEditPopup from './WorkspaceTagEditPopup';
import { generateTransparentColor } from '../../utils/utility';


// used to hold the current tag that has the edit button pressed and popup shown for
let tagClickedIndex = null;

const CustomOption = ({ children, ...props }) => {


  const [workspaceTagEditBtnVisible, setWorkspaceTagEditBtnVisible] = useState(false);


  const tagOptions = useStore(state => state.workspaceTagOptions);
  const setWorkspaceTagOptions = useStore(state => state.setWorkspaceTagOptions);

  // get state variables & functions from parent select, selectProps for controlling tagEditPopup
  const workspaceTagEditCurrentlyEditingIndex = useStore(state => state.workspaceTagEditCurrentlyEditingIndex);
  const setWorkspaceTagEditCurrentlyEditingIndex = useStore(state => state.setWorkspaceTagEditCurrentlyEditingIndex);

  const workspaceTagEditPopupVisible = useStore(state => state.workspaceTagEditPopupVisible);
  const setWorkspaceTagEditPopupVisible = useStore(state => state.setWorkspaceTagEditPopupVisible);

  const workspaceTagEditPopupPosition = useStore(state => state.workspaceTagEditPopupPosition);
  const setWorkspaceTagEditPopupPosition = useStore(state => state.setWorkspaceTagEditPopupPosition);



  const styleTagContainer = {
    justifyContent: 'space-between',

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const styleTagName = {
    cursor: 'pointer',
    backgroundColor: props.data.backgroundColor,
    color: props.data.textColor,
    cursor: 'default',
    width: 'fit-content',
    padding: '4px 6px',
    borderRadius: '6px',
    minHeight: '22px',
    minWidth: '22px'
  };

  const styleBtnOptions = {
    cursor: 'pointer',
    visibility: workspaceTagEditBtnVisible ? "visible" : "hidden",
    color: 'rgba(90, 90, 90, 1)',
  };

  const handleMouseOver = () => {
    setWorkspaceTagEditBtnVisible(true);
  }

  const handleMouseOut = () => {
    setWorkspaceTagEditBtnVisible(false);
  }

  const handleOptionsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // find the tag object based on the id of the clicked option
    tagClickedIndex = tagOptions.findIndex(tag => tag.value === e.target.id);

    setWorkspaceTagEditPopupPosition({
      top: e.clientY - 15,
    });

    if (tagClickedIndex === workspaceTagEditCurrentlyEditingIndex) {
      setWorkspaceTagEditPopupVisible(!workspaceTagEditPopupVisible);
    }
    else {
      setWorkspaceTagEditPopupVisible(true);
    }

    setWorkspaceTagEditCurrentlyEditingIndex(tagClickedIndex);
  }

  return (
    <components.Option {...props}>
      <div className='tagOptionContainer' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} style={styleTagContainer}>
        <span className='tagLabel' style={styleTagName}>
          {children}
        </span>
        <span id={props.data.value} className='btnTagOptions' onClick={handleOptionsClick} style={styleBtnOptions}>
          ...
        </span>
      </div>
    </components.Option>
  );
};

const CustomSingleValue = ({ children, ...props }) => {

  const tagOptions = useStore(state => state.workspaceTagOptions);

  const selectClearValue = props.clearValue;
  const selectSetValue = props.setValue;

  const tagBackgroundColour = props.data.backgroundColor;
  const tagHoverColor = generateTransparentColor(props.data.backgroundColor, '0.6');
  const tagTextColor = props.data.textColor;

  const styleTagContainer = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const styleTagName = {
    cursor: 'pointer',
    backgroundColor: tagBackgroundColour,
    color: tagTextColor,
    cursor: 'default',
    width: 'fit-content',
    padding: '4px 6px',
    borderRadius: '6px 0 0 6px',
    minHeight: '22px'
  };

  const styleTagRemove = {
    cursor: 'pointer',
    backgroundColor: props.data.backgroundColor,
    color: tagTextColor,
    padding: '4px 6px',
    borderRadius: '0 6px 6px 0',
  };

  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = tagHoverColor;
  }

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = tagBackgroundColour;
  }

  const handleTagRemove = (e) => {
    selectSetValue('');

    e.preventDefault();
    e.stopPropagation();

  }

  return (
    <components.SingleValue {...props}>
      <div className='tagSingleValueContainer' style={styleTagContainer}>
        <span className='tagLabel' style={styleTagName}>
          {children}
        </span>
        <span className='tagRemove' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onClick={handleTagRemove} style={styleTagRemove}>
          X
        </span>
      </div>
    </components.SingleValue>
  );
};

const styleTagSelect = {
  control: (styles) => {
    return {
      ...styles,
      backgroundColor: 'white',
      minHeight: '32px',
      height: '32px',
      borderRadius: '8px',
      border: 'none',
    };
  },

  option: (styles, { data, isDisabled, isFocused, isSelected }) => {

    return {
      ...styles,
      paddingTop: '3px',
      paddingBottom: '3px',

      backgroundColor: "",
      "&:hover": {                                           // overriding hover
        backgroundColor: "",
      },
    };
  },

  menu: (styles) => {
    return {
      ...styles,
      backgroundColor: 'rgba(240, 240, 240, 1)',
      borderRadius: '8px',
      overflowY: 'hidden',
    };
  },

  placeholder: (styles) => ({
    ...styles,
    color: 'rgba(90, 90, 90, 1)',
    fontFamily: "GTAmerica-STD-Regular",
    width: '120px',
    paddingLeft: '0px',
    marginLeft: '0px',
  }),

  valueContainer: (styles) => {

    return {
      ...styles,
      paddingLeft: '3px',
      paddingBottom: '6px',
    };
  },


  indicatorSeparator: (styles) => {
    return {
      ...styles,
      display: 'none',
    };
  },
};

const WorkspaceTagSelect = ({ loading, props }) => {

  const [menuIsOpen, setMenuIsOpen] = useState();

  const setWorkspaceTag = useStore(state => state.setWorkspaceTag);

  const workspace = useStore(state => state.workspace);

  const tagOptions = useStore(state => state.workspaceTagOptions);
  const setWorkspaceTagOptions = useStore(state => state.setWorkspaceTagOptions);

  const workspaceTagEditPopupVisible = useStore(state => state.workspaceTagEditPopupVisible);
  const setWorkspaceTagEditPopupVisible = useStore(state => state.setWorkspaceTagEditPopupVisible);

  const handleChange = selectedTag => {
    setWorkspaceTag(selectedTag.value);
  };


  return (
    <>
      <Select
        {...props}
        className="workspace-tag-select"
        classNamePrefix="tag-select"
        styles={styleTagSelect}
        placeholder="Tag your workspace"
        options={tagOptions}
        defaultValue={tagOptions[workspace.tag]}
        value={tagOptions[workspace.tag]}
        blurInputOnSelect
        closeMenuOnSelect
        menuIsOpen={workspaceTagEditPopupVisible ? true : undefined} // needs undefined not false to use default behaviour
        onChange={handleChange}


        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
      />

      <WorkspaceTagEditPopup tagClickedIndex={tagClickedIndex} />
    </>

  );
};

export default WorkspaceTagSelect;
