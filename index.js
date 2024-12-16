const axios = require('axios');

// Azure DevOps Configuration
const organization = "your_organization"; // Replace with your organization name
const project = "your_project";           // Replace with your project name
const pat = "your_personal_access_token"; // Replace with your PAT

// Base URL
const baseUrl = `https://dev.azure.com/${organization}/${project}/_apis`;

// Axios configuration for authentication
const authConfig = {
    auth: {
        username: "", // Leave blank for PAT
        password: pat
    }
};

// Function to get all repositories
async function getRepositories() {
    const url = `${baseUrl}/git/repositories?api-version=7.1-preview.1`;
    try {
        const response = await axios.get(url, authConfig);
        return response.data.value; // List of repositories
    } catch (error) {
        console.error("Error fetching repositories:", error.message);
        throw error;
    }
}

// Function to get pull requests created in 2024 for a repository
async function getPullRequestsIn2024(repoId) {
    const startDate = "2024-01-01T00:00:00Z";
    const endDate = "2024-12-31T23:59:59Z";
    const url = `${baseUrl}/git/repositories/${repoId}/pullrequests?searchCriteria.status=all&searchCriteria.createdDate=${startDate}&searchCriteria.createdDate=${endDate}&$top=1000&api-version=7.1-preview.1`;
    try {
        const response = await axios.get(url, authConfig);
        return response.data.value.length; // Count of PRs created in 2024
    } catch (error) {
        console.error(`Error fetching PRs for repository ${repoId}:`, error.message);
        return 0; // Return 0 PRs on error to allow script to continue
    }
}

// Main function to calculate total PR count in 2024
async function getTotalPullRequestCountIn2024() {
    try {
        let totalPRCount = 0;

        // Fetch all repositories
        const repositories = await getRepositories();
        console.log(`Found ${repositories.length} repositories.`);

        // Loop through each repository and count PRs in 2024
        for (const repo of repositories) {
            console.log(`Processing repository: ${repo.name}...`);
            const prCount = await getPullRequestsIn2024(repo.id);
            console.log(`Repository: ${repo.name}, PRs in 2024: ${prCount}`);
            totalPRCount += prCount;
        }

        console.log(`Total Pull Requests across all repositories in 2024: ${totalPRCount}`);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Run the script
getTotalPullRequestCountIn2024();
