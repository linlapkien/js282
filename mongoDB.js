// Khai báo biến envz
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const dbName = process.env.DBNAME;
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hd9ovqa.mongodb.net/?retryWrites=true&w=majority`;

class mongoDB {
  getAll(collection_name, filter = {}) {
    return MongoClient.connect(uri)
      .then((client) => {
        let collection = client.db(dbName).collection(collection_name);
        return collection.find(filter).toArray();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  getOne(collection_name, filter = {}) {
    return MongoClient.connect(uri)
      .then((client) => {
        let collection = client.db(dbName).collection(collection_name);
        return collection.findOne(filter);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  insertOne(collection_name, document) {
    return MongoClient.connect(uri)
      .then((client) => {
        let collection = client.db(dbName).collection(collection_name);
        return collection.insertOne(document);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  updateOne(collection_name, filter, document) {
    return MongoClient.connect(uri)
      .then((client) => {
        let collection = client.db(dbName).collection(collection_name);
        return collection.updateOne(filter, document);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  deleteOne(collection_name, filter) {
    return MongoClient.connect(uri)
      .then((client) => {
        let collection = client.db(dbName).collection(collection_name);
        return collection.deleteOne(filter);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

let db = new mongoDB();
module.exports = db;
