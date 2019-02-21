// import { CompressedPrefetchGraph, CompressedGraphMap, PrefetchConfig } from '../declarations';

// type GuessFn = (params?: Partial<GuessFnParams>) => Predictions;

// interface GuessFnParams {
//   path: string;
//   thresholds: ConnectionEffectiveTypeThresholds;
//   connection: ConnectionEffectiveType;
// }

// type Probability = number;
// type ConnectionEffectiveType = '4g' | '3g' | '2g' | 'slow-2g';

// interface ConnectionEffectiveTypeThresholds {
//   '4g': Probability;
//   '3g': Probability;
//   '2g': Probability;
//   'slow-2g': Probability;
// }

// interface Predictions {
//   [route: string]: Navigation;
// }

// export interface Navigation {
//   probability: Probability;
//   chunk?: string;
// }

// export interface Navigations {
//   [key: string]: Navigation;
// }

/* class GraphNode {
  constructor(_node,_map) {
    this._node = _node;
    this._map = _map;
  }

  get probability() {
    return this._node[0];
  }

  get route() {
    return this._map.routes[this._node[1]];
  }

  get chunk() {
    return this._map.chunks[this._node[2]];
  }
} */

class GraphNode {
  constructor(_node,_map) {
    this._node = _node;
    this._map = _map;
  }

  get probability() {
    return this._node.probability;
  }

  get route() {
    return this._node.route;
  }

  get chunk() {
    return this._node.chunk;
  }
}

class Graph {
  constructor(_graph,_map) {
    this._graph = _graph;
    this._map = _map;
  }

  /* findMatch(route) {
    console.log(route);
    console.log(this._graph);
    console.log(this._map);
    const result = this._graph.filter((_, i) => matchRoute(this._map.routes[i], route)).pop();
    console.log('result');
    console.log(result);
    if (!result) {
      return [];
    }
    return result.map(n => new GraphNode(n, this._map));
  } */
  findMatch(route) {
    console.log(route);
    console.log(this._graph);
    console.log(this._map);
    //const result = this._graph.filter((_, i) => matchRoute(this._map.routes[i], route)).pop();
    const identifiedRoute = this._graph.find((_, index) => {
      const match = Object.keys(_).find((routeObject) => {
        if(routeObject === route) {
          return _[routeObject];
        }
      });
      return match;
    });
    console.log('Identified Route');
    console.log(identifiedRoute);
    if(identifiedRoute) {
      const routeToBeLoaded = Object.values(identifiedRoute)[0];
      console.log('routeTobe Loaded');
      console.log(routeToBeLoaded);
      const result = [];
      Object.keys(this._map).filter((singleArray, index) => {
        const object = this._map[singleArray][0];
        if(object.route === Object.keys(routeToBeLoaded)[0]) {
          console.log('object');
          console.log(object);
          result.push(object);
        }
      })
      console.log('result');
      console.log(result);
      if (!result) {
        return [];
      }
      return result.map(n => new GraphNode(n, this._map));
    }
    return [];
  }
}

const matchRoute = (route, declaration) => {
  const routeParts = route.split('/');
  const declarationParts = declaration.split('/');
  if (routeParts.length > 0 && routeParts[routeParts.length - 1] === '') {
    routeParts.pop();
  }

  if (declarationParts.length > 0 && declarationParts[declarationParts.length - 1] === '') {
    declarationParts.pop();
  }

  if (routeParts.length !== declarationParts.length) {
    return false;
  } else {
    return declarationParts.reduce((a, p, i) => {
      if (p.startsWith(':')) {
        return a;
      }
      return a && p === routeParts[i];
    }, true);
  }
};

const guessNavigation = (graph, params) => {
  const matches = graph.findMatch(params.path);
  console.log('matches');
  console.log(matches);
  return matches.reduce(
    (p, n) => {
      if (n.probability >= params.thresholds[params.connection]) {
        const nav = {
          probability: n.probability
        };
        if (n.chunk) {
          nav.chunk = n.chunk;
        }
        p[n.route] = nav;
      }
      return p;
    },
    {}
  );
};

export let guess = (params) => {
  throw new Error('Guess is not initialized');
};

const getEffectiveType = (global) => {
  if (!global.navigator || !global.navigator || !global.navigator.connection) {
    return '3g';
  }
  return global.navigator.connection.effectiveType || '3g';
};

export const initialize = (
  global,
  compressed,
  map,
  thresholds
) => {
  console.log('compressed');
  console.log(compressed);
  const graph = new Graph(compressed, map);
  console.log('graph object');
  console.log(graph);
  global.__GUESS__ = global.__GUESS__ || {};
  global.__GUESS__.guess = guess = (params) => {
    params = params || {};
    if (!params.path) {
      params.path = (global.location || { pathname: '' }).pathname;
    }
    if (!params.connection) {
      params.connection = getEffectiveType(global);
    }
    if (!params.thresholds) {
      params.thresholds = thresholds;
    }
    return guessNavigation(graph, params);
  };
};
