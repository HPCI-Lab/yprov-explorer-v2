/**
 * graphController.js: Controller for Graph API. Permits to call functions from the app.
 * Managing the communication between UI and Graph
 * @class GraphController
 * @property {Object} graphData - The graph data containing nodes and links.
 * @property {Function} nodeClickHandler - Callback function for node click events.
 * @property {Object} graphAPI - Object containing methods to interact with the graph.
 * @method setGraphData - Sets the graph data.
 * @method registerGraphAPI - Registers the graph API methods.
 * @method applyFilter - Applies a filter to the graph.
 * @method onNodeClick - Registers a callback for node click events.
 * @method emitNodeClick - Emits a node click event with the provided node information.
 * @method selectNode - Selects a node in the graph by its ID.
 * @method focusNode - Focuses on a node in the graph by its ID.
 * @method resetView - Resets the graph view to its default state.
 * @method highlightNodes - Highlights nodes in the graph by their IDs.
 * @method searchNode - Searches for a node in the graph by a query string and focuses on it if found.
 * @method getAvailableFilters - Retrieves available filters based on the graph data.
 */
class GraphController {
    graphData = null;
    nodeClickHandler = () => {};

    //Graoh api
    graphAPI = {
        selectNode: () => {},
        focusNode: () => {},
        resetView: () => {},
        applyFilter: () => {},
        highlightNodes: () => {}
    };

    //set the data
    setGraphData = (graphData) => {
        this.graphData = graphData;
    }

    //
    registerGraphAPI(api) {
        this.graphAPI = { ...this.graphAPI, ...api };
    }

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
            const node = this.graphData.nodes.find(node =>
                node.id.toLowerCase().includes(q) ||
                node.label?.toLowerCase().includes(q)
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
        //defines cells and workers
        const cells = new Set();
        const workers = new Set();

        if (!this.graphData){
            return {
                cells: [...cells],
                workers: [...workers],
                chunks: []
            };
        }else{
            this.graphData.nodes.forEach(node => {
                const a = node.attributes || {};
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
}

export default new GraphController();
