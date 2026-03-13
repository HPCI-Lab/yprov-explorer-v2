
/*
* parserNotebook.js: manage the notebook feature: from the linearization to building the cells
* */

//function for parsing the notebook, extracting the lines and building the cells
function parseNotebook(notebook, provenanceNodes){
    const lines = [];
    const cells = [];
    let count = 1;
    const activityNodes = provenanceNodes.filter(n => n.type === "activity");

    if(notebook == null || notebook === undefined) {
        return {lines, cells};
    }else if(!notebook.cells){
        return {lines, cells};
    }else{
        //extracting lines
        for(let i=0; i<notebook.cells.length; i++){
            if(notebook.cells[i].cell_type !== "code"){

            }else{
                for(let k=0; k<notebook.cells[i].source.length; k++){
                    lines.push({
                        count: count,
                        code: notebook.cells[i].source[k].replace(/\n$/, ""),
                        index: i,
                    });
                    count++;
                }
            }
        }
        //building cells
        for(let i=0; i<lines.length; i++){
            //if has differnt index line
            if(cells.length === 0 || lines[i].index !== cells[cells.length - 1].cellIndex){
                cells.push({
                    cellIndex: lines[i].index,
                    startLine: lines[i].count,
                    endLine: lines[i].count,
                    preview: lines[i].code,
                    hasProvenance: false,
                });
            }else{
                const lastCell = cells[cells.length - 1];
                lastCell.endLine = lines[i].count;

                if (!lastCell.preview && lines[i].code.trim()) {
                    lastCell.preview = lines[i].code;
                }
            }
        }

        //associating with provenance
        for(let i=0; i<activityNodes.length; i++){
            const index = activityNodes[i].attributes?.["yprov4wfs:jupyter_cell_index"];
            for (let j = 0; j < cells.length; j++) {
                if (cells[j].cellIndex === Number(index)) {
                    cells[j].hasProvenance = true;
                }
            }
        }
    }

    return {lines, cells};
}

export default parseNotebook;
