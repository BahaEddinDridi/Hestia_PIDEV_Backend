const Notification = require('../Models/Notification');

async function createNotification(recipientId, type, message, jobId, applicantId) {
    try {

        const notification = new Notification({
            recipientId,
            type,
            message,
            jobId,
            applicantId
        });
        await notification.save();

        const { io, getUser } = require('../app');
        console.log('id', recipientId)
        const recipientUser = getUser(recipientId);
        console.log('Recipient user:', recipientUser);

        if (recipientUser) {
            console.log('Recipient is connected. Socket ID:', recipientUser.socketId);
            io.to(recipientUser.socketId).emit('newNotification', { notification });
            console.log('Notification created successfully and sent to recipient.');
        } else {
            console.log('Recipient is not connected. Notification not sent.');
        }
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

const getNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ recipientId: userId }).sort({ timestamp: -1 });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const markNotificationsAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;
        await Notification.updateMany(
            { _id: { $in: notificationIds } },
            { $set: { read: true } }
        );
        res.status(200).send({ message: 'Notifications marked as read successfully' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

module.exports = {
    createNotification,
    getNotificationsByUserId,
    markNotificationsAsRead
};