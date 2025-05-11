# Gmonad Globe

Welcome to the Gmonad Globe project! This application visualizes user-generated locations on a globe using React, TypeScript, and Vite. It allows users to track and display their "gmonads" (global moments) in a visually engaging way.

## Features

- **Interactive Globe**: Users can add their locations to a 3D globe and visualize their contributions.
- **Recent Gmonads**: View a leaderboard of recent pins, including location names and timestamps.
- **Anonymous Submissions**: Users can submit locations anonymously.
- **Responsive Design**: The application is designed to work seamlessly on various devices.

## Tech Stack

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Vite**: A fast build tool that provides a smooth development experience.
- **Supabase**: A backend-as-a-service that handles data storage and retrieval.

## Getting Started

To run this project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sm2828/globalGmonads.git
   cd globalGmonads
   ```

2. **Install Dependencies**:
   Make sure you have Node.js and npm installed. Then run:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root of the project and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server**:
   Run the following command to start the application:
   ```bash
   npm start
   ```

5. **Open in Browser**:
   Navigate to `http://localhost:3000` in your web browser to view the application.

## Deployment

This project is hosted on Vercel. Any changes pushed to the main branch will automatically trigger a deployment.

## ESLint Configuration

For a production-ready application, consider updating the ESLint configuration to enable type-aware lint rules. You can refer to the following example:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for checking out the Gmonad Globe project! We hope you enjoy using it and contributing to its development.
