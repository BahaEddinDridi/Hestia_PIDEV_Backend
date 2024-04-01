const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
const fs = require("fs").promises;

puppeteer.use(StealthPlugin());

const url = "https://www.linkedin.com/jobs/search/?currentJobId=3842999560";
const urlSignIn =
    "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";

const MAX_RETRY_COUNT = 10;

const scrapLinkedin = async (req, res) => {
    const { location, keywords } = req.params;
    let jobData;
    let fileName;
    let retryCount = 0;
    while (retryCount < MAX_RETRY_COUNT) {
        try {
            jobData = await scrapeLinkedInJobs(location, keywords);
            fileName = `${keywords.replace(/\s+/g, "_").toLowerCase()}_jobData.json`;
            await fs.writeFile(fileName, JSON.stringify(jobData, null, 2));
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
        headless: false, // Set to true for production use
        executablePath: executablePath(),
        defaultViewport: null,
    });

    try {
        const page = await browser.newPage();
        await loginToLinkedIn(page);

        await Promise.all([
            page.waitForNavigation({ waitUntil: "domcontentloaded" }),
            navigateToJobsPage(page, url, location, keywords),
        ]);

        await page.evaluate(() => {
            return new Promise((resolve) => {
                setTimeout(resolve, 3000);
            });
        });
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
            await page.waitForSelector(".search-bar__placeholder");
            await page.click(".search-bar__placeholder");
            await page.$eval("#job-search-bar-location", (input) => (input.value = ""));
            await page.type("#job-search-bar-location", location || "");
            await page.click("#job-search-bar-keywords");
            await page.$eval("#job-search-bar-keywords", (input) => (input.value = ""));
            await page.type("#job-search-bar-keywords", keywords || "");
            await page.keyboard.press('Enter'); // Submit the form by pressing Enter

            // Set a timeout for navigation
            await page.keyboard.press('Enter'); // Submit the form by pressing Enter
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
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

module.exports = {
    scrapLinkedin
};
