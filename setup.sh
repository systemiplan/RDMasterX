#!/bin/bash

# RDMasterX Setup Script
# This script installs all necessary dependencies for Active Directory integration

echo "Setting up RDMasterX with Active Directory integration..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install Active Directory specific packages
echo "Installing Active Directory packages..."
npm install activedirectory ldapjs

# Install additional security and utility packages
echo "Installing additional packages..."
npm install dotenv bcrypt jsonwebtoken express-rate-limit helmet cors

# Install development dependencies
echo "Installing development dependencies..."
npm install --save-dev nodemon

# Create logs directory
echo "Creating logs directory..."
mkdir -p logs

# Copy environment example
echo "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Environment file created. Please edit .env with your Active Directory settings."
fi

# Set up database if needed
echo "Setting up database..."
# Add database initialization commands here if needed

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Active Directory configuration"
echo "2. Configure your domain controller settings"
echo "3. Test the connection with: npm run test-ad"
echo "4. Start the application with: npm start"
echo ""
echo "For development mode: npm run dev"
