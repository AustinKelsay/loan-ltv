Payments
GET
/api/v1/payments
get list of payments
Parameters
Name	Description
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
status
string
(query)
	

Supports Filtering. Supports Search
tag
string
(query)
	

Supports Filtering. Supports Search
checking_id
string
(query)
	

Supports Filtering
amount
integer
(query)
	

Supports Filtering. Supports Search
fee
integer
(query)
	

Supports Filtering
memo
string
(query)
	

Supports Filtering. Supports Search
time
string($date-time)
(query)
	

Supports Filtering. Supports Search
preimage
string
(query)
	

Supports Filtering
payment_hash
string
(query)
	

Supports Filtering
wallet_id
string
(query)
	

Supports Filtering. Supports Search
Responses
Code	Description	Links
200	

list of payments
Media type
Controls Accept header.

[
  {
    "checking_id": "string",
    "payment_hash": "string",
    "wallet_id": "string",
    "amount": 0,
    "fee": 0,
    "bolt11": "string",
    "status": "pending",
    "memo": "string",
    "expiry": "2025-06-03T17:48:41.756Z",
    "webhook": "string",
    "webhook_status": "string",
    "preimage": "string",
    "tag": "string",
    "extension": "string",
    "time": "2025-06-03T17:48:41.757Z",
    "created_at": "2025-06-03T17:48:41.757Z",
    "updated_at": "2025-06-03T17:48:41.757Z",
    "extra": {}
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
/api/v1/payments
Create or pay an invoice

This endpoint can be used both to generate and pay a BOLT11 invoice. To generate a new invoice for receiving funds into the authorized account, specify at least the first four fields in the POST body: out: false, amount, unit, and memo. To pay an arbitrary invoice from the funds already in the authorized account, specify out: true and use the bolt11 field to supply the BOLT11 invoice to be paid.
Parameters

No parameters
Request body

{
  "unit": "sat",
  "internal": false,
  "out": true,
  "amount": 0,
  "memo": "string",
  "description_hash": "string",
  "unhashed_description": "string",
  "expiry": 0,
  "extra": {},
  "webhook": "string",
  "bolt11": "string",
  "lnurl_callback": "string"
}

Responses
Code	Description	Links
201	

Successful Response
Media type
Controls Accept header.

{
  "checking_id": "string",
  "payment_hash": "string",
  "wallet_id": "string",
  "amount": 0,
  "fee": 0,
  "bolt11": "string",
  "status": "pending",
  "memo": "string",
  "expiry": "2025-06-03T17:48:41.762Z",
  "webhook": "string",
  "webhook_status": "string",
  "preimage": "string",
  "tag": "string",
  "extension": "string",
  "time": "2025-06-03T17:48:41.762Z",
  "created_at": "2025-06-03T17:48:41.762Z",
  "updated_at": "2025-06-03T17:48:41.762Z",
  "extra": {}
}

	No links
400	

Invalid BOLT11 string or missing fields.
	No links
401	

Invoice (or Admin) key required.
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
520	

Payment or Invoice error.
	No links
GET
/api/v1/payments/history
Get Payments History
Parameters
Name	Description
group
string
(query)
	

Available values : hour, day, month

Default value : day
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
status
string
(query)
	

Supports Filtering. Supports Search
tag
string
(query)
	

Supports Filtering. Supports Search
checking_id
string
(query)
	

Supports Filtering
amount
integer
(query)
	

Supports Filtering. Supports Search
fee
integer
(query)
	

Supports Filtering
memo
string
(query)
	

Supports Filtering. Supports Search
time
string($date-time)
(query)
	

Supports Filtering. Supports Search
preimage
string
(query)
	

Supports Filtering
payment_hash
string
(query)
	

Supports Filtering
wallet_id
string
(query)
	

Supports Filtering. Supports Search
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

[
  {
    "date": "2025-06-03T17:48:41.779Z",
    "income": 0,
    "spending": 0,
    "balance": 0
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
/api/v1/payments/stats/count
Get Payments History For All Users
Parameters
Name	Description
count_by
string
(query)
	

Available values : status, tag, extension, wallet_id

Default value : tag
usr
string($uuid4)
(query)
	
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
status
string
(query)
	

Supports Filtering. Supports Search
tag
string
(query)
	

Supports Filtering. Supports Search
checking_id
string
(query)
	

Supports Filtering
amount
integer
(query)
	

Supports Filtering. Supports Search
fee
integer
(query)
	

Supports Filtering
memo
string
(query)
	

Supports Filtering. Supports Search
time
string($date-time)
(query)
	

Supports Filtering. Supports Search
preimage
string
(query)
	

Supports Filtering
payment_hash
string
(query)
	

Supports Filtering
wallet_id
string
(query)
	

Supports Filtering. Supports Search
cookie_access_token
string
(cookie)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

[
  {
    "field": "",
    "total": 0
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
/api/v1/payments/stats/wallets
Get Payments History For All Users
Parameters
Name	Description
usr
string($uuid4)
(query)
	
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
status
string
(query)
	

Supports Filtering. Supports Search
tag
string
(query)
	

Supports Filtering. Supports Search
checking_id
string
(query)
	

Supports Filtering
amount
integer
(query)
	

Supports Filtering. Supports Search
fee
integer
(query)
	

Supports Filtering
memo
string
(query)
	

Supports Filtering. Supports Search
time
string($date-time)
(query)
	

Supports Filtering. Supports Search
preimage
string
(query)
	

Supports Filtering
payment_hash
string
(query)
	

Supports Filtering
wallet_id
string
(query)
	

Supports Filtering. Supports Search
cookie_access_token
string
(cookie)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

[
  {
    "wallet_id": "",
    "wallet_name": "",
    "user_id": "",
    "payments_count": 0,
    "balance": 0
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
/api/v1/payments/stats/daily
Get Payments History Per Day
Parameters
Name	Description
usr
string($uuid4)
(query)
	
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
status
string
(query)
	

Supports Filtering. Supports Search
tag
string
(query)
	

Supports Filtering. Supports Search
checking_id
string
(query)
	

Supports Filtering
amount
integer
(query)
	

Supports Filtering. Supports Search
fee
integer
(query)
	

Supports Filtering
memo
string
(query)
	

Supports Filtering. Supports Search
time
string($date-time)
(query)
	

Supports Filtering. Supports Search
preimage
string
(query)
	

Supports Filtering
payment_hash
string
(query)
	

Supports Filtering
wallet_id
string
(query)
	

Supports Filtering. Supports Search
cookie_access_token
string
(cookie)
	
Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

[
  {
    "date": "2025-06-03T17:48:41.833Z",
    "balance": 0,
    "balance_in": 0,
    "balance_out": 0,
    "payments_count": 0,
    "count_in": 0,
    "count_out": 0,
    "fee": 0
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
/api/v1/payments/paginated
get paginated list of payments
Parameters
Name	Description
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
status
string
(query)
	

Supports Filtering. Supports Search
tag
string
(query)
	

Supports Filtering. Supports Search
checking_id
string
(query)
	

Supports Filtering
amount
integer
(query)
	

Supports Filtering. Supports Search
fee
integer
(query)
	

Supports Filtering
memo
string
(query)
	

Supports Filtering. Supports Search
time
string($date-time)
(query)
	

Supports Filtering. Supports Search
preimage
string
(query)
	

Supports Filtering
payment_hash
string
(query)
	

Supports Filtering
wallet_id
string
(query)
	

Supports Filtering. Supports Search
Responses
Code	Description	Links
200	

list of payments
Media type
Controls Accept header.

{
  "data": [
    "string"
  ],
  "total": 0
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
/api/v1/payments/all/paginated
get paginated list of payments
Parameters
Name	Description
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
usr
string($uuid4)
(query)
	
status
string
(query)
	

Supports Filtering. Supports Search
tag
string
(query)
	

Supports Filtering. Supports Search
checking_id
string
(query)
	

Supports Filtering
amount
integer
(query)
	

Supports Filtering. Supports Search
fee
integer
(query)
	

Supports Filtering
memo
string
(query)
	

Supports Filtering. Supports Search
time
string($date-time)
(query)
	

Supports Filtering. Supports Search
preimage
string
(query)
	

Supports Filtering
payment_hash
string
(query)
	

Supports Filtering
wallet_id
string
(query)
	

Supports Filtering. Supports Search
cookie_access_token
string
(cookie)
	
Responses
Code	Description	Links
200	

list of payments
Media type
Controls Accept header.

{
  "data": [
    "string"
  ],
  "total": 0
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
/api/v1/payments/fee-reserve
Api Payments Fee Reserve
Parameters
Name	Description
invoice
string
(query)
	

Default value : invoice
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

	No links
POST
/api/v1/payments/lnurl
Api Payments Pay Lnurl
Parameters

No parameters
Request body

{
  "description_hash": "string",
  "callback": "string",
  "amount": 0,
  "comment": "string",
  "description": "string",
  "unit": "string"
}

Responses
Code	Description	Links
200	

Successful Response
Media type
Controls Accept header.

{
  "checking_id": "string",
  "payment_hash": "string",
  "wallet_id": "string",
  "amount": 0,
  "fee": 0,
  "bolt11": "string",
  "status": "pending",
  "memo": "string",
  "expiry": "2025-06-03T17:48:41.872Z",
  "webhook": "string",
  "webhook_status": "string",
  "preimage": "string",
  "tag": "string",
  "extension": "string",
  "time": "2025-06-03T17:48:41.872Z",
  "created_at": "2025-06-03T17:48:41.872Z",
  "updated_at": "2025-06-03T17:48:41.873Z",
  "extra": {}
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
/api/v1/payments/{payment_hash}
Api Payment
Parameters
Name	Description
payment_hash *
any
(path)
	
x-api-key
string
(header)
	
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

	No links
POST
/api/v1/payments/decode
Api Payments Decode
Parameters

No parameters
Request body

{
  "data": "string",
  "filter_fields": []
}

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

	No links
POST
/api/v1/payments/{payment_request}/pay-with-nfc
Api Payment Pay With Nfc
Parameters
Name	Description
payment_request *
string
(path)
	
Request body

{
  "lnurl_w": "string"
}

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
