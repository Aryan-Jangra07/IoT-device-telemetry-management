const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || error.errors || [];
      return res.status(400).json({
        message: 'Validation failed',
        errors: issues.map((e) => ({
          path: e.path ? e.path.join('.') : 'unknown',
          message: e.message,
        })),
      });
    }
    console.error('Validation Middleware Error:', error);
    return res.status(500).json({ message: 'Internal server error in validation middleware' });
  }
};

// Schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['user', 'admin']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const deviceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    type: z.enum(['Warehouse Monitoring', 'Smart Agriculture', 'Smart Home', 'Cold Storage', 'Power Monitoring', 'Server Room']),
    config: z.record(z.any()).optional(),
  }),
});

module.exports = { validate, registerSchema, loginSchema, deviceSchema };
