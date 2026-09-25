> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# Learnings: Environment Variables in React

When working with environment variables in a React application, especially one created with `create-react-app`, there are specific conventions and practices to follow to ensure they work correctly. Here are the key learnings:

## Key Points

1. **Prefix Requirement**:
   - Environment variables must be prefixed with `REACT_APP_` to be accessible in a React application. This is a security measure to prevent accidental exposure of sensitive information.

2. **Build-Time Substitution**:
   - Environment variables are substituted at build time. This means that the values are embedded into the JavaScript files during the build process and are not accessible at runtime in the browser.

3. **.env Files**:
   - You can define environment variables in `.env` files located in the root of your project. These files are automatically read by `create-react-app` during the build process.
   - You can create multiple `.env` files for different environments, such as `.env.development`, `.env.production`, etc. The appropriate file is used based on the `NODE_ENV` value.

4. **Accessing Variables**:
   - Use `process.env.REACT_APP_VARIABLE_NAME` in your code to access these variables. For example:
     ```javascript
     const apiUrl = process.env.REACT_APP_API_URL;
     ```

5. **Deployment Considerations**:
   - Ensure that your deployment process includes the correct environment variables. If using Docker, make sure the `.env` file is included in the build context or that environment variables are set in the container environment.

## Example

### .env File

REACT_APP_API_URL=https://api.example.com

### Access in Code

```javascript
const apiUrl = process.env.REACT_APP_API_URL;
```

### Build Command

```bash
npm run build
```

The environment file selection is controlled by the NODE_ENV environment variable, which is set differently depending on which npm/yarn command you run:
npm start sets NODE_ENV=development
npm test sets NODE_ENV=test
npm run build sets NODE_ENV=production
To ensure you're using the development environment, you should:
Use npm start instead of npm run build for development