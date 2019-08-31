
const state = {
  storage: null,
  key: '~~state~~',
  current: {},

  init: (storage) => {
    state.storage = storage;
  },

  getDebug: () => {
    state.current = state.storage.getItem(state.key) || {
      debug: false
    };
    return state.current.debug;
  },
  setDebug: (debug = true) => {
    state.current.debug = debug;
    state.storage.setItem(state.key, state.current);
  }
};