usermanager
GET
/usermanager/
Index
Parameters
Name	Description
usr
string($uuid4)
(query)
	
cookie_access_token
string
(cookie)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

string

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
GET
/usermanager/api/v1/users
get list of users
Parameters
Name	Description
extra
string($json-string)
(query)
	

Can be used to filter users by extra fields
limit
integer
(query)
	
offset
integer
(query)
	
sortby
string
(query)
	
direction
string
(query)
	

Available values : asc, desc
search
string
(query)
	

Text based search
id
string
(query)
	

Supports Filtering
name
string
(query)
	

Supports Filtering
email
string
(query)
	

Supports Filtering
Responses
Code	Description	Links
200	

list of users
Media type
Controls Accept header.

[
  {
    "id": "string",
    "name": "string",
    "admin": "string",
    "email": "string",
    "password": "string",
    "extra": {
      "additionalProp1": "string",
      "additionalProp2": "string",
      "additionalProp3": "string"
    }
  }
]

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
POST
/usermanager/api/v1/users
Create a new user

Create a new user
Parameters

No parameters
Request body

{
  "user_name": "string",
  "wallet_name": "string",
  "email": "",
  "password": "",
  "extra": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}

Responses
Code	Description	Links
200	

New User
Media type
Controls Accept header.

{
  "id": "string",
  "name": "string",
  "admin": "string",
  "email": "string",
  "password": "string",
  "extra": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "wallets": [
    {
      "id": "string",
      "admin": "string",
      "name": "string",
      "user": "string",
      "adminkey": "string",
      "inkey": "string"
    }
  ]
}

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
GET
/usermanager/api/v1/users/{user_id}
Get a specific user

get user
Parameters
Name	Description
user_id *
string
(path)
	
Responses
Code	Description	Links
200	

user if user exists
Media type
Controls Accept header.

{
  "id": "string",
  "name": "string",
  "admin": "string",
  "email": "string",
  "password": "string",
  "extra": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "wallets": [
    {
      "id": "string",
      "admin": "string",
      "name": "string",
      "user": "string",
      "adminkey": "string",
      "inkey": "string"
    }
  ]
}

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
PUT
/usermanager/api/v1/users/{user_id}
Update a user

Update a user
Parameters
Name	Description
user_id *
string
(path)
	
Request body

{
  "user_name": "string",
  "extra": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}

Responses
Code	Description	Links
200	

Updated user
Media type
Controls Accept header.

{
  "id": "string",
  "name": "string",
  "admin": "string",
  "email": "string",
  "password": "string",
  "extra": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "wallets": [
    {
      "id": "string",
      "admin": "string",
      "name": "string",
      "user": "string",
      "adminkey": "string",
      "inkey": "string"
    }
  ]
}

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
DELETE
/usermanager/api/v1/users/{user_id}
Delete a user
POST
/usermanager/api/v1/extensions
Extension Toggle

Extension Toggle
Parameters
Name	Description
extension *
string
(query)
	
userid *
string
(query)
	
active *
boolean
(query)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

{
  "additionalProp1": "string",
  "additionalProp2": "string",
  "additionalProp3": "string"
}

	No links
404	

User does not exist.
	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
GET
/usermanager/api/v1/wallets
Get all user wallets

Get all user wallets
Parameters

No parameters
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

[
  {
    "id": "string",
    "admin": "string",
    "name": "string",
    "user": "string",
    "adminkey": "string",
    "inkey": "string"
  }
]

	No links
POST
/usermanager/api/v1/wallets
Create wallet for user

Create wallet for user
Parameters

No parameters
Request body

{
  "user_id": "string",
  "wallet_name": "string"
}

Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

{
  "id": "string",
  "admin": "string",
  "name": "string",
  "user": "string",
  "adminkey": "string",
  "inkey": "string"
}

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
GET
/usermanager/api/v1/transactions/{wallet_id}
Get all wallet transactions

Get all wallet transactions
Parameters
Name	Description
wallet_id *
any
(path)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

[
  {
    "status": "string",
    "pending": true,
    "checking_id": "string",
    "amount": 0,
    "fee": 0,
    "memo": "string",
    "time": 0,
    "bolt11": "string",
    "preimage": "string",
    "payment_hash": "string",
    "expiry": 0,
    "extra": {},
    "wallet_id": "string",
    "webhook": "string",
    "webhook_status": 0
  }
]

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
GET
/usermanager/api/v1/wallets/{user_id}
Get user wallet

Get user wallet
Parameters
Name	Description
user_id *
any
(path)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

[
  {
    "id": "string",
    "admin": "string",
    "name": "string",
    "user": "string",
    "adminkey": "string",
    "inkey": "string"
  }
]

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

	No links
DELETE
/usermanager/api/v1/wallets/{wallet_id}
Delete wallet by id

Delete wallet by id
Parameters
Name	Description
wallet_id *
any
(path)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

"string"

	No links
422	

Validation Error
Media type

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

