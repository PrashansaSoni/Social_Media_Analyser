# Social Network Analyzer

A full-stack social network analysis application built with Node.js, Express, MongoDB, React, and Cytoscape.js. This application allows users to create profiles, connect with friends, and visualize social network graphs with advanced analytics.

## 🤖 Built with Cursor AI

This project was developed using **Cursor AI**, an AI-powered code editor that significantly accelerated the development process. The AI assistant helped with:

- **Code Generation**: Rapid prototyping of components and API endpoints
- **Architecture Design**: Structuring the full-stack application with best practices
- **Graph Algorithms**: Implementing BFS, degree centrality, and network analysis
- **AI Integration**: Adding Gemini AI for intelligent network insights
- **Bug Fixing**: Identifying and resolving issues quickly
- **Documentation**: Generating comprehensive documentation and comments

The development experience with Cursor AI made it possible to build this complex social network analyzer with advanced features in record time, while maintaining high code quality and following modern development practices.

## 🚀 Features

### User Management
- **User Registration & Authentication**: Secure JWT-based authentication
- **Profile Management**: Update personal information, bio, and location
- **User Search**: Find other users by name or username

### Friendship System
- **Friend Requests**: Send, accept, or decline friend requests
- **Friend Management**: View friends list and manage connections
- **Mutual Friends**: Discover mutual connections between users
- **Friend Suggestions**: AI-powered suggestions based on mutual connections

### Graph Analytics
- **Interactive Network Visualization**: Beautiful graph visualization using Cytoscape.js
- **Shortest Path Analysis**: Find the shortest path between any two users (BFS algorithm)
- **Degree Centrality**: Identify the most influential users in the network
- **Network Statistics**: Comprehensive network analysis and metrics

### Interactive Features
- **Click-to-Explore**: Click on nodes to view user details
- **Path Finder Mode**: Interactive mode to find paths between users
- **Real-time Updates**: Live updates when connections change
- **Responsive Design**: Works seamlessly on desktop and mobile

### AI-Powered Insights
- **Gemini AI Integration**: Ask natural language questions about your network
- **Intelligent Analysis**: Get insights about network structure and user behavior
- **Smart Recommendations**: AI-powered friend suggestions and network insights
- **Conversational Interface**: Chat with AI about your social network data

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Google Generative AI** - Gemini AI integration

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Cytoscape.js** - Graph visualization
- **React Hook Form** - Form management
- **Axios** - HTTP client

### Graph Algorithms
- **BFS (Breadth-First Search)** - Shortest path finding
- **Degree Centrality** - Influence measurement
- **Connected Components** - Network analysis
- **Mutual Friends Detection** - Relationship analysis

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd LegoAi
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm run install-all

# Or install manually:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

#### Backend Environment
Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-network
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Gemini AI Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Replace `your-gemini-api-key-here` with your actual API key

#### Frontend Environment (Optional)
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create the database automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

### 5. Seed Sample Data (Optional)
```bash
cd backend
npm run seed
```

This creates 10 sample users with various friendship connections for testing.

## 🚀 Running the Application

### Development Mode
```bash
# Run both backend and frontend concurrently
npm run dev

# Or run separately:
# Backend (http://localhost:5000)
npm run server

# Frontend (http://localhost:3000)
npm run client
```

### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 📱 Usage

### 1. Registration/Login
- Visit `http://localhost:3000`
- Register a new account or use demo credentials:
  - Email: `alice@example.com`
  - Password: `Password123`

### 2. Dashboard
- View your network statistics
- Manage friend requests
- See friend suggestions
- Access network analytics

### 3. Network Graph
- Visualize the entire social network
- Click nodes to view user details
- Use "Path Mode" to find shortest paths between users
- Search for specific users
- View network statistics

### 4. Profile Management
- Update your profile information
- View your friends list
- Connect with suggested friends

