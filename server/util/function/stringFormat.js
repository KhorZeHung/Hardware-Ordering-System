const db = require("./conn");

function replaceIds(arrays, result) {
  return arrays.map((arrayId) => {
    const categoryObj = result.find((item) => item.id === parseInt(arrayId));
    return categoryObj ? categoryObj.name : null;
  });
}



module.exports = {  replaceIds };
