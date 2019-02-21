const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const template = require('lodash.template');
const ts = require('typescript');
const ConcatSource = require('webpack-sources').ConcatSource;
require("isomorphic-fetch");

class CustomWebpackPlugin {
  constructor() { }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      //console.log(compilation.chunks);
      const fileChunk = {};
      let main = null;
      compilation.chunks.forEach((currentChunk) => {
        //console.log(currentChunk);
        let blocks = [];
        
        if (isInitial(currentChunk)) {
          main = currentChunk;
        }
        const chunk = currentChunk;
        forEachBlock(currentChunk, ({ block, chunk }) => {
          console.log('*********************************');
          console.log(block);
          console.log(chunk);
          console.log('**********************************');
          let name = (chunk.files || []).filter((f) => f.endsWith('.js')).pop();
          if (!name && chunk.chunks && chunk.chunks[0]) {
            name = chunk.chunks[0].files[0];
          }
          console.log(block.dependencies[0].module.userRequest);
          fileChunk[block.dependencies[0].module.userRequest] = name;
        });

      });
      if (!main) {
        callback();
        throw new Error('Cannot find the main chunk of the application');
      }
      console.log(fileChunk);
      const result = parseRoutes(path.join('./', 'src'));
      console.log(result);
      // const routes = [{ path: '/', lazy: true, modulePath: 'E:\\Practise\\custom-webpack-plugin\\src\\containers\\Home.js', parentModulePath: null },
      // { path: '/home', lazy: true, modulePath: 'E:\\Practise\\custom-webpack-plugin\\src\\containers\\Home.js', parentModulePath: null },
      // { path: '/about', lazy: true, modulePath: 'E:\\Practise\\custom-webpack-plugin\\src\\containers\\About.js', parentModulePath: null },
      // { path: '/contacts', lazy: true, modulePath: 'E:\\Practise\\custom-webpack-plugin\\src\\containers\\Contacts.js', parentModulePath: null }];
      // const data = {
      //   "/": {
      //     "/contacts": 80,
      //     "/about": 20
      //   },
      //   "/contacts": {
      //     "/": 20,
      //     "/about": 0
      //   },
      //   "/about": {
      //     "/": 20,
      //     "/contacts": 80
      //   }
      // };
      // const newConfig = {};
      // const initialGraph = buildMap(result, data);
      // console.log('initialGraph');
      // console.log(initialGraph);
      // Object.keys(initialGraph).forEach(c => {
      //   newConfig[c] = [];
      //   initialGraph[c].forEach(p => {
      //     const newTransition = {
      //       probability: p.probability,
      //       route: p.route,
      //       chunk: fileChunk[p.file]
      //     };
      //     newConfig[c].push(newTransition);
      //   });
      // });
      // console.log('New Config');
      // console.log(newConfig);
      // const { graph, graphMap } = compressGraph(newConfig, 3);
      // console.log('graph');
      // console.log(graph);
      // console.log('graphMap');
      // console.log(graphMap);

