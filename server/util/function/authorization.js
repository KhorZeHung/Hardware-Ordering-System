function isAdmin(req, res, next) {
  if (!req.user)
    return res.status(500).json({ message: "User missing from server side" });
  const position = req.user.user_position;
  if (position > 2)
    return res
      .status(401)
      .json({ message: "You do not have authorization to make changes. " });

  next();
}

function isManager(req, res, next) {
  if (!req.user)
    return res.status(500).json({ message: "User missing from server side" });
  const position = req.user.user_position;
  if (position === 2)
    return res
      .status(401)
      .json({ message: "You do not have authorization to make changes. " });

  next();
}
function isSuperuser(req, res, next) {
  if (!req.user)
    return res.status(500).json({ message: "User missing from server side" });
  const position = req.user.user_position;
  if (position !== 1)
    return res
      .status(401)
      .json({ message: "You do not have authorization to make changes. " });

  next();
}

module.exports = {
  isAdmin,
  isManager,
  isSuperuser,
};
