# Cosmic Nexus

A sophisticated visual tool to map your interests and discover connections between them, featuring advanced graph visualizations, interactive node cards, and secure OTP-based authentication.

## Features

- **Interactive Graph Visualization**: Visualize your interests and their connections
- **Secure OTP Authentication**: Email verification using one-time passwords
- **Personalized Interest Mapping**: Create and organize your interests
- **Connection Discovery**: Find unexpected connections between your interests

## Quick Start

1. **Set Up Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update with your Supabase and EmailJS credentials
   - See [Email Setup Guide](docs/EMAIL_SETUP.md) for EmailJS configuration

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Database Tables**:
   ```bash
   # Run the database setup script
   npm run setup-db
   ```

   If the script doesn't work, you can manually create the tables:
   - Go to your Supabase dashboard (https://app.supabase.com)
   - Navigate to the SQL Editor
   - Copy and paste the contents of `direct-setup.sql` and `supabase/migrations/20240414000000_create_otp_table.sql`
   - Run the SQL

4. **Start the Application**:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Authentication System

Cosmic Nexus uses a secure OTP-based authentication system:

1. **Registration**: Users enter their email and password
2. **Email Verification**: A one-time password (OTP) is sent to the user's email
3. **OTP Verification**: User enters the OTP to verify their email
4. **Account Creation**: After verification, the account is created and the user can log in

This approach provides several benefits:
- No need for email confirmation links that might break in different environments
- More secure than simple email/password authentication
- Better user experience with immediate feedback

For detailed setup instructions, see the [Email Setup Guide](docs/EMAIL_SETUP.md).

## Advanced Visualization Features

### Graph View
The graph visualization offers multiple layout options:

- **Force-directed**: Dynamic, physics-based layout that naturally clusters related nodes
- **Radial**: Arranges nodes in a circular pattern for a clean, organized view
- **Cluster**: Groups nodes by category, making it easy to see relationships between similar interests
- **Grid**: Organizes nodes in a structured grid pattern

Additional visualization controls:
- Toggle node labels on/off
- Toggle directional arrows on/off
- Enable/disable connection highlighting
- Interactive hover effects with detailed information panels
- Animated particles along connection paths

### Node Cards
Each interest node features:

- 3D tilt effect that responds to mouse movement
- Category-specific styling and iconography
- Expandable descriptions
- Connection count indicators
- Animated selection indicators
- Interactive hover states with visual feedback

## Core Features

- Create and manage interest nodes with rich metadata
- Visualize connections between interests using advanced graph algorithms
- AI-powered connection discovery between seemingly unrelated interests
- Multiple visualization modes (graph, grid, list)
- Filter interests by category, date, or connection count
- Search functionality with highlighted results
- Responsive design that works on all devices

## Troubleshooting

### Database Connection Issues

If you see errors like "relation 'public.interest_nodes' does not exist":

1. Make sure you've run the database setup script or SQL commands
2. Check that your Supabase credentials in the `.env` file are correct
3. Verify the tables have been created in the correct schema (public)

You can check if tables exist by going to your Supabase dashboard:
- Navigate to Table Editor
- Look for `interest_nodes`, `connections`, and `discovery_prompts` tables

### UI Issues

If the UI appears outdated or simple:

1. Make sure all dependencies are installed: `npm install`
2. Restart the development server: `npm run dev`
3. Clear your browser cache and reload the page