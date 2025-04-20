const app = require("./src/app");
const { checkOverloadConnect } = require("./src/helpers/check.connect");
const PORT = process.env.PORT || 3052;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
process.on("SIGINT", () => {
    server.close(() => console.log('Exit Server Express'));
});

