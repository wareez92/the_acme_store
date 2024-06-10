// --- import modules ---

const {
  client,
  createTables,
  createProduct,
  createUser,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
} = require("./db");

// --- import express and store in app ---

const express = require("express");
const app = express();

// --- json parsing middleware ---

app.use(express.json());

// O------ [  init function  ] ------O //

const init = async () => {
  // ~ connect client to the database ~

  console.log("connecting to the database...");
  await client.connect();
  console.log("...connected to the database");

  // ~ instatiate created tables ~

  console.log("o------TABLES------O");
  await createTables();

  // ~ users & products ~

  const [john, james, jones, julian, basketball, laptop, television] = await Promise.all([
    // - four created users -
    createUser({ username: "john", password: "S3cr3t" }),
    createUser({ username: "james", password: "S3cr3t" }),
    createUser({ username: "jones", password: "S3cr3t" }),
    createUser({ username: "julian", password: "S3cr3t" }),

    // - three created products -
    createProduct({ name: "basketball" }),
    createProduct({ name: "laptop" }),
    createProduct({ name: "television" }),
  ]);

  // ~~~ two favorites ~~~

  const [favorite, favorite2] = await Promise.all([
    createFavorite({ user_id: john.id, product_id: laptop.id }),
    createFavorite({ user_id: jones.id, product_id: basketball.id }),
  ]);

  console.log("o---users---o");
  console.log(await fetchUsers());
  console.log("o---products---o");
  console.log(await fetchProducts());
  console.log("o---favorites---o");
  console.log(await fetchFavorites()); 

  // ~~~ create port and add a listener ~~~

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });

  // ~~~ logging routes ~~~

  console.log("o------TEST ROUTES------o");
  console.log(`GET | localhost:${port}/api/users`);
  console.log(`GET | localhost:${port}/api/products`);
  console.log(`GET | localhost:${port}/api/users/:id/favorites`);
  console.log(`POST | localhost:${port}/api/users/:id/favorites`);
  console.log(`DELETE | localhost:${port}/api/users/:userId/favorites/:id`);
};

// --- [  invoke init  ] --- //

init();

// o------ [  EXPRESS ROUTES  ] ------o //

//  --- readUsers ---
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

//  --- readProducts ---
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});

//  --- readFavorites ---
app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});

//  --- createFavorites ---
app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});

//  --- deleteFavorites ---
app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
