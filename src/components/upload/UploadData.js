import { MenuItem } from "@chakra-ui/react";
//function for reading the json
function readFileAsJson(file) {
    return new Promise((resolve, reject) => {
        //builds a reader file
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

//function for uploading the data
export default function UploadData({ currentDataset, onDatasetLoaded }) {
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
                notebook: notebookJson,
                filename: null, //se il nootebook viene caricato dopo, questo non ha importanza
                filesize: null
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
        let notebookJson = null;
        if (notebookFile) {
            notebookJson = await readFileAsJson(notebookFile);
        } else if (currentDataset?.notebook) {
            notebookJson = currentDataset.notebook;
        }
        onDatasetLoaded({
            provJson,
            notebook: notebookJson,
            filename: provFile.name,
            filesize: provFile.size
        });
    };

    //main layout
    return (
        <>
        <MenuItem as="label" bg="black" cursor="pointer">
            Upload data (.json o .ipynb)
            <input type="file" accept=".json,.ipynb" multiple hidden onChange={handleUpload}/>
        </MenuItem>
        {/*To implement*/}
        <MenuItem bg="black">
            Upload from URL
        </MenuItem>
        {/*To implement*/}
        <MenuItem bg="black">
            Upload from API
        </MenuItem>
        </>
    );
}

