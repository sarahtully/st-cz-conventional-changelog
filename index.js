"format cjs";

var wrap = require('word-wrap');
var colors = require('colors/safe');

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = {

  // When a user runs `git cz`, prompter will
  // be executed. We pass you cz, which currently
  // is just an instance of inquirer.js. Using
  // this you can ask questions and get answers.
  //
  // The commit callback should be executed when
  // you're ready to send back a commit template
  // to git.
  //
  // By default, we'll de-indent your commit
  // template and will keep empty lines.
  prompter: function(cz, commit) {

    console.log('\nLine 1 will be cropped at 100 characters. All other lines will be wrapped after 100 characters.\n');

    // Let's ask some questions of the user
    // so that we can populate our commit
    // template.
    //
    // See inquirer.js docs for specifics: https://github.com/SBoudrias/Inquirer.js/
    // You can also opt to use another input
    // collection library if you prefer.
    cz.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select the type of change that you\'re committing:',
        choices: [
        {
          name: 'feat:     A new feature',
          value: 'feat'
        }, {
          name: 'fix:      A bug fix',
          value: 'fix'
        }, {
          name: 'docs:     Documentation only changes',
          value: 'docs'
        }, {
          name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)',
          value: 'style'
        }, {
          name: 'refactor: A code change that neither fixes a bug or adds a feature',
          value: 'refactor'
        }, {
          name: 'perf:     A code change that improves performance',
          value: 'perf'
        }, {
          name: 'test:     Adding missing tests',
          value: 'test'
        }, {
          name: 'chore:    Changes to the build process or auxiliary tools\n            and libraries such as documentation generation',
          value: 'chore'
        }]
      }, {
        type: 'input',
        name: 'scope',
        message: 'Denote the scope of this change (action-sheet, animations, cards, config, etc.):\n'
      }, {
        type: 'input',
        name: 'subject',
        message: 'Write a short description of the change:\n',
        filter: function(value) {
          if (value.slice(-1) == '.') {
            value = value.substring(0, value.length - 1);
          }
          return value.charAt(0).toLowerCase() + value.slice(1);
        }
      }, {
        type: 'input',
        name: 'body',
        message: 'Provide a longer description of the change:\n'
      }, {
        type: 'input',
        name: 'footer',
        message: 'List any breaking changes or issues closed by this change (e.g references #5077, closes #5077, etc.):\n'
      }, {
        type: 'list',
        name: 'confirmCommit',
        choices: [
          {
            name: 'Yes',
            value: 'yes'
          }, {
            name: 'Abort commit',
            value: 'no'
          }
        ],
        message: function(answers) {
          var SEP = '--------------------------------------------------------------';
          console.log('\n' + SEP + '\n' + buildCommit(answers) + '\n' + SEP + '\n');
          return 'Are you sure you want to proceed with the commit above?';
        }
      }
    ], function(answers) {
      if (answers.confirmCommit === 'yes') {
        commit(buildCommit(answers));
        console.log(colors.green("Commit has been created."));
      } else {
        console.log(colors.red("Commit has been canceled."));
      }
    });
  }
}

// Build the commit
function buildCommit(answers) {
  var maxLineWidth = 100;

  var wrapOptions = {
    trim: true,
    newline: '\n',
    indent:'',
    width: maxLineWidth
  };

  // parentheses are only needed when a scope is present
  var scope = answers.scope.trim();
  scope = scope ? '(' + answers.scope.trim() + ')' : '';

  // Hard limit this line
  var head = (answers.type + scope + ': ' + answers.subject.trim()).slice(0, maxLineWidth);

  // Wrap these lines at 100 characters
  var body = wrap(answers.body, wrapOptions);
  var footer = wrap(answers.footer, wrapOptions);

  var result = head + '\n\n' + body + '\n\n' + footer;

  return result;
}