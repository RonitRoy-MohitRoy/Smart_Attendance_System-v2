/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 1
   Developed By:
   Ronit Choudhary
========================================= */

"use strict";

/* =========================================
   DOM ELEMENTS
========================================= */

const loginForm =
document.getElementById(
    "loginForm"
);

const usernameInput =
document.getElementById(
    "username"
);

const passwordInput =
document.getElementById(
    "password"
);

const loginButton =
document.getElementById(
    "loginButton"
);

const showPassword =
document.getElementById(
    "showPassword"
);

const loginMessage =
document.getElementById(
    "loginMessage"
);

const loginActivityButton =
document.getElementById(
    "loginActivityButton"
);

/* =========================================
   APPLICATION STATE
========================================= */

let loginInProgress = false;

let loginAttempts = 0;

const MAX_LOGIN_ATTEMPTS = 5;

/* =========================================
   PAGE INITIALIZATION
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    initializeApplication

);

/* =========================================
   INITIALIZE APPLICATION
========================================= */

function initializeApplication(){

    clearLoginMessage();

    disableLoginButton();

    focusUsername();

    registerEvents();

}

/* =========================================
   REGISTER EVENTS
========================================= */

function registerEvents(){

    usernameInput.addEventListener(

        "input",

        validateLoginForm

    );

    passwordInput.addEventListener(

        "input",

        validateLoginForm

    );

    usernameInput.addEventListener(

        "keydown",

        handleKeyboard

    );

    passwordInput.addEventListener(

        "keydown",

        handleKeyboard

    );

}

/* =========================================
   FOCUS USERNAME
========================================= */

function focusUsername(){

    usernameInput.focus();

}

/* =========================================
   ENABLE LOGIN BUTTON
========================================= */

function enableLoginButton(){

    loginButton.disabled = false;

}

/* =========================================
   DISABLE LOGIN BUTTON
========================================= */

function disableLoginButton(){

    loginButton.disabled = true;

}

/* =========================================
   CLEAR LOGIN MESSAGE
========================================= */

function clearLoginMessage(){

    loginMessage.className =
    "login-message";

    loginMessage.textContent = "";

}

/* =========================================
   END OF PART - 1
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 2
========================================= */

/* =========================================
   VALIDATE LOGIN FORM
========================================= */

function validateLoginForm(){

    const username =
    usernameInput.value.trim();

    const password =
    passwordInput.value.trim();

    if(

        username.length > 0 &&

        password.length > 0 &&

        loginInProgress === false

    ){

        enableLoginButton();

    }

    else{

        disableLoginButton();

    }

}

/* =========================================
   USERNAME VALIDATION
========================================= */

function isUsernameValid(){

    const username =
    usernameInput.value.trim();

    return username.length >= 3;

}

/* =========================================
   PASSWORD VALIDATION
========================================= */

function isPasswordValid(){

    const password =
    passwordInput.value.trim();

    return password.length >= 6;

}

/* =========================================
   COMPLETE FORM VALIDATION
========================================= */

function validateCredentials(){

    if(!isUsernameValid()){

        showErrorMessage(

            "Username must contain at least 3 characters."

        );

        usernameInput.focus();

        return false;

    }

    if(!isPasswordValid()){

        showErrorMessage(

            "Password must contain at least 6 characters."

        );

        passwordInput.focus();

        return false;

    }

    clearLoginMessage();

    return true;

}

/* =========================================
   HANDLE KEYBOARD EVENTS
========================================= */

function handleKeyboard(event){

    if(event.key !== "Enter"){

        return;

    }

    event.preventDefault();

    if(loginButton.disabled){

        return;

    }

    loginButton.click();

}

/* =========================================
   USERNAME INPUT EVENT
========================================= */

usernameInput.addEventListener(

    "blur",

    function(){

        validateLoginForm();

    }

);

/* =========================================
   PASSWORD INPUT EVENT
========================================= */

passwordInput.addEventListener(

    "blur",

    function(){

        validateLoginForm();

    }

);

/* =========================================
   PREVENT EXTRA SPACES
========================================= */

