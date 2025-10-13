const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');

// Config
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'tickets';
const collectionName = 'myCollectionName';
const outputFile = path.join(__dirname, 'ticket_files', 'scan_data.csv');

const save_csv = function () {
    const self = this;

    self.savecsv = async function () {
        const client = new MongoClient(mongoUrl);

        try {
            console.log('[CSV Export] Connecting to MongoDB...');
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            const data = await collection.find({}).toArray();

            if (!data.length) {
                console.warn('[CSV Export] No documents found to export.');
                return;
            }

            const csvHeader = 'id,date_scanned,date_first_scan,date_last_attempt,scan_attempts\n';
            const csvRows = data.map(doc => 
                `${doc._id},${doc.date_scanned || ''},${doc.date_first_scan || ''},${doc.date_last_attempt || ''},${doc.scan_attempts || 0}`
            );
            const csvContent = csvHeader + csvRows.join('\n');

            fs.writeFileSync(outputFile, csvContent, 'utf8');
            console.log(`[CSV Export] File saved to ${outputFile}`);

        } catch (err) {
            console.error('[CSV Export] Error during export:', err.message);
        } finally {
            await client.close();
            console.log('[CSV Export] MongoDB connection closed.');
        }
    };
};

module.exports = save_csv;
