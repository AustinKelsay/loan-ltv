Open API Client
Powered by Scalar

v1.0.0
OAS 3.1.0
Voltage Payments API

Download OpenAPI Document

Download OpenAPI Document
API documentation for Voltage Payments

Server
Server:
https://voltageapi.com/v1

Authentication
Required

Selected Auth Type:api_key
Environment api key used to authenticate

Name
:
x-api-key
Value
:
QUxMIFlPVVIgQkFTRSBBUkUgQkVMT05HIFRPIFVT
Show Password
Client Libraries
Curl Shell
Wallets ​#Copy link
Manage wallets in an organization

WalletsOperations
get
organizations/{organization_id}/wallets
post
organizations/{organization_id}/wallets
get
organizations/{organization_id}/wallets/{wallet_id}
delete
organizations/{organization_id}/wallets/{wallet_id}
get
organizations/{organization_id}/wallets/{wallet_id}/ledger
Get all wallets in an organization​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to create the wallet in

Responses

200
Successfully retrieved organization's wallets

application/json
400
Badly formatted request

403
No access to retrieve the organization's wallets, organization READ access required

404
No wallet found for given organization_id in provided organization

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/wallets
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/wallets' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/wallets)
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "active": true,
    "created_at": "2025-06-11T17:17:51.606Z",
    "updated_at": "2025-06-11T17:17:51.606Z",
    "deleted_at": null,
    "deletion_failed_at": null,
    "name": "string",
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "environment_id": "123e4567-e89b-12d3-a456-426614174000",
    "limit": null,
    "line_of_credit_id": null,
    "network": "mainnet",
    "metadata": null,
    "balances": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "wallet_id": "123e4567-e89b-12d3-a456-426614174000",
        "effective_time": "2025-06-11T17:17:51.606Z",
        "available": {
          "amount": 100000000,
          "currency": "btc",
          "negative": false,
          "unit": "msat"
        },
        "total": {
          "amount": 100000000,
          "currency": "btc",
          "negative": false,
          "unit": "msat"
        },
        "network": "mainnet",
        "currency": "btc"
      }
    ],
    "holds": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "amount": {
          "amount": 100000000,
          "currency": "btc",
          "negative": false,
          "unit": "msat"
        },
        "effective_time": "2025-06-11T17:17:51.606Z"
      }
    ],
    "error": null
  }
]
Successfully retrieved organization's wallets

Create a new wallet​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to create the wallet in

Body
required
application/json
id
Type:Currency
Format:uuid
required
environment_id
Type:Currency
Format:uuid
required
line_of_credit_id
Type:Currency
Format:uuid
required
name
Type:Currency
required
network
Type:Currency
enum
required
mainnet
testnet3
mutinynet
limit
Type:BtcAmount
Format:u-int64
min: 
1
required
Example
metadata
Type:object | null
Responses
202
Successfully requested a new wallet be created

400
Badly formatted request

403
No access to create a wallet, organization WRITE access required

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/wallets
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/wallets' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN' \
  --data '{
  "environment_id": "123e4567-e89b-12d3-a456-426614174000",
  "id": "7a68a525-9d11-4c1e-a3dd-1c2bf1378ba2",
  "limit": 100000000,
  "line_of_credit_id": "7df75323-84f1-4699-97da-776380a0aa81",
  "metadata": {
    "tag": "testing wallet"
  },
  "name": "testing",
  "network": "mutinynet"
}'

Test Request
(post organizations/{organization_id}/wallets)
Status:202
Status:400
Status:403
Status:500
No Body
Successfully requested a new wallet be created

Get a wallet​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to create the wallet in

wallet_id
Type:Currency
Format:uuid
required
Wallet ID to retrieve

Responses

200
Successfully retrieved a wallet

application/json
400
Badly formatted request

403
No access to retrieve the wallet, organization READ access required

