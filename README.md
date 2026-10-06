# E-Commerce API

REST API for an e-commerce store: categories, subcategories, brands and products.
Node + Express 5 + MongoDB (Mongoose). Backend only - no frontend, no auth yet.

---

## Quick start

```bash
npm install
```

1. Copy the env template and fill in your database:

   ```bash
   cp config.env.example config.env
   ```

2. Open `config.env` and set `DB_URL` (see [Database](#database) below).

3. Start it:

   ```bash
   npm run start:dev
   ```

You should see:

```
mode: development
app running on http://localhost:8000
Database conntected: <host>
```

If `DB_URL` is missing the server exits straight away with a message telling you so.

---

## Database

`config.env` holds the connection string. This file is **git-ignored** - never commit it.
`config.env.example` is the committed template.

### Option 1 - MongoDB Atlas (cloud)

Get the string from Compass (**Edit connection**) or from the Atlas site
(**Connect > Drivers**), then put it in `config.env`:

```
DB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecommerce?retryWrites=true&w=majority
```

Two things that usually break this:

- A password containing `@ : / ? # [ ]` must be URL-encoded - `p@ss` becomes `p%40ss`
- **Atlas > Network Access** must allow your current IP, otherwise it just hangs

The `/ecommerce` part before the `?` is the database name the data goes into.

### Option 2 - Local MongoDB

Needs the MongoDB **server** installed and running (Compass alone is only the GUI client):

```
DB_URL=mongodb://127.0.0.1:27017/ecommerce
```

On Windows: `winget install MongoDB.Server` - it registers a service on port 27017.

---

## Endpoints

Base path: `/api/v1`

| Method | Path | Notes |
|---|---|---|
| GET | `/categories` | list, paginated |
| POST | `/categories` | `name` 3-32, unique |
| GET · PUT · DELETE | `/categories/:id` | |
| GET | `/subcategories` | |
| POST | `/subcategories` | `name` 2-32 unique, `category` must exist |
| GET · PUT · DELETE | `/subcategories/:id` | |
| GET | `/categories/:categoryId/subcategories` | only that category's children |
| POST | `/categories/:categoryId/subcategories` | `category` taken from the URL |
| GET | `/brands` | |
| POST | `/brands` | `name` 3-32, unique |
| GET · PUT · DELETE | `/brands/:id` | |
| GET | `/products` | |
| POST | `/products` | see required fields below |
| GET · PUT · DELETE | `/products/:id` | GET populates the category name |

**Product required fields:** `title` (3-100), `description` (20-2000), `quantity`,
`price` (max 20000), `imageCover`, `category` (must exist).
**Optional:** `sold`, `priceAfterDiscount` (must be lower than `price`), `colors[]`,
`images[]`, `subcategories[]` (each must belong to the given category), `brand`
(must exist), `ratingsAverage` (1-5), `ratingsQuantity`.

`slug` is generated automatically from `name` / `title` - never send it.

### Query API

Every list endpoint supports the same options:

| Query | Example | Meaning |
|---|---|---|
| `page`, `limit` | `?page=2&limit=10` | pagination, `limit` capped at 100 |
| `sort` | `?sort=-price,title` | `-` means descending |
| `fields` | `?fields=title,price` | only return these fields |
| `keyword` | `?keyword=samsung` | products search title + description, others search name |
| filters | `?price[gte]=100&price[lte]=2000` | `gte` `gt` `lte` `lt`, or exact match `?brand=<id>` |

Responses look like:

```json
{
  "results": 5,
  "pagination": {
    "currentPage": 1,
    "limit": 5,
    "numberOfPages": 3,
    "totalDocuments": 13,
    "nextPage": 2
  },
  "data": [ ... ]
}
```

Errors come back as `{ status, message }` in production, plus the stack in development.
Validation errors return `{ errors: [ { msg, path, location } ] }`.

---

## Testing with Postman

The collection lives in the repo:

- Collection: `postman/collections/ecommerce-api.postman_collection.json`
- Environment: `postman/environments/local.postman_environment.json`

In Postman: **Import** both files, then pick **"E-Commerce API - local"** in the
environment dropdown at the top right - that is what fills `{{baseUrl}}`.
Without it selected, requests go nowhere.

Create requests save the new id into a collection variable (`{{categoryId}}`,
`{{subCategoryId}}`, `{{brandId}}`, `{{productId}}`), so Get / Update / Delete work
right after without copying ids by hand. Deletes clear the variable again.

Run the whole collection from the terminal:

```bash
npx newman run postman/collections/ecommerce-api.postman_collection.json -e postman/environments/local.postman_environment.json
```

---

## Sample data

```bash
npm run seed          # insert 10 demo products (creates their categories first)
npm run seed:destroy  # remove them again
```

Running `seed` twice inserts the products twice - run `seed:destroy` first.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | nodemon, restarts on file changes |
| `npm run start:prod` | production mode, errors hidden from responses |
| `npm run lint` | eslint |
| `npm run seed` / `seed:destroy` | demo data |

---

## Project layout

```
server.js                 express app, route mounting, error handling, startup
config/data.base.js       mongoose connection
routes/                   URL -> validator -> service wiring
services/                 request handlers
  handlersFactory.js      generic CRUD, every service is built from it
models/                   mongoose schemas
utils/
  apiFeatures.js          filter / search / sort / fields / pagination
  apiError.js             operational errors with a status code
  slugifyPlugin.js        keeps slug in sync with name / title
  validators/             express-validator rules per resource
  dummyData/seeder.js     demo data loader
middleware/
  errorMiddleware.js      global error handler, maps mongoose errors to 400
  validatorMiddleware.js  turns validation results into a 400 response
postman/                  collection + environment
```

**Adding a new resource** means: a model in `models/`, validators in
`utils/validators/`, a service that calls `handlersFactory`, a route file, and one
`app.use()` line in `server.js`.

---

## Not built yet

- Authentication and users (no login, so anyone can create or delete anything)
- Image upload - `imageCover` and `images` are just URL strings for now
- Reviews, cart, orders, wishlist, coupons

Note: with no auth layer, clients can set `sold` and `ratingsAverage` directly.
Those normally get locked down when auth lands.
