const debug = require('debug')('persistency-module');
var MongoClient = require('mongodb').MongoClient;

function persistencyModule() {

	const NO_DATABASE = 'none';

	function insertFlights(database, collection, docs) {
		if (database === NO_DATABASE) {
			return Promise.resolve(docs);
		}
		return new Promise(function(resolve, reject) {
			if (docs.length > 0) {
				MongoClient.connect('mongodb://' + database, function(err, db) {
					if (err != null) {
						reject(err);
					} else {
						debug('Successfully connected to ' + database + ' !');
						db.collection(collection).insertMany(docs, function(err, res) {
							if (err != null) {
								reject(err);
							} else {
								debug(JSON.stringify(res.insertedIds) + ' - ' + res.insertedIds.length);
								db.close();
								debug('Closed connection to ' + database + ' !');
								resolve(res.insertedIds);
							}
						});
					}
				});
			} else {
				debug('No data to be inserted!');
				resolve([]);
			}
		});
	}

	function removeFlights(database, collection, ids) {
		if (database === NO_DATABASE) {
			return Promise.resolve(ids);
		}
		return new Promise(function(resolve, reject) {
			MongoClient.connect('mongodb://' + database, function(err, db) {
				if (err != null) {
					reject(err);
				} else {
					db.collection(collection).deleteMany({
						'_id': {
							'$in': ids
						}
					}, function(err, res) {
						if (err != null) {
							reject(err);
						} else {
							resolve(res.result.n);
						}
						db.close();
					});
				}
			});
		});
	}

	return {
		NO_DATABASE,
		insertFlights,
		removeFlights
	};

}

module.exports = persistencyModule();