404
No wallet found for given id in provided organization

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/wallets/{wallet_id}
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/wallets/{wallet_id}' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/wallets/{wallet_id})
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "active": true,
  "created_at": "2025-06-11T17:17:51.606Z",
  "updated_at": "2025-06-11T17:17:51.606Z",
  "deleted_at": null,
  "deletion_failed_at": null,
  "name": "string",
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "environment_id": "123e4567-e89b-12d3-a456-426614174000",
  "limit": null,
  "line_of_credit_id": null,
  "network": "mainnet",
  "metadata": null,
  "balances": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "wallet_id": "123e4567-e89b-12d3-a456-426614174000",
      "effective_time": "2025-06-11T17:17:51.606Z",
      "available": {
        "amount": 100000000,
        "currency": "btc",
        "negative": false,
        "unit": "msat"
      },
      "total": {
        "amount": 100000000,
        "currency": "btc",
        "negative": false,
        "unit": "msat"
      },
      "network": "mainnet",
      "currency": "btc"
    }
  ],
  "holds": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "amount": {
        "amount": 100000000,
        "currency": "btc",
        "negative": false,
        "unit": "msat"
      },
      "effective_time": "2025-06-11T17:17:51.606Z"
    }
  ],
  "error": null
}
Successfully retrieved a wallet

Delete a wallet​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to delete the wallet in

wallet_id
Type:Currency
Format:uuid
required
Wallet ID to delete

Responses
200
Successfully deleted wallet

400
Badly formatted request

403
No access to delete a wallet, organization WRITE access required

404
No wallet found for given id in provided organization

500
Server failed to complete the request

Request Example for
delete
organizations/{organization_id}/wallets/{wallet_id}
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/wallets/{wallet_id}' \
  --request DELETE \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(delete organizations/{organization_id}/wallets/{wallet_id})
Status:200
Status:400
Status:403
Status:404
Status:500
No Body
Successfully deleted wallet

Get a wallet's transaction history​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to create the wallet in

wallet_id
Type:Currency
Format:uuid
required
Wallet ID to retrieve the ledger for

Query Parameters
offset
Type:integer | null
Format:u-int32
min: 
0
limit
Type:integer | null
Format:u-int32
min: 
0
payment_id
Type:string | null
Format:uuid
start_date
Type:string | null
Format:date-time
end_date
Type:string | null
Format:date-time
sort_key
Type:Currency
enum
nullable
effective_time
message_time
time_and_effective_time
sort_order
Type:Currency
enum
nullable
ASC
DESC
Responses

200
Successfully retrieved a wallet's ledger

application/json
400
Badly formatted request

403
No access to retrieve the wallet ledger, organization READ access required

404
No wallet found for given id in provided organization

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/wallets/{wallet_id}/ledger
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/wallets/{wallet_id}/ledger' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/wallets/{wallet_id}/ledger)
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "items": [
    {
      "credit_id": "123e4567-e89b-12d3-a456-426614174000",
      "payment_id": "123e4567-e89b-12d3-a456-426614174000",
      "amount_msats": 1,
      "currency": "btc",
      "effective_time": "2025-06-11T17:17:51.606Z",
      "type": "credited"
    }
  ],
  "offset": 1,
  "limit": 1,
  "total": 1
}
Successfully retrieved a wallet's ledger

Payments ​#Copy link
Manage payments in an organization

PaymentsOperations
get
organizations/{organization_id}/environments/{environment_id}/payments
post
organizations/{organization_id}/environments/{environment_id}/payments
get
organizations/{organization_id}/environments/{environment_id}/payments/{payment_id}
get
organizations/{organization_id}/environments/{environment_id}/payments/{payment_id}/history
Get all payments for an organization​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID the payment is in

environment_id
Type:Currency
Format:uuid
required
Environment ID the payment is in

Query Parameters
offset
Type:integer | null
Format:u-int32
min: 
0
limit
Type:integer | null
Format:u-int32
min: 
0
wallet_id
Type:string | null
Format:uuid
statuses
Type:array | null
sort_key
Type:Currency
enum
nullable
created_at
updated_at
sort_order
Type:Currency
enum
nullable
ASC
DESC
kind
Type:Currency
enum
nullable
bolt11
onchain
bip21
direction
Type:Currency
enum
nullable
send
receive
end_date
Type:string | null
Format:date-time
start_date
Type:string | null
Format:date-time
Responses

200
Successfully found the payment

application/json
400
Badly formatted request

403
No access to get a payment, organization READ access required

