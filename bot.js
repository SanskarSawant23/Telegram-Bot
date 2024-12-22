const token = '7874112201:AAGVHC3xqNRPx1lmybL6-naUuJ61-HqP-wE'
const TelegramBot = require("node-telegram-bot-api");
const express = require('express')
const crypto = require('crypto')
const axios = require('axios')

const {PrismaClient} = require('@prisma/client');
const { check } = require("prisma");
const prisma = new PrismaClient();
const app = express();

const CLIENT_ID = 'lzFzi1Zxv1YNhWLcKQVodW_eL1nUustZvjyLwZukq0U';
const CLIENT_SECRET = 'fLaxNXpPSDjYYIf8YFmlmTR898o1nLedisVI3vFyiwn-bivTH8QritBjjsCqysO4a5mcRdholdD1S0a32n-imQ';
const HUBSTAFF_API_URL = 'https://api.hubstaff.com/v2';



let bot = new TelegramBot(token, {polling:true});
bot.on('message', (msg)=>{
    console.log("raw messgae received", msg)
})
const groupId = '933767902'

const user = {};
const checkMember = async (chatId, userId )=>{
    try{
        const chatMember = await bot.getChatMember(groupId, userId);
        if(['member','administrator','creator'].includes(chatMember.status)){
            // bot.sendMessage(chatId,"your are part of the group! you can access this endpoint")
            return false;
        }else{
            bot.sendMessage(chatId,"Your are not part of the group." )
            return true;
        }
    } catch(error){
        console.error("error checking membership", error);
    } 
}



bot.onText(/\/help/, (msg) => {
    let chatId = msg.chat.id;
    const message = `
<b>👋 Welcome to PV Operations Bot!</b>
<i>Here are the available commands:</i>

- <code>/start</code> - <span class="tg-spoiler">Displays the start message</span>
- <code>/dailyupdate</code> - <span class="tg-spoiler">Submit your daily update</span>
- <code>/leave</code> - <span class="tg-spoiler">Mark yourself as on leave</span>
- <code>/help</code> - <span class="tg-spoiler">Display this help message</span>
- <code>/hubstaff</code> - <span class="tg-spoiler">Link Telegram with Hubstaff</span>
- <code>/addtask</code> - <span class="tg-spoiler">Add new task on Hubstaff</span>
- <code>/listtask</code> - <span class="tg-spoiler">List all Hubstaff active tasks</span>
- <code>/stats</code> - <span class="tg-spoiler">Display Hubstaff stats</span>
    ↳ Advanced: <code>/stats @User [today|yesterday|week|lastweek|month]</code>
- <code>/feedback</code> - <span class="tg-spoiler">Give feedback</span>

<i>Type any command to get started!</i>`;

    bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                ['/start', '/help'],
                ['/dailyupdate', '/leave'],
                ['/hubstaff', '/stats'],
                ['/addtask', '/listtask'],
                ['/feedback']
            ],
            resize_keyboard: true
        }
    });
});
bot.onText(/\/start/, (msg)=>{
   bot.sendMessage(msg.chat.id, ` simplly type /help to get all the commands`)

})

bot.onText(/\/leave/, async(msg)=>{
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if(checkMember(chatId,userId)){
        let user = await prisma.user.findUnique({
            where: { telegramId: userId.toString() }
        });
    
        if (!user) {
            // Create a new user if not found
            user = await prisma.user.create({
                data: {
                    telegramId: userId.toString(),
                    feedback: null,
                    leave: true, // Mark the user as on leave
                },
            });
        } else {
            // Update the user's leave status
            user = await prisma.user.update({
                where: { telegramId: userId.toString() },
                data: { leave: true },
            });
        }
    
        bot.sendMessage(chatId, "You have been marked as on leave.");
    }
})


// bot.on('message', (msg)=>{
//     console.log(msg);
//     const chatid = msg.chat.id;
//     const chatTitle = msg.chat.title;

//     //console.log(`Chat ID: ${chatid}, Group Name: ${chatTitle || 'N/A'}`);

