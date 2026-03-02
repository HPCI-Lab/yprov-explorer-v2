// notebookLoader.js
//linearize the notebook: split the code into lines
export function linearizeNotebook(notebook) {
    const lines = [];   //lines
    let lineNumber = 1;

    if (!notebook?.cells) return lines;

    notebook.cells.forEach((cell, cellIndex) => {
        if (cell.cell_type !== "code") return;

        //builds the lines
        cell.source.forEach((line) => {
            lines.push({
                lineNumber,
                content: line.replace(/\n$/, ""),
                cellIndex,
            });
            lineNumber++;
        });

        //joins the lines
        lines.push({
            lineNumber,
            cellIndex,
            isCellSeparator: true,
        });

        lineNumber++;
    });

    return lines;
}
