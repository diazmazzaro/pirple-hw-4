# pirple-hw-3

Pirple Homework Assignment #3
***
# Summary
### Landing page
![alt text](https://github.com/diazmazzaro/pirple-hw-3/blob/master/docs/2.png?raw=true "landing")
### Sign In
![alt text](https://github.com/diazmazzaro/pirple-hw-3/blob/master/docs/3.png?raw=true "landing")
### Login
![alt text](https://github.com/diazmazzaro/pirple-hw-3/blob/master/docs/4.png?raw=true "landing")
### Orders history
![alt text](https://github.com/diazmazzaro/pirple-hw-3/blob/master/docs/5.png?raw=true "landing")
### Book an order
![alt text](https://github.com/diazmazzaro/pirple-hw-3/blob/master/docs/6.png?raw=true "landing")
### Checkout
![alt text](https://github.com/diazmazzaro/pirple-hw-3/blob/master/docs/7.png?raw=true "landing")

***
# API
This API provides all endpoints for a Pizza Delivery application.

## 1. Security

The application security is based on __Tokens__. You can get a token by tokens endpoint, using user's email and password.

_POST_ body to __~/tokens__
```javascript
{
	"email" : "mail@server.com",
	"password" : "12345678"
}
```
Response
```javascript
{
    "email": "mail@server.com",
    "id": "vh6tvkd3vj0ylsg4kvqt",
    "expires": 1544311736418
}
```
Also you can __extend__ token's live by _put_ method or __delete__ by _delete_ method

### Use token
Always add the token header.
```
token:e666uvyq3d1j3mo02gju
```

## 2. Users

Endpoint for user management.
### Create User
_POST_ body to __~/users__
```javascript
{
	"firstName" : "test",
	"lastName" : "user",
	"phone" : "4567121322",
	"email" : "test@gmail.com",
	"address" : "5th street, CA",
	"password" : "12345678",
	"tosAgreement" : true
}
```
Response
```javascript
{ }
```

### Update User
_PUT_ body to __~/users__ (email is the key for users)
```javascript
{
	"email" : "test@gmail.com",
	"address" : "NEW street, CA"
}
```
Response
```javascript
{ }
```

### Delete User
_DELETE_ body to __~/users__ (Only email is required)
```javascript
{
	"email" : "test@gmail.com"
}
```
Response
```javascript
{ }
```

### Get User
_GET_ to __~/users__ (Only email is required)
You can get by body:
```javascript
{
	"email" : "test@gmail.com"
}
```

Or you can get by query url:
```javascript
~/users?email=test@gmail.com
```
Response
```javascript
{
	"firstName" : "test",
	"lastName" : "user",
	"phone" : "4567121322",
	"email" : "test@gmail.com",
	"address" : "5th street, CA",
	"tosAgreement" : true
}
```

## 3. Menus

Endpoint for menus listing.

### Get especific menu item
_GET_ to __~/menus__ (email and menu id is required)
```javascript
~/menus?email=test@gmail.com&menuid=menu1
```
Response
```javascript
{
    "id": "menu1",
    "name": "GODFATHER",
    "description": "Pepperoni, fresh tomato, capsicum, Italian sausage, olives, oregano & garlic sauce",
    "price": 3.2
}
```
### Get menu items list
_GET_ to __~/menus__ (email  is required)
```javascript
~/menus?email=test@gmail.com
```
Response
```javascript
[
    {
        "id": "menu1",
        "name": "GODFATHER",
        "description": "Pepperoni, fresh tomato, capsicum, Italian sausage, olives, oregano & garlic sauce",
        "price": 3.2
    },
    {
        "id": "menu2",
        "name": "CHICKEN, BACON & AVOCADO",
        "description": "Succulent seasoned chicken, Avocado, crispy rasher bacon, red onion topped with hollandaise sauce and spring onion.",
        "price": 4.15
    },
    {
        "id": "menu3",
        "name": "MEGA MEATLOVERS",
        "description": "Succulent chicken, Italian sausage, crispy rasher bacon, ground beef, pepperoni, pork & fennel sausage topped with Hickory BBQ sauce",
        "price": 4.98
    },
    {
        "id": "menu4",
        "name": "CHEESY CHICKEN, BACON & CHORIZO",
        "description": "Succulent seasoned chicken, Spanish style chorizo, crispy rasher bacon, fire roasted peppers, red onion topped with lots of stretchy mozzarella.",
        "price": 3.15
    }
]
```
## 4. Orders

This endpoint provides the methods to add items to user shopping bag. You can add as many items as you want (no limit).

### Add menu item to shipping bag
_POST_ body to __~/orders__ (email and menu id is required)
```javascript
{
	"menuId" : "menu1",
	"email" : "test@gmail.com"
}
```
Response
```javascript
{ }
```

### Remove menu item to shipping bag
_DELTE_ body to __~/orders__ (email and menu id is required) (if you have many itemes for the same menu, this method only remove one)
```javascript
{
	"menuId" : "menu1",
	"email" : "test@gmail.com"
}
```
Response
```javascript
{ }
```

### Get orders in the bag
_GET_ body to __~/orders__ (email is required) 
```javascript
{
	"email" : "test@gmail.com"
}
```

Response
```javascript
{
    "userId": "test_gmail.com",
    "email": "test@gmail.com",
    "orders": [
        {
            "menuId": "menu1",
            "price": 3.2,
            "purchased": false
        },
        {
            "menuId": "menu1",
            "price": 3.2,
            "purchased": false
        }
    ]
}
```


## 5. Checkout

Final step, this Endpoint can list the orders that are going to be purchased and execute the checkout process (Using __Stripe__ for credit card payment and __Mailgun__ for receipt mailing)

### Get amount to ckeckout
_GET_ body to __~/checkout__ (email is required) 
```javascript
{
	"email" : "test@gmail.com"
}
```

Response
```javascript
{
    "userId": "diazmazzaro_gmail.com",
    "total": 3.2,
    "count": 1
}
```

### Ckeckout by Stripe
_POST_ body to __~/checkout__ (email is required) 
```javascript
{
	"email" : "test@gmail.com"
}
```

Response
```javascript
{ }
```

### Warnings
When any external APIs fails this method response a __waring__ massage.

Ex. Response
```javascript
{
    "warning": {
        "statusCode": 400,
        "error": {
            "message": "exposed account credentials"
        }
    }
}
```
