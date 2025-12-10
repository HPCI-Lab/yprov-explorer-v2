/*
GraphController.js: Controller for Graph API. Permits to call functions from the app
*/

class GraphController {
    nodeClickHandler = () => {};

    //Graoh api
    API = {
        selectNode: () => {},
        focusNode: () => {},
        resetView: () => {}
    };

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
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new GraphController();
