const fs = require("fs");
const path = require("path");
const consoleLogger = require("../../utils/consoleLogger");
const netWrapper = require("../net-wrapper");

const onRetrain = () => {
  consoleLogger.info("Retrained");

  netWrapper.net.fromJSON(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../training/data/net.json"),"utf8"))
  );
};

module.exports = { onRetrain };
