# Validart

Validart is an open-source tool designed to help users validate artwork for event cards, badges, and similar printed materials. It provides a visual interface to check how punch holes, slots, and other physical features will interact with your design, helping to prevent costly printing errors.

LIVE DEMO: https://staging-validart-tool-gbmi.frontend.encr.app

## How It Works

The application allows you to:
1.  **Set Card Dimensions:** Specify the exact width and height of your card.
2.  **Upload Artwork:** Upload your design file (JPG, PNG, SVG).
3.  **Add Features:** Place and move punch holes and slots onto the artwork preview.
4.  **Define Safety Lines:** Configure trim and bleed lines according to your print vendor's specifications.
5.  **Preview & Download:** See a real-time preview of your card and download a screenshot for reference.

The frontend is built with React and TypeScript, providing a dynamic and interactive user experience. The backend, powered by Encore.ts, handles secure file operations by generating signed URLs for uploads.

## Getting Started

This project is built on the Leap development platform. To run it locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/spenceriam/validart-tool.git
    cd validart-tool
    ```

2.  **Run the application:**
    This command starts the development server for both the frontend and backend.
    ```bash
    encore run
    ```

The application will be available at `http://localhost:4000`.

## License

This project is open source and available under the MIT License.
