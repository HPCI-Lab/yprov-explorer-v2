export function mapLinesToActivities(lines, refs) {
    const map = new Map();

    lines.forEach((line) => {
        refs.forEach((ref) => {
            if (
                line.cellIndex === ref.cellIndex &&
                line.lineNumber >= ref.lineStart &&
                line.lineNumber <= ref.lineEnd
            ) {
                if (!map.has(line.lineNumber)) {
                    map.set(line.lineNumber, []);
                }
                map.get(line.lineNumber).push(ref);
            }
        });
    });

    return map;
}