//     bot.sendMessage(chatid, `This group's chat ID is: ${chatid}`);
// })

bot.onText(/\/dailyupdate/, (msg) =>{
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    checkMember(chatId, userId);
   
})

bot.onText(/\/leave/, (msg) =>{
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    checkMember(chatId, userId)
})
bot.onText(/\/feedback/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Ask for feedback
    bot.sendMessage(chatId, "Please type your feedback. To cancel, type /cancel.");
    
    // Store user feedback after they type it
    bot.on('message', async (msg) => {
        if (msg.from.id === userId && msg.text !== '/cancel') {
            const feedbackText = msg.text;

            // Check if user already exists
            let user = await prisma.user.findUnique({
                where: { telegramId: userId.toString() }
            });

            if (!user) {
                // Create a new user if not found
                user = await prisma.user.create({
                    data: {
                        telegramId: userId.toString(),
                        feedback: feedbackText,
                        leave: false,
                    },
                });
            } else {
                // Update the user's feedback
                user = await prisma.user.update({
                    where: { telegramId: userId.toString() },
                    data: { feedback: feedbackText },
                });
            }

            bot.sendMessage(chatId, "Thank you for your feedback!");
        } else if (msg.text === '/cancel') {
            bot.sendMessage(chatId, "Feedback process canceled.");
        }
    });
});



 // Store user states temporarily for linking process

// Hubstaff API credentials


// Handle /hubstaff command


// Handle user messages to get their email
// bot.on('message', (msg) => {
//     console.log("Inside message handler");
//     const chatId = msg.chat.id;
//     const userId = msg.from.id;

//     // Check if msg.text exists first
//     if (!msg.text) {
//         console.log('Non-text message received');
//         return;
//     }

//     // Now safely check for commands
//     if (msg.text.startsWith('/')) {
//         console.log('Command detected, ignoring in message handler.');
//         return;
//     }

//     console.log("Non-command message received:", msg.text);

//     // Find the user state
//     const state = Object.keys(user).find(
//         (key) => user[key].telegramId === userId && user[key].status === 'awaiting_email'
//     );

//     if (state) {
//         console.log(`User in 'awaiting_email' state: ${state}`);
//         const userEmail = msg.text;

//         // Save the email and update user state
//         user[state].email = userEmail;
//         user[state].status = 'email_received';

//         console.log(`Email received from user: ${userEmail}`);

//         // Validate email with Hubstaff
//         validateHubstaffEmail(userEmail, chatId, state);
//     } else {
//         console.log("No user state found. Sending default response.");
//         bot.sendMessage(chatId, "I didn't understand that. If you need help, type /help.");
//     }
// });




