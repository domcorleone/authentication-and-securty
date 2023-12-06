# Levels of Authentication and Security

## Level 1 - Username and Password Only
Will use simply a text username and password
## Level 2 - Encryption
Will save the password into the databse as a encoded string
## Level 3 - Hashing with md5
It will convert pwd to hash with algorithm md5 
### Add Environment Vars
Wll add environment variable to hide any KEY, PASSWORDS or APY_KEY which prevents hackers from get access to this important peace of information that could lead to a disaster
## Level 4 - Hashing and Salting with bcrypt
Will convert pwd to hash using algorithm bcrypt and furthermore will be using salting round that allows to reenforce or reconvert each resultant hash according to the number defined in salting result
## Level 5 - Cookies and Sessions
This level uses passport.js for authentication
## Level 6 - Google OAuth 2.0 Authentication
