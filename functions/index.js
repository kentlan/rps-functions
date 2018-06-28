const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const gamesRef = admin.database().ref('games')
const queueRef = admin.database().ref('queue')
const userListRef = admin.database().ref('userList')

const createGame = (users, userQueueKeys) => {
  const newGameData = {
      score: {
        [users[0]]: 0,
        [users[1]]: 0,
      }
    }

  const newGameKey = gamesRef.push(newGameData).key
  
  queueRef.child(userQueueKeys[0]).remove()
  queueRef.child(userQueueKeys[1]).remove()

  updateUserList(users, newGameKey)
}

const updateUserList = (users, newGameKey) => {
  const newUserList = {
    [users[0]]: newGameKey,
    [users[1]]: newGameKey,
  }
 
  userListRef.update(newUserList)
}

const setupGame = (users, userQueueKeys) => gamesRef
    .once('value')
    .then(games => createGame(users, userQueueKeys))
    .catch(console.log)

exports.getDatabase = functions.database.ref('queue').onUpdate((change) => {
  const currentQueue = change.after.val()
  const queueKeys = Object.keys(currentQueue || {})

  return queueKeys.length > 1 &&
    setupGame(
      [currentQueue[queueKeys[0]], currentQueue[queueKeys[1]]],
      [queueKeys[0], queueKeys[1]]
    )
})
