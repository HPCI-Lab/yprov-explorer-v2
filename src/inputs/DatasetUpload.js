import { MenuItem } from "@chakra-ui/react";

function readFileAsJson(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                resolve(JSON.parse(reader.result));
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

export default function DatasetUpload({ currentDataset, onDatasetLoaded }) {
    const handleUpload = async (event) => {
        const files = Array.from(event.target.files);

        let provFile = null;
        let notebookFile = null;

        files.forEach(f => {
            if (f.name.endsWith(".json")) provFile = f;
            if (f.name.endsWith(".ipynb")) notebookFile = f;
        });

        //notebook uploaded after the json
        if (!provFile && notebookFile && currentDataset?.provJson) {
            const notebookJson = await readFileAsJson(notebookFile);

            onDatasetLoaded({
                provJson: currentDataset.provJson,
                notebook: notebookJson
            });
            return;
        }

        //no json and no notebook
        if (!provFile) {
            alert("Please upload a provenance JSON file.");
            return;
        }

        //json uploaded (eith or without notebook)
        const provJson = await readFileAsJson(provFile);
        const notebookJson = notebookFile
            ? await readFileAsJson(notebookFile)
            : currentDataset?.notebook ?? null;

        onDatasetLoaded({
            provJson,
            notebook: notebookJson
        });
    };

    return (
        <MenuItem as="label" bg="gray.900" cursor="pointer">
            Upload dataset
            <input
                type="file"
                accept=".json,.ipynb"
                multiple
                hidden
                onChange={handleUpload}
            />
        </MenuItem>
    );
}

