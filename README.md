# Turnstile QR Validator App

A web-based application designed to validate QR codes for access control systems, ensuring secure and efficient entry management.

## Features

- **QR Code Scanning**: Quickly scan QR codes from a physical scanner to verify ticket codes over a serial port.
- **Pretix integration**: Tickets are validated against the events in Pretix
- **Preprinted tickets and codes**: Accepts a CSV of valid ticket codes where ticketsd are preprinted or handed out in the venue
- **Flexible business logic**: Set business rules on multiple scans and events
- **Real-Time Validation**: Instant feedback on the validity of scanned codes.
- **(TBC)User-Friendly Interface**: Intuitive design for seamless user experience.

## Tech Stack

- **Frontend (tbc)**: HTML, CSS, JavaScript
- **Backend**: Node.js (Express.js)
- **Database**: MongoDB
- **APi connections**: [pretix](https://docs.pretix.eu/dev/api/index.html) for ticket validation

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v10.8.2 or higher)
- Mongod (v4.4.18)

### Steps to install and test a ticket

1. Clone the repository and install

   ```bash
   git clone https://github.com/MarkPajak/turnstile-qr-validator-app.git
   cd turnstile-qr-validator-app
   npm install

2. Setup secret folder and api_key:

   ```bash
   npm run setup
   npm run socat
   npm run port-emulate

3. Setup secret folder and api_key:

   add pretix API key to settings/pretix_settings.json

5. Start the app in a new terminal window

    ```bash
   npm start

6. run a test tickwet in a new terminal window

   ```bash
   npm run port-command
   
   
   
