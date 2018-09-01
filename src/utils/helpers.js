String.prototype.pad = function(size) {
  let s = this;
  while (s.length < size) s = "0" + s;
  return s;
};

// s = "10";
// s = s.pad(2);
// console.log(s);

exports.codeGenerator = function codeGenerator(suffix = "") {
  let date = new Date();
  let year = date
    .getFullYear()
    .toString()
    .substring(2);
  let month = date
    .getMonth()
    .toString()
    .pad(2);
  suffix = suffix.toString().pad(6);
  return year + month + suffix;
};
