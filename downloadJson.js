import https from 'https';
import fs from 'fs';

const url = 'https://raw.githubusercontent.com/yedhinkarun/kerala-local-bodies/master/kerala-local-bodies.json';

https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            fs.mkdirSync('src/data', { recursive: true });
            fs.writeFileSync('src/data/kerala.json', rawData);
            console.log("Successfully downloaded kerala.json");
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
