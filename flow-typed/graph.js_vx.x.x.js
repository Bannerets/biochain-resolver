declare module 'graph.js/dist/graph.full.js' {
  declare class Graph {
    constructor(...parts?: any[][]): this;
    hasVertex(key: string): boolean;
    createNewEdge(from: string, to: string, value?: any): void;
    sinks(): Iterator<[string, any]>;
    path(from: string, to: string): any[];
    // ...
  }

  declare module.exports: Class<Graph>
}
