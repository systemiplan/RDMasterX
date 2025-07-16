# RDMasterX - Remote Connection Manager

A modern, secure desktop application for managing remote connections including RDP, SSH, VNC, Telnet, and web logins. Built with Electron, React, Node.js, and SQLite.

![RDMasterX](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🔐 Secure Connection Management
- **Multiple Connection Types**: RDP, SSH, VNC, Telnet, and Web/HTTP connections
- **Encrypted Credential Storage**: AES encryption for passwords and sensitive data
- **User Authentication**: JWT-based authentication system
- **Role-Based Access**: Admin and user roles with different permissions

### 🎨 Modern User Interface
- **Clean, Intuitive Design**: Modern UI with card-based connection display
- **Dark/Light Themes**: Toggle between themes with system preference detection
- **Search & Filter**: Quick search across all connection properties
- **Favorites & Grouping**: Organize connections with favorites and custom groups
- **Tag System**: Flexible tagging for better organization

### 📊 Management & Monitoring
- **Audit Trail**: Comprehensive logging of all user actions
- **User Management**: Admin panel for user creation and management
- **Connection Statistics**: Track usage and recent connections
- **Import/Export**: Backup and restore connection configurations

### 🚀 Advanced Features
- **Quick Launch**: One-click connection launching
- **Script Support**: Pre and post-connection PowerShell/shell scripts
- **Responsive Design**: Works well on different screen sizes
- **Keyboard Shortcuts**: Efficient navigation with hotkeys

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router
- **Backend**: Node.js, Express
- **Database**: SQLite with encrypted storage
- **Desktop Framework**: Electron
- **Authentication**: JWT tokens, bcrypt password hashing
- **Encryption**: AES encryption for sensitive data
- **Build Tools**: Webpack, Babel

## 📋 Requirements

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Operating System**: Windows 10/11, macOS 10.14+, or Ubuntu 18.04+

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd RDMasterX

# Install dependencies
npm install
```

### 2. Development Mode

```bash
# Start backend server and frontend development server
npm run start

# In a separate terminal, start Electron
npm run electron
```

### 3. Build for Production

```bash
# Build frontend
npm run build

# Create desktop installer (Windows)
npm run build-win

# Create installers for all platforms
npm run dist
```

## 🔧 Development Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start backend and frontend development servers |
| `npm run backend` | Start only the backend server |
| `npm run frontend` | Start only the frontend development server |
| `npm run build` | Build production frontend |
| `npm run electron` | Start Electron app |
| `npm run electron-dev` | Start full development environment |
| `npm run build-win` | Build Windows installer |
| `npm run dist` | Build installers for all platforms |

## 📂 Project Structure

```
RDMasterX/
├── src/
│   ├── backend/          # Express server and API
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Authentication middleware
│   │   ├── database.js   # SQLite database setup
│   │   └── server.js     # Express server
│   └── frontend/         # React application
│       ├── components/   # React components
│       ├── styles/       # CSS stylesheets
│       ├── index.js      # React entry point
│       └── index.html    # HTML template
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── webpack.config.js    # Build configuration
└── package.json         # Project dependencies
```

## 🔐 Security Features

### Data Encryption
- **Password Storage**: All passwords encrypted with AES encryption
- **Database Security**: SQLite database with proper access controls
- **Session Management**: JWT tokens with expiration

### Authentication & Authorization
- **Role-Based Access Control**: Admin and user roles
- **Secure API Endpoints**: All endpoints protected with authentication
- **Password Requirements**: Configurable password policies

### Audit & Compliance
- **Activity Logging**: All user actions logged with timestamps
- **Connection Tracking**: Track who accessed what and when
- **Export Capabilities**: Audit logs can be exported for compliance

## 👥 User Roles

### Administrator
- Create and manage users
- View all audit logs
- Export/import system data
- Full access to all connections

### User
- Create and manage personal connections
- View personal audit logs
- Launch connections
- Modify profile settings

## 🎯 Default Credentials

For first-time setup, use these default credentials:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password immediately after first login!

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key-here
DB_PATH=./data/rdmasterx.db
```

### Connection Types Supported

| Type | Description | Default Port |
|------|-------------|--------------|
| RDP | Remote Desktop Protocol | 3389 |
| SSH | Secure Shell | 22 |
| VNC | Virtual Network Computing | 5900 |
| Telnet | Telnet Protocol | 23 |
| Web | HTTP/HTTPS URLs | 80/443 |

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change the port in src/backend/server.js
   const PORT = process.env.PORT || 3002;
   ```

2. **Database Connection Issues**
   ```bash
   # Check if data directory exists and has proper permissions
   mkdir data
   chmod 755 data
   ```

3. **Electron Won't Start**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Change password

### Connection Endpoints
- `GET /api/connections` - Get all connections
- `POST /api/connections` - Create new connection
- `PUT /api/connections/:id` - Update connection
- `DELETE /api/connections/:id` - Delete connection
- `POST /api/connections/:id/launch` - Launch connection

### User Management (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Audit Logs
- `GET /api/audit` - Get audit logs
- `GET /api/audit/stats` - Get audit statistics
- `GET /api/audit/export` - Export audit logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI components inspired by modern design principles
- Security practices following OWASP guidelines

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**RDMasterX** - Secure, Modern Remote Connection Management
