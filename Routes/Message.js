const express = require('express');
const router = express.Router();
const Message = require("../Models/Message");



//Add

router.post("/" , async (req,res) => {
    const newMessage = new Message(req.body);

    try{
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage)
    }catch(err) {
        res.status(500).json(err);
    }
});

// get 
router.get("/:conversationId" , async (req,res) => {
    try {
        const messages = await Message.find({
            ConversationId: req.params.conversationId
        })
        res.status(200).json(messages)
    }catch (err){
        res.status(500).json(err);
    }
});

// Get last message of a conversation
router.get("/lastMessage/:conversationId", async (req, res) => {
    try {
        const lastMessage = await Message.findOne({
            ConversationId: req.params.conversationId
        }).sort({ createdAt: -1 }).limit(1);

        res.status(200).json(lastMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;