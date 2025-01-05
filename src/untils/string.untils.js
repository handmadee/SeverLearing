function parseSubject(str, subjectUID) {
    if (typeof str === 'number') {
        if (str < 1 || str > 3) return null;
        return [{
            languageIt: subjectUID,
            level: str,
            score: 0
        }];
    }
    if (typeof str !== 'string') return null;

    const arr = str.split(';').map((text) => {
        const parts = text.split(',').map(s => s.trim());
        if (parts.length < 2) {
            return null;
        }
        const level = Number(parts[0]);
        const score = Number(parts[1]);
        if (isNaN(level) || isNaN(score) || level < 1 || level > 3) {
            return null;
        }
        return {
            languageIt: subjectUID,
            level: level,
            score: score
        };
    }).filter(subj => subj !== null); // Filter out null values

    return arr.length > 0 ? arr : null;
}


const generateCustomId = () => {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timePart = Date.now().toString(36).substring(5, 7).toUpperCase();
    return randomPart + timePart;
};


module.exports = { parseSubject, generateCustomId };

