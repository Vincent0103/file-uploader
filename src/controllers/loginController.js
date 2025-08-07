import passport from "passport";

const loginController = (() => {
  const loginGet = (req, res) => {
    return res.render("login");
  };

  const loginPost = () => {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    });
  };

  return { loginGet, loginPost };
})();

export default loginController;