usernameInput.addEventListener(

    "change",

    function(){

        usernameInput.value =

        usernameInput.value.trim();

    }

);

passwordInput.addEventListener(

    "change",

    function(){

        passwordInput.value =

        passwordInput.value.trim();

    }

);

/* =========================================
   AUTO VALIDATION
========================================= */

validateLoginForm();

/* =========================================
   END OF PART - 2
========================================= */

/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 3
========================================= */

/* =========================================
   LOGIN BUTTON CLICK
========================================= */

loginButton.addEventListener(

    "click",

    startLoginProcess

);

/* =========================================
   START LOGIN PROCESS
========================================= */

function startLoginProcess(event){

    event.preventDefault();

    if(loginInProgress){

        return;

    }

    if(!validateCredentials()){

        return;

    }

    beginLogin();

}

/* =========================================
   BEGIN LOGIN
========================================= */

function beginLogin(){

    loginInProgress = true;

    disableLoginButton();

    setLoadingState();

}

/* =========================================
   STOP LOGIN
========================================= */

function stopLogin(){

    loginInProgress = false;

    validateLoginForm();

    removeLoadingState();

}

/* =========================================
   SET LOADING STATE
========================================= */

function setLoadingState(){

    loginButton.textContent =

    "Signing In...";

}

/* =========================================
   REMOVE LOADING STATE
========================================= */

function removeLoadingState(){

    loginButton.textContent =

    "Login";

}

/* =========================================
   RESET LOGIN FORM
========================================= */

function resetLoginForm(){

    loginForm.reset();

    disableLoginButton();

    clearLoginMessage();

    usernameInput.focus();

}

/* =========================================
   INCREASE LOGIN ATTEMPTS
========================================= */

function increaseLoginAttempts(){

    loginAttempts++;

}

/* =========================================
   RESET LOGIN ATTEMPTS
========================================= */

function resetLoginAttempts(){

    loginAttempts = 0;

}

/* =========================================
   CHECK LOGIN LIMIT
========================================= */

function loginLimitReached(){

    return loginAttempts >=

    MAX_LOGIN_ATTEMPTS;

}

/* =========================================
   END OF PART - 3
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 4
========================================= */

/* =========================================
   SHOW PASSWORD EVENT
========================================= */

showPassword.addEventListener(

    "change",

    togglePasswordVisibility

);

/* =========================================
   TOGGLE PASSWORD VISIBILITY
========================================= */

function togglePasswordVisibility(){

    if(showPassword.checked){

        passwordInput.type = "text";

    }

    else{

        passwordInput.type = "password";

    }

}

/* =========================================
   USERNAME INPUT EVENT
========================================= */

usernameInput.addEventListener(

    "focus",

    function(){

        clearLoginMessage();

    }

);

/* =========================================
   PASSWORD INPUT EVENT
========================================= */

passwordInput.addEventListener(

    "focus",

    function(){

        clearLoginMessage();

    }

);

/* =========================================
   USERNAME CHARACTER LIMIT
========================================= */

usernameInput.addEventListener(

    "input",

    function(){

        if(

            usernameInput.value.length > 50

        ){

            usernameInput.value =

            usernameInput.value.substring(

                0,

                50

            );

        }

    }

);

/* =========================================
   PASSWORD CHARACTER LIMIT
========================================= */

passwordInput.addEventListener(

    "input",

    function(){

        if(

            passwordInput.value.length > 100

        ){

            passwordInput.value =

            passwordInput.value.substring(

                0,

                100

            );

        }

    }

);

/* =========================================
   DISABLE COPY FROM PASSWORD
========================================= */

passwordInput.addEventListener(

    "copy",

    function(event){

        event.preventDefault();

    }

);

/* =========================================
   DISABLE CUT FROM PASSWORD
========================================= */

passwordInput.addEventListener(

    "cut",

    function(event){

        event.preventDefault();

    }

);

/* =========================================
   DISABLE DRAG FROM PASSWORD
========================================= */

passwordInput.addEventListener(

    "dragstart",

    function(event){

        event.preventDefault();

    }

);

/* =========================================
   END OF PART - 4
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 5
========================================= */

/* =========================================
   SHOW SUCCESS MESSAGE
========================================= */

function showSuccessMessage(message){

    loginMessage.className =

    "login-message success";

    loginMessage.textContent =

    message;

}

/* =========================================
   SHOW ERROR MESSAGE
========================================= */

function showErrorMessage(message){

    loginMessage.className =

    "login-message error";

    loginMessage.textContent =

    message;

}

/* =========================================
   SHOW WARNING MESSAGE
========================================= */

function showWarningMessage(message){

    loginMessage.className =

    "login-message warning";

    loginMessage.textContent =

    message;

}

/* =========================================
   SHOW INFO MESSAGE
========================================= */

function showInfoMessage(message){

    loginMessage.className =

    "login-message info";

    loginMessage.textContent =

    message;

}

/* =========================================
   SHOW LOADING MESSAGE
========================================= */

function showLoadingMessage(){

    showInfoMessage(

        "Please wait. Signing in..."

    );

}

/* =========================================
   HIDE LOGIN MESSAGE
========================================= */

function hideLoginMessage(){

    loginMessage.className =

    "login-message";

    loginMessage.textContent = "";

}

/* =========================================
   UPDATE LOADING STATE
========================================= */

function updateLoadingState(isLoading){

    if(isLoading){

        loginButton.disabled = true;

        loginButton.textContent =

        "Signing In...";

        showLoadingMessage();

    }

    else{

        loginButton.textContent =

        "Login";

        validateLoginForm();

        hideLoginMessage();

    }

}

/* =========================================
   DISPLAY LOGIN STATUS
========================================= */

function displayLoginStatus(

    status,

    message

){

    switch(status){

        case "success":

            showSuccessMessage(message);

            break;

        case "error":

            showErrorMessage(message);

            break;

        case "warning":

            showWarningMessage(message);

            break;

        default:

            showInfoMessage(message);

            break;

    }

}

/* =========================================
   END OF PART - 5
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 6
========================================= */

/* =========================================
   LOGIN REQUEST
========================================= */

async function loginRequest(){

    try{

        updateLoadingState(true);

        const response = await fetch(

            "/login",

            {

                method:"POST",

                headers:{

                    "Content-Type":

                    "application/json"

                },

                body:JSON.stringify({

                    username:

                    usernameInput.value.trim(),

                    password:

                    passwordInput.value

                })

            }

        );

        const result =

        await response.json();

        processLoginResponse(

            result

        );

    }

    catch(error){

        stopLogin();

        displayLoginStatus(

            "error",

            "Unable to connect to server."

        );

        console.error(error);

    }

}

/* =========================================
   PROCESS LOGIN RESPONSE
========================================= */

function processLoginResponse(

    result

){

    if(result.success){

        loginSuccess(

            result

        );

    }

    else{

        loginFailed(

            result

        );

    }

}

/* =========================================
   START SERVER LOGIN
========================================= */

function submitLogin(){

    loginRequest();

}

/* =========================================
   UPDATE LOGIN PROCESS
========================================= */

function beginLogin(){

    loginInProgress = true;

    disableLoginButton();

    submitLogin();

}

/* =========================================
   END OF PART - 6
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 7
========================================= */

/* =========================================
   LOGIN SUCCESS
========================================= */

function loginSuccess(

    result

){

    stopLogin();

    resetLoginAttempts();

    displayLoginStatus(

        "success",

        "Login Successful."

    );

    setTimeout(

        function(){

            window.location.href = "/";

        },

        1500

    );

}

/* =========================================
   LOGIN FAILED
========================================= */

function loginFailed(

    result

){

    stopLogin();

    increaseLoginAttempts();

    displayLoginStatus(

        "error",

        result.message

    );

    passwordInput.value = "";

    passwordInput.focus();

    if(

        loginLimitReached()

    ){

        lockLogin();

    }

}

/* =========================================
   LOCK LOGIN
========================================= */

