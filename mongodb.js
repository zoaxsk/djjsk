// Update in mongodb.js

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const colors = require('./UI/colors/colors');
const configPath = path.join(__dirname, 'config.json');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const uri = config.mongodbUri || process.env.MONGODB_URI;
const client = new MongoClient(uri);

const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('\n' + '─'.repeat(40));
        console.log(`${colors.magenta}${colors.bright}🕸️  DATABASE CONNECTION${colors.reset}`);
        console.log('─'.repeat(40));
        console.log('\x1b[36m[ DATABASE ]\x1b[0m', '\x1b[32mConnected to MongoDB ✅\x1b[0m');

       
        await mongoose.connect(uri);
        console.log('\x1b[36m[ MONGOOSE ]\x1b[0m', '\x1b[32mConnected using Mongoose ✅\x1b[0m');
        
       
        await initCollections();

    } catch (err) {
        console.error("❌ Error connecting to MongoDB or Mongoose", err);
    }
}


async function initCollections() {
    giveawayCollection = db.collection('giveaways');
    try {
        await giveawayCollection.createIndex({ messageId: 1 }, { unique: true });
        console.log('\x1b[36m[ COLLECTION ]\x1b[0m', '\x1b[32mGiveaway collection initialized ✅\x1b[0m');
    } catch (err) {
        console.error("❌ Error initializing giveaway collection", err);
    }
}

const db = client.db("discord-bot");
const voiceChannelCollection = db.collection("voiceChannels");
const centralizedControlCollection = db.collection("centralizedControl"); 
const nqnCollection = db.collection("nqn");
const welcomeCollection = db.collection("welcomeChannels");
const autoroleCollection = db.collection("autorolesetups");
const hentaiCommandCollection = db.collection("hentailove");
const serverConfigCollection = db.collection("serverconfig");
const reactionRolesCollection = db.collection("reactionRoles");
const antisetupCollection = db.collection("antisetup");
const anticonfigcollection = db.collection("anticonfiglist");
const afkCollection = db.collection('afk');
const notificationsCollection = db.collection("notifications");
const logsCollection = db.collection("logs");
const nicknameConfigs = db.collection("nicknameConfig");
const economyCollection = db.collection("economy"); 
const usersCollection = db.collection('users'); 
const epicDataCollection = db.collection('epicData');
const customCommandsCollection = db.collection('customCommands');
const birthdayCollection = db.collection('birthday'); 
const applicationCollection = db.collection('applications'); 
const serverLevelingLogsCollection = db.collection('serverLevelingLogs');
const commandLogsCollection = db.collection('commandLogs');
const reportsCollection = db.collection('reports'); 
const stickyMessageCollection = db.collection('stickymessages');
const serverStatsCollection = db.collection('serverStats');
const autoResponderCollection = db.collection('autoResponder');
const playlistCollection = db.collection('lavalinkplaylist');
const autoplayCollection = db.collection('autoplaylavalink');
const embedCollection = db.collection('aioembeds');
const countingCollection = db.collection('countingame');
const botStatusCollection = db.collection('bot_status');
const scheduleCollection = db.collection('scheduleCollections')
const gameAccountsCollection = db.collection('gameAccounts');
let giveawayCollection;

async function saveGiveaway(giveaway) {
    if (!giveawayCollection) {
        console.error("Giveaway collection not initialized!");
        return;
    }
    
    await giveawayCollection.updateOne(
        { messageId: giveaway.messageId },
        { $set: giveaway },
        { upsert: true }
    );
}

async function getGiveaways() {
    if (!giveawayCollection) {
        console.error("Giveaway collection not initialized!");
        return [];
    }
    
    return await giveawayCollection.find().toArray();
}

async function getGiveawayById(messageId) {
    if (!giveawayCollection) {
        console.error("Giveaway collection not initialized!");
        return null;
    }
    
    return await giveawayCollection.findOne({ messageId });
}

async function deleteGiveaway(messageId) {
    if (!giveawayCollection) {
        console.error("Giveaway collection not initialized!");
        return;
    }
    
    await giveawayCollection.deleteOne({ messageId });
}

// Export without the redundant initGiveawayCollection function
module.exports = {
    connectToDatabase,
    voiceChannelCollection,
    centralizedControlCollection, 
    nqnCollection,
    welcomeCollection,
    giveawayCollections: db.collection('giveaways'), // For backwards compatibility
    saveGiveaway,
    getGiveaways,
    getGiveawayById,
    deleteGiveaway,
    autoroleCollection,
    hentaiCommandCollection,
    serverConfigCollection,
    reactionRolesCollection,
    antisetupCollection,
    notificationsCollection,
    anticonfigcollection,
    afkCollection,
    logsCollection,
    nicknameConfigs,
    usersCollection,
    epicDataCollection,
    customCommandsCollection,
    economyCollection,
    birthdayCollection,
    applicationCollection,
    serverLevelingLogsCollection,
    commandLogsCollection,
    reportsCollection,
    stickyMessageCollection,
    serverStatsCollection,
    autoResponderCollection,
    playlistCollection,
    autoplayCollection,
    embedCollection,
    countingCollection,
    botStatusCollection,
    scheduleCollection,
    gameAccountsCollection,
};