const express = require("express");
const userRouter = express.Router();
const User = require("../models/user.model");
const auth = require("../middlewares/auth");

userRouter.post('/api/update-user', auth, async (req, res) => {
    try {
        const { id, imageUrl, gender, des } = req.body;
        let user = await User.findById(id);

        user.gender = gender;
        user.imageUrl = imageUrl;
        user.des = des;
        user = await user.save();
        res.json(user);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/get-user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        console.log(user);
        res.json(user);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = userRouter;