### 5. AI Assistant
- Navigate to the Network Graph tab
- Find the "AI Assistant" section in the sidebar
- Ask natural language questions about your network:
  - "Who are the most connected users?"
  - "What's the network structure like?"
  - "Find users with similar interests"
  - "Who are the influencers in the network?"
  - "Show me users from New York"

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Friends
- `POST /api/friends/request/:userId` - Send friend request
- `PUT /api/friends/respond/:friendshipId` - Accept/decline request
- `GET /api/friends/:userId` - Get user's friends
- `GET /api/friends/requests/received` - Get pending requests
- `DELETE /api/friends/:friendshipId` - Remove friend

### Graph Analytics
- `GET /api/graph/path/:id1/:id2` - Shortest path between users
- `GET /api/graph/influencer` - Most influential user
- `GET /api/graph/centrality` - Degree centrality rankings
- `GET /api/graph/stats` - Network statistics
- `GET /api/graph/data` - Graph data for visualization
- `POST /api/graph/gemini` - Query Gemini AI about network data

## 🧪 Testing

### Sample Credentials
The seeded database includes these test accounts:
- `alice@example.com` / `Password123`
- `bob@example.com` / `Password123`
- `charlie@example.com` / `Password123`
- (All users have the same password: `Password123`)

### Testing Features
1. **Login** with any sample account
2. **Send friend requests** to other users
3. **Accept/decline requests** from the dashboard
4. **Explore the network graph** to see connections
5. **Use path finder** to find shortest paths between users
6. **View analytics** to see most influential users

## 🏗️ Project Structure

