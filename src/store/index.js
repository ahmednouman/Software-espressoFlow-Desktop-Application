import { nanoid } from 'nanoid';
import create from 'zustand';
import { emptyContextItems } from '../component/Context/ContextShortcuts';
import { Actions } from '../store/Actions';
import SNAPPING_WALKTHROUGH, { ARRANGEMENT_WALKTHROUGH, osFinder } from '../utils/utility';
import { ColorCombinations } from '../utils/utility';


const initialState = {
  displays: [],
  rotationInterval: null,
  brightness: 0,
  displayToggled: { id: null, state: false },
  selectedToggle: { id: "", visible: false },
  quitListener: false,
  devicesInterval: null,
  activeNav: "",
  version: '0.0.1',
  tutorialDone: {
    version: '',
    completed: false,
  },
  updatedFlag: false,
  permission: osFinder("Mac") ? null : true,
  pollPermission: null,
  flowWindowPollInterval: null,
  theme: 'dark',
  user: {},
  brightnessSync: true,
  touchEnabled: true,
  workspaceEnabled: true,
  flowWindowPermissions: osFinder("Mac") ? false : true,
  history: null,
  windowTabState: 'workspace',
  windowTabVisibilityState: 'visible',
  workspaceState: 'list',
  workspaceAppPopupVisible: false,
  workspaceAppPopupSelectedTab: 0,
  workspaces: null,
  workspace: null,
  appsList: [],
  contextAppsList: [],
  savedAppsList: [],
  webpagesList: [],
  workspaceName: '',
  // workspaceTag: null,
  workspaceTagOptions: [
    { value: 'work', label: 'Work', ...ColorCombinations[0] },
    { value: 'home', label: 'Home', ...ColorCombinations[1] },
    { value: 'airport', label: 'Airport', ...ColorCombinations[2] },
    { value: 'library', label: 'Library', ...ColorCombinations[3] },

    { value: '1monitor', label: '1 monitor', ...ColorCombinations[4] },
    { value: 'meetings', label: 'Meetings', ...ColorCombinations[5] },
    { value: 'cafe', label: 'Café', ...ColorCombinations[6] },
    { value: 'lounge', label: 'Lounge', ...ColorCombinations[7] },
  ],
  // workspaceTagOptions: [],
  workspaceTagEditPopupVisible: false,
  workspaceTagEditPopupPosition: [],
  workspaceTagEditCurrentlyEditingIndex: null,
  workspaceDisplays: [],
  workspaceSaveButtonVisible: false,
  workspaceSaveState: false,
  appSwapUpdating: false,
  appDragOn: false,
  conflictingAppFlowWindow: '',
  toolbarAppCount: 0,
  newFirmwareFlag: false,
  toolTip: {
    name: '',
    visible: false,
    urls: [],
    size: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
  },
  workspaceEditMode: false,
  workspaceActivating: {
    id: null,
    loading: false,
  },
  editShortcut: false,
  shortcuts: {
    leftHalf: '⌃⌥←',
    rightHalf: '⌃⌥→',
    topHalf: '⌃⌥↑',
    bottomHalf: '⌃⌥↓',
    maximize: '⌃⌥↩',
    nextDisplay: '⌃⌥⌘→',
    previousDisplay: '⌃⌥⌘←',
    topLeft: '⌃⌥U',
    topRight: '⌃⌥I',
    bottomLeft: '⌃⌥J',
    bottomRight: '⌃⌥K',
    firstThird: '⌃⌥D',
    centerThird: '⌃⌥C',
    lastThird: '⌃⌥G',
    firstTwoThirds: '⌃⌥E',
    lastTwoThirds: '⌃⌥T'
  },
  contextShortcut: {
    id: nanoid(),
    name: '',
    shortcut: {
      keyCode: '',
      modifierFlag: '',
      displayString: '',
    },
  },
  contextShortcuts: [],
  appContextShortcuts: [],
  selectedContextShortcuts: emptyContextItems,
  selectedContextAppId: '',
  penActions: {
    barrel: 'system',
    eraser: 'undo'
  },
  mirrorMode: {
    id: "",
    on: false
  },
  workspaceOnboardingDone: true,
  workspaceOnboardingRun: false,
  workspaceOnboardingStep: SNAPPING_WALKTHROUGH.START,
  workspaceOnboardingModal: {
    step: 1,
    visible: false,
  },
  workspaceContainerRef: null,
  penActivated: true,
  espressoSetup: false,
  onboarding: {
    initial: true,
    display: true,
    workspace: true,
    pen: true
  },
  espressoFound: {
    found: false,
    id: null
  },
  nonEspressoFound: {
    found: false,
    id: null
  },
  espressoV2Found: false,
  menuVisible: false,
  startSidebarWalkthrough: false,
  startDisplayWalkthrough: false,
  startWorkspaceWalkthrough: false,
  displayOnboardingStep: ARRANGEMENT_WALKTHROUGH.START,
  showNoEspressoModal: false,
};

const useStore = create((set, get) => ({
  // here get methods wil use for get the current state value
  ...initialState,
  ...Actions(set, get),
}));

export default useStore;
