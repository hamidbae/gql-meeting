## .env note

* **DB_CONNECT:** url mongodb
* **USER_SECRET_KEY:** secret key untuk membuat dan validasi user token jwt 
* **ADMIN_SECRET_KEY:** secret key untuk membuat dan validasi admin token jwt
* **MAIL_API:** mailgun api
* **MAIL_DOMAIN:** mailgun domain
* **MAIL_DOMAIN:** cloudinary clound name
* **MAIL_DOMAIN:** cloudinary api key
* **MAIL_DOMAIN:** cloudinary api secret

## creating user

karena ada image yang harus di upload oleh user, dan graphql hanya menerima data json, maka langkah pembuatan user harus dengan membuat url image terlebih dahulu dengan route {base_url}/user-image, ex:

```http://localhost:3000/image-url```