```
LegoAi/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication & validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Graph algorithms & utilities
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── lib/         # Utilities & API client
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app component
│   └── package.json
└── package.json         # Root package.json
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers

## 🎨 UI/UX Features

- **Modern Design** with Tailwind CSS and shadcn/ui
- **Responsive Layout** that works on all devices
- **Interactive Animations** and smooth transitions
- **Dark Mode Support** (built into shadcn/ui)
- **Accessibility** features and keyboard navigation
- **Toast Notifications** for user feedback

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a process manager like PM2
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Serve static files with nginx or similar
3. Configure API URL for production

### Database
- Use MongoDB Atlas for production
- Set up proper indexes for performance
- Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity for Atlas

2. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Authentication Issues**
   - Check JWT_SECRET in backend `.env`
   - Clear browser localStorage
   - Verify API endpoints are accessible

4. **Graph Visualization Issues**
   - Ensure Cytoscape.js dependencies are installed
   - Check browser console for errors
   - Verify graph data format

### Performance Tips

1. **Database Optimization**
   - Ensure proper indexes on User and Friendship collections
   - Use pagination for large datasets
   - Implement caching for frequently accessed data

2. **Frontend Optimization**
   - Implement virtual scrolling for large lists
   - Use React.memo for expensive components
   - Optimize graph rendering for large networks

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

## 🚀 Future Scope

This social network analyzer has tremendous potential for expansion and enhancement. Here are the planned future features and improvements:

### 🎤 Voice Assistant Integration
- **Voice-to-Text Interface**: Replace the chat input with voice commands
- **Natural Speech Processing**: Ask questions about your network using natural speech
- **Audio Responses**: Get AI responses in audio format for hands-free interaction
- **Multi-language Support**: Support for multiple languages in voice interactions
- **Voice Commands**: Navigate the application using voice commands
- **Accessibility Enhancement**: Make the app more accessible for visually impaired users

### 🤖 Advanced AI Features
- **Predictive Analytics**: Predict future connections and network growth
- **Behavioral Analysis**: Analyze user interaction patterns and preferences
- **Smart Notifications**: AI-powered notifications for important network events
- **Content Recommendation**: Suggest posts and content based on network interests
- **Sentiment Analysis**: Analyze the sentiment of posts and interactions
- **Anomaly Detection**: Identify unusual patterns or suspicious activities

### 📊 Enhanced Analytics
- **Real-time Network Monitoring**: Live updates of network changes and metrics
- **Advanced Graph Algorithms**: Implement PageRank, Betweenness Centrality, and Clustering
- **Network Evolution Tracking**: Visualize how the network changes over time
- **Community Detection**: Automatically identify communities and groups
- **Influence Propagation**: Track how information spreads through the network
- **Custom Metrics**: Allow users to define their own network metrics

### 🎨 Improved User Experience
- **3D Network Visualization**: Three-dimensional graph rendering for better depth perception
- **Mobile App**: Native iOS and Android applications
- **Progressive Web App**: Offline functionality and app-like experience
- **Dark/Light Theme**: Enhanced theming options with custom color schemes
- **Keyboard Shortcuts**: Power user features for faster navigation
- **Drag-and-Drop Interface**: Intuitive file uploads and data management

### 🔗 Integration Capabilities
- **Social Media Integration**: Connect with Facebook, Twitter, LinkedIn, Instagram
- **Calendar Integration**: Sync with Google Calendar, Outlook for event-based networking
- **Email Integration**: Send network insights and updates via email
- **Slack/Discord Bots**: Network insights directly in team communication tools
- **CRM Integration**: Connect with Salesforce, HubSpot for business networking
- **API Marketplace**: Allow third-party developers to build extensions

### 🛡️ Advanced Security & Privacy
- **End-to-End Encryption**: Secure messaging and data transmission
- **Privacy Controls**: Granular privacy settings for different user groups
- **Data Anonymization**: Option to anonymize data for research purposes
- **GDPR Compliance**: Full compliance with data protection regulations
- **Blockchain Integration**: Decentralized identity and data ownership
- **Zero-Knowledge Proofs**: Verify connections without revealing sensitive data

### 📈 Business Intelligence
- **Network ROI Analysis**: Measure the value of professional connections
- **Team Collaboration Metrics**: Analyze team effectiveness and communication patterns
- **Organizational Charts**: Automatic generation of company hierarchy
- **Skills Mapping**: Map skills and expertise across the network
- **Project Collaboration**: Track project-based networking and collaboration
- **Performance Analytics**: Measure individual and team performance metrics

### 🌐 Scalability & Performance
- **Microservices Architecture**: Break down into smaller, scalable services
- **Graph Database**: Migrate to Neo4j or similar for better graph performance
- **Caching Layer**: Implement Redis for faster data access
- **CDN Integration**: Global content delivery for better performance
- **Load Balancing**: Handle millions of users with proper load distribution
- **Real-time Synchronization**: WebSocket integration for live updates

### 🧪 Research & Development
- **Academic Partnerships**: Collaborate with universities for network research
- **Open Source Components**: Release graph algorithms as open source libraries
- **Research Publications**: Publish findings on social network analysis
- **Machine Learning Models**: Train custom models on network data
- **A/B Testing Framework**: Test new features with controlled experiments
- **Data Science Tools**: Built-in tools for network researchers

### 🎯 Specialized Use Cases
- **Healthcare Networks**: Analyze patient-doctor relationships and care coordination
- **Educational Networks**: Track student-teacher interactions and learning outcomes
- **Corporate Networks**: Enterprise-level networking and collaboration tools
- **Event Networking**: Specialized tools for conference and event networking
- **Dating Networks**: Relationship analysis and compatibility matching
- **Professional Networks**: Industry-specific networking and mentorship

### 🔮 Emerging Technologies
- **Augmented Reality**: AR visualization of network connections in physical space
- **Virtual Reality**: Immersive VR experience for exploring large networks
- **IoT Integration**: Connect with smart devices and sensors
- **Edge Computing**: Process data closer to users for better performance
- **Quantum Computing**: Leverage quantum algorithms for complex network analysis
- **Federated Learning**: Train AI models without centralizing user data

### 📱 Platform Expansion
- **Desktop Applications**: Native Windows, macOS, and Linux applications
- **Browser Extensions**: Chrome, Firefox, Safari extensions for quick access
- **Smart TV Apps**: Network visualization on large screens
- **Wearable Integration**: Smartwatch apps for quick network insights
- **Smart Speaker Integration**: Alexa, Google Home voice commands
- **Car Integration**: Voice-controlled networking while driving

## 🤖 Cursor AI Development Rules

This project was built using Cursor AI with the following development guidelines and rules:

### Project Architecture Rules
- **Full-Stack Structure**: Maintain clear separation between frontend (React/Vite) and backend (Node.js/Express)
- **API-First Design**: All frontend-backend communication through RESTful APIs
- **Component-Based Frontend**: Use React functional components with hooks
- **MVC Backend**: Follow Model-View-Controller pattern with Express.js
- **Database Abstraction**: Use Mongoose ODM for MongoDB operations

### Code Quality Standards
- **ES6+ JavaScript**: Use modern JavaScript features (async/await, destructuring, arrow functions)
- **Consistent Naming**: Use camelCase for variables/functions, PascalCase for components
- **Error Handling**: Implement try-catch blocks and proper error responses
- **Input Validation**: Validate all user inputs on both frontend and backend
- **Security First**: Implement JWT authentication, password hashing, and input sanitization

### File Organization Rules
```
backend/
├── config/          # Database and app configuration
├── controllers/     # Route handlers and business logic
├── middleware/      # Authentication, validation, error handling
├── models/          # MongoDB schemas and data models
├── routes/          # API route definitions
├── services/        # External service integrations (Gemini AI)
├── utils/           # Helper functions and algorithms
└── server.js        # Main application entry point

