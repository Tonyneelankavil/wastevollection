const fs = require('fs');

async function fetchData() {
    try {
        console.log("Fetching geojson...");
        const response = await fetch('https://raw.githubusercontent.com/opendatakerala/lsg-kerala-data/master/kl_lsgd.geojson');
        const data = await response.json();
        const m = {};

        if (!data.features) {
            console.error("No features array found in data.");
            return;
        }

        data.features.forEach(f => {
            const p = f.properties;
            const dist = p.DISTRICT;
            // Provide a name like "Thiruvananthapuram (Corporation)"
            const lsg = p.LSG_NAME + ' (' + p.LSG_TYPE + ')';

            if (dist) {
                if (!m[dist]) Object.assign(m, { [dist]: [] });
                if (!m[dist].includes(lsg)) m[dist].push(lsg);
            }
        });

        // Ensure exactly 14 districts are mapped if possible.
        const c = Object.keys(m).length;
        console.log(`Found ${c} districts and mapping saved to src/data/kerala_data.json`);

        fs.mkdirSync('src/data', { recursive: true });
        fs.writeFileSync('src/data/kerala_data.json', JSON.stringify(m, null, 2));
    } catch (err) {
        console.error("Fetch Data Error: ", err);
    }
}

fetchData();
