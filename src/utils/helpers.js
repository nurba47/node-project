String.prototype.pad = function(size) {
  let s = this;
  while (s.length < size) s = "0" + s;
  return s;
};

// s = "10";
// s = s.pad(2);
// console.log(s);
