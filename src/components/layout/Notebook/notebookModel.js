import { useEffect, useState } from "react";
import {linearizeNotebook} from "./notebookLoader";

//builds the notebook cells based on the lines
function buildCells(notebookLines, provNodes) {
    const activityNodes = provNodes.filter(n => n.type === "activity");
    const cellsMap = new Map();

    notebookLines.forEach(line => {
        if (!cellsMap.has(line.cellIndex)) {
            cellsMap.set(line.cellIndex, {
                cellIndex: line.cellIndex,
                startLine: line.lineNumber,
                endLine: line.lineNumber,
                preview: line.content,
                hasProvenance: false,
            });
        } else {
            const cell = cellsMap.get(line.cellIndex);
            cell.endLine = line.lineNumber;
            if (!cell.preview && line.content.trim()) {
                cell.preview = line.content;
            }
        }
    });

    activityNodes.forEach(node => {
        const idx = node.attributes?.["yprov4wfs:jupyter_cell_index"];
        if (idx !== undefined && cellsMap.has(Number(idx))) {
            cellsMap.get(Number(idx)).hasProvenance = true;
        }
    });

    return Array.from(cellsMap.values()).sort(
        (a, b) => a.cellIndex - b.cellIndex
    );
}

//graph-notebook association
export function useNotebookModel(notebookJson, provGraph) {
    const [lines, setLines] = useState([]);
    const [cells, setCells] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!notebookJson || !provGraph) {
            setLines([]);
            setCells([]);
            return;
        }
        try {
            setLoading(true);

            const notebookLines = linearizeNotebook(notebookJson);
            const builtCells = buildCells(notebookLines, provGraph.nodes);

            setLines(notebookLines);
            setCells(builtCells);
            setError(null);
        } catch (e) {
            console.error(e);
            setError(e);
        } finally {
            setLoading(false);
        }
    }, [notebookJson, provGraph]);

    return { lines, cells, loading, error };
}
