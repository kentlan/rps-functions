const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const gamesRef = admin.database().ref('games')
const queueRef = admin.database().ref('queue')
const userListRef = admin.database().ref('userList')

const removeFromQueue = (currentQueue, users) => {
  const newQueue = currentQueue.filter(id => console.log('nu i pizda', !(id === users[0] || id === users[1])) || !(id === users[0] || id === users[1]))
  queueRef.set(newQueue)
}

const createGame = (currentGames, users, newGameId) => {
  const newGames = Object.assign(currentGames || {}, {
    [newGameId]: {
      score: {
        [users[0]]: 0,
        [users[1]]: 0,
      },
    },
  })

  gamesRef.set(newGames)
}

const updateUserList = (currentUserList, users, newGameId) => {
  const newUserList = Object.assign(currentUserList || {}, {
    [users[0]]: newGameId,
    [users[1]]: newGameId,
  })
 
  userListRef.set(newUserList)
}

const setupGame = (users) => {
  const newGameId = gamesRef.push().key

  gamesRef
    .once('value')
    .then(games => createGame(games ? games.val() : {}, users, newGameId))
    .catch(console.log)

  queueRef
    .once('value')
    .then(queue => removeFromQueue(queue.val(), users))
    .catch(console.log)

  userListRef
    .once('value')
    .then(userList => updateUserList(userList.val(), users, newGameId))
    .catch(console.log)
}

exports.getDatabase = functions.database.ref('queue').onUpdate((change) => {
  const currentQueue = change.after.val()
  currentQueue.length > 1 && setupGame([currentQueue[0], currentQueue[1]])
})
