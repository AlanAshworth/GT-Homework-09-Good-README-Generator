var inquirer = require("inquirer");
var axios = require("axios");
var fs = require("fs");
var util = require("util");

const writeFileAsync = util.promisify(fs.writeFile);

const promptUserForGitHubInfo = () => {
  return inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "What is your GitHub username?"
    }
  ]);
};

const promptUserForProjectInfo = () => {
  return inquirer.prompt([
    {
      type: "input",
      name: "projectTitle",
      message: "What is the name of the project?"
    },
    {
      type: "input",
      name: "projectDescription",
      message: "Provide a description of the project:"
    },
    {
      type: "input",
      name: "projectUsage",
      message: "How will this project be used?"
    },
    {
      type: "list",
      name: "projectLicense",
      message: "Under what license will this project be protected?",
      choices: ["MIT", "GPL v3", "AGPL"]
    },
    {
      type: "input",
      name: "projectContributors",
      message: "Who is contributing to this project (separate by commas)?"
    }
  ]);
};

function generateREADME({ projectTitle, projectDescription, projectUsage, projectLicense, projectContributors }, userLogin, userAvatar, userLicense) {
  return `
  # ${projectTitle}

  ## Description

  ${projectDescription}

  ## Table of Contents

  *[Installation](#installation)
  *[Usage](#usage)
  *[Credits](#credits)
  *[License](#license)
  *[Contact](#contact)

  ## Installation

  1. Include the package folder within your project directory.
  2. Open your terminal to your current project directory.
  3. Within your project directory, in the console type 'node index.js'
  4. Prompts with ask for your GitHub username and questions about your project.
  5. Once questions are successfully answered, a generated README.md will be created and placed in your projects directory.

  ## Usage

  ${projectUsage}

  The following image demonstrates the application functionality:

  ![readme generator demo](./Assets/readme-generator-demo.gif)

  ## Credits

  * ${projectContributors}

  ## License

  Licensed under the ${projectLicense} license.
  ${userLicense}

  ## Contact

  ![GitHub avator](${userAvatar})
  ![GitHub followers](https://img.shields.io/github/followers/${userLogin}?label=Follow&style=social)`;
}

promptUserForGitHubInfo()
  .then(function({ username }) {
    const queryUrl = `https://api.github.com/users/${username}`;

    axios.get(queryUrl).then(function(response) {
      // const userEmail = response.data.email;
      const userLogin = response.data.login;
      const userAvatar = response.data.avatar_url;

      promptUserForProjectInfo()
        .then(data => {

          let userLicense = '';
          switch(data.projectLicense) {
            case "GPL v3":
              // code block
              userLicense = '![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)';
              break;
            case "AGPL":
              // code block
              userLicense = '![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)';
              break;
            default:
              // code block
              userLicense = '![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)';
          }

          const readme = generateREADME(data, userLogin, userAvatar, userLicense);
          return writeFileAsync("generatedREADME.md", readme);
          
        }).then(function() {console.log("GENERATE-READMe.md created successfully.");} )
        .catch(error => {
          console.log("Inquirer prompt error: ", error);
        });
    });
  })
  .catch(error => {
    console.log("Inquirer prompt error: ", error);
  });
