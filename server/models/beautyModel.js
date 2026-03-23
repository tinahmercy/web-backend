const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/database.json');

exports.readData = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            const init = { staff: [], bookings: [], attendance: [] };
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
            fs.writeFileSync(dataPath, JSON.stringify(init, null, 2));
            return init;
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
        return { staff: [], bookings: [], attendance: [] };
    }
};

exports.writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};