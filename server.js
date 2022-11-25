//exact copy of full example code from (https://medium.com/izettle-engineering/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679)
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const app = express()
app.use(cors())
app.use(bodyParser.json())
const port = process.env.PORT || 4000
app.get('/api', (req, res) => res.send('Hello World!'))
const dummyDb = { subscriptions: [] } //dummy in memory store

const saveToDatabase = async data => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscriptions.push(data)
}

app.get('/', async (req, res) => {
  res.json({ message: 'live' })
});

app.post('/api/clear', async (req, res) => {
  dummyDb.subscriptions = [];

  res.json({ message: 'success' })
});

app.post('/api/save-subscription', async (req, res) => {
  const subscription = req.body
  await saveToDatabase({...subscription, id: Date.now()}) //Method to save the subscription to Database
  res.json({ message: 'success' })
});

app.post('/api/remove-subscription', async (req, res) => {
  const subscriptionToRemove = req.body;

  dummyDb.subscriptions = dummyDb.subscriptions.filter(({subscription}) => JSON.stringify(subscription) !== JSON.stringify(subscriptionToRemove))

  res.json({ message: 'success' })
});

app.get('/api/subscriptions', async (req, res) => {
  res.json(dummyDb.subscriptions.map(({id, info}) => ({id, info})))
});

const vapidKeys = {
  publicKey:
    'BKMBshDExl6CQiJLloq5d_w7F67jCwh_p84kP07U3OEUxRpjIJEbfTEXZdCcBZfibGBvkm1i5S4m5eckrXl33mk',
  privateKey: 'LjxT-QJI8V3X0cjokh8qelmGJ3U1_Mu-hBjcdEYlWF8',
}
//setting our previously generated VAPID keys
webpush.setVapidDetails(
  'mailto:myuserid@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)
//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend) => {
  webpush.sendNotification(subscription, dataToSend)
}
//route to test send notification
app.post('/api/send-notification', (req, res) => {
  const {message, id} = req.body;

  const subscription = dummyDb.subscriptions.find((item) => item.id === id)?.subscription

  sendNotification(subscription, JSON.stringify({
    "notification": {
      // "actions": NotificationAction[],
      // "badge": USVString,
      // "body": DOMString,
      "body": message,
      // "dir": "auto"|"ltr"|"rtl",
      // "icon": USVString,
      // "image": USVString,
      // "lang": DOMString,
      // "renotify": boolean,
      // "requireInteraction": boolean,
      // "silent": boolean,
      // "tag": DOMString,
      // "timestamp": DOMTimeStamp,
      "title": 'TEST PUSH',
      // "vibrate": number[]
    }
  }))
  res.json({ message: 'message sent' })
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
