const app = require("./src/app");
const { checkOverloadConnect } = require("./src/helpers/check.connect");
const PORT = process.env.PORT || 3052;
// const intervalID = checkOverloadConnect();

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//     clearInterval(intervalID);
process.on("SIGINT", (err, promise) => {
    server.close(() => console.log('Exit Sever Express'));
});