404
No payment with that ID found in this organization and environment

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/environments/{environment_id}/payments
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/payments' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/environments/{environment_id}/payments)
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "items": [
    {
      "created_at": "2024-11-21T18:47:04.008Z",
      "currency": "btc",
      "data": {
        "amount_msats": 150000,
        "max_fee_msats": 1000,
        "memo": "testing",
        "payment_request": "lntbs1500n1pn5w25ypp59sfhx5llskdp6rmsmmq3zs86xey6l4y9wkzvkjl5v2cw0ex7xd4sdqqcqzzsxqyz5vqsp5u333jtc7lh0qvkusq5ntcpm3n2jjx6tw8jz7zvpqpnt3v8e572eq9qxpqysgq4hm7n79tnk76j4ll4f7ey9mmxdyj5pwzcmyqgxtgz40vjg9w58wq73040qvuurj83jakt2zws6y9qgzg2f6gtnj3ajf0mj4gw4mdt2cqhr2tpz"
      },
      "direction": "send",
      "environment_id": "123e4567-e89b-12d3-a456-426614174000",
      "error": null,
      "id": "3e84b6c5-5bbe-4e0f-9fb3-f1198330f6fa",
      "organization_id": "b0684ab8-1130-46af-8f70-71519442f108",
      "status": "sending",
      "type": "bolt11",
      "updated_at": "2024-11-21T18:47:04.008Z",
      "wallet_id": "7a68a525-9d11-4c1e-a3dd-1c2bf1378ba2"
    },
    {
      "created_at": "2025-02-12T21:22:50.30219Z",
      "currency": "btc",
      "data": {
        "address": "tb1pzkhtj4ld86g9c49du5yagnncfrm0s489t76vmrwmt2ecxfnf7spsvjte49",
        "amount_sats": 150000,
        "fees_sats": 10,
        "label": null,
        "max_fee_sats": 1000,
        "receipts": [
          {
            "amount_sats": 10000,
            "height_mined_at": 1888021,
            "ledger_id": "0c16fd8e-ce4d-42fe-9d0b-3069244eb66c",
            "required_confirmations_num": 1,
            "tx_id": "a22ec88f7a84a705466c9cd8d37024155ffa7930300fcee4fed9e5cc4e25904e"
          }
        ]
      },
      "direction": "send",
      "environment_id": "123e4567-e89b-12d3-a456-426614174000",
      "error": null,
      "id": "2ec1e783-19b4-4c10-8181-66336a6232bd",
      "organization_id": "b0684ab8-1130-46af-8f70-71519442f108",
      "status": "completed",
      "type": "onchain",
      "updated_at": "2025-02-12T21:22:52.407189Z",
      "wallet_id": "7a68a525-9d11-4c1e-a3dd-1c2bf1378ba2"
    },
    {
      "created_at": "2024-11-21T18:47:04.008Z",
      "currency": "btc",
      "data": {
        "amount_msats": 150000,
        "memo": "testing",
        "payment_request": "lntbs1500n1pn5w25ypp59sfhx5llskdp6rmsmmq3zs86xey6l4y9wkzvkjl5v2cw0ex7xd4sdqqcqzzsxqyz5vqsp5u333jtc7lh0qvkusq5ntcpm3n2jjx6tw8jz7zvpqpnt3v8e572eq9qxpqysgq4hm7n79tnk76j4ll4f7ey9mmxdyj5pwzcmyqgxtgz40vjg9w58wq73040qvuurj83jakt2zws6y9qgzg2f6gtnj3ajf0mj4gw4mdt2cqhr2tpz"
      },
      "direction": "receive",
      "environment_id": "123e4567-e89b-12d3-a456-426614174000",
      "error": null,
      "id": "11ca843c-bdaa-44b6-965a-39ac550fcef7",
      "organization_id": "b0684ab8-1130-46af-8f70-71519442f108",
      "status": "receiving",
      "type": "bolt11",
      "updated_at": "2024-11-21T18:47:04.008Z",
      "wallet_id": "7a68a525-9d11-4c1e-a3dd-1c2bf1378ba2"
    },
    {
      "created_at": "2025-02-12T21:21:21.744713Z",
      "currency": "btc",
      "data": {
        "address": "tb1pzkhtj4ld86g9c49du5yagnncfrm0s489t76vmrwmt2ecxfnf7spsvjte49",
        "amount_sats": 1500000,
        "label": "test payment",
        "outflows": [
          {
            "amount_sats": 10000,
            "height_mined_at": 1888021,
            "ledger_id": "03d87c6d-2cf8-414b-929a-eceeb4c896ed",
            "required_confirmations_num": 1,
            "tx_id": "a22ec88f7a84a705466c9cd8d37024155ffa7930300fcee4fed9e5cc4e25904e"
          }
        ]
      },
      "direction": "receive",
      "environment_id": "123e4567-e89b-12d3-a456-426614174000",
      "error": null,
      "id": "0a24c349-55d0-473e-9c03-155f884f1867",
      "organization_id": "b0684ab8-1130-46af-8f70-71519442f108",
      "status": "completed",
      "type": "onchain",
      "updated_at": "2025-02-12T21:23:03.173159Z",
      "wallet_id": "7a68a525-9d11-4c1e-a3dd-1c2bf1378ba2"
    }
  ],
  "limit": 100,
  "offset": 0,
  "total": 4
}
Successfully found the payment

Create a new payment​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to create the payment in

environment_id
Type:Currency
Format:uuid
required
Environment ID to create the payment in

Body
required
application/json

One of
object
When the payment_request has no amount (decodes to 0 or 'any') we will require that the 'amount' is passed in as an argument When the payment_request has a specified amount the BOLT11-encoded amount is considered canonical/authoritative and we will error that the 'amount' in this enum does not match the payment_request decoded value

data
Type:Balance
Show Child Attributesfor data
type
Type:Currency
enum
const: 
bip21
bip21
id
Type:Currency
Format:uuid
required
wallet_id
Type:Currency
Format:uuid
required
currency
Type:Currency
enum
required
btc
usd
Responses
202
Successfully requested a new payment be created

400
Badly formatted request

403
No access to create a payment, organization WRITE access required

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/payments
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/payments' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN' \
  --data '{
  "amount_msats": 150000,
  "currency": "btc",
  "description": "Payment for services",
  "id": "11ca843c-bdaa-44b6-965a-39ac550fcef7",
  "payment_kind": "bip21",
  "wallet_id": "7a68a525-9d11-4c1e-a3dd-1c2bf1378ba2"
}'
Selected Example Values:Receive BIP21 Payment Example


Test Request
(post organizations/{organization_id}/environments/{environment_id}/payments)
Status:202
Status:400
Status:403
Status:500
No Body
Successfully requested a new payment be created

Get a payment for an organization​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID the payment is in

environment_id
Type:Currency
Format:uuid
required
Environment ID the payment is in

payment_id
Type:Currency
Format:uuid
required
Payment ID for the payment

Responses

200
Successfully found the payment

application/json
400
Badly formatted request

403
No access to get a payment, organization READ access required

404
No payment with that ID found in this organization and environment

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/environments/{environment_id}/payments/{payment_id}
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/payments/{payment_id}' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/environments/{environment_id}/payments/{payment_id})
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "created_at": "2024-11-21T18:47:04.008Z",
  "currency": "BTC",
  "data": {
    "amount_msats": 100000,
    "max_fee_msats": 1000,
    "memo": "testing",
    "payment_request": "lnbc100n1p3slw4kpp5z4ybq0q0j6wkrkk99s9xg8p7rugry2nl0y4h8srq0l80r8gf8jhsdqqcqzpgxqyz5vqsp5l5ft0c6h6p5ktkudznlddtnkk5zf7xgwsyqcqwwz2v8zrsm8d7q9qyyssq"
  },
  "direction": "send",
  "environment_id": "123e4567-e89b-12d3-a456-426614174000",
  "error": null,
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "sending",
  "type": "bolt11",
  "updated_at": "2024-11-21T18:47:04.008Z",
  "wallet_id": "123e4567-e89b-12d3-a456-426614174000"
}
Successfully found the payment

Get the history of a payment​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID the payment is in

environment_id
Type:Currency
Format:uuid
required
Environment ID the payment is in

payment_id
Type:Currency
Format:uuid
required
Payment ID for the payment

Responses

200
Successfully requested the history of a payment

application/json
400
Badly formatted request

403
No access to get this payment's history, organization READ access required

