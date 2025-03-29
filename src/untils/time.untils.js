 const formatDateTime = (date) => {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();


    return `${day}-${month}-${year}`;
};

module.exports = {formatDateTime};