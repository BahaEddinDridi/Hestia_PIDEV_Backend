const express = require('express');
const router = express.Router();
const Conversation = require("../Models/Conversation");
const User = require('../Models/user')

//new Conversation
router.post("/", async (req,res)=> {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
});

try{
    const saveConversation = await newConversation.save();
    res.status(200).json(saveConversation)
}catch(err){
    res.status(500).json(err)
}
});

//get conv of a user
router.get("/:userId" , async (req,res) => {
    try{
        const conversation = await Conversation.find({
            members : { $in: [req.params.userId]},
        });
        res.status(200).json(conversation)
    }catch(err){
        res.status(500).json(err);
    }
})

//get conversation includes 2 users id
router.get("/find/:firstUserId/:secondUserId", async (req,res)=>{
    try{
        const firstUserId = req.params.firstUserId;
        const secondUserId = req.params.secondUserId;

        // Recherchez une conversation existante entre les deux utilisateurs
        let conversation = await Conversation.findOne({
            members: { $all : [firstUserId, secondUserId] }
        });

        // Si aucune conversation n'est trouvée, créez une nouvelle conversation
        if (!conversation) {
            const newConversation = new Conversation({
                members: [firstUserId, secondUserId]
            });
            conversation = await newConversation.save();
        }

        res.status(200).json(conversation);
    } catch(err){
        res.status(500).json(err);
    }
});



module.exports = router;