      console.log('ga-implementation');
      getReport().then((routes) => {
        console.log(routes);
        const newConfig = {};
        const initialGraph = buildMap(result, routes.routeData);
        console.log('initialGraph');
        console.log(initialGraph);
        Object.keys(initialGraph).forEach(c => {
          newConfig[c] = [];
          initialGraph[c].forEach(p => {
            const newTransition = {
              probability: p.probability,
              route: p.route,
              chunk: fileChunk[p.file]
            };
            newConfig[c].push(newTransition);
          });
        });
        const mainName = main.files.filter((f) => f.endsWith('.js')).pop();
        const old = compilation.assets[mainName];
        console.log('New Config');
        console.log(newConfig);
        const { graph, graphMap } = compressGraph(newConfig, 3);
        console.log('graph');
        console.log(graph);
        const modifiedGraph = graph.filter((data) => data.length > 0);
        console.log('graphMap');
        console.log(graphMap);
        const runtimeTemplate = fs.readFileSync(path.join(__dirname, './runtime.tpl')).toString();
      console.log(runtimeTemplate);
      const defaultPrefetchConfig = {
        '4g': 0.15,
        '3g': 0.3,
        '2g': 0.45,
        'slow-2g': 0.6
      };
      /* const runtimeLogic = template(runtimeTemplate)({
        BASE_PATH: undefined,
        GRAPH: JSON.stringify(graph),
        GRAPH_MAP: JSON.stringify(graphMap),
        THRESHOLDS: JSON.stringify(Object.assign({}, defaultPrefetchConfig))
      }); */
      const runtimeLogic = template(runtimeTemplate)({
        BASE_PATH: undefined,
        GRAPH: JSON.stringify(routes.routeData),
        GRAPH_MAP: JSON.stringify(newConfig),
        THRESHOLDS: JSON.stringify(Object.assign({}, defaultPrefetchConfig))
      });
      console.log(runtimeLogic);
      const MemoryFileSystem = require('memory-fs');
      const memoryFs = new MemoryFileSystem();

      memoryFs.mkdirpSync('/src');
      memoryFs.writeFileSync('/src/index.js', runtimeLogic, 'utf-8');
      memoryFs.writeFileSync('/src/guess.js', fs.readFileSync(path.join(__dirname, 'guess.js')).toString(), 'utf-8');
      memoryFs.writeFileSync('/src/runtime.js', fs.readFileSync(path.join(__dirname, 'runtime.js')).toString(), 'utf-8');

      const compiler = require('webpack')({
        context: '/src/',
        mode: 'production',
        entry: './index.js',
        target: 'node',
        output: {
          filename: './output.js'
        }
      });

      compiler.inputFileSystem = memoryFs;
      compiler.outputFileSystem = memoryFs;
      compiler.resolvers.normal.fileSystem = memoryFs;
      compiler.resolvers.context.fileSystem = memoryFs;

      compiler.run((err, stats) => {
        if (err) {
          callback();
          throw err;
        }
        const code = stats.compilation.assets['./output.js'].source();
        console.log(code);
        compilation.assets[mainName] = new ConcatSource(code, '\n;', old.source());
        callback();
      })
      });
      callback();
    })
  }

}
const forEachBlock = (chunk, cb) => {
  let blocks = [];
  if (chunk.groupsIterable) {
    blocks = Array.from(chunk.groupsIterable).reduce(
      (prev, group) =>
        prev.concat(blocks.concat(group.getBlocks().map((block) => ({ chunk: group, block })))),
      []
    );
  } else {
    blocks = (chunk.blocks || []).map((block) => ({ chunk, block }));
  }
  blocks.forEach(cb);
};


const buildMap = (routes, graph) => {
  const result = {};
  const routeFile = {};
  /**It will map like {'/': modulepath} . Here route path is directly mapped to the module path*/
  routes.forEach(r => {
    routeFile[r.path] = r.modulePath;
  });
  console.log('routeFile');
  console.log(routeFile);
  /**Graph object is nothing but routes.json file we have given in webpack config */
  Object.keys(graph).forEach(k => {
    result[k] = [];
    /**Next Line will iterate over each object in particular route */
    const sum = Object.keys(graph[k]).reduce((a, n) => a + graph[k][n], 0);
    /**NOTE: In most of the cases the variable sum will be 100 */
    Object.keys(graph[k]).forEach(n => {
      result[k].push({
        route: n,
        probability: 0.8,
        file: routeFile[n]
      });
    });
    result[k] = result[k].sort((a, b) => b.probability - a.probability);
  });
  /**This method will return an object where each key has the value of array which contains objects of routes with the probability sorted */
  return result;
};

const compressGraph = (input, precision) => {
  let currentChunk = 0;
  let currentRoute = 0;
  const chunks = [];
  const routes = [];
  const chunkToID = {};
  const routeToID = {};
  const graphMap = { chunks, routes };
  const graph = [];
  Object.keys(input).forEach(route => {
    if (routeToID[route] === undefined) {
      routes[currentRoute] = route;
      routeToID[route] = currentRoute++;
      console.log(routeToID[route]);
    }
    console.log('currentRoute');
    console.log(currentRoute);
    graph[routeToID[route]] = [];
    input[route].forEach(n => {
      if (routeToID[n.route] === undefined) {
        routes[currentRoute] = n.route;
        routeToID[n.route] = currentRoute++;
      }
      if (chunkToID[n.chunk] === undefined) {
        chunks[currentChunk] = n.chunk;
        chunkToID[n.chunk] = currentChunk++;
      }
      graph[routeToID[route]].push([
        parseFloat(n.probability.toFixed(precision)),
        routeToID[n.route],
        chunkToID[n.chunk]
      ]);
      console.log('Inside Graph');
      console.log(graph);
    });
  });
  return { graph, graphMap };
};

const parseRoutes = (base) => {
  return parseReactRoutes(readFiles(base), {
    jsx: ts.JsxEmit.React,
    allowJs: true
  });
};

const readFiles = (dir) => {
  if (dir === 'node_modules') {
    return [];
  }
  const result = fs.readdirSync(dir).map(node => path.join(dir, node));
  const files = result.filter(node => fs.statSync(node).isFile() && (node.endsWith('.jsx') || node.endsWith('.js')));
  const dirs = result.filter(node => fs.statSync(node).isDirectory());
  return [].concat.apply(files, dirs.map(readFiles));
};

const extractRoutes = (file) => {
  const result = [];
  const stack = [file];
  const extractModule = (a) => {
      const init = a.initializer;
      if (!init) {
          return null;
      }
      const expr = init.expression;
      if (!expr) {
          return '';
      }
      if (!expr.arguments) {
          return '';
      }
      const arrow = expr.arguments[0];
      if (!arrow) {
          return '';
      }
      const body = arrow.body;
      if (!body) {
          return '';
      }
      const arg = body.arguments[0];
      if (!arg || arg.kind !== ts.SyntaxKind.StringLiteral) {
          return '';
      }
      return arg.text;
  };
  while (stack.length) {
      const c = stack.pop();
      if (!c) {
          return result;
      }
      if (c.kind === ts.SyntaxKind.JsxElement || c.kind === ts.SyntaxKind.JsxSelfClosingElement) {
          let el = c.openingElement;
          if (c.kind === ts.SyntaxKind.JsxSelfClosingElement) {
              el = c;
          }
          /* if(el.tagName.text === 'CustomMatch') {
            console.log(c.children[0]);
            console.log(c.children[1]);
            console.log(c.children[1].getSourceFile());
          } else */ 
          if (el.tagName.text === 'Route') {
              const module = {
                  lazy: false,
                  parentModulePath: file.fileName,
                  modulePath: file.fileName
              };
              el.attributes.properties.forEach(p => {
                  const { text } = p.name;
                  if (text === 'path') {
                      module.path = p.initializer.text;
                  }
                  if (text === 'component') {
                      const parts = file.fileName.split('/');
                      parts.pop();
                      const tempName = extractModule(p);
                      if (tempName) {
                          const name = tempName + '.js';
                          //module.modulePath = '/' + path.join(...parts.concat([name]));
                          module.modulePath = path.join(...parts.concat([name]));
                          module.lazy = true;
                      }
                  }
                  result.push(module);
              });
          }
      }
      c.getChildren(file).forEach(child => {
          stack.push(child);
      });
  }
  return result;
};

const parseReactRoutes = (files, options) => {
  const program = ts.createProgram(files, options);
  const jsxFiles = program.getSourceFiles().filter(f => f.fileName.endsWith('.js') || f.fileName.endsWith('.jsx'));
  console.log(jsxFiles);
  fs.readFile(files[3], 'utf-8', function(err,data){
    if (!err) {
        console.log('received data: ' + data);
    } else {
        console.log(err);
    }
  });
  const routes = jsxFiles.reduce((a, f) => a.concat(extractRoutes(f)), []);
  const modules = routes.reduce(
    (a, r) => {
      a[r.modulePath] = true;
      return a;
    },
    {}
  );
  const rootModule = routes.filter(r => r.parentModulePath && !modules[r.parentModulePath]).pop();
  /* if (rootModule) {
    routes.push({
      path: '/',
      parentModulePath: null,
      modulePath: rootModule.parentModulePath,
      lazy: false
    });
  } */
  const routeMap = routes.reduce(
    (a, m) => {
      a[m.path] = m;
      return a;
    },
    {}
  );
  return Object.keys(routeMap).map(k => routeMap[k]);
};

const getReport = () => {
  return fetch('http://localhost:9000/getData', {method: 'get'})
              .then(function(response) { return response.json(); })
              .then(response => response);
}

const isInitial = (chunk) => {
  if (chunk.canBeInitial) {
    return chunk.canBeInitial();
  }
  return /^main(\.js)?$/.test(chunk.name);
};


module.exports = CustomWebpackPlugin;