bot.onText(/\/hubstaff/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Generate a unique state for this user
    const state = crypto.randomBytes(16).toString('hex');
    user[state] = { telegramId: userId, status: 'awaiting_email' };

    // Prompt the user for their Hubstaff email
    bot.sendMessage(chatId, "Please provide your Hubstaff email to link your account.");


    console.log(`State created: ${state}, awaiting email from user: ${userId}`);
    bot.on("message", (msg)=>{
        console.log("Inside message handler");
            const chatId = msg.chat.id;
            const userId = msg.from.id;
        
            // Check if msg.text exists first
            if (!msg.text) {
                console.log('Non-text message received');
                return;
            }
        
            // Now safely check for commands
            if (msg.text.startsWith('/')) {
                console.log('Command detected, ignoring in message handler.');
                return;
            }
        
            console.log("Non-command message received:", msg.text);
        
            // Find the user state
            const state = Object.keys(user).find(
                (key) => user[key].telegramId === userId && user[key].status === 'awaiting_email'
            );
        
            if (state) {
                console.log(`User in 'awaiting_email' state: ${state}`);
                const userEmail = msg.text;
        
                // Save the email and update user state
                user[state].email = userEmail;
                user[state].status = 'email_received';
        
                console.log(`Email received from user: ${userEmail}`);
        
                // Validate email with Hubstaff
                validateHubstaffEmail(userEmail, chatId, state);
            } else {
                console.log("No user state found. Sending default response.");
                bot.sendMessage(chatId, "I didn't understand that. If you need help, type /help.");
            }
    })
});
// Function to validate email with Hubstaff API
async function validateHubstaffEmail(userEmail, chatId, state) {
    console.log("inside validatehubstaffemail")
    try {
        // You may need to call an API to search users in Hubstaff, like this:
        const response = await axios.get(`${HUBSTAFF_API_URL}/users`, {
            headers: { Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImRlZmF1bHQifQ.eyJqdGkiOiJVRktpaSt3dCIsImlzcyI6Imh0dHBzOi8vYWNjb3VudC5odWJzdGFmZi5jb20iLCJleHAiOjE3NDI0Nzg5MjMsImlhdCI6MTczNDcwMjkyMywic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBodWJzdGFmZjpyZWFkIn0.dsPyAtkhB7pgmDB_afLVjynqMdNZ2Jgkv9_2CP2JdGXeMLAnsYckPRv4DVgP5xLlY179VBg4oEUvzjKBZNHh3x3cnUCVW78X2RuS7j-G1TQe96tLDfGJ1hH2cWDLmwvQ7rwZr0KHAA7R6MehAWclZRAZBeizlVz7VT__8VYEufvbF9QEIKvTlNeOKii9m9VQ43N8MqkZzyCylymyAK7vN34e1f62F9z8bwh-BqhlSaeV8f_mYTRKMR3COKYs6YUz-7HxiTHHq8gufIbkFiTBHNTyp_kA7SMG91NI4f_gmoOgsFEJrm_-eXWyfX53_CLQIkxzPmS7tikWaKFiVqDKyw` }
        });

        const users = response.data;

        // Check if any user matches the email
        const userMatch = users.find(u => u.email === userEmail);

        if (userMatch) {
            // Proceed to the Hubstaff OAuth flow
            bot.sendMessage(chatId, "Email validated! Now proceeding to link your account...");
            initiateHubstaffOAuth(chatId, state);
        } else {
            // Email not found
            bot.sendMessage(chatId, "Email not registered with Hubstaff. Please check your email.");
            user[state].status = 'awaiting_email'; // Reset state to await email again
            bot.sendMessage(chatId, "Please provide your Hubstaff email again.");
        }
    } catch (error) {
        console.error("Error validating Hubstaff email:", error.message);
        bot.sendMessage(chatId, "An error occurred while validating your email. Please try again.");
    }
}

// Function to initiate the Hubstaff OAuth flow
function initiateHubstaffOAuth(chatId, state) {
    const authUrl = `https://account.hubstaff.com/authorize?client_id=${CLIENT_ID}&redirect_uri=https://yourapp.com/hubstaff-auth&response_type=code&state=${state}`;
    
    // Send the user the Hubstaff OAuth URL to authorize the app
    bot.sendMessage(chatId, `Please click the link to authorize your account: ${authUrl}`);
}

// Express route to handle Hubstaff OAuth callback
app.get('/hubstaff-auth', async (req, res) => {
    const { state, code } = req.query;
    
    if (!user[state]) {
        return res.status(400).send('Invalid or expired state token.');
    }

    try {
        // Exchange the code for an access token from Hubstaff
        const response = await axios.post('https://api.hubstaff.com/v2/auth/token', {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: 'https://yourapp.com/hubstaff-auth',
            code,
        });

        const { access_token } = response.data;
        const telegramId = user[state].telegramId;
        user[state].hubstaffToken = access_token;

        // Successfully linked the Hubstaff account
        bot.sendMessage(telegramId, 'Your Hubstaff account has been successfully linked!');
        res.send("Your Hubstaff account has been linked.");
    } catch (error) {
        console.error("Error linking Hubstaff account:", error.message);
        res.status(500).send('Failed to link your Hubstaff account.');
    }
});

// Start the Express server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});