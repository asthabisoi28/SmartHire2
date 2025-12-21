# AI Interview System

A comprehensive AI-powered interview management system that streamlines the entire recruitment process from ATS resume checking to live interviews.

## Features

### 🎯 For Candidates
- **ATS Resume Checker**: Upload and analyze resumes for ATS compatibility
- **Technical Tests**: Take coding challenges with real-time monitoring
- **Live Interviews**: Participate in AI-assisted video interviews
- **Progress Tracking**: Monitor your application status through each stage

### 👥 For HR Managers
- **Candidate Management**: View and manage all candidate applications
- **Analytics Dashboard**: Get insights on recruitment metrics
- **Interview Scheduling**: Schedule and manage interview sessions
- **Comprehensive Reporting**: Generate detailed reports on candidate performance

## System Architecture

### Frontend Structure
```
AI Interview/
├── Components/
│   └── interview/
│       └── ScheduledInterview.jsx
├── Entities/
│   ├── User.js
│   ├── Interview.js
│   ├── TechnicalQuestion.js
│   └── index.js
├── Pages/
│   ├── Analytics.jsx
│   ├── ATSChecker.jsx
│   ├── CandidateDashboard.jsx
│   ├── CandidateManagement.jsx
│   ├── Home.jsx
│   ├── HRdashboard.jsx
│   ├── InterviewRoom.jsx
│   ├── LiveInterview.jsx
│   └── TechnicalTest.jsx
├── utils/
│   └── index.js
├── Layout.jsx
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with camera/microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ai-interview-system.git
   cd ai-interview-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   VITE_APP_NAME=AI Interview System
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Core Components

### Entity Classes

#### User Entity (`Entities/User.js`)
Manages user authentication and profile data with methods for:
- Login/logout functionality
- Profile management
- Password changes
- Avatar uploads

#### Interview Entity (`Entities/Interview.js`)
Handles interview lifecycle management:
- Interview creation and scheduling
- Status and stage tracking
- Score management
- Progress monitoring

#### TechnicalQuestion Entity (`Entities/TechnicalQuestion.js`)
Manages technical assessment questions:
- Question creation and categorization
- Test case management
- Answer submission and evaluation
- Difficulty and time limit settings

### Page Components

#### Candidate Pages
- **CandidateDashboard**: Overview of application status and next steps
- **ATSChecker**: Resume upload and ATS compatibility analysis
- **TechnicalTest**: Coding challenges with Monaco editor
- **InterviewRoom**: Video interview interface

#### HR Pages
- **HRDashboard**: HR overview with key metrics and recent activities
- **CandidateManagement**: Candidate list with filtering and management tools
- **Analytics**: Detailed recruitment analytics and reporting
- **LiveInterview**: Real-time interview monitoring and evaluation

### Utility Functions (`utils/index.js`)
Common helper functions including:
- URL routing and navigation
- Date and time formatting
- Validation utilities
- Score calculation and formatting
- File handling utilities

## Interview Process Flow

1. **ATS Stage**: Candidate uploads resume for automated screening
2. **Technical Stage**: Candidate completes coding challenges
3. **Interview Stage**: Live video interview with HR
4. **Completion**: Final evaluation and decision

Each stage has configurable passing thresholds and automatic progression.

## API Integration

The system expects a REST API with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Interviews
- `GET /api/interviews` - List interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/:id` - Get interview details
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview

### Technical Questions
- `GET /api/technical-questions` - List questions
- `POST /api/technical-questions` - Create question
- `GET /api/technical-questions/:id` - Get question details
- `POST /api/technical-questions/:id/submit` - Submit answer

## Development

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- React best practices and hooks

### Testing
```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Building for Production
```bash
npm run build
```

## Technologies Used

- **Frontend**: React 18, React Router, Tailwind CSS
- **UI Components**: Radix UI, Lucide React icons
- **Code Editor**: Monaco Editor (VS Code editor)
- **Charts**: Recharts for analytics
- **Real-time**: Socket.IO for live features
- **Video**: WebRTC for video interviews
- **Build Tool**: Vite
- **Testing**: Vitest, Testing Library

## Configuration

### Tailwind CSS
The system uses Tailwind CSS for styling with custom components and utilities.

### Environment Variables
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_SOCKET_URL`: WebSocket server URL
- `VITE_APP_NAME`: Application name

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## Roadmap

- [ ] AI-powered question generation
- [ ] Advanced analytics and ML insights
- [ ] Mobile application
- [ ] Integration with popular ATS systems
- [ ] Multi-language support
- [ ] Advanced proctoring features