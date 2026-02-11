const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = './events.json';

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

app.get('/events', (req, res) => res.json(readData()));

app.post('/events', (req, res) => {
    const { title, description, date, location } = req.body;
    const events = readData();
    const newEvent = { id: uuidv4(), title, description, date, location, votes: 0 };
    events.push(newEvent);
    writeData(events);
    res.status(201).json(newEvent);
});

app.post('/events/:id/vote', (req, res) => {
    const events = readData();
    const event = events.find(e => e.id === req.params.id);
    if (event) {
        event.votes += 1;
        writeData(events);
        res.json(event);
    } else {
        res.status(404).send('Not Found');
    }
});

app.listen(PORT, () => console.log(`Serveur prêt sur http://localhost:${PORT}`));