const { Types: { ObjectId } } = require('mongoose');
const Application = require('../Models/Application');
const User = require('../Models/user');
const Job = require('../Models/job');
const Intership = require('../Models/internship');
const { createNotification } = require('./controller.notification');
const axios = require('axios');
const Notification=require("../Models/Notification");
const {io} = require("../app");

const notificationapi = require('notificationapi-node-server-sdk').default;

notificationapi.init(
    '14eadjhddt7i0ln1o5pas0tvca',
    '14qn0jegih2qq32g7o05l4dpvep5j72gr0ca0bvldvh9351l4itt'
);
const saveApplication = async (req, res) => {
    try {
        const { fullName, email, phoneNumber,applicantUsername, motivationLetter, resume,companyName,companyLogo,jobTitle, userId, jobId } = req.body;

        const job = await Job.findById(jobId).populate('jobApplications');
        const userHasApplied = job.jobApplications.some(application => application.applicantUsername === applicantUsername);
        if (userHasApplied) {
            return res.status(400).json({ error: 'User has already applied for this job' });
        }

        const user = await User.findById(userId);

        const newApplication = new Application({
            fullName,
            email,
            phoneNumber,
            applicantUsername,
            submitDate : new Date(),
            motivationLetter,
            resume,
            companyName,
            companyLogo,
            jobTitle,
            jobId : job._id
        });
        await newApplication.save();

        user.applications.push(newApplication);
        job.jobApplications.push(newApplication);


        await Promise.all([user.save(),job.save()]);
        const company = await User.findById(job.jobCompanyId);
        await createNotification(
            job.jobCompanyId,
            'job_application',
            `${user.username} has applied for the ${job.jobTitle} job offer`,
            job._id,
            user._id
        );
         // Envoie une notification à l'administrateur
         const adminUser = await User.findOne({ role: 'admin' });
         if (adminUser) {
             const adminId = adminUser._id; // Récupérer l'ID de l'administrateur

             const notification = new Notification({
                 recipientId: adminId, // Remplacez par l'ID de l'admin
                 type: 'job_application',
                 message: `${user.username} has applied for the ${job.jobTitle} job offer `,
             });

             await notification.save();
             console.log(notification);
         }

        await notificationapi.send({
            notificationId: 'new_job_application',
            user: {
                id: company.email,
                email: company.email,
                number: company.phoneNumber
            },
            mergeTags: {
                "job_title": jobTitle,
                "company_name": companyName,
                "applicant_name": fullName,
                "applicant_email": email,
                "applicant_phoneNumber": phoneNumber,
                "applicant_resume": resume
            }
        })

        res.status(201).json({ message: 'Application saved successfully' });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const saveInternshipApplication = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, applicantUsername, motivationLetter, resume, companyName, companyLogo, jobTitle, userId, internshipId } = req.body;

        const internship = await Intership.findById(internshipId).populate('internshipApplications');
        const userHasApplied = internship.internshipApplications.some(application => application.applicantUsername === applicantUsername);
        if (userHasApplied) {
            return res.status(400).json({ error: 'User has already applied for this internship' });
        }

        const user = await User.findById(userId);

        const newApplication = new Application({
            fullName,
            email,
            phoneNumber,
            applicantUsername,
            submitDate : new Date(),
            motivationLetter,
            resume,
            companyName,
            companyLogo,
            jobTitle,
            internshipId: internship._id
        });
        await newApplication.save();

        user.applications.push(newApplication);
        internship.internshipApplications.push(newApplication);

        await Promise.all([user.save(), internship.save()]);

        await createNotification(
            internship.interCompanyId,
            'internship_application',
            `${user.username} has applied for the ${internship.interTitle} job offer`,
            internship._id,
            user._id
        );
         // Envoie une notification à l'administrateur
         const adminUser = await User.findOne({ role: 'admin' });
         if (adminUser) {
             const adminId = adminUser._id; // Récupérer l'ID de l'administrateur

             const notification = new Notification({
                 recipientId: adminId, // Remplacez par l'ID de l'admin
                 type: 'internship_application',
                 message: `${user.username} has applied for the ${internship.interTitle} intership offer `,
             });

             await notification.save();
             console.log(notification);
         }

        res.status(201).json({ message: 'Application for internship saved successfully' });
    } catch (error) {
        console.error('Error saving internship application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { fullName, email, phoneNumber, motivationLetter, resume, userId, jobId } = req.body;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        application.fullName = fullName;
        application.email = email;
        application.phoneNumber = phoneNumber;
        application.motivationLetter = motivationLetter;
        application.resume = resume;

        await application.save();

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found')
            return res.status(404).json({ error: 'User not found' });
        }
        const userApplicationIndex = user.applications.findIndex(app => app._id.toString() === applicationId);
        if (userApplicationIndex !== -1) {
            user.applications[userApplicationIndex] = application;
            await user.save();
        }

        // Update the application in the job offer's applications list
        const job = await Job.findById(jobId);
        if (!job) {
            console.log('Job not found')
            return res.status(404).json({ error: 'Job offer not found' });
        }
        const jobApplicationIndex = job.jobApplications.findIndex(app => app._id.toString() === applicationId);
        if (jobApplicationIndex !== -1) {
            job.jobApplications[jobApplicationIndex] = application;
            await job.save();
        }

        res.status(200).json({ message: 'Application updated successfully' });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateInternshipApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { fullName, email, phoneNumber, motivationLetter, resume, userId, internshipId } = req.body;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        application.fullName = fullName;
        application.email = email;
        application.phoneNumber = phoneNumber;
        application.motivationLetter = motivationLetter;
        application.resume = resume;

        await application.save();

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
        const userApplicationIndex = user.applications.findIndex(app => app._id.toString() === applicationId);
        if (userApplicationIndex !== -1) {
            user.applications[userApplicationIndex] = application;
            await user.save();
        }

        // Update the application in the internship's applications list
        const internship = await Intership.findById(internshipId);
        if (!internship) {
            console.log('Internship not found');
            return res.status(404).json({ error: 'Internship not found' });
        }
        const internshipApplicationIndex = internship.internshipApplications.findIndex(app => app._id.toString() === applicationId);
        if (internshipApplicationIndex !== -1) {
            internship.internshipApplications[internshipApplicationIndex] = application;
            await internship.save();
        }

        res.status(200).json({ message: 'Application for internship updated successfully' });
    } catch (error) {
        console.error('Error updating internship application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getApplicationsByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const applications = await Application.find({ applicantUsername: username }).sort({submitDate :-1});
        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching applications by username:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        console.log('Application ID:', applicationId);

        const application = await Application.findById(applicationId);
        console.log('Application:', application);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const user = await User.findOne({ username: application.applicantUsername });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        const userIndex = user.applications.findIndex(application => application && application._id.toString() === applicationId);
        console.log('user', userIndex)
        if (userIndex !== -1) {
            user.applications.splice(userIndex, 1);
            await user.save();
        }


        if (application.jobId) {
            const job = await Job.findById(application.jobId);
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }

            const jobIndex = job.jobApplications.findIndex(application => application && application._id.toString() === applicationId);
            console.log('job', jobIndex)
            if (jobIndex !== -1) {
                job.jobApplications.splice(jobIndex, 1);
                await job.save();
            }
        } else if (application.internshipId) {
            const internship = await Intership.findById(application.internshipId);
            if (!internship) {
                return res.status(404).json({ error: 'Internship not found' });
            }

            const internshipIndex = internship.internshipApplications.findIndex(application => application && application._id.toString() === applicationId);
            console.log('intership', internshipIndex)
            if (internshipIndex !== -1) {
                internship.internshipApplications.splice(internshipIndex, 1);
                await internship.save();
            }
        }


        await Application.findByIdAndDelete(applicationId);

        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId, newStatus ,DateInterview} = req.body;
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        if (!['Pending', 'Accepted', 'Rejected'].includes(newStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        application.status = newStatus;
        await application.save();
        const user = await User.findOne({ username: application.applicantUsername });

        await createNotification(
            user._id,
            'status',
            `Your application for the ${application.jobTitle} job offer has been ${newStatus.toLowerCase()}.`, // message
            application.jobId,
            user._id
        );
        await notificationapi.send({
            notificationId: 'application_status_update',
            user: {
                id: user.email,
                email: user.email,
                number: user.phoneNumber
            },
            mergeTags: {
                "job_title": application.jobTitle,
                "fullname": user.firstName ,
                "company_name": application.companyName,
                "decision": newStatus
            }
        }) ;
         if (newStatus === 'Accepted') {
            
            application.interviewDates=DateInterview.map(date => new Date(date));
            await application.save();
          }else if (newStatus === 'Rejected') {
            application.interviewDates = null;
            await application.save();
        }
        await User.updateOne(
            { username: application.applicantUsername, 'applications._id': application._id },
            { $set: { 'applications.$.status': newStatus , 'applications.$.interviewDates':application.interviewDates } },
            
        );
        await Job.updateOne(
            { 'jobApplications._id': application._id },
            { $set: { 'jobApplications.$.status': newStatus } }
            
        );
        res.status(200).json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const updatestatuinter = async (req, res) => {
    try {
        const { applicationId, newStatus } = req.body;
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        if (!['Pending', 'Accepted', 'Rejected'].includes(newStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        application.status = newStatus;
        await application.save();

            
        const user = await User.findOne({ username: application.applicantUsername });
        await createNotification(
            user._id,
            'status',
            `Your application for the ${application.jobTitle} internship offer has been ${newStatus.toLowerCase()}.`, // message
            application.jobId,
            user._id
        );

        await User.updateOne(
            { username: application.applicantUsername, 'applications._id': application._id },
            { $set: { 'applications.$.status': newStatus  } }
        );

        await Intership.updateOne(
            { 'internshipApplications._id': application._id },
            { $set: { 'internshipApplications.$.status': newStatus } }
        );
       


        res.status(200).json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//get jobApplication Available 
const getAvailableJobsApplications = async (req, res) => {
    try {
        const today = new Date();
        const jobs = await Job.find({
            jobApplicationDeadline: { $gt: today },
            jobApplications: { $exists: true, $not: { $size: 0 } },
            jobCommpanyName: { $exists: true },
        }).select('jobCommpanyName jobTitle jobApplicationDeadline jobApplications');
        
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//get jobApplication Not Available
const getUnavailableJobsApplications = async (req, res) => {
    try {
        const today = new Date();
        const jobs = await Job.find({
            jobApplicationDeadline: { $lt: today },
            jobApplications: { $exists: true, $not: { $size: 0 } },
            jobCommpanyName: { $exists: true },
        }).select('jobCommpanyName jobTitle jobApplicationDeadline jobApplications');
        
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching unavailable jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// get IntershipApplication available 
const getAvailableInternshipApplications = async (req, res) => {
    try {
        const today = new Date();
        const internships = await Intership.find({
            interApplicationDeadline: { $gt: today },
            internshipApplications: { $exists: true, $not: { $size: 0 } },
            interCommpanyName: { $exists: true },
        }).select('interCommpanyName interTitle interApplicationDeadline internshipApplications');
        
        res.status(200).json(internships);
    } catch (error) {
        console.error('Error fetching available internship applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//get IntershipApplication Not available 
const getUnavailableInternshipApplications = async (req, res) => {
    try {
        const today = new Date();
        const internships = await Intership.find({
            interApplicationDeadline: { $lt: today },
            internshipApplications: { $exists: true, $not: { $size: 0 } },
            interCommpanyName: { $exists: true },
        }).select('interCommpanyName interTitle interApplicationDeadline internshipApplications');
        
        res.status(200).json(internships);
    } catch (error) {
        console.error('Error fetching unavailable internship applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const CALENDARIFIC_API_KEY = 'V5kdzfNbzIe5kvqhpOSw0PC227ipVtoO';
const calendar = async (req, res) => {
    try {
       // const { username } = req.query; 
        //const applications = await Application.find({ applicantUsername: username });
        const { username, companyName } = req.query;
        let query = {};
    
        if (username) {
          query = { applicantUsername: username };
        } else if (companyName) {
          query = { companyName };
        } else {
          return res.status(400).json({ error: 'Missing username or companyName parameter' });
        }
        const applications = await Application.find(query);
        const response = await axios.get('https://calendarific.com/api/v2/holidays', {
      params: {
        api_key: CALENDARIFIC_API_KEY,
        country: 'TN',
        year: new Date().getFullYear()
      }
    });
    const holidays = response.data.response.holidays;
    const events = [];
    holidays.forEach(holiday => {
        events.push({
          title: holiday.name,
          start: holiday.date.iso,
          rendering: 'background'
        });
      });
      applications.forEach(application => {
        if (application.interviewDate) {
          events.push({
            title: 'Entretien',
            start: application.interviewDate.toISOString() // Supposons que interviewDate est un objet Date
          });
        }
      });
  
      res.json(events);

    }catch (error){
        console.error('Error fetching events:', error);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}
const selectInterviewDate = async (req, res) => {
    try {
        const { applicantUsername, selectedDate } = req.body;
        const application = await Application.findOne({ applicantUsername });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const selectedDateTime = new Date(selectedDate);
        if (!application.interviewDates.some(date => date.getTime() === selectedDateTime.getTime())) {
            return res.status(400).json({ error: 'Selected date is not available for interview' });
        }
        //const formattedSelectedDate = selectedDateTime.toISOString().slice(0, 19).replace('T', ' ');
        application.interviewDate = selectedDateTime;
        await application.save();
        await User.updateOne(
            { username: application.applicantUsername, 'applications._id': application._id },
            { $set: {  'applications.$.interviewDate':application.interviewDate } },

        );

        res.status(200).json({ message: 'Interview date selected successfully', interviewDate: selectedDate });
    } catch (error) {
        console.error('Error selecting interview date:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    saveApplication,
    updateApplication,
    saveInternshipApplication,
    updateInternshipApplication,
    getApplicationsByUsername,
    deleteApplication,
    updateApplicationStatus,
    updatestatuinter,
    getAvailableJobsApplications,
    getUnavailableJobsApplications,
    getAvailableInternshipApplications,
    getUnavailableInternshipApplications,
    calendar,
    selectInterviewDate
};
