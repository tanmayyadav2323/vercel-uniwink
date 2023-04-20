const express = require("express");
const auth = require("../middlewares/auth");
const eventRouter = express.Router();
const Events = require("../models/event.model");
const UserEvents = require("../models/user.events");
const User = require("../models/user.model");
const Wink = require("../models/wink.model");
const Report = require("../models/report.model");
const Rate = require('../models/rate.model');

eventRouter.post('/api/user-event', auth, async (req, res) => {
    try {
        const events = await Events.find({ memberIds: { $in: [req.body.userId] } });
        res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.post('/api/edit-event', auth, async (req, res) => {
    try {
        console.log(req.body.title);
        let event = await Events.findById(req.body.id);
        event.title = req.body.title;
        event.organizer = req.body.organizer;
        event.about = req.body.about;
        event.image = req.body.image;
        event.latitude = req.body.latitude;
        event.longitude = req.body.longitude;
        event.images = req.body.images;
        event.startDateTime = req.body.startDateTime;
        event.endDateTime = req.body.endDateTime;
        await event.save();

        res.json(event);
    }
    catch (e) {
        console.log(e.message);
        res.status(500).json({ error: e.message });
    }
});

eventRouter.post('/api/create-event', auth, async (req, res) => {
    try {
        let event = new Events({
            id: req.body.id,
            title: req.body.title,
            authorId: req.body.authorId,
            memberIds: [],
            organizer: req.body.organizer,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            savedMembers: [],
            memberImageUrls: [],
            creationDate: req.body.creationDate,
            about: req.body.about,
            image: req.body.image,
            images: req.body.images,
            rating: req.body.rating,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime
        });
        await event.save();

        let updatedEvent = await joinEvent(event.id, req.body.authorId, req.body.memberImageUrls[0]);

        res.json(updatedEvent);
    }
    catch (e) {
        console.log(e.message);
        res.status(500).json({ error: e.message });
    }
});


eventRouter.get('/api/ongoing-events', auth, async (req, res) => {
    try {
        const today = new Date();
        const events = await Events.find({ startDateTime: { $lte: today }, endDateTime: { $gt: today } }).sort({ endDateTime: 1 });
        console.log(events);
        res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.get('/api/upcoming-events', auth, async (req, res) => {
    try {
        const today = new Date();
        const events = await Events.find({ startDateTime: { $gt: today } }).sort({ endDateTime: 1 });
        console.log(events);
        res.json(events);
    }
    catch (e) {

        res.status(500).json({ error: e.message });
    }
});



eventRouter.post('/api/rate-event', auth, async (req, res) => {
    try {
        const userId = req.body.userId;
        const rateValue = req.body.rateValue;
        const eventId = req.body.eventId;

        let rating = await Rate.findOne({ eventId, userId });

        if (rating) {
            rating.rate = rateValue;
        } else {
            rating = new Rate({
                eventId: eventId,
                userId: userId,
                rate: rateValue
            });
        }
        await rating.save();
        let allRating = await Rate.find({ eventId });
        let sum = 0;
        allRating.forEach(rate => sum += rate.rate);
        let avgRating = sum / allRating.length;
        let event = await Events.findById(eventId);
        event.rating = avgRating;
        event.save();
        res.json({});
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.post('/api/get-event-rating', auth, async (req, res) => {
    try {
        const userId = req.body.userId;
        const eventId = req.body.eventId;

        const rate = await Rate.findOne({ eventId, userId });

        if (rate) {
            res.json(rate);
        }
        else {
            res.json({ rate: 0 });
        }
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.get('/api/saved-events/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const events = await Events.find({ savedMembers: { $in: [userId] } });
        console.log(events);
        res.json(events);
    }
    catch (e) {

        res.status(500).json({ error: e.message });
    }
});

eventRouter.get('/api/my-events/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const events = await Events.find({ authorId: userId });
        console.log(events);
        res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

eventRouter.get('/api/joined-events/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const events = await Events.find({
            $and: [
                { memberIds: { $in: [userId] } },
                { authorId: { $ne: userId } }
            ]
        });
        console.log(events);
        res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.get('/api/past-events', auth, async (req, res) => {
    try {
        const today = new Date();
        const events = await Events.find({ endDateTime: { $lt: today } });
        res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

eventRouter.post('/api/save-event', auth, async (req, res) => {
    try {
        const { eventId, userId, add } = req.body;
        console.log(add);
        let event = await Events.findById(eventId);
        if (add == true) {
            event.savedMembers.push(userId);
        }
        else {
            const index = event.savedMembers.indexOf(userId);
            if (index > -1) {
                event.savedMembers.splice(index, 1);
            }
        }
        await event.save();
        return res.json();
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

eventRouter.get('/api/search-events/:search', auth, async (req, res) => {
    try {
        const search_query = req.params.search;
        console.log(search_query.toString());
        const events = await Events.find({ title: { $regex: new RegExp(`^${search_query}`, 'i') } });
        console.log(events);
        return res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

eventRouter.post('/api/join-event', auth, async (req, res) => {
    try {
        const { eventId, userId, imageUrl } = req.body;

        const updatedEvent = await joinEvent(eventId, userId, imageUrl);

        res.json(updatedEvent);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.post('/api/event-users', auth, async (req, res) => {
    try {
        const userIds = req.body.userIds;
        console.log(userIds);
        let users = await User.find({ _id: { $in: userIds } }).populate('winks');
        res.json(users);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.post('/api/user-winks', auth, async (req, res) => {
    try {
        const userId = req.body.userId;
        let user = await User.findById(userId).populate('winks');


        const otherUserIds = user.winks.map(wink => {
            const otherUserId = wink.winkedToId.toString() === userId ? wink.winkedById.toString() : wink.winkedToId.toString();
            return otherUserId;
        });
        let users = await User.find({ _id: { $in: otherUserIds } }).populate('winks');
        res.json(users);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

eventRouter.post('/api/report-event', auth, async (req, res) => {
    try {
        const userId = req.body.userId;
        const eventId = req.body.eventId;
        const message = req.body.message;

        let report = new Report({
            userId: userId,
            eventId: eventId,
            message: message,
        },);

        await report.save();
        res.json();
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

eventRouter.post('/api/delete-event', auth, async (req, res) => {
    try {
        const eventId = req.body.eventId;
        await Events.findByIdAndDelete(eventId);
        res.json();
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

eventRouter.post('/api/update-wink', auth, async (req, res) => {
    try {
        const winkId = req.body.winkId;
        let status = req.body.status;
        let message = req.body.message;

        let wink = await Wink.findById(winkId);
        console.log(wink);
        wink.message = message;
        wink.status = status;
        await wink.save();
        res.json({});
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



eventRouter.post('/api/wink-user', auth, async (req, res) => {
    try {
        const toUser = await User.findById(req.body.winkedToId);
        const byUser = await User.findById(req.body.winkedById);

        // Check if a wink already exists for the two users
        let wink = await Wink.findOne({
            winkedById: req.body.winkedById,
            winkedToId: req.body.winkedToId
        });

        if (wink) {
            // If wink exists, update the message and status fields
            wink.message = req.body.message;
            wink.status = req.body.status;
            await wink.save();
        } else {
            // If wink doesn't exist, create a new one
            wink = new Wink({
                winkedById: req.body.winkedById,
                winkedToId: req.body.winkedToId,
                status: req.body.status,
                message: req.body.message
            });

            await wink.save();
            toUser.winks.push(wink._id);
            byUser.winks.push(wink._id);
            await toUser.save();
            await byUser.save();
        }
        res.json({});
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eventRouter.post('/api/leave-event', auth, async (req, res) => {
    try {
        const eventId = req.body.eventId;
        const userId = req.body.userId;
        const imageUrl = req.body.imageUrl;

        let updatedEvent = await Events.findById(eventId);
        updatedEvent.memberIds = updatedEvent.memberIds.filter(id => id !== userId);
        updatedEvent.memberImageUrls = updatedEvent.memberImageUrls.filter(url => url !== imageUrl);

        let userEvents = await UserEvents.findById(userId);
        if (userEvents) {
            userEvents.eventIds = userEvents.eventIds.filter(id => id !== eventId);
            await userEvents.save();
        }

        await updatedEvent.save();
        return res.json();
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});


async function joinEvent(eventId, userId, imageUrl) {
    try {
        let updatedEvent = await Events.findById(eventId);
        updatedEvent.memberIds.push(userId);
        updatedEvent.memberImageUrls.push(imageUrl);


        let userEvents = await UserEvents.findById(userId);
        if (!userEvents) {
            userEvents = await UserEvents.create({
                id: userId,
                eventIds: [eventId]
            });
        } else {
            userEvents.eventIds.push(eventId);
        }

        await updatedEvent.save();
        await userEvents.save();
        return updatedEvent;
    } catch (e) {
        console.log(e.message);
        throw new Error(e.message);
    }
}

module.exports = eventRouter;