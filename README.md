# SuperScripts - Instagram Reel Script Generator

This is a Next.js web application designed to generate viral-worthy Instagram reel scripts based on user-defined criteria. It leverages market research principles (simulated via Genkit and a Large Language Model) to craft engaging content.

## Features

-   **Topic Input:** Enter the main subject of your reel.
-   **Customization:** Select reel length (15s, 30s, 60s, 90s), language, tone, and objective.
-   **Script Generation:** Get 5 unique reel script suggestions based on your inputs.
-   **Market Research Inspired:** Scripts are designed considering audience engagement and trends (powered by Genkit).
-   **Modern UI:** Clean, responsive interface inspired by Material Design principles.

## Getting Started

### Prerequisites

-   Node.js (Version 18 or later recommended)
-   npm, yarn, or pnpm
-   A Google Generative AI API Key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    -   Rename the `.env.example` file to `.env`.
    -   Open the `.env` file and replace `YOUR_GOOGLE_GENAI_API_KEY_HERE` with your actual Google Generative AI API key.
    ```env
    # .env
    GOOGLE_GENAI_API_KEY=AIz...your...key...here
    ```
    **Important:** Ensure `.env` is listed in your `.gitignore` file to prevent accidentally committing your API key.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running on `http://localhost:9002` (or the specified port).

### Building for Production

```bash
npm run build
npm run start
```

## Technology Stack

-   **Framework:** Next.js (App Router)
-   **Styling:** Tailwind CSS, ShadCN UI (with custom Material Design inspired theme)
-   **AI Integration:** Genkit (using Google AI models)
-   **UI Components:** ShadCN UI
-   **State Management:** React Hooks (useState, useEffect)
-   **Form Handling:** React Hook Form, Zod
-   **Animations:** Framer Motion

## Security Note

-   **API Key:** Your `GOOGLE_GENAI_API_KEY` is sensitive. Keep it secure in the `.env` file and ensure this file is **never** committed to version control (like Git). The `.gitignore` file is configured to prevent this by default.
-   **CORS & Embedding:** The `next.config.ts` file includes basic headers for Cross-Origin Resource Sharing (CORS) and iframe embedding control. Review and configure `ALLOWED_ORIGIN` and `ALLOWED_EMBEDDING_ORIGIN` environment variables in your `.env` file for production deployment according to your security needs.

## Contributing

Contributions are welcome! Please follow standard Git practices (fork, branch, pull request).

## License

This project is licensed under the [MIT License](LICENSE). (Note: You might need to add a LICENSE file if one doesn't exist).
