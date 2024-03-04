const app = require("./src/app");
const config = require("./src/configs/congif.mongodb");
const PORT = config.app.port || 3080;


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", (err, promise) => {
    server.close(() => console.log('Exit Sever Express'));
});

