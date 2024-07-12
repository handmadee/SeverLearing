const app = require("./src/app");
const PORT = process.env.PORT || 3052;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", (err, promise) => {
    server.close(() => console.log('Exit Sever Express'));
});

