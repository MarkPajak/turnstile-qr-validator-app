# Turnstile QR Validator App

A web-based application designed to validate QR codes for access control systems, ensuring secure and efficient entry management.

## Features

- **QR Code Scanning**: Quickly scan QR codes to verify access permissions.
- **Real-Time Validation**: Instant feedback on the validity of scanned codes.
- **User-Friendly Interface**: Intuitive design for seamless user experience.

## Tech Stack

- **Frontend tbc**: HTML, CSS, JavaScript
- **Backend**: Node.js (Express.js)
- **Database**: MongoDB
- **APi connections**: [pretix](https://docs.pretix.eu/dev/api/index.html) for ticket validation

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v10.8.2 or higher)
- Mongod (v4.4.18)

### Steps to install and test a ticket

1. Clone the repository:

   ```bash
   git clone https://github.com/MarkPajak/turnstile-qr-validator-app.git
   cd turnstile-qr-validator-app

2. run npm install:

   ```bash
   npm run setup
   npm run port-emulate

4. start the app

    ```bash
   npm start

6. in a  new terminal on the same directory:

   ```bash
   npm run port-command
   
   
   
