// notificationSender.js

const notificationapi = require('notificationapi-node-server-sdk').default;

notificationapi.init(
    '14eadjhddt7i0ln1o5pas0tvca', // clientId
    '14qn0jegih2qq32g7o05l4dpvep5j72gr0ca0bvldvh9351l4itt'// clientSecret
);

async function sendNotification() {
    try {
        const response = await notificationapi.send({
            notificationId: 'new_comment',
            user: {
                id: "bahaeddine170@gmail.com",
                email: "bahaeddine170@gmail.com",
                number: "+15005550006" // Replace with your phone number
            },
            mergeTags: {
                "comment": "Build something great :)",
                "commentId": "commentId-1234-abcd-wxyz"
            }
        });
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

module.exports = {sendNotification};
