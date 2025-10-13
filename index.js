const express = require('express');
const { SerialPort } = require('serialport');

const app = express();
const PORT = 3000;





SerialPort.list().then(ports => {
  console.log('Available serial ports:');
  ports.forEach(port => {
    console.log(`${port.path} - ${port.manufacturer || 'Unknown manufacturer'}`);
  });
}).catch(err => {
  console.error('Error listing ports', err);
});

// Replace with your serial port path (check with `ls /dev/tty*` on Linux)
const SERIAL_PORT_PATH = '/dev/ttyUSB0'; 
const SERIAL_BAUD_RATE = 9600;

const serialPort = new SerialPort({
  path: SERIAL_PORT_PATH,
  baudRate: SERIAL_BAUD_RATE,
});

serialPort.on('open', () => {
  console.log('Serial port opened:', SERIAL_PORT_PATH);
});

serialPort.on('data', (data) => {
  console.log('Data received from serial port:', data.toString());
});

serialPort.on('error', (err) => {
  console.error('Serial port error:', err);
});

app.get('/', (req, res) => {
  res.send('Express server running, listening to serial port...');
});

app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
