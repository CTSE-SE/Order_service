# Order_service

📋 Complete Order Service Implementation
1. Project Structure

order-service/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── aws.js               # SQS client setup
│   │   └── redis.js             # Redis for caching (optional)
│   ├── models/
│   │   ├── Order.js             # Order model
│   │   └── OrderItem.js         # Order item model
│   ├── controllers/
│   │   └── order.controller.js
│   ├── services/
│   │   ├── order.service.js
│   │   ├── user.service.js      # HTTP client for User Service
│   │   ├── product.service.js   # HTTP client for Product Service
│   │   └── sqs.service.js       # SQS message publisher
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── routes/
│   │   └── order.routes.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── constants.js
│   ├── app.js
│   └── index.js
├── tests/
│   └── order.test.js
├── .github/
│   └── workflows/
│       └── deploy.yml
├── Dockerfile
├── docker-compose.yml
├── swagger.yaml
├── sonar-project.properties
├── package.json
├── .env.example
└── README.md
