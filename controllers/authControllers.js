const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { getDb } = require("../utill/databaseutill");

// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.getSignup = (req, res, next) => {
    res.render("auth/signup", {
        pageTitle: "Signup",
        currentpage: "signup",
        errorMessage: null
    });
};

exports.postSignup = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        User.findByEmail(email, async (existingUser) => {
            if (existingUser) {
                return res.render("auth/signup", {
                    pageTitle: "Signup",
                    currentpage: "signup",
                    errorMessage: "Email already registered. Please login."
                });
            }
            const user = new User(name, email, password);
            await user.save();
            res.redirect("/login");
        });
    } catch (err) {
        console.log("Signup error: ", err);
    }
};

exports.getLogin = (req, res, next) => {
    res.render("auth/login", {
        pageTitle: "Login",
        currentpage: "login",
        errorMessage: null
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findByEmail(email, async (user) => {
        if (!user) {
            return res.render("auth/login", {
                pageTitle: "Login",
                currentpage: "login",
                errorMessage: "Invalid email or password."
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("auth/login", {
                pageTitle: "Login",
                currentpage: "login",
                errorMessage: "Invalid email or password."
            });
        }
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };
        req.session.save(err => {
            if (err) {
                console.log(err);
                return res.redirect("/login");
            }
            res.redirect("/");
        });
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) console.log("Logout error:", err);
        res.redirect("/login");
    });
};

// ✅ Forgot Password
exports.getForgotPassword = (req, res, next) => {
    res.render("auth/forgot-password", {
        pageTitle: "Forgot Password",
        currentpage: "login",
        errorMessage: null,
        successMessage: null
    });
};

exports.postForgotPassword = (req, res, next) => {
    const { email } = req.body;
    const db = getDb();

    User.findByEmail(email, async (user) => {
        if (!user) {
            return res.render("auth/forgot-password", {
                pageTitle: "Forgot Password",
                currentpage: "login",
                errorMessage: "There is no any account from this email!",
                successMessage: null
            });
        }

        // Token generate karo
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = Date.now() + 3600000; // 1 hour

        // Token MongoDB mein save karo
        await db.collection("users").updateOne(
            { email: email },
            { $set: { resetToken: token, resetTokenExpiry: expiry } }
        );

        // Reset link
        const resetLink = `http://localhost:3007/reset-password/${token}`;

        // Email bhejo
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Airbnb — Password Reset Link",
            html: `
                <h2>Password Reset Request</h2>
                <p>For reset password , click below:</p>
                <a href="${resetLink}" 
                   style="background:#ef4444;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    Reset Password
                </a>
                <p style="color:gray;margin-top:16px;">This link will invalid in next 1 hour.</p>
            `
        });

        res.render("auth/forgot-password", {
            pageTitle: "Forgot Password",
            currentpage: "login",
            errorMessage: null,
            successMessage: "Reset link is send on your email! ✅"
        });
    });
};

// ✅ Reset Password
exports.getResetPassword = (req, res, next) => {
    const { token } = req.params;
    const db = getDb();

    db.collection("users").findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    }).then(user => {
        if (!user) {
            return res.render("auth/forgot-password", {
                pageTitle: "Forgot Password",
                currentpage: "login",
                errorMessage: "Reset link is expired or invalid!",
                successMessage: null
            });
        }
        res.render("auth/reset-password", {
            pageTitle: "Reset Password",
            currentpage: "login",
            token: token,
            errorMessage: null
        });
    });
};

exports.postResetPassword = (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    const db = getDb();

    db.collection("users").findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    }).then(async user => {
        if (!user) {
            return res.render("auth/forgot-password", {
                pageTitle: "Forgot Password",
                currentpage: "login",
                errorMessage: "Reset link is expired!",
                successMessage: null
            });
        }

        // Naya password hash karo
        const hashedPassword = await bcrypt.hash(password, 12);

        // Password update karo aur token delete karo
        await db.collection("users").updateOne(
            { resetToken: token },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: "", resetTokenExpiry: "" }
            }
        );

        res.redirect("/login");
    });
};