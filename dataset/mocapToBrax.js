const fs = require('fs');

const asfInputFile = "./02.asf";
const amcInputFile = "./02_02.amc";
const braxInputFile = "./braxConfig.json";
const outputFile = "./02_02.json";


const mapping = {
    "torso": "thorax",
    "lwaist": "upperback",
    "pelvis": "lowerback",
    "right_thigh": "rfemur",
    "right_shin": "rtibia",
    "left_thigh": "lfemur",
    "left_shin": "ltibia",
    "right_upper_arm": "rhumerus",
    "right_lower_arm": "rradius",
    "left_upper_arm": "lhumerus",
    "left_lower_arm": "lradius",
};

function isNumber(value) {
    return !isNaN(value);
}

function parseAmc(asfInputFile, amcInputFile) {
    const parsedAsfFile = parseAsf(asfInputFile);

    const amcFile = fs.readFileSync(amcInputFile, 'utf-8');
    const lines = amcFile.split("\n").slice(3);
    const frames = [];
    let currentFrame = {};
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (isNumber(line)) {
            if (Object.keys(currentFrame).length !== 0) {
                frames.push(currentFrame);
                currentFrame = {};
            }
            if (frames.length === 5) {
                break;
            }
            continue;
        }
        const [body, ...values] = line.split(" ");
        const braxKey = Object.entries(mapping).find(([k, v]) => v === body);
        if (!braxKey) {
            continue;
        }

        if (values.length !== parsedAsfFile[body].dof?.length) {
            console.error("Skipping", body, "because it has", values.length, "values, but should have", parsedAsfFile[body].dof?.length);
            continue;
        }
        if (braxKey) {
            for (const [i, v] of values.entries()) {
                currentFrame[braxKey[0]] = values.map(v => parseFloat(v));
            }
        }
        if (Object.keys(currentFrame).length !== 0) {
            frames.push(currentFrame);
        }
        return frames;
    }

    function parseAsf(filename) {
        const contents = fs.readFileSync(filename, 'utf8');
        const lines = contents.split("\n");

        let currentSection = "";

        const allData = {};
        let currentData = {};
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length === 0 || line.startsWith("#")) {
                continue;
            }
            if (line.startsWith(":")) {
                currentSection = line.slice(1);
                currentData = {};
                console.log("Setting section to", currentSection, "at line", i, line);
            } else if (currentSection === "root") {
                allData["root"] = {
                    id: "0",
                    name: "root",
                    position: [0, 0, 0],
                    orientation: [0, 0, 0],
                };
            } else if (currentSection === "bonedata") {
                if (line === "begin") {
                    continue;
                } else if (line === "end") {
                    if (currentData) {
                        allData[currentData.name] = currentData;
                        currentData = {};
                    }
                }
                if (line.startsWith("limit") || line.startsWith("(")) {
                    continue;
                }
                const [key, ...value] = line.split(" ");
                currentData[key] = (value.length === 1 && key !== "dof") ? value[0] : value.filter(v => !!v);
            } else if (currentSection === "hierarchy") {
                if (line === "begin") {
                    continue;
                } else if (line === "end") {
                    continue;
                }
                const [parent, ...children] = line.split(" ");
                if (allData[parent]) {
                    allData[parent].children = children;
                }
                children.forEach(child => {
                    if (allData[child]) {
                        allData[child].parent = parent;
                    }
                });
            }
        }
        return allData;
    }

    // const parsed1 = parseAsf(asfInputFile);
    // fs.writeFileSync("parsedAsf.json", JSON.stringify(parsed1, null, 4));
    const parsed2 = parseAmc(asfInputFile, amcInputFile);
    fs.writeFileSync("parsedAmc.json", JSON.stringify(parsed2, null, 4));
