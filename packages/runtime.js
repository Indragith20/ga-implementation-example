// import { guess, initialize as initializeGuess } from './guess';
const customGuess = require('./guess');

const handleNavigationChange = (basePath, path) => {
  const predictions = customGuess.guess({ path });
  Object.keys(predictions).forEach(currentPath => {
    const chunk = predictions[currentPath].chunk;
    if (chunk) {
      prefetch(basePath, chunk);
    }
  });
};

const support = (feature) => {
  if (typeof document === 'undefined') {
    return false;
  }
  const fakeLink = document.createElement('link');
  try {
    if (fakeLink.relList && typeof fakeLink.relList.supports === 'function') {
      return fakeLink.relList.supports(feature);
    }
  } catch (err) {
    return false;
  }
};

const linkPrefetchStrategy = (url) => {
  if (typeof document === 'undefined') {
    return;
  }
  const link = document.createElement('link');
  link.setAttribute('rel', 'prefetch');
  link.setAttribute('href', url);
  link.setAttribute('as', 'script');
  const parentElement = document.getElementsByTagName('head')[0] || document.getElementsByName('script')[0].parentNode;
  parentElement.appendChild(link);
};

const importPrefetchStrategy = (url) => import(url);

const supportedPrefetchStrategy = support('prefetch') ? linkPrefetchStrategy : importPrefetchStrategy;

const preFetched = {};

const prefetch = (basePath, url) => {
  url = basePath + url;
  if (preFetched[url]) {
    return;
  }
  preFetched[url] = true;
  supportedPrefetchStrategy(url);
};

export const initialize = (
  history,
  global,
  graph,
  map,
  basePath,
  thresholds
) => {
  customGuess.initialize(global, graph, map, thresholds);

  if (typeof global.addEventListener === 'function') {
    global.addEventListener('popstate', (e) => handleNavigationChange(basePath, location.pathname));
  }

  const pushState = history.pushState;
  history.pushState = function(state) {
    if (typeof (history).onpushstate === 'function') {
      (history).onpushstate({ state: state });
    }
    handleNavigationChange(basePath, arguments[2]);
    return pushState.apply(history, arguments);
  };
  handleNavigationChange(basePath, location.pathname);
};
