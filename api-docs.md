# API Documentation

## End Points :

List of available endpoints:

- `POST /login`

- `GET /auth/google`

- `GET /funds`

- `POST /funds/buy`

- `POST /payment/generate-midtrans-token`

- `POST /payment/update-status-transaction`

- `POST /funds/sell`

- `POST /funds/switch`

- `GET /pub/funds`

&nbsp;

## POST /login

User login with email and password.

_Request Body_

```json
{
  "email": "string",
  "password": "string"
}
```

_Response (200 - OK)_

```json
{
  "data": {
    "name": "string",
    "totalAsset": "string",
    "profit": "string"
  },
  "access_token": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Email is required"
}

OR

{
  "message": "Password is required"
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid email/password"
}
```

&nbsp;

## GET /auth/google

User login with Google OAuth.

_Response (200 - OK)_

```json
{
  "data": {
    "name": "string",
    "totalAsset": "string",
    "profit": "string"
  },
  "access_token": "string"
}
```

&nbsp;

## GET /funds

Get All funds with authentication.

_Request Header_

```json
{
  "access_token": "string"
}
```

_Response (200 - OK)_

```json
{
  "id": "integer",
  "name": "string",
  "type": "string",
  "nav": "string",
  "rating": "string"
},
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

&nbsp;

## POST /funds/buy

User buy mutual fund.

_Request Header_

```json
{
  "access_token": "string"
}
```

_Request Body_

```json
{
  "fundId": "integer",
  "amount": "integer"
}
```

_Response (201 - Created)_

```json
{
  "message": "string",
  "data": {
    "TransactionId": "string",
    "transactionType": "string",
    "units": "string",
    "totalAmount": "string",
    "status": "string"
  }
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Fund not found"
}
```

&nbsp;

## POST /payment/generate-midtrans-token

Generate token from midtrans.

_Request Header_

```json
{
  "access_token": "string"
}
```

_Request Body_

```json
{
  "TransactionId": "string"
}
```

_Response (201 - Created)_

```json
{
  "midtransToken": {
    "token": "string",
    "redirect_url": "string"
  }
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

OR

```json
{
  "message": "Invalid transaction"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Fund not found"
}
```

&nbsp;

## PATCH /payment/update-status-transaction

Update status payment of transaction.

_Request Header_

```json
{
  "access_token": "string"
}
```

_Request Body_

```json
{
  "TransactionId": "string"
}
```

_Response (200 - OK)_

```json
{
  "message": "string"
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

OR

```json
{
  "message": "Invalid transaction"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Fund not found"
}
```

&nbsp;

## POST /funds/sell

User can sell his fund.

_Request Header_

```json
{
  "access_token": "string"
}
```

_Request Body_

```json
{
  "fundId": "integer",
  "units": "integer"
}
```

_Response (201 - Created)_

```json
{
  "message": "string",
  "data": {
    "transactionType": "string",
    "units": "string",
    "nav": "string",
    "totalAmount": "string"
  }
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

OR

```json
{
  "message": "Invalid transaction"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Fund not found"
}
```

&nbsp;

## POST /funds/switch

User can switch his fund.

_Request Header_

```json
{
  "access_token": "string"
}
```

_Request Body_

```json
{
  "sourceFundId": "integer",
  "targetFundId": "integer",
  "units": "integer"
}
```

_Response (201 - Created)_

```json
{
  "message": "Mutual fund switch successful"
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

OR

```json
{
  "message": "Invalid transaction"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Fund not found"
}
```

&nbsp;

## GET /pub/funds

Get all funds without authentication.

_Response (200 - OK)_

```json
{
  "id": "integer",
  "name": "string",
  "type": "string",
  "nav": "string",
  "rating": "string"
},
```

&nbsp;

## Global Error

_Response (500 - Internal Server Error)_

```json
{
  "message": "Internal Server Error"
}
```
