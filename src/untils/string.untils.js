function parseSubject(str, subjectUID) {
    if (typeof str !== 'string') return null;
    const parts = str.split(',').map(s => s.trim());
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
}

module.exports = { parseSubject };

