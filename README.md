# meetInCode_RESTful_API

> Project with Node.JS, Express, MongoDB (Cloud version - Atlas) and authorization wit JWT tokens.
> RESTful API of IT tech **Events** and associated with them **Talks** of specific topics. API provide possibility to register and log in, only logged users have access to specific routes. There will be implementation of **user's roles** to differ what user can do with data.
> Each **Talk** is connected to specific **Event**, witch might have many **Talks**. Specifying **Event** address geocoder API provide coordinates of place to Data Base.

---

### In project i use:

<p style="float: left">
<img src="http://www.tech-app.fr/wp-content/uploads/2015/04/nodejs.png" alt="Node.js" width="64" style="display: inline">
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS88qsrd0PXJzWBK2MYRgBWchcs-LMBYwBncfMuLDlAWjHbUXvGIw" alt="Express" width="64" style="display: inline">
<img src="https://www.mongodb.com/assets/images/global/leaf.png" alt="MongoDB" width="64" style="display: inline">
<img src="https://miro.medium.com/max/700/1*XkmnsJ6Joa6EDFVGUw0tfA.png" alt="JWT" width="128" style="display: inline">
</p>

---

### Build Setup

```bash
# install dependencies
npm i

# start server at localhost:5000
npm run dev
```

For app to work correctly you have to provide specific _.env_ file with this environment variables:

```bash
# .env

DB_CONNECT = ...
GEOCODE_API_KEY = ...
JWT_SECRET = ...
```
