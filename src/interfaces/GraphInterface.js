/**
 * @typedef {Object} GraphNode
 * @property {string} id
 * @property {string} [label]
 * @property {Object<string, any>} [data]
 */

/**
 * @typedef {Object} GraphEdge
 * @property {string} source
 * @property {string} target
 * @property {Object<string, any>} [data]
 */

/**
 * @typedef {Object} GraphData
 * @property {GraphNode[]} nodes
 * @property {GraphEdge[]} edges
 */

/**
 * GraphController serves as a bridge between the graph visualization and UI components.
 * It manages graph data, handles user interactions, and exposes an API for controlling the graph.
 *
 * @typedef {Object} GraphInterface
 *
 * @property {(data: GraphData) => void} setGraphData
 * Sets the graph data used by the controller.
 *
 * @property {(callback: (node: GraphNode) => void) => void} onNodeClick
 * Registers a callback triggered when a node is clicked.
 *
 * @property {(node: GraphNode) => void} emitNodeClick
 * Emits a node click event.
 *
 * @property {(id: string) => void} selectNode
 * Selects a node by its ID using the registered graph API.
 *
 * @property {(id: string) => void} focusNode
 * Focuses the view on a node by its ID.
 *
 * @property {() => void} resetView
 * Resets the graph viewport to its default state.
 *
 * @property {(ids: string[]) => void} highlightNodes
 * Highlights multiple nodes by their IDs.
 *
 * @property {(query: string) => (GraphNode | null)} searchNode
 * Searches for a node by ID or label.
 *
 * @property {() => Object<string, any>} getAvailableFilters
 * Returns available filters derived from the current graph data.
 */