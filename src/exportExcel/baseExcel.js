'use strict';
const { convertRawToExcel, exportFeedbackToExcel } = require('../untils/xlsx');



const dataStudents = [
    {
        _id: "6692016f40a1291a267b5bce",
        fullname: "Như Ý",
        phone: "0868552445",
        study: 1,
        days: [3, 5],
    },
];

const exportStudents = (dataStudents = []) => {
    const data = dataStudents.map(item => ({
        ...item,
        days: Array.isArray(item.days) ? item.days.join(', ') : item.days
    }));
    const file = convertRawToExcel(data, ["_id", "fullname", "phone", "study", "days"], './output.xlsx');
    return file;
}

exportStudents(dataStudents);



module.exports = {
    exportStudents,
}   
