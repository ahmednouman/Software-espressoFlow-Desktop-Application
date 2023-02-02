import React, { useState, useEffect } from 'react';
import PrimaryNavTabs from '../shared/PrimaryNavTabs';
import Pen from './Pen';
import Config from '../Context/Config';
import Container from '../shared/Container';
import useStore from '../../store';
import PenActivate from './PenActivate';
import Dialog from '../shared/Dialog';
import Button from '../shared/Button';
import Tooltip from '../shared/Tooltip';

const Index = () => {
  const [tabState, setTabState] = useState('Pen');
  const penActivated = useStore(state => state.penActivated);
  const flowWindowPermissions = useStore(state => state.flowWindowPermissions);
  const [dialogVisible, setDialogVisible] = useState(false);
  const getApps = useStore(state => state.getApps);
  const promptFlowWindowAccessibility = useStore(
    state => state.promptFlowWindowAccessibility,
  );
  const checkFlowWindowPermissions = useStore(
    state => state.checkFlowWindowPermissions,
  );
  const returnedApps = useStore(state => state.returnedApps);
  const penActivate = useStore(state => state.penActivate)
  const onPenActivate = useStore(state => state.onPenActivate)
  const getPenActivate = useStore(state => state.getPenActivate)

  useEffect(() => {
    setDialogVisible(!flowWindowPermissions);
    if (!flowWindowPermissions) {
      checkFlowWindowPermissions();
    }

    if (!penActivated) {
      penActivate()
    }

    getApps();
    getPenActivate()
    const unsubscribeReturnedApps = returnedApps();
    const unsubscribePenActivate = onPenActivate();

    return () => {
      unsubscribeReturnedApps();
      unsubscribePenActivate();
    };
  }, []);

  return (
    <Container
      title={
        !penActivated
          ? 'Touch the pen to the espresso screen to activate'
          : tabState === 'Pen'
            ? 'Choose pen actions'
            : 'Choose context menu'
      }
    >
      <Tooltip />
      {!flowWindowPermissions && dialogVisible && (
        <Dialog message="espressoFlow needs accessibility enabled">
          <div className="flow-window-accessibility-buttons">
            <button
              className="link-button"
              onClick={() => setDialogVisible(!dialogVisible)}
            >
              Go back
            </button>
            <Button
              label="Enable now"
              handleClick={promptFlowWindowAccessibility}
            />
          </div>
        </Dialog>
      )}
      {!penActivated ? (
        <PenActivate />
      ) : (
        <PrimaryNavTabs
          navTitles={['Pen', 'Context Menu']}
          tabContent={[<Pen />, <Config />]}
          tabState={tabState}
          setTabState={setTabState}
        />
      )}
    </Container>
  );
};

export default Index;
