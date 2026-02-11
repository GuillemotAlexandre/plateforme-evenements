const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // Assurez-vous que vos fichiers HTML sont dans un dossier "public"

const DATA_FILE = './events.json';

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        return fileContent ? JSON.parse(fileContent) : [];
    } catch (e) {
        return [];
    }
};

const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// 1. Récupérer tous les événements
app.get('/events', (req, res) => {
    res.json(readData());
});

// 2. AJOUTÉ : Récupérer un SEUL événement (C'est ce qui manquait !)
app.get('/events/:id', (req, res) => {
    const events = readData();
    const event = events.find(e => e.id === req.params.id);

    if (event) {
        res.json(event);
    } else {
        res.status(404).json({ message: 'Événement non trouvé' });
    }
});

// 3. Créer un événement
app.post('/events', (req, res) => {
    const { title, description, date, location } = req.body;
    const events = readData();
    const newEvent = { id: uuidv4(), title, description, date, location, votes: 0 };
    events.push(newEvent);
    writeData(events);
    res.status(201).json(newEvent);
});

// 4. Voter pour un événement
app.post('/events/:id/vote', (req, res) => {
    const events = readData();
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    
    if (eventIndex !== -1) {
        events[eventIndex].votes += 1;
        writeData(events);
        res.json(events[eventIndex]);
    } else {
        res.status(404).send('Not Found');
    }
});

app.listen(PORT, () => console.log(`Serveur prêt sur http://localhost:${PORT}`));