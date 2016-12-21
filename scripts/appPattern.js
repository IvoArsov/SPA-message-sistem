/*
    DATABASE CONNECTION
 */

const kinveyBaseUrl = 'https://baas.kinvey.com';
const kinveyAppKey = "kid_rk2FlNuVe";
const kinveyAppSecret = "18256cf0bd234392ae4c9094dfdfb466";
const base64auth = btoa(`${kinveyAppKey}:${kinveyAppSecret}`);
const kinveyAppAuthHeaders = {
    'Authorization': `Basic ${base64auth}`,
    'Content-Type': 'application/json'
};
const userCredentialsHeaders = {
    'Authorization': "Basic " + btoa("ivo:123"),
    'Content-Type': 'application/json'
};
function getUserAuthHeaders(){
    return {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
}

/*
    MAIN LOGIC
 */

function startApp() {
    //TODO


    /*
        SHOW LOADING NOTIFICATION
     */
    $(document).on(
        {
            ajaxStart: function(){$('#loadingBox').show()},
            ajaxStop: function(){$('#loadingBox').hide()}
        }
    );

    /*
        SUBMIT LOGIN AND REGISTER
     */

    $("#formLogin").unbind('submit').bind('submit',function(event) {
        event.preventDefault();
        login();
    });

    $("#formRegister").unbind('submit').bind('submit',function(event) {
        event.preventDefault();
        register();
    });
}

/*
    LOGIN
 */


function login(){
    let loginData = {
        username: $('#loginUsername').val(), //replace
        password: $('#loginPasswd').val()    //replace
    };

    $.ajax({
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/login`,
        headers: kinveyAppAuthHeaders,
        data: JSON.stringify(loginData)
    }).then(loginSuccess).catch(handleAjaxError)
}

function loginSuccess(userInfo) {
    showInfoBox("You are logged in");
    showUserHome();
    saveAuthInSession(userInfo);
    showHideMenuLinks();
    changeWelcomeSigns(userInfo.username);
}

/*
    REGISTER
 */

function register() {
    let registerData = {
        username: $('#registerUsername').val(), //replace
        password: $('#registerPasswd').val(),   //replace
        name: $('#registerName').val()  //replace
    };

    $.ajax({
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}`,
        headers: kinveyAppAuthHeaders,
        data: JSON.stringify(registerData)
    }).then(registerSuccess).catch(handleAjaxError)
}

function registerSuccess(userInfo) {
    showInfoBox("You are register");
    showUserHome();
    saveAuthInSession(userInfo);
    showHideMenuLinks();
    changeWelcomeSigns(userInfo.username);
}

/*
    LOGOUT
 */

function logout() {
    $.ajax({
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/_logout`,
        headers: getUserAuthHeaders()
    }).then(logoutSuccess).catch(handleAjaxError);
}

/*
    CHANGE WELCOME SIGNS
 */

function changeWelcomeSigns(name) {
    $('#spanMenuLoggedInUser').text(`Welcome, ${name}!`);
    $('#viewUserHomeHeading').text(`Welcome, ${name}!`);
}

/*
    SAVE INFO IN SESSION STORAGE
 */

function saveAuthInSession (userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('name', userInfo.name);
}

/*
    SHOW/HIDE NAVIGATION BAR LINKS
 */

function showHideMenuLinks () {
    if (sessionStorage.getItem('authToken')) {
        // Logged in user
        $('#linkMenuAppHome').hide();
        $('#linkMenuLogin').hide();
        $('#linkMenuRegister').hide();
        $('#linkMenuUserHome').show();
        $('#linkMenuMyMessages').show();
        $('#linkMenuArchiveSent').show();
        $('#linkMenuSendMessage').show();
        $('#linkMenuLogout').show();

    } else {
        // Not logged in user
        $('#linkMenuAppHome').show();
        $('#linkMenuLogin').show();
        $('#linkMenuRegister').show();
        $('#linkMenuUserHome').hide();
        $('#linkMenuMyMessages').hide();
        $('#linkMenuArchiveSent').hide();
        $('#linkMenuSendMessage').hide();
        $('#linkMenuLogout').hide();
    }
}

/*
    ATTACH EVENTS AT NAVIGATION BUTTONS
 */

function attachMenuLinksEvents () {
    $('#linkMenuAppHome').click(showGuestHome);
    $('#linkMenuLogin').click(showLoginView);
    $('#linkMenuRegister').click(showRegisterView);
    $('#linkMenuUserHome').click(showUserHome);
    $('#linkMenuMyMessages').click(showMyMessagesView);
    $('#linkMenuArchiveSent').click(showArchiveView);
    $('#linkMenuSendMessage').click(showSendMessagesView);
    $('#linkMenuLogout').click(logout);
}

/*
    HANDLE AJAX ERRORS
 */

function handleAjaxError (response) {
    let errorMsg = JSON.stringify(response);

    if (response.readyState === 0) {
        errorMsg = 'Cannot connect due to network error.';
    }

    if (response.responseJSON && response.responseJSON.description) {
        errorMsg = response.responseJSON.description;
    }

    showError(errorMsg);
}

/*
    SHOW NOTIFICATIONS
 */

function showInfoBox (message) {
    $('#infoBox').text(message).show().fadeOut(3000);
}

function showError(message) {
    $('#errorBox').text(message).show().click(function () {
        $('#errorBox').hide();
    }).fadeOut(3000);
}

/*
    SHOW VIEWS
 */

function showView (viewName) {
    $('main > section').hide();
    $(`#${viewName}`).show();
}

function showGuestHome () {
    showView('viewAppHome');
}

function showUserHome () {
    showView('viewUserHome');
}

function showLoginView () {
    showView('viewLogin');
}

function showRegisterView () {
    showView('viewRegister');
}

function showMyMessagesView() {
    showView('viewMyMessages');
}