# Where Is My Money


## Application Summary

User can save your wallet with checking income and spending.
User can register or login and Add, Edit ,or delete Income or Spending.
The Report page shows compare income and spending and check how much in my pocket.


This link is the front-end client, built in React.  
https://first-capstone-7jximoi0z.vercel.app/



## What I Use for App

### Back End

- Node and Express
  - Authentication via JWT
  - RESTful Api

- Testing
  - Supertest(integration)
  - Mocha and Chai (unit)

- Database
  - postgreSQL
  - knex

- Production
  - Deployed via Heoku

### Front End

- React
  - Create React
  - React Router
  - React Context

- Testing
  - Jest(Somke tests)

- Production
  - Deployed via Vercel

## Documentation of API

### Authorization

- API requests protected endpoints requires the use of a bearer token. 
- To authenticate an API request, user should provide user's bearer token in the Authorization header.

### Where Is My Money's Endpoint

#### Users Endpoint

```http
POST  /api/users
```

|  Key         | Values               |
| :------------|----------------------|
|   user_name  | string, required     |
|   password   | string, required     |
|   full_name  | string, required     |


#### Income Endpoint

```http
GET  /api/incomes
```

Provides array of all incomes objects

```http
GET  /api/incomes/:income_id
```

Provides specific income

```http
POST  /api/incomes
```

Creates a new income. Requires a request body

|  Key         | Values               |
| :------------|----------------------|
|   start_time | number, required     |
|   end_time   | number, required     |
|hourly_payment| number, required     |
| daily_extra  | number, optional     |

```http
DELETE  /api/incomes/:income_id
```
Deletes income matching id parameter

```http
PATCH  /api/incomes/:income_id
```

Updates income matching id with the fields provided.


#### SpendingList Endpoint

```http
GET  /api/slists
```

Provides array of all spending lists objects

```http
GET  /api/slists/:slist_id
```

Provides specific spending list

```http
POST  /api/slists
```

Creates a new spending list. Requires a request body

|  Key         | Values               |
| :------------|----------------------|
|   category   | string, required     |

```http
DELETE  /api/slists/:slist_id
```
Deletes spending list matching id parameter

```http
PATCH  /api/slists/:slist_id
```

Updates income matching id with the fields provided.

|  Key         | Values               |
| :------------|----------------------|
|   category   | string, required     |

#### SpendingItem Endpoint

```http
GET  /api/sitems
```

Provides array of all spending items objects

```http
GET  /api/sitems/:sitem_id
```

Provides specific spending item

```http
POST  /api/sitems
```

Creates a new spending item. Requires a request body

|  Key         | Values               |
| :------------|----------------------|
|  item_ name  | string, required     |
|  spending    | number, required     |
|  content     | string, required     |

```http
DELETE  /api/sitems/:sitem_id
```
Deletes spending list matching id parameter

```http
PATCH  /api/sitems/:sitem_id
```

Updates income matching id with the fields provided.

|  Key         | Values               |
| :------------|----------------------|
|  item_ name  | string, required     |
|  spending    | number, required     |
|  content     | string, required     |