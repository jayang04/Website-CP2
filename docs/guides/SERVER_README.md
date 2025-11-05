# 🖥️ Server README

## Backend Server for RehabMotion

This is the backend server for the RehabMotion rehabilitation tracking application.

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## Running the Server

### Development Mode
```bash
npm run dev
# or
yarn dev
```

Server will start on `http://localhost:3001`

### Production Mode
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Progress
- `GET /api/progress/:userId` - Get user progress
- `POST /api/progress` - Save progress
- `PUT /api/progress/:id` - Update progress
- `DELETE /api/progress/:id` - Delete progress

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get specific exercise
- `POST /api/exercises` - Create exercise (admin)
- `PUT /api/exercises/:id` - Update exercise (admin)

### Rehab Plans
- `GET /api/rehab-plans` - Get all rehab plans
- `GET /api/rehab-plans/:injuryType` - Get plan by injury type

## Project Structure

```
server/
├── index.ts          # Main server file
├── routes/           # API routes
├── controllers/      # Request handlers
├── models/           # Database models
├── middleware/       # Custom middleware
└── utils/            # Utility functions
```

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication
- **CORS** - Cross-origin requests

## Development

### Adding New Routes

1. Create route file in `routes/`
2. Define handlers in `controllers/`
3. Import and use in `index.ts`

Example:
```typescript
// routes/example.ts
import { Router } from 'express';
import { exampleController } from '../controllers/example';

const router = Router();
router.get('/example', exampleController);

export default router;
```

## Database

Currently using localStorage on the frontend for simplicity. 

### Future: Database Integration
- PostgreSQL or MongoDB recommended
- Set up migrations
- Add ORM (Prisma or TypeORM)

## Security

- CORS enabled for specific origins
- JWT token authentication
- Input validation
- Rate limiting (to be implemented)

## Testing

```bash
npm test
# or
yarn test
```

## Deployment

### Recommended Platforms:
- Heroku
- Railway
- Render
- AWS EC2

### Deployment Steps:
1. Set environment variables
2. Build the project
3. Start the server
4. Configure reverse proxy (nginx)

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9
```

### CORS Issues
Check `CORS_ORIGIN` in environment variables matches your frontend URL.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit pull request

---

**Status**: Backend structure in place, ready for database integration