404
No payment with that ID found in this organization and environment

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/environments/{environment_id}/payments/{payment_id}/history
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/payments/{payment_id}/history' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/environments/{environment_id}/payments/{payment_id}/history)
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "events": [
    {
      "event_type": "string",
      "error": null,
      "time": "2025-06-11T17:17:51.606Z",
      "position": 1
    }
  ]
}
Successfully requested the history of a payment

Lines of Credit ​#Copy link
Manage lines of credit in an organization

Lines of CreditOperations
get
organizations/{organization_id}/lines_of_credit/{line_id}/summary
get
organizations/{organization_id}/lines_of_credit/summaries
Retrieve a summary of a line of credit​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to get the line of credit in

line_id
Type:Currency
Format:uuid
required
ID of line of credit to update

Responses

200
Successfully retrieved a line of credit summary

application/json
400
Badly formatted request

403
No access to retrieve the line of credit found, organization READ access required

404
No line of credit found for given id in provided organization

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/lines_of_credit/{line_id}/summary
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/lines_of_credit/{line_id}/summary' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/lines_of_credit/{line_id}/summary)
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "network": "mainnet",
  "environment_id": "123e4567-e89b-12d3-a456-426614174000",
  "limit": 1,
  "allocated_limit": 1,
  "currency": "btc",
  "status": null,
  "disabled_at": null
}
Successfully retrieved a line of credit summary

Retrieve summaries for all lines of credit for an organization​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to get the line of credit in

Responses

200
Successfully retrieved lines of credit

application/json
400
Badly formatted request

403
No access to retrieve the lines of credit found, organization WRITE access required

404
No lines of credit found in provided organization

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/lines_of_credit/summaries
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/lines_of_credit/summaries' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/lines_of_credit/summaries)
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "network": "mainnet",
    "environment_id": "123e4567-e89b-12d3-a456-426614174000",
    "limit": 1,
    "allocated_limit": 1,
    "currency": "btc",
    "status": null,
    "disabled_at": null
  }
]
Successfully retrieved lines of credit

Webhooks ​#Copy link
Manage webhooks in an organization

WebhooksOperations
get
organizations/{organization_id}/webhooks
post
organizations/{organization_id}/environments/{environment_id}/webhooks
get
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}
delete
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}
patch
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/keys
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/test
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/start
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/stop
get
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/abandon
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/retry
Get all webhooks for an organization and environment with filter​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to get webhooks from

Query Parameters
environment_ids
Type:array | null
statuses
Type:array | null
enum
active
stopped
deleted
sort_key
Type:Currency
enum
nullable
created_at
updated_at
sort_order
Type:Currency
enum
nullable
ASC
DESC
Responses

200
Successfully retrieved webhooks

application/json
400
Badly formatted request

403
No access to get webhooks, organization READ access required

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/webhooks
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/webhooks' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/webhooks)
Status:200
Status:400
Status:403
Status:500
Copy content
[
  {
    "created_at": "2025-04-29T17:09:11.299Z",
    "deleted_at": null,
    "environment_id": "123e4567-e89b-12d3-a456-426614174000",
    "events": [
      {
        "send": [
          "succeeded",
          "failed"
        ]
      },
      {
        "receive": [
          "generated",
          "refreshed",
          "expired",
          "succeeded",
          "completed",
          "failed"
        ]
      },
      {
        "test": [
          "created"
        ]
      }
    ],
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "some name",
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "active",
    "stopped_at": null,
    "updated_at": "2025-04-29T17:09:11.299Z",
    "url": "http://example.com"
  }
]
Selected Example Values:All Event Types Example

All Event Types Example
Create a new webhook​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to create the webhook in

environment_id
Type:Currency
Format:uuid
required
Environment ID to create the webhook in

Body
required
application/json
id
Type:Currency
Format:uuid
required
Example
url
Type:Currency
required
Example
name
Type:Currency
required
Example
events
Type:Currency
required
Example
Responses

202
Successfully requested a new webhook be created

application/json
400
Badly formatted request

403
No access to create a webhook, organization WRITE access required

409
Webhook already exists

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/webhooks
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN' \
  --data '{
  "id": "b0fc9829-f139-4035-bb14-4a4b6cd58f0e",
  "url": "https://example.com",
  "name": "some name",
  "events": [
    {
      "send": "succeeded"
    },
    {
      "send": "failed"
    },
    {
      "receive": "succeeded"
    },
    {
      "receive": "completed"
    },
    {
      "receive": "failed"
    }
  ]
}'

