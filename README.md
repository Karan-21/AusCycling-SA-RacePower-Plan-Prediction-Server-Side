# CYCOUT9

"Outdoor Road Time Trial Prediction Tool".

## Contents

- [Git Fundamentals and Workflow](#git-fundamentals-and-workflow)
    - [Create a Branch](#1-2-create-a-branch-and-checkout-the-branch-locally)
    - [Write Code and Commit Regularly](#3-write-code-and-commit-regularly)
    - [Fetch When You're Done](#4-fetch-when-youre-done)
    - [Rebase and Squash](#5-rebase-and-squash-all-commits-into-one-commit)
    - [Push Code to Remote](#6-push-code-to-the-remote-version-of-your-branch)
    - [Make a Pull Request](#7-make-a-pull-request)
    - [Merge Your New Feature](#8-merge-your-new-feature)
- [Git Dos and Don'ts](#git-dos-and-donts)
- [Common JavaScript Conventions](#common-javascript-conventions)
    - [LET, VAR, and CONST?](#when-should-we-use-let-var-and-const)
    - [Use camelCase](#use-camelcase)
- [Commenting and Documentation](#commenting-and-documentation)
    - [Code tells HOW and Comments tell WHY](#code-tells-how-and-comments-tell-why)
    - [Function and Method Comments](#function-and-method-comments)
    - [File-Level Comments](#file-level-comments)

## Git Fundamentals and Workflow

There has been some confusion as to how we should be using Git to make changes in the `main` branch.

In English, our Git workflow look's like this:

```
 1. Create a branch.
 2. Checkout the new branch locally.
 3. Write code and commit regularly.
 
	Finished making changes? NO? Go back to STEP 3.
		
 4. Fetch when you're done.
 5. Rebase and squash all commits into one commit.
 6. Push code to the remote version of your branch.
 7. Make a Pull Request, write a DETAILED description, and have it reviewed by a team member.
 
	Reviewer is happy with the code? NO? Go back to STEP 3.
		
 9. Merge new feature into main.
```
Now, to translate this into Git commands.

### 1-2. Create a Branch and Checkout the Branch Locally

Go to the GitHub repository "Projects" tab [here](https://github.cs.adelaide.edu.au/a1225127/CYCOUT9/projects/1). Find the ticket you'd like to make a branch for, click on it.

A sidebar will appear, down the bottom, click "Go to issue for full details".

On the side, there's a sub-section named "Development", and right underneath it, there's a link that says "Create a branch", click on it.

The branch name should start with the issue number, and be followed by the name of the ticket. If the ticket name is long, shorten it by removing some words, but DO NOT remove the issue number. For instance, 

```bash
# Before
30-initialise-express-server-structure-and-connect-it-to-firebase

# After
30-initialise-express-server-structure
```

Once created, you'll be prompted to run some Git commands, run those in your terminal locally.

### 3. Write Code and Commit Regularly

```bash
# Add all files to the stage.
git add .

# Commit files.
git commit -m "Description of this commit"

# Optional (but recommended) push local branch to remote.
git push origin 12-feature-name
```

### 4. Fetch When You're Done

Fetching makes sure you're up to date before making a pull request.

This doesn't actually merge the code with the code on your machine (git pull does that) but rather updates references to any remote changes which may have happened while you've been working locally.

```bash
# Fetches remote changes.
git fetch
```

### 5. Rebase and Squash All Commits Into One Commit

In short, rebasing will essentially place all of your features code on top of the code in the remote `main` branch. This makes the reviewers life A LOT easier, and also make's it easier to merge into `main` later.

Squashing effectively condenses down all your feature branch commits into a single commit.

```bash
# Open the interactive rebase tool.
git rebase -i origin/main
```

This will open an interactive rebase tool, which shows all the commits you've made on your branch. You'll then "squash" all your changes into one commit.

```bash
# Interactive rebase tool.
pick bf27dcd Initial change
pick cc570e1 Second change
pick ca0ec55 Third change
```

Squash your commits by replacing pick with `s` for all but the top commit. `s` is shorthand for squash - imagine all the changes you've made being "squashed" up into the top commit.

```bash
# 'Squashing' the second and third commit into the first.
pick bf27dcd Initial change
s cc570e1 Second change
s ca0ec55 Third change
```

Once you've squashed some commits, and exited the NANO editor, you may encounter some errors in your terminal. This is because there are likely conflicts between your code and `main`.

The only lines in this error message that you should care about are the one's that start with `CONFLICT`.

It will look something like this:

```
error: could not apply fa39187... something to add to patch A...
...
CONFLICT (content): Merge conflict in server/src/routes/users.js
...
```

To see the beginning of the merge conflict in your file, search the file for the conflict marker `<<<<<<<`. When you open the file in your text editor, you'll see the changes from the HEAD or base branch after the line `<<<<<<< HEAD`. Next, you'll see `=======`, which divides your changes from the changes in the other branch, followed by `>>>>>>> BRANCH-NAME`.

In this example, one person wrote "open an issue" in the base or HEAD branch and another person wrote "ask your question in IRC" in the compare branch or `branch-a`.

```
If you have questions, please
<<<<<<< HEAD
open an issue
=======
ask your question in IRC.
>>>>>>> branch-a
```

Decide if you want to keep only your branch's changes, keep only the other branch's changes, or make a brand new change, which may incorporate changes from both branches. Delete the conflict markers `<<<<<<<`, `=======`, `>>>>>>>` and make the changes you want in the final merge.

In this example, both changes are incorporated into the final merge:

```
If you have questions, please open an issue or ask in our IRC channel if it's more urgent.
```
If there are several conflicts across more than one commit, you will need to repeat this process a few times.

Once all conflicts have been resolved, stage your changes and continue the rebase.

```bash
# Add all files to the stage.
git add .

# Continue rebase.
git rebase --continue
```

### 6. Push Code to the Remote Version of Your Branch

Eventually you will have successfully rebased.

Once that happens, commit your changes and push them to the remote version of your branch.

```bash
git commit -m "Description of this commit"

git push origin 12-feature-name
```

### 7. Make a Pull Request

This can be done in your browser on GitHub — [READ HERE](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

The description should convey to the reviewer **WHAT** your feature does, **WHY** it does it, **HOW** they can test it, and **ANYTHING ELSE** that needs to be noted.

For this purpose, I have created the following template:

```
### WHAT?
...
### WHY?
...
### TESTING
...
### SCREENSHOTS
...
### ANYTHING ELSE?
...
```

### 8. Merge Your New Feature

Once the reviewer has checked your code and confirmed that it works as intended, either you or they can merge it into `main` using the "Merge pull request" button inside the pull request.
	
## Git Dos and Don'ts

### DO

- Merge you feature once you've confirmed that all functionality works as intended.
- Remove all commented code.
- Commit changes with a concise and useful commit message.
- Delete branches if a feature or bug fix is merged to its intended branches and the branch is no longer required.

### DON'T

- Create one pull request addressing multiple issues.
- Work on multiple issues in the same branch. If a feature is dropped, it will be difficult to revert changes.
- Force push until you’re extremely comfortable performing this action.

## Common JavaScript Conventions

### When should we use LET, VAR, and CONST?

In short, DON'T use `var`.

> Variable declarations `let`  and  `const`  introduce block scope that allows us to write clean and less error-prone code.
>
> Why don’t we use  `var`  anymore? Because now there is a better way of declaring variables and even constants… With block scope! You don’t need to think twice when declaring variables inside blocks. I think that is easier to work with block scope than with function scope. The  _var_  usage has been being discouraged.

[Read More Here.](https://medium.com/@codingsam/awesome-javascript-no-more-var-working-title-999428999994) 

|SCOPE|CONST|LET|VAR|
|--|--|--|--|
|GLOBAL|`NO`|`NO`|`YES`|
|FUNCTION|`YES`|`YES`|`YES`|
|BLOCK|`YES`|`YES`|`NO`|
|CAN BE REASSIGNED?|`NO`|`YES`|`YES`|

### Use camelCase

Each language has it's own conventions for naming code elements.

What should we use in JavaScript? Either `lowerCamelCase` or `UpperCamelCase`. Why? because it's used by JavaScript itself, by jQuery, and other popular JS libraries.

Hence, for this project, and for most others, we choose to follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html#naming-camel-case-defined). In short,

|CODE ELEMENT|STYLE|
|--|--|
|CLASS|`UpperCamelCase`|
|ENUM|`UpperCamelCase`|
|FUNCTION|`lowerCamelCase`|
|PARAMETER|`lowerCamelCase`|
|VARIABLE|`lowerCamelCase`|

It's important to note that for CONSTANTS we use `CONSTANT_CASE`.

## Commenting and Documentation

As a developer, it can be frustrating to delve into code written by someone else that was not properly commented, and it’s remarkably easy to forget what your own code meant when you’re no longer immersed in the context of a program. 

Commenting code early will reinforce good programming habits throughout your career to avoid issues later on.

### Code tells HOW and Comments tell WHY

Comments should be insightful for the person who reads them, and we should always avoid writing how the code works in comments. Here, the code should be able to self-explain **HOW** it works, keeping comments to address **WHY** it’s there in the first place.

```javascript
// Do
let p = 3.14; // Rounded value of Pi  
let c = 2 * p * 10; // Calculate the circumference of a circle with radius 10

// Don't
let p = 3.14; // Initiate the value of the variable p  
let c = 2 * p * 10 // Multiply the value p into 20
```

### Function and Method Comments

```javascript
/**
 * Multiple lines of JSDoc text are written here,
 * wrapped normally.
 *
 * @param {number} argOne A number to do something to.
 * @param {number} argTwo A number to do something to.
 * @returns {number} Returns the sum of argOne and argTwo.
 *
 * NOTE: May need to be optimised as it currently runs in O(n!).
 */
 function addTwoNumbers(argOne, argTwo)  {  …  }
```

### File-Level Comments

```javascript
/**
 * @fileoverview Description of file and its uses.
 */
```
