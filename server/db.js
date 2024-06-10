// import pg and create client

const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store_db"
);

// import uuid and bcrypt

const uuid = require("uuid");
const bcrypt = require("bcrypt");

// createTables

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS "user" CASCADE;
    DROP TABLE IF EXISTS product CASCADE;
    DROP TABLE IF EXISTS favorite CASCADE;
    CREATE TABLE "user" (
      id UUID PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL
    );
    CREATE TABLE product (
      id UUID PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL
    );
    CREATE TABLE favorite (
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES product(id) NOT NULL,
      user_id UUID REFERENCES "user"(id) NOT NULL,
      CONSTRAINT unique_user_product UNIQUE (product_id, user_id)
    );
  `;
  await client.query(SQL);
};

// createProduct

const createProduct = async ({ name }) => {
  const SQL = `INSERT INTO product (id, name) VALUES ($1, $2) RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

// createUser

const createUser = async ({ username, password }) => {
  const SQL = `INSERT INTO "user" (id, username, password) VALUES ($1, $2, $3) RETURNING *`;

  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

// createFavorite

const createFavorite = async ({ product_id, user_id }) => {
  const SQL = `INSERT INTO favorite (id, product_id, user_id) VALUES ($1, $2, $3) RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
};

// fetchUsers

const fetchUsers = async () => {
  const SQL = `SELECT * FROM "user"`;
  const response = await client.query(SQL);
  return response.rows;
};

// fetchProducts

const fetchProducts = async () => {
  const SQL = `SELECT * FROM product`;
  const response = await client.query(SQL);
  return response.rows;
};

// fetchFavorites

const fetchFavorites = async () => {
  const SQL = `SELECT * FROM favorite`;
  const response = await client.query(SQL);
  return response.rows;
};

// destroyFavorite

const destroyFavorite = async ({ id, user_id }) => {
  const SQL = `DELETE FROM favorite WHERE id = $1 AND user_id = $2`;
  await client.query(SQL, [id, user_id]);
};

// module exports

module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
};