Test Request
(post organizations/{organization_id}/environments/{environment_id}/webhooks)
Status:202
Status:400
Status:403
Status:409
Status:500
Copy content
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "shared_secret": "vltg_GDtRrrJFJ6afRrAYMW3t9RpxgCdcT8zp"
}
Successfully requested a new webhook be created

Get a webhook​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to get webhook from

environment_id
Type:Currency
Format:uuid
required
Environment ID to get webhook from

webhook_id
Type:Currency
Format:uuid
required
ID of webhook to retrieve

Responses

200
Successfully retrieved webhook

application/json
400
Badly formatted request

403
No access to get webhook, organization READ access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id})
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "environment_id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://example.com",
  "name": "some name",
  "events": [
    {
      "send": "succeeded"
    }
  ],
  "status": "active",
  "created_at": "2025-06-11T17:17:51.606Z",
  "updated_at": "2025-06-11T17:17:51.606Z",
  "stopped_at": null,
  "deleted_at": null
}
Successfully retrieved webhook

Delete a webhook​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to delete webhook from

environment_id
Type:Currency
Format:uuid
required
Environment ID to delete webhook from

webhook_id
Type:Currency
Format:uuid
required
ID of webhook to delete

Responses
202
Successfully submitted delete webhook request

400
Badly formatted request

403
No access to delete webhook, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
delete
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}' \
  --request DELETE \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(delete organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id})
Status:202
Status:400
Status:403
Status:404
Status:500
No Body
Successfully submitted delete webhook request

Update webhook details​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to create the webhook in

environment_id
Type:Currency
Format:uuid
required
Environment ID to create the webhook in

webhook_id
Type:Currency
Format:uuid
required
Webhook ID to update

Body
required
application/json
url
Type:Currency
required
Example
name
Type:string | null
Example
events
Type:array Frozen[]
required
Provide all event types that the webhook should be subscribed, The event types array will be replaced entirely inline with JSON Merge Patch (RFC 7396)

Show Child Attributesfor events
Responses
202
Successfully requested update webhook

400
Badly formatted request

403
No access to update a webhook, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
patch
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}' \
  --request PATCH \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN' \
  --data '{
  "url": "https://example.com",
  "name": "some name",
  "events": [
    {
      "send": "succeeded"
    }
  ]
}'

Test Request
(patch organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id})
Status:202
Status:400
Status:403
Status:404
Status:500
No Body
Successfully requested update webhook

Generate new key for webhook​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to update the webhook in

environment_id
Type:Currency
Format:uuid
required
Environment ID to update the webhook in

webhook_id
Type:Currency
Format:uuid
required
Webhook ID to generate new key

Responses

202
Successfully requested a new webhook be created

application/json
400
Badly formatted request

403
No access to create a webhook, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/keys
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/keys' \
  --request POST \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(post organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/keys)
Status:202
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "shared_secret": "vltg_GDtRrrJFJ6afRrAYMW3t9RpxgCdcT8zp"
}
Successfully requested a new webhook be created

Test a webhook​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID of the webhook to use

environment_id
Type:Currency
Format:uuid
required
Environment ID of the webhook to use

webhook_id
Type:Currency
Format:uuid
required
Webhook to initiate the delivery on

Body
required
application/json
delivery_id
Type:Currency
Format:uuid
required
payload
required

One of
object
detail
Type:Balance
required
Show Child Attributesfor detail
type
Type:Currency
enum
const: 
send
required
send
Responses
202
Successfully requested a new webhook delivery be started with provided payload

400
Badly formatted request

