const db = require('./modules/database.js');

let query = `INSERT INTO MachineProducts (machineId, productId) VALUES ?`;

let values = [
	[10, 20],
	[10, 30],
	[20, 20],
	[20, 30]
];

db.query(query, [values])
	.then(result => {
		console.log(result);
	});
