/*
GraphController.js: Controller for Graph API. Permits to call functions from the app
*/

class GraphController {
    nodeClickHandler = () => {};
    graphData = null;

    //Graoh api
    API = {
        selectNode: () => {},
        focusNode: () => {},
        resetView: () => {}
    };

    setGraphData = (graphData) => {
        this.graphData = graphData;
    }

    registerGraphAPI(api) {
        this.graphAPI = { ...this.graphAPI, ...api };
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

    //seach api
    searchNode(query) {
        if(!this.graphData || !query) return null;

        const q = String(query).toLowerCase();

        const node = this.graphData.nodes.find(n =>
            n.id.toLowerCase().includes(q) ||
            n.label?.toLowerCase().includes(q)
        );

        if(!node) return null;

        this.selectNode(node.id);
        this.focusNode(node.id);
        this.emitNodeClick(node);

        return node;
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default new GraphController();
