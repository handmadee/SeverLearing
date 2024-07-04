const app = require("./src/app");
const config = require("./src/configs/config.mongodb");
const PORT = config.app.port || 8001;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", (err, promise) => {
    server.close(() => console.log('Exit Sever Express'));
});

