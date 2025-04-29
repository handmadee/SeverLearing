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


// learningStatus: {
//     type: [{
//         topic: { type: Types.ObjectId, ref: 'topic' },
//         status: { type: Number, required: true, enum: [0, 1, 2] }, // 0: chưa học, 1: đã học, 2: đang học 
//     }],
//         required: true
// },
function parseLearningStatus(value, topicId) {
    if (value === null || value === undefined) return null;
    const status = parseInt(value);
    // Check if status is valid (0: not learned, 1: learned, 2: studying)
    if (isNaN(status) || status < 0 || status > 2) return null;
    return {
        topic: topicId,
        status: status
    };
}



const generateCustomId = () => {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timePart = Date.now().toString(36).substring(5, 7).toUpperCase();
    return randomPart + timePart;
};


module.exports = { parseSubject, generateCustomId, parseLearningStatus };

