const fs = require("fs");
const path = require("path");

// Define the source and destination file paths
const sourceFile = path.join(__dirname, "..","src","external","aria");
const destinationFile = path.join(__dirname, "..","lib","external","aria");
console.log("Copying files");

fs.cp(sourceFile, destinationFile,{ recursive: true }, (err) => {
    if (err) {
        console.error("Error copying files", err);
    } else {
        console.log("Files copied successfully");
    }
});


