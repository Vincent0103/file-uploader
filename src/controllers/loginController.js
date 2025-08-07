import passport from "passport";

const loginController = (() => {
  const loginGet = (req, res) => {
    return res.render("login");
  };

  const loginPost = [
    (req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).render("login", {
            errors: [{ msg: info.message }],
            username: req.body.username,
          });
        }
        req.logIn(user, (err) => {
          if (err) return next(err);
          return res.redirect("/");
        });
      })(req, res, next);
    },
  ];

  return { loginGet, loginPost };
})();

export default loginController;
