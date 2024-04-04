const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
const fs = require("fs").promises;
const path = require('path');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');


const skills = require('../skill/skills.json');
const jobs = require('../Data/jobs.json');
puppeteer.use(StealthPlugin());

const url = "https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0";
const urlSignIn ="https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";

const MAX_RETRY_COUNT = 10;

const scrapLinkedin = async (req, res) => {
    const { location, keywords } = req.params;
    let jobData;
    let fileName;
    let retryCount = 0;
    while (retryCount < MAX_RETRY_COUNT) {
        try {
            jobData = await scrapeLinkedInJobs(location, keywords);
            fileName = `jobs.json`;

            // Save job data to JSON file
            const dataFolderPath = '../Hestia_PIDEV_Backend/Data';
            const filePath = path.join(dataFolderPath, fileName);

            await fs.writeFile(filePath, JSON.stringify(jobData, null, 2));
            res.send(`Scraping for ${keywords} in ${location} completed successfully. Job data saved to ${fileName}`);
            return; // Exit the loop and function if scraping succeeds
        } catch (error) {
            if (error.name === 'TargetCloseError') {
                console.error(`Error: Target page closed unexpectedly during scraping. Retrying... (Retry ${retryCount + 1})`);
            } else {
                console.error(`Error during scraping (Retry ${retryCount + 1}):`, error);
                retryCount++;
            }
        }
    }
    res.status(500).send(`Failed to scrape ${keywords} in ${location} after ${MAX_RETRY_COUNT} attempts.`);
};

