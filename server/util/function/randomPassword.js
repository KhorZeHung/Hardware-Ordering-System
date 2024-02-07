function randomPassword(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const passwordLength = length;

  let user_temp_password = "";

  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    user_temp_password += characters.charAt(randomIndex);
  }

  return user_temp_password;
}

module.exports = {
  randomPassword,
};
