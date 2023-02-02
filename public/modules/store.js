const Store = require('electron-store');

const schema = {
  user: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
    additionalProperties: { type: 'string' },
  },
  tutorial: {
    type: 'boolean',
  },
  firmwareVersion: {
    type: 'string',
  },
  firmwareUpdated: {
    type: 'object',
    properties: {
      version: { type: 'string' },
      completed: { type: 'boolean' },
    },
  },
  updatedFlag: {
    type: 'boolean',
  },
  workspaceEnabled: {
    type: 'boolean',
  },
  releaseTutorial: {
    type: 'object',
    properties: {
      version: { type: 'string' },
      completed: { type: 'boolean' },
    },
  },
  onboarding: {
    type: 'object',
    properties: {
      initial: { type: 'boolean' },
      display: { type: 'boolean' },
      workspace: { type: 'boolean' },
      pen: { type: 'boolean' },
    },
  },
  savedApps: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
  shortcuts: {
    type: 'object',
    properties: {
      leftHalf: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      rightHalf: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      topHalf: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      bottomHalf: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      maximize: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      nextDisplay: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      previousDisplay: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      topLeft: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      topRight: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      bottomLeft: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      bottomRight: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      firstThird: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      centerThird: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      lastThird: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      firstTwoThirds: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
      lastTwoThirds: {
        type: 'object',
        properties: {
          displayString: { type: 'string' },
          keyCode: { type: 'number' },
          modifierFlag: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  contextShortcuts: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        shortcut: {
          type: 'object',
          properties: {
            keyCode: { type: 'string' },
            modifierFlag: { type: 'array', items: { type: 'string' } },
            displayString: { type: 'string' },
          },
        },
      },
    },
  },
  workspaces: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        arrangement: { type: 'string' },
        starred: { type: 'boolean' },
        gradient: { type: 'string' },
        displays: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                anyOf: [
                  {
                    type: 'integer',
                  },
                  {
                    type: 'string',
                  },
                ],
              },
              name: { type: 'string' },
              type: { type: 'string' },
              location: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
              },
              orientation: { type: 'number' },
              resolution: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
              },
              is_main: { type: 'boolean' },
              is_mirror: { type: 'boolean' },
              brightness: { type: 'number' },
              contrast: { type: 'number' },
              colour_preset: { type: 'number' },
              volume: { type: 'number' },
              is_locked: { type: 'boolean' },
              ddc_enabled: { type: 'boolean' },
              autobrightness: { type: 'boolean' },
              apps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    icon: { type: 'string' },
                  },
                },
              },
              arrangement: { type: 'string' },
            },
          },
        },
      },
    },
  },
  workspaceTagOptions: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        value: { type: 'string' },
        label: { type: 'string' },
        backgroundColor: { type: 'string' },
        textColor: { type: 'string' },
      },
    },
  },
};

const makeStore = function (options) {
  try {
    return new Store({ ...options });
  } catch (e) {
    const store = new Store({ ...options, schema: schema });
    store.clear();
    return new Store({ ...options });
  }
};

const store = makeStore();

module.exports = {
  store,
};