function lockLogin(){

    loginInProgress = true;

    disableLoginButton();

    showWarningMessage(

        "Maximum login attempts reached. Please refresh the page."

    );

}

/* =========================================
   UNLOCK LOGIN
========================================= */

function unlockLogin(){

    loginInProgress = false;

    resetLoginAttempts();

    validateLoginForm();

}

/* =========================================
   END OF PART - 7
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 8
========================================= */

/* =========================================
   HANDLE SERVER ERROR
========================================= */

function handleServerError(){

    stopLogin();

    increaseLoginAttempts();

    displayLoginStatus(

        "error",

        "Server error. Please try again later."

    );

}

/* =========================================
   HANDLE NETWORK ERROR
========================================= */

function handleNetworkError(){

    stopLogin();

    displayLoginStatus(

        "error",

        "Network connection failed."

    );

}

/* =========================================
   HANDLE UNKNOWN ERROR
========================================= */

function handleUnknownError(){

    stopLogin();

    displayLoginStatus(

        "error",

        "Unexpected error occurred."

    );

}

/* =========================================
   CLEAR PASSWORD AFTER ERROR
========================================= */

function clearPasswordField(){

    passwordInput.value = "";

    passwordInput.focus();

}

/* =========================================
   RESET ERROR STATE
========================================= */

function resetErrorState(){

    clearLoginMessage();

    validateLoginForm();

}

/* =========================================
   CHECK SERVER RESPONSE
========================================= */

function isServerResponseValid(result){

    return (

        result &&

        typeof result === "object"

    );

}

/* =========================================
   HANDLE INVALID RESPONSE
========================================= */

function handleInvalidResponse(){

    stopLogin();

    displayLoginStatus(

        "error",

        "Invalid server response."

    );

}

/* =========================================
   END OF PART - 8
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 9
========================================= */

/* =========================================
   LOGIN ACTIVITY BUTTON EVENT
========================================= */

loginActivityButton.addEventListener(

    "click",

    loadLoginActivity

);

/* =========================================
   LOAD LOGIN ACTIVITY
========================================= */

async function loadLoginActivity(){

    try{

        displayLoginStatus(

            "info",

            "Loading login activity..."

        );

        const response = await fetch(

            "/login_activity"

        );

        if(

            !response.ok

        ){

            throw new Error(

                "Request Failed"

            );

        }

        const activity =

        await response.json();

        showLoginActivity(

            activity

        );

    }

    catch(error){

        displayLoginStatus(

            "error",

            "Unable to load login activity."

        );

        console.error(error);

    }

}

/* =========================================
   SHOW LOGIN ACTIVITY
========================================= */

function showLoginActivity(

    activity

){

    if(

        !Array.isArray(activity) ||

        activity.length === 0

    ){

        showInfoMessage(

            "No login activity available."

        );

        return;

    }

    let message =

        "Recent Login Activity\n\n";

    activity

    .slice()

    .reverse()

    .forEach(function(item){

        message +=

            item.username +

            " - " +

            new Date(

                item.time

            ).toLocaleString() +

            "\n";

    });

    alert(message);

}

/* =========================================
   END OF PART - 9
========================================= */
/* =========================================
   SMART ATTENDANCE SYSTEM
   ADMIN LOGIN JAVASCRIPT
   PART - 10
========================================= */

/* =========================================
   RESET APPLICATION
========================================= */

function resetApplication(){

    loginInProgress = false;

    resetLoginAttempts();

    resetLoginForm();

    hideLoginMessage();

}

/* =========================================
   CHECK LOGIN SESSION
========================================= */

async function checkLoginSession(){

    try{

        const response = await fetch(

            "/"

        );

        if(

            response.redirected

        ){

            return;

        }

    }

    catch(error){

        console.error(error);

    }

}

/* =========================================
   FINAL INITIALIZATION
========================================= */

function finalizeApplication(){

    validateLoginForm();

    hideLoginMessage();

}

/* =========================================
   START APPLICATION
========================================= */

(function(){

    finalizeApplication();

    checkLoginSession();

})();

/* =========================================
   END OF PART - 10
========================================= */