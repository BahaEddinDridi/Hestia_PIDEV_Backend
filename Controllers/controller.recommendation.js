const User = require('../Models/user');
const JobOffer = require('../Models/job');

// Controller method to recommend job offers based on user skills and location using Collaborative Filtering
const recommendUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the user's skills and location
        const userSkills = user.skills;
        
        const userLocation = user.location;
        

        // Query all job offers
        const allJobOffers = await JobOffer.find();

        // Calculate recommendation scores for each job offer using Collaborative Filtering
        const scoredJobOffers = allJobOffers.map(jobOffer => {
            const skillMatchScore = calculateSkillMatchScore(jobOffer.jobRequiredSkills, userSkills);
            const locationScore = calculateLocationScore(jobOffer.jobLocation, userLocation);

            // Placeholder for Collaborative Filtering score (item-based approach)
            const collaborativeFilteringScore = calculateCollaborativeFilteringScore(jobOffer, user);

            // Combine scores into a weighted average (adjust weights as needed)
            const totalScore = 0.5 * skillMatchScore + 0.3 * locationScore + 0.2 * collaborativeFilteringScore;

            return { jobOffer, score: totalScore };
        });

        // Sort job offers by score in descending order
        scoredJobOffers.sort((a, b) => b.score - a.score);

        // Extract recommended job offers (sorted by score)
        const recommendedJobOffers = scoredJobOffers.map(scoredOffer => scoredOffer.jobOffer);

        // Return the recommended job offers
        res.status(200).json({ jobOffers: recommendedJobOffers });
    } catch (error) {
        console.error('Error recommending job offers:', error);
        res.status(500).json({ error: 'Failed to recommend job offers' });
    }
};

// Helper function to calculate skill match score
function calculateSkillMatchScore(jobSkills, userSkills) {
    const matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
    return matchingSkills.length / userSkills.length; // Normalized score between 0 and 1
}

// Helper function to calculate location score (proximity-based)
function calculateLocationScore(jobLocation, userLocation) {
    // Example: Calculate score based on distance (e.g., using geospatial coordinates)
    // For simplicity, a placeholder function is used here
    const distance = calculateDistance(jobLocation, userLocation);
    return 1 / (1 + distance); // Higher score for closer locations
}

// Placeholder function to calculate Collaborative Filtering score (item-based approach)
function calculateCollaborativeFilteringScore(jobOffer, user) {
    // Check if the user document and jobOffers array are defined
    if (!user || !user.jobOffers || !Array.isArray(user.jobOffers)) {
        return 0; // Return a default score if user data is incomplete or invalid
    }

    // Placeholder logic for Collaborative Filtering score
    // This could involve analyzing user-item interactions or similarities
    // For demonstration, check if the jobOffer ID is present in user's jobOffers array
    const commonInteractions = user.jobOffers.some(offerId => offerId.equals(jobOffer._id));
    return commonInteractions ? 1 : 0;
}

// Placeholder function to calculate distance (for demonstration purposes)
function calculateDistance(location1, location2) {
    // Simulated distance calculation (not a real implementation)
    return Math.abs(location1 - location2); // Placeholder for distance calculation
}

module.exports = {
    recommendUser
};
