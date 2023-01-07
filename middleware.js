const User = require("./models/user");

module.exports.isAdmin = async (req, res, next) => {
    if (!res.locals.currentUser) {
        req.flash("error", "Войдите в свой аккаунт");
        return res.redirect("/login");
    }
    const { id } = res.locals.currentUser;
    const user = await User.findById(id);
    if (!user.isAdmin) {
        req.flash("error", "Это действие может выполнять только администратор");
        return res.redirect("/pictures");
    }
    next();
};