403
No access to submit delivery via a webhook, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/test
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/test' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN' \
  --data '{
  "delivery_id": "123e4567-e89b-12d3-a456-426614174002",
  "payload": {
    "detail": {
      "data": {
        "created_at": "2024-11-21T19:15:22.123Z",
        "currency": "BTC",
        "data": {
          "amount_msats": 250000,
          "description": "Invoice for coffee",
          "payment_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
          "payment_request": "lnbc2500n1p3xyz123pp5mnrv3usmd97zu3venjxs8xtpy6x5vnryg69tc4p7syc875dajhsqdqqcqzpgxqyz5vqsp5ayzdef"
        },
        "direction": "receive",
        "environment_id": "123e4567-e89b-12d3-a456-426614174000",
        "error": null,
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "organization_id": "123e4567-e89b-12d3-a456-426614174000",
        "status": "pending",
        "type": "bolt11",
        "updated_at": "2024-11-21T19:15:22.123Z",
        "wallet_id": "123e4567-e89b-12d3-a456-426614174000"
      },
      "event": [
        "generated",
        "refreshed",
        "expired",
        "succeeded",
        "completed",
        "failed"
      ]
    },
    "type": "receive"
  }
}'
Selected Example Values:Test Receive Webhook Example

Test Receive Webhook Example

Test Request
(post organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/test)
Status:202
Status:400
Status:403
Status:404
Status:500
No Body
Successfully requested a new webhook delivery be started with provided payload

Start a webhook​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to start webhook from

environment_id
Type:Currency
Format:uuid
required
Environment ID to start webhook from

webhook_id
Type:Currency
Format:uuid
required
ID of webhook to start

Responses
202
Successfully submitted start webhook request

400
Badly formatted request

403
No access to start webhook, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/start
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/start' \
  --request POST \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(post organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/start)
Status:202
Status:400
Status:403
Status:404
Status:500
No Body
Successfully submitted start webhook request

Stop a webhook​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to stop webhooks from

environment_id
Type:Currency
Format:uuid
required
Environment ID to stop webhooks from

webhook_id
Type:Currency
Format:uuid
required
ID of Webhook to stop

Responses
202
Successfully submitted stop webhook request

400
Badly formatted request

403
No access to stop webhooks, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/stop
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/stop' \
  --request POST \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(post organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/stop)
Status:202
Status:400
Status:403
Status:404
Status:500
No Body
Successfully submitted stop webhook request

Get all webhook deliveries for a given webhook in an organization and environment with filter​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to get webhooks from

environment_id
Type:Currency
Format:uuid
required
Environment ID to get webhooks from

webhook_id
Type:Currency
Format:uuid
required
ID of Webhook to retrieve deliveries from

Query Parameters
statuses
Type:array | null
enum
Example
attempting
succeeded
failed
abandoned
sort_key
Type:Currency
enum
nullable
created_at
updated_at
sort_order
Type:Currency
enum
nullable
ASC
DESC
limit
Type:integer | null
Format:u-int32
min: 
0
offset
Type:integer | null
Format:u-int32
min: 
0
Responses

200
Successfully retrieved webhooks

application/json
400
Badly formatted request

403
No access to get webhooks, organization READ access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
get
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries' \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(get organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries)
Status:200
Status:400
Status:403
Status:404
Status:500
Copy content
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "webhook_id": "123e4567-e89b-12d3-a456-426614174000",
      "url": "https://example.com",
      "status": "succeeded",
      "payload": {
        "detail": {
          "event": "succeeded",
          "data": {
            "created_at": "2024-11-21T18:47:04.008Z",
            "currency": "BTC",
            "data": {
              "amount_msats": 100000,
              "max_fee_msats": 1000,
              "memo": "testing",
              "payment_request": "lnbc100n1p3slw4kpp5z4ybq0q0j6wkrkk99s9xg8p7rugry2nl0y4h8srq0l80r8gf8jhsdqqcqzpgxqyz5vqsp5l5ft0c6h6p5ktkudznlddtnkk5zf7xgwsyqcqwwz2v8zrsm8d7q9qyyssq"
            },
            "direction": "send",
            "environment_id": "123e4567-e89b-12d3-a456-426614174000",
            "error": null,
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "organization_id": "123e4567-e89b-12d3-a456-426614174000",
            "status": "sending",
            "type": "bolt11",
            "updated_at": "2024-11-21T18:47:04.008Z",
            "wallet_id": "123e4567-e89b-12d3-a456-426614174000"
          }
        },
        "type": "send"
      },
      "created_at": "2025-06-11T17:17:51.606Z",
      "updated_at": "2025-06-11T17:17:51.606Z",
      "attempt_count": 1,
      "error": null,
      "status_code": 200
    }
  ],
  "offset": 1,
  "limit": 1,
  "total": 1
}
Successfully retrieved webhooks