frontend/
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page-level components
│   ├── lib/         # Utilities, API client, helpers
│   ├── contexts/    # React context providers
│   └── App.jsx      # Main application component
```

### Development Workflow Rules
1. **Feature Development**: Create new features in isolated branches
2. **API Development**: Define API endpoints before frontend implementation
3. **Component Creation**: Build reusable components with proper props validation
4. **State Management**: Use React hooks for local state, context for global state
5. **Styling**: Use Tailwind CSS classes with shadcn/ui components

### AI Integration Rules
- **Gemini AI Service**: Centralized service for all AI operations
- **Data Context**: Provide comprehensive network data to AI for analysis
- **Error Handling**: Graceful fallbacks when AI service is unavailable
- **Rate Limiting**: Implement proper rate limiting for AI endpoints
- **Security**: Never expose API keys in frontend code

### Graph Algorithm Rules
- **Non-Directional Edges**: Treat friendships as bidirectional relationships
- **Efficient Algorithms**: Use BFS for shortest path, optimized centrality calculations
- **Data Structures**: Use adjacency lists for graph representation
- **Performance**: Implement caching for expensive graph operations
- **Visualization**: Use Cytoscape.js for interactive graph rendering

### Testing and Quality Assurance
- **Manual Testing**: Test all user flows and edge cases
- **API Testing**: Verify all endpoints with proper authentication
- **UI Testing**: Ensure responsive design and accessibility
- **Performance Testing**: Monitor graph rendering performance with large datasets
- **Security Testing**: Verify authentication and authorization

### Documentation Standards
- **Code Comments**: Document complex algorithms and business logic
- **API Documentation**: Include endpoint descriptions and examples
- **README Updates**: Keep documentation current with new features
- **Inline Documentation**: Use JSDoc for function documentation

### Deployment Rules
- **Environment Variables**: Use .env files for configuration
- **Production Builds**: Optimize frontend builds for production
- **Database Migrations**: Handle schema changes properly
- **Error Monitoring**: Implement proper logging and error tracking
- **Security Headers**: Use Helmet.js for security headers

### Cursor AI Best Practices
- **Clear Prompts**: Provide specific, detailed prompts for AI assistance
- **Iterative Development**: Build features incrementally with AI help
- **Code Review**: Always review AI-generated code before implementation
- **Testing**: Test AI-generated code thoroughly
- **Documentation**: Document AI-assisted development decisions

---

**Built with ❤️ using Cursor AI and modern web technologies**
