/** @typedef {import('../../interfaces/GraphInterface.js').GraphNode} GraphNode */
/** @typedef {import('../../interfaces/GraphInterface.js').GraphEdge} GraphEdge */
/** @typedef {import('../../interfaces/GraphInterface.js').GraphData} GraphData */
/** @typedef {import('../../interfaces/GraphInterface.js').GraphInterface} GraphInterface */

/**
 * graphController.js: Controller for Graph API. Permits to call functions from the app.
 * Managing the communication between UI and Graph
 * @implements {GraphInterface}
*/
class GraphController {
    
    /** @type { GraphData } */
    graphData;

    nodeClickHandler = () => {};

    //Graoh api
    graphAPI = {
        selectNode: () => {},
        focusNode: () => {},
        resetView: () => {},
        applyFilter: () => {},
        highlightNodes: () => {}
    };

    /**
     * Sets the graph data used by the controller.
     * @param {GraphData} graphData - The graph data to be set.
     * @returns {void}
     */
    setGraphData = (graphData) => {
        this.graphData = graphData;
    }

    /**
     * Registers the graph API methods.
     * @param {Object} api - The graph API methods to register.
     * @returns {void}
     */
    registerGraphAPI(api) {
        this.graphAPI = { ...this.graphAPI, ...api };
    }

    /**
     * Applies a filter to the graph.
     * @param {Object} filter - The filter to apply.
     * @returns {void}
     */
    applyFilter(filter) {
        this.graphAPI.applyFilter(filter);
    }

    //Graph to UI
    onNodeClick(callback) {
        this.nodeClickHandler = callback;
    }
    emitNodeClick(nodeInfo) {
        this.nodeClickHandler(nodeInfo);
    }

    //UI to Graph
    selectNode(id) {
        this.graphAPI.selectNode(id);
    }
    focusNode(id) {
        this.graphAPI.focusNode(id);
    }
    resetView() {
        this.graphAPI.resetView();
    }
    highlightNodes(id) {
        this.graphAPI.highlightNodes(id);
    }

    //seach api based on the id
    searchNode(query) {
        if(!this.graphData || !query){
            return null;
        } else{
            const q = String(query).toLowerCase();
            const node = this.graphData.nodes.find(n =>
                n.id.toLowerCase().includes(q) ||
                n.label?.toLowerCase().includes(q)
            );
            if(!node){
                return null;
            } else{
                this.selectNode(node.id);
                this.focusNode(node.id);
                this.emitNodeClick(node);

                return node;
            }
        }
    }
    //Dask filtering api function
    getAvailableFilters() {
        if (!this.graphData){
            return {
                cells: [...cells],
                workers: [...workers],
                chunks: []
            };
        }
        //defines cells and workers
        const cells = new Set();
        const workers = new Set();
        this.graphData.nodes.forEach(n => {
            const a = n.attributes || {};
            if (a["yprov4wfs:jupyter_cell_index"])
                cells.add(a["yprov4wfs:jupyter_cell_index"]);
            if (a["yprov4wfs:processed_on"])
                workers.add(a["yprov4wfs:processed_on"]);
        });

        return {
            cells: [...cells],
            workers: [...workers],
            chunks: []
        };
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new GraphController();
