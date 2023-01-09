const fs = require("fs");

let settings = JSON.parse(fs.readFileSync("./settings.json"));
let data = JSON.parse(raw);
data.windowHeight = 1000;
console.log(data);

fs.writeFileSync("./settings.json", JSON.stringify(data));
