// notebookLoader.js

export function linearizeNotebook(notebook) {
    const lines = [];
    let lineNumber = 1;

    if (!notebook?.cells) return lines;

    notebook.cells.forEach((cell, cellIndex) => {
        if (cell.cell_type !== "code") return;

        cell.source.forEach((line) => {
            lines.push({
                lineNumber,
                content: line.replace(/\n$/, ""),
                cellIndex,
            });
            lineNumber++;
        });

        lines.push({
            lineNumber,
            cellIndex,
            isCellSeparator: true,
        });

        lineNumber++;
    });

    return lines;
}
