const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Samurdhi Backend API',
    version: '1.0.0',
    description: 'API documentation for the Samurdhi backend.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
  tags: [
    { name: 'System', description: 'Service and health endpoints' },
    { name: 'Authentication', description: 'User login and registration' },
    { name: 'Users', description: 'Authenticated user endpoints' },
    { name: 'Banks', description: 'Bank management endpoints' },
    { name: 'Sectors', description: 'Sector management endpoints' },
  ],
  components: {
    securitySchemes: {
      authToken: {
        type: 'apiKey',
        in: 'header',
        name: 'x-auth-token',
        description: 'JWT returned by POST /api/auth',
      },
    },
    schemas: {
      UserRegistration: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 5, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 5 },
        },
      },
      UserCredentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 5 },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
      Bank: {
        type: 'object',
        required: ['name'],
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', minLength: 5, maxLength: 50 },
          overdueLoanAmount: { type: 'number', minimum: 0, maximum: 255 },
          overdueLoanQty: { type: 'integer', minimum: 0, maximum: 255 },
          InactiveLoanAmount: { type: 'number', minimum: 0, maximum: 255 },
          InactiveLoanQty: { type: 'integer', minimum: 0, maximum: 255 },
          customColumns: {
            type: 'array',
            readOnly: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                dataType: { type: 'string', enum: ['string', 'number', 'boolean', 'date', 'document'] },
              },
            },
          },
        },
      },
      BankColumns: {
        type: 'object',
        minProperties: 1,
        additionalProperties: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'date', 'document'],
        },
        example: {
          branchCount: 'number',
          isActive: 'boolean',
          openingDate: 'date',
        },
      },
      Sector: {
        type: 'object',
        required: ['name', 'bank', 'location'],
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', minLength: 3, maxLength: 100 },
          bank: { type: 'string', description: 'Bank ObjectId' },
          location: { type: 'string', minLength: 2, maxLength: 255 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Check API health',
        responses: { 200: { description: 'Service is healthy' } },
      },
    },
    '/api/user': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRegistration' } } },
        },
        responses: { 201: { description: 'User created' }, 400: { description: 'Validation error' } },
      },
    },
    '/api/auth': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate a user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCredentials' } } },
        },
        responses: { 200: { description: 'JWT token returned' }, 400: { description: 'Invalid credentials' } },
      },
    },
    '/api/user/me': {
      get: {
        tags: ['Users'],
        summary: 'Get the authenticated user',
        security: [{ authToken: [] }],
        responses: { 200: { description: 'User details' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/banks': {
      get: {
        tags: ['Banks'],
        summary: 'Get all banks',
        security: [{ authToken: [] }],
        responses: { 200: { description: 'List of banks' } },
      },
      post: {
        tags: ['Banks'],
        summary: 'Create a bank',
        security: [{ authToken: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Bank' } } },
        },
        responses: { 201: { description: 'Bank created' }, 400: { description: 'Validation error' } },
      },
    },
    '/api/banks/{id}/columns': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        tags: ['Banks'],
        summary: 'Add custom columns to a bank',
        description: 'Adds client-defined column names and data types to the bank definition.',
        security: [{ authToken: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BankColumns' } } },
        },
        responses: {
          201: { description: 'Bank columns added' },
          400: { description: 'Invalid bank id, column name, or data type' },
          404: { description: 'Bank not found' },
          409: { description: 'Column already exists' },
        },
      },
      '/api/banks/{id}/documents/{columnName}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'columnName', in: 'path', required: true, schema: { type: 'string' } },
        ],
        post: {
          tags: ['Banks'],
          summary: 'Upload a PDF custom column value',
          security: [{ authToken: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: { file: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
          responses: { 201: { description: 'PDF uploaded' }, 400: { description: 'Invalid PDF or column' }, 404: { description: 'Bank not found' } },
        },
        get: {
          tags: ['Banks'],
          summary: 'Download a PDF custom column value',
          security: [{ authToken: [] }],
          responses: { 200: { description: 'PDF document' }, 404: { description: 'Document not found' } },
        },
      },
    },
    '/api/banks/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Banks'],
        summary: 'Get one bank',
        security: [{ authToken: [] }],
        responses: { 200: { description: 'Bank details' }, 404: { description: 'Bank not found' } },
      },
      put: {
        tags: ['Banks'],
        summary: 'Update a bank',
        security: [{ authToken: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Bank' } } },
        },
        responses: { 200: { description: 'Bank updated' }, 400: { description: 'Validation error' } },
      },
      delete: {
        tags: ['Banks'],
        summary: 'Delete a bank',
        security: [{ authToken: [] }],
        responses: {
          200: { description: 'Bank deleted' },
          403: { description: 'Admin access required' },
          404: { description: 'Bank not found' },
        },
      },
    },
    '/api/sectors': {
      get: {
        tags: ['Sectors'],
        summary: 'Get all sectors',
        security: [{ authToken: [] }],
        responses: { 200: { description: 'List of sectors' } },
      },
      post: {
        tags: ['Sectors'],
        summary: 'Create a sector',
        security: [{ authToken: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Sector' } } },
        },
        responses: { 201: { description: 'Sector created' }, 400: { description: 'Validation error' } },
      },
    },
    '/api/sectors/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Sectors'],
        summary: 'Get one sector',
        security: [{ authToken: [] }],
        responses: { 200: { description: 'Sector details' }, 404: { description: 'Sector not found' } },
      },
      put: {
        tags: ['Sectors'],
        summary: 'Update a sector',
        security: [{ authToken: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Sector' } } },
        },
        responses: { 200: { description: 'Sector updated' }, 400: { description: 'Validation error' } },
      },
      delete: {
        tags: ['Sectors'],
        summary: 'Delete a sector',
        security: [{ authToken: [] }],
        responses: { 200: { description: 'Sector deleted' }, 404: { description: 'Sector not found' } },
      },
    },
  },
};

export default swaggerDocument;
