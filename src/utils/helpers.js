String.prototype.pad = function(size) {
  let s = this;
  while (s.length < size) s = "0" + s;
  return s;
};

exports.generatePrefix = function() {
  let date = new Date();
  let year = date
    .getFullYear()
    .toString()
    .substring(2);
  let month = date
    .getMonth()
    .toString()
    .pad(2);
  return year + month;
};

exports.generateCode = function(prefix, number) {
  suffix = number.toString().pad(6);
  return prefix + suffix;
};
