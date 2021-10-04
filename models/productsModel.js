const { ObjectID } = require('mongodb');
const connection = require('./connection');

const create = async (name, quantity) => {
  const productsCollection = await connection()
    .then((db) => db.collection('products'));

  const response = await productsCollection
    .insertOne({ name, quantity });

  return {
    _id: response.insertedId,
    name,
    quantity,
  };
};

const findByName = async (name) => {
  const productsCollection = await connection()
    .then((db) => db.collection('products'));

  const result = await productsCollection.findOne({ name });
  return result;
};

const getAll = async () => {
  const productsCollection = await connection()
    .then((db) => db.collection('products'));

  const products = await productsCollection.find().toArray();
  return { products };
};

const getById = async (id) => {
  const productsCollection = await connection()
    .then((db) => db.collection('products'));

  const response = await productsCollection.findOne(new ObjectID(id));
  return response;
};

const updateById = async (id, name, quantity) => {
  const productsCollection = await connection()
    .then((db) => db.collection('products'));
  try {
    const response = await productsCollection.updateOne(
      { _id: id },
      { $set: { name, quantity } },
    );

    if (response) { return true; }

    return false;
  } catch (err) {
    return err;
  }
};

const deleteById = async (id) => {
  const productsCollection = await connection()
    .then((db) => db.collection('products'));

  try {
    const deleted = await productsCollection.deleteOne(
      { _id: new ObjectID(id) },
    );
    console.log(deleted);
    return deleted;
  } catch (err) {
    return err;
  }
};

const subtractProductsQuantity = async (id, quantity) => {
  const productsCollection = await connection().then((db) => db.collection('products'));
  const oldValue = await productsCollection.findOne(new ObjectID(id));

  const response = await productsCollection.updateOne(
    { _id: new ObjectID(id) },
    { $set: { quantity: (oldValue.quantity - quantity) } },
  );

  const newValue = await productsCollection.findOne(new ObjectID(id));

  if (response) { return newValue.quantity; }

  return false;
};

const addProductsQuantity = async (id, quantity) => {
  const productsCollection = await connection().then((db) => db.collection('products'));

  try {
    const oldValue = await productsCollection.findOne(new ObjectID(id));

    const response = await productsCollection.updateOne(
      { _id: new ObjectID(id) },
      { $set: { quantity: oldValue.quantity + quantity } },
    );

    if (response) { return true; }
    return false;
  } catch (err) {
    return err;
  }
};

module.exports = {
  create,
  findByName,
  getAll,
  getById,
  updateById,
  deleteById,
  subtractProductsQuantity,
  addProductsQuantity,
};