Abandon a webhook delivery​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID of the webhook to use

environment_id
Type:Currency
Format:uuid
required
Environment ID of the webhook to use

webhook_id
Type:Currency
Format:uuid
required
Webhook to abandon the delivery on

delivery_id
Type:Currency
Format:uuid
required
Delivery ID to abandon

Responses
202
Successfully requested an abandoned webhook delivery

400
Badly formatted request

403
No access to submit abandon via a webhook, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/abandon
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/abandon' \
  --request POST \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(post organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/abandon)
Status:202
Status:400
Status:403
Status:404
Status:500
No Body
Successfully requested an abandoned webhook delivery

Retry a webhook delivery​#Copy link
Path Parameters
organization_id
Type:Currency
Format:uuid
required
Organization ID to retry webhook from

environment_id
Type:Currency
Format:uuid
required
Environment ID to retry webhook from

webhook_id
Type:Currency
Format:uuid
required
ID of webhook to retry

delivery_id
Type:Currency
Format:uuid
required
ID of webhook delivery to retry

Responses
202
Successfully submitted delete webhook request

400
Badly formatted request

403
No access to retry webhook delivery, organization WRITE access required

404
Webhook does not exists

500
Server failed to complete the request

Request Example for
post
organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/retry
Selected HTTP client:Shell Curl

Curl
Copy content
curl 'https://voltageapi.com/v1/organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/retry' \
  --request POST \
  --header 'X-Api-Key: YOUR_SECRET_TOKEN'

Test Request
(post organizations/{organization_id}/environments/{environment_id}/webhooks/{webhook_id}/deliveries/{delivery_id}/retry)
Status:202
Status:400
Status:403
Status:404
Status:500
No Body
Successfully submitted delete webhook request

Onboarding (Collapsed)​#Copy link
Manage onboarding of an organization

Show More
Billing (Collapsed)​#Copy link
Manage bills in an organization

Show More
Models

Amount​#Copy link

Balance​#Copy link

BtcAmount​#Copy link

CapturedEvent​#Copy link

CollateralStatus​#Copy link

CreditedEvent​#Copy link

Currency​#Copy link

DeliveryStatus​#Copy link

EventHistory​#Copy link

EventTypes​#Copy link

Frozen​#Copy link

HeldEvent​#Copy link

Hold​#Copy link

Ledger​#Copy link

LedgerEvent​#Copy link

LedgerSortKey​#Copy link

Network​#Copy link

NewWalletRequest​#Copy link

NewWebhookRequest​#Copy link

OnChainPaymentFrozen​#Copy link

OnChainPaymentReceipt​#Copy link

Payload​#Copy link

Payment​#Copy link

PaymentDirection​#Copy link

PaymentFrozen​#Copy link

PaymentHistory​#Copy link

PaymentKind​#Copy link

PaymentReceiveType​#Copy link

PaymentRequest​#Copy link

PaymentSendType​#Copy link

PaymentTypeRequest​#Copy link

Payments​#Copy link

Reasons​#Copy link

ReceiveError​#Copy link

ReceiveEventTypes​#Copy link

ReceivePayload​#Copy link

ReceivePayment​#Copy link

ReceivePaymentRequest​#Copy link

ReceiveStatus​#Copy link

ReleasedEvent​#Copy link

SecuredStatus​#Copy link

SendError​#Copy link

SendEventTypes​#Copy link

SendPayload​#Copy link

SendPayment​#Copy link

SendPaymentRequest​#Copy link

SendStatus​#Copy link

SignedAmount​#Copy link

SortKey​#Copy link

SortOrder​#Copy link

SummaryLineOfCredit​#Copy link

SupportedNetwork​#Copy link

TestEventTypes​#Copy link

TestPayload​#Copy link

TestWebhookRequest​#Copy link

UpdateWebhookRequest​#Copy link

UsdAmount​#Copy link

VerifiedStatus​#Copy link

Wallet​#Copy link

WalletEventError​#Copy link

WebhookDeliveries​#Copy link

WebhookDeliveryRead​#Copy link

WebhookPlainSecret​#Copy link

WebhookRead​#Copy link

WebhookStatus​#Copy link