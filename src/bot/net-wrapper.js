const brain = require("brain.js");
const fs = require("fs");
const path = require("path");

const categories = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../training/data/categories.json"),"utf8"));

const net = new brain.recurrent.LSTM({
  activation: "leaky-relu",
});

const getResponse = (intent) => {
  const awnsers = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../training/data/awnsers.json"),"utf8"));
  if (intent === "") return ":thinking:";

  let parsed = parseInt(intent);

  if (awnsers[parsed] == undefined) {
    return awnsers[2][Math.floor(Math.random() * awnsers[2].length)];
  }
  return awnsers[parsed][Math.floor(Math.random() * awnsers[parsed].length)];
};

const categoryexistsWithId = (id) => {
  for (var i = 0; i < categories.categories.length; i++) {
    if (Object.keys(categories.categories[i])[0] == id) {
      return true;
    }
  }
  return false;
};

const categoryexistsWithName = (name) => {
  for (var i = 0; i < categories.categories.length; i++) {
    if (Object.values(categories.categories[i])[0] == name) {
      return true;
    }
  }
  return false;
};

const addCategory = (name) => {
  let id = categories.categories.length + 1;
  let toSave = { [id]: name };
  categories.categories.push(toSave);
  fs.writeFileSync(
    path.resolve(__dirname, "../training/data/categories.json"),
    JSON.stringify(categories)
  );
};

const getCategories = () => {
  return categories.categories;
};

module.exports = {
  net,
  getResponse,
  categories,
  categoryexistsWithId,
  categoryexistsWithName,
  addCategory,
  getCategories,
};