async function scrapeLinkedInJobs(location, keywords) {
    const browser = await puppeteer.launch({
        headless: true, // Set to true for production use
        executablePath: executablePath(),
        args: ['--start-maximized'],
        defaultViewport: null,
    });

    try {
        const page = await browser.newPage();
        //await loginToLinkedIn(page);

        await Promise.all([
            page.waitForNavigation({ waitUntil: "domcontentloaded" }),
            navigateToJobsPage(page, url, location, keywords),
        ]);

        await new Promise(resolve => setTimeout(resolve, 3000));
        const jobData = await extractJobData(page);
        return jobData;
    } catch (error) {
        console.error("Error during scraping:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

async function loginToLinkedIn(page) {
    await page.goto(urlSignIn);
    await page.type("#username", process.env.MAILTRAP_Username);
    await page.type("#password", process.env.MAILTRAP_Password);
    await page.click(".login__form_action_container button");
}

async function navigateToJobsPage(page, url, location, keywords) {
    try {
        await page.goto(url, { waitUntil: "networkidle2" });

        // Check if the page is still open
        if (!page.isClosed()) {
            if (page.url().includes("linkedin.com/authwall")) {
                console.log("Redirected to LinkedIn authentication wall. Retrying...");
                await page.waitForNavigation({ waitUntil: "domcontentloaded" });
                await page.goto(url, { waitUntil: "domcontentloaded" });
            }

            await page.waitForSelector("#job-search-bar-location", { timeout: 5000 });
            await page.$eval("#job-search-bar-location", (input) => (input.value = ""));
            await page.type("#job-search-bar-location", location || "");

            await page.waitForSelector("#job-search-bar-keywords", { timeout: 5000 });
            await page.$eval("#job-search-bar-keywords", (input) => (input.value = ""));
            await page.type("#job-search-bar-keywords", keywords || "");

            await Promise.all([
                page.waitForNavigation({ waitUntil: "domcontentloaded" }),
                page.keyboard.press("Enter"),
            ]);

            // Adding a delay to ensure the page is fully loaded
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            throw new Error("Page is closed.");
        }
    } catch (error) {
        console.error("Error during navigation to jobs page:", error);
        throw error;
    }
}

async function extractJobData(page) {
    try {
        return await page.evaluate(() => {
            const elements = document.querySelectorAll(".jobs-search__results-list li");
            console.log("Job elements:", elements.length); // Debugging output
            const jobData = [];

            elements.forEach((element) => {
                const jobTitle = element.querySelector(".base-search-card__title")?.innerText || "";
                const company = element.querySelector(".hidden-nested-link")?.innerText || "";
                const location = element.querySelector(".job-search-card__location")?.innerText || "";
                const salary = element.querySelector(".job-search-card__salary-info")?.innerText || "";
                const postedDate = element.querySelector(".job-search-card__listdate")?.dateTime || "";
                const link = element.querySelector(".base-card__full-link")?.href || "";
                const img = element.querySelector(".artdeco-entity-image")?.src || "";
                jobData.push({
                    jobTitle,
                    company,
                    location,
                    salary,
                    postedDate,
                    link,
                    img,
                });
            });

            return jobData;
        });
    } catch (error) {
        console.error("Error during job data extraction:", error);
        return [];
    }
}
//////////////
const extractSkillsFromJobs = async (req , res) =>{
    
    console.log("Extracting skills from job descriptions...");
    const browser = await puppeteer.launch({
        headless: true, // Set to true for production use
        executablePath: executablePath(),
        defaultViewport: null,
        args: ['--start-maximized'],
    });

    const jobDescriptions = [];

    try {
        const page = await browser.newPage();
        
        for (const job of jobs) {
            try {
                const { jobTitle, company, location, salary, postedDate, link } = job;
                const { description, seniorityLevel, employmentType, jobFunction, industries, salary: extractedSalary, img } = await extractJobDetails(page, link);
                const jobSkills = extractSkillsFromDescription(description);
                jobDescriptions.push({ jobTitle, company, location, salary: extractedSalary || salary, postedDate, link, img, seniorityLevel, employmentType, jobFunction, industries, skills: jobSkills });

                // Store skills in a new database
                if (jobSkills.length > 0) {
                    //await storeSkillsInDatabase({ jobTitle, company, location, skills: jobSkills });
                }
            } catch (error) {
                console.error("Error during skill extraction:", error);
            }
        }
    } catch (error) {
        console.error("Error launching browser:", error);
    } finally {
        await browser.close();
    }
    try {
        await saveToExcel(jobDescriptions); // Save job descriptions to Excel file
        console.log("Job descriptions saved successfully.");
    } catch (error) {
        console.error("Error saving job descriptions:", error);
    }

    try {
    const fileNameExcel = "job_descriptions.json";
    const dataFolderPath = './Data';
    const filePath = path.join(dataFolderPath, fileNameExcel);
    await fs.writeFile(filePath, JSON.stringify(jobDescriptions, null, 2));
    console.log("Job descriptions saved successfully.");
    res.send("Job descriptions saved successfully.");
} catch (error) {
    console.error("Error saving job descriptions:", error);
    res.status(500).send("Error saving job descriptions.");
}
}

async function extractJobDetails(page, jobUrl) {
    let retries = 3; // Number of retries
    while (retries > 0) {
        try {
            const response = await page.goto(jobUrl, { waitUntil: "domcontentloaded" });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before extracting data

            // Check if redirected to the LinkedIn homepage or authentication wall
            if (response.status() === 200 && (response.url().includes("linkedin.com/feed") || response.url().includes("linkedin.com/authwall"))) {
                console.log("Redirected to LinkedIn homepage or authentication wall. Skipping...");
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 3 seconds before retrying
                await page.goto(jobUrl, { waitUntil: "domcontentloaded" });
                return {};
            }

            const description = await page.evaluate(() => {
                const descriptionElement = document.querySelector(".show-more-less-html__markup");
                return descriptionElement ? descriptionElement.innerText : '';
            });

            // Extract Seniority level, Employment type, Job function, and Industries
            const seniorityLevel = await extractInnerText(page, '.description__job-criteria-item:nth-child(1) .description__job-criteria-text');
            const employmentType = await extractInnerText(page, '.description__job-criteria-item:nth-child(2) .description__job-criteria-text');
            const jobFunction = await extractInnerText(page, '.description__job-criteria-item:nth-child(3) .description__job-criteria-text');
            const industries = await extractInnerText(page, '.description__job-criteria-item:nth-child(4) .description__job-criteria-text');

            // Extract salary if available
            let salary = "";
            const salaryElement = await page.$(".salary.compensation__salary");
            if (salaryElement) {
                salary = await page.evaluate(el => el.innerText, salaryElement);
            }

            // Extract image link
            let img = "";
            const imgElement = await page.$(".artdeco-entity-image.artdeco-entity-image--square-5");
            if (imgElement) {
                img = await page.evaluate(el => el.getAttribute("src"), imgElement);
            }

            // Extract skills from description
            const jobSkills = extractSkillsFromDescription(description);

            return { description, seniorityLevel, employmentType, jobFunction, industries, salary, img, jobSkills };
        } catch (error) {
            console.error(`Error extracting description for job ${jobUrl}:`, error);
            retries--;
            if (retries === 0) {
                console.log(`Retries exhausted for job ${jobUrl}. Skipping...`);
                return {}; // Return empty object to indicate failure
            }
            console.log(`Retrying (${retries} retries left)...`);
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for 3 seconds before retrying
        }
    }
}

async function extractInnerText(page, selector) {
    const element = await page.$(selector);
    if (element) {
        return await page.evaluate(el => el.innerText, element);
    }
    return "";
}

function extractSkillsFromDescription(description) {
    const jobSkills = [];
    if (description) {
        for (const skillCategory in skills) {
            skills[skillCategory].forEach((skill) => {
                if (description.toLowerCase().includes(skill.toLowerCase())) {
                    jobSkills.push(skill);
                }
            });
        }
    }
    return jobSkills;
}

async function saveToExcel(jobDescriptions) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Job Descriptions');

    // Add headers
    worksheet.addRow(['Job Title', 'Company', 'Location', 'Salary', 'Posted Date', 'Link', 'Image', 'Seniority Level', 'Employment Type', 'Job Function', 'Industries', 'Skills']);

    // Add data rows
    jobDescriptions.forEach(job => {
        const { jobTitle, company, location, salary, postedDate, link, img, seniorityLevel, employmentType, jobFunction, industries, skills } = job;
        worksheet.addRow([jobTitle, company, location, salary, postedDate, link, img, seniorityLevel, employmentType, jobFunction, industries, skills.join(', ')]);
    });

    const folderPath = path.join(__dirname, '../skill');

    // Save Excel file
    await workbook.xlsx.writeFile(path.join(folderPath, 'job_descriptions.xlsx'));
}

const topSkills = async (req, res) =>{
    const jobDescriptions = JSON.parse(await fs.readFile(path.join(__dirname, '../Data/job_descriptions.json')));
    const allSkills = jobDescriptions.flatMap(job => job.skills);
    const skillCounts = {};
    allSkills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);
    console.log("Top skills:", sortedSkills.slice(0, 10));
    res.json(sortedSkills.slice(0, 10));
    return sortedSkills.slice(0, 10);
}
const exportPDF = async (req, res) => {
    try {
        const jobDescriptions = JSON.parse(await fs.readFile(path.join(__dirname, '../Data/job_descriptions.json')));
        const doc = new PDFDocument();
        const fileName = "job_descriptions.pdf";
        const folderPath = path.join(__dirname, '../Data');
        const filePath = path.join(folderPath, fileName);

        // Write PDF document to file
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(20).text('Job Descriptions', { align: 'center' });

        jobDescriptions.forEach(job => {
            const { jobTitle, company, location, salary, postedDate, link, img, seniorityLevel, employmentType, jobFunction, industries, skills } = job;
            doc.fontSize(16).text(jobTitle, { underline: true });
            doc.fontSize(14).text(`Company: ${company}`);
            doc.fontSize(14).text(`Location: ${location}`);
            doc.fontSize(14).text(`Salary: ${salary}`);
            doc.fontSize(14).text(`Posted Date: ${postedDate}`);
            doc.fontSize(14).text(`Link: ${link}`);
            doc.fontSize(14).text(`Seniority Level: ${seniorityLevel}`);
            doc.fontSize(14).text(`Employment Type: ${employmentType}`);
            doc.fontSize(14).text(`Job Function: ${jobFunction}`);
            doc.fontSize(14).text(`Industries: ${industries}`);
            doc.fontSize(14).text(`Skills: ${skills.join(', ')}`);
            doc.fontSize(14).text('--------------------------------------');
        });

        doc.end();

        // Send the PDF file as response
        res.sendFile(filePath);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Internal Server Error");
    }
};

const exportExcel = async (req, res) => {
    try {
        try {
        const jobDescriptions = JSON.parse(await fs.readFile(path.join(__dirname, '../Data/job_descriptions.json')));
        
        // Convert JSON data to CSV format
        const csvData = convertJSONToCSV(jobDescriptions);

        const fileName = "job_descriptions.csv";
        const folderPath = path.join(__dirname, '../Data');
        const filePath = path.join(folderPath, fileName);

        // Write CSV data to file
        await fs.writeFile(filePath, csvData);

        // Send the CSV file as response
        res.sendFile(filePath);
    } catch (error) {
        console.error("Error generating CSV:", error);
        res.status(500).send("Internal Server Error");
    }
} catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Internal Server Error");
}
};

const convertJSONToCSV = (data) => {
    const csvRows = [];

    // Extract headers from the first object
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    // Extract values and add rows
    data.forEach(obj => {
        const values = headers.map(header => {
            // Handle special characters and CSV format
            let value = obj[header];
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`; // Enclose in quotes if there are commas
            }
            return value;
        });
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
};

module.exports = {
    scrapLinkedin,
    extractSkillsFromJobs,
    topSkills,
    exportPDF,
    exportExcel
};
