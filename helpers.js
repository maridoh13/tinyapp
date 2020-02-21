// HELPER FUNCTIONS

const getEmailByUserID = (userID, users) => {
  return users[userID].email;
};

const getUserByEmail = (email, users) => {
  for (let el in users) {
    if (users[el]['email'] === email) {
      return users[el].id;
    }
  }
  return false;
};

const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


module.exports = {
  getEmailByUserID,
  getUserByEmail,
  generateRandomString,
};