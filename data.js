const data = [
  { email: "admin", parent: null, referralCode: "1", level: 1, children: ["2", "3", "4"] },
  { email: "admin2", parent: "1", referralCode: "2", level: 2, children: ["5", "6"] },
  { email: "admin3", parent: "1", referralCode: "3", level: 2, children: [] },
  { email: "admin4", parent: "1", referralCode: "4", level: 2, children: [] },
  { email: "admin5", parent: "2", referralCode: "5", level: 3, children: [] },
  { email: "admin6", parent: "2", referralCode: "6", level: 3, children: [] }
];

module.exports = data;
