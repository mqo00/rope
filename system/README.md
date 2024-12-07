# ROPE Training System

This repository contains the code for the ROPE Training System. Follow the instructions below to set up, run, and manage the system.

---

## Installation and Running the System

1. Navigate to the `system` directory:
   ```bash
   cd ./system
2. Install the necessary dependencies:
   ```bash
   npm install
3. Make a .env file and save your API keys and database credentials 
   ```.env
    OPENAI_API_KEY = ""
    MONGODB_URI=
   ```
3. Start the development server:
   ```bash
   npm run dev
Open your browser and access the application at: http://localhost:3333

### Changing Games

To change the game in the ROPE Training System:

1. Locate the **three buttons** in the middle of the right edge of the page.
2. Click the **third button**, labeled `Change Game`. This will open a menu with the following options:
   - **Select a Game**: Choose an existing game from the list.
   - **Add Game**: Upload files to add a new game.
   - **Delete Game**: Remove an existing game.

3. You can either **Select a Game** to switch to an existing one or **Add a Game** by uploading the necessary files as described below.

---

#### Adding a Game

To add a new game:

1. Select the **Add Game** option from the `Change Game` menu.
2. Upload **two required files**:
   - **Game Code File**: This file contains the game’s code logic.
   - **Game Data File**: This file contains the game’s configuration or rules.

3. Example files are provided for reference:
   - `system/lib/connect4/code.txt` (Game Code)
   - `system/lib/connect4/data.json` (Game Data)

These example files serve as templates to help you create your own games.

---

