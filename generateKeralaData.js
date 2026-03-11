import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcFile = path.join(__dirname, 'lsg-kerala-data', 'kl_lsgd.geojson');
const destFile = path.join(__dirname, 'src', 'data', 'kerala.json');

try {
    const geojson = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
    const m = {};

    if (geojson.features) {
        geojson.features.forEach(f => {
            const props = f.properties;
            const district = props.DISTRICT ? props.DISTRICT.trim() : null;
            if (!district) return;

            const lsgType = props.LSG_TYPE ? props.LSG_TYPE.trim() : 'Gram Panchayat';
            const lsgName = props.LSG_NAME ? props.LSG_NAME.trim() : props.DIST_NAME;

            if (!m[district]) {
                m[district] = [];
            }

            const displayName = `${lsgName} (${lsgType})`;
            if (!m[district].includes(displayName)) {
                m[district].push(displayName);
            }
        });

        for (const d in m) {
            if (m.hasOwnProperty(d)) {
                m[d] = m[d].sort();
            }
        }

        fs.mkdirSync(path.join(__dirname, 'src', 'data'), { recursive: true });
        fs.writeFileSync(destFile, JSON.stringify(m, null, 2));

        console.log(`Saved Kerala data to ${destFile} successfully! Number of districts: ${Object.keys(m).length}`);
    }
} catch (e) {
    console.error("Error extracting data:", e.message);
}
