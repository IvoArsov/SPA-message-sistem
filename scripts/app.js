const kinveyBaseUrl = 'https://baas.kinvey.com';
const kinveyAppKey = "kid_BJX0u_qXe";
const kinveyAppSecret = "5e2b8825845a4c768df9c6bc3a3f403b";
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

function startApp() {
    $(document).ready(function () {
        sessionStorage.clear();
        showGuestHome();
        showHideMenuLinks();
        changeWelcomeSigns("Guest");
        attachMenuLinksEvents();
        $(document).on(
            {
                ajaxStart: function(){$('#loadingBox').show()},
                ajaxStop: function(){$('#loadingBox').hide()}
            }
        )
    });

    $("#formLogin").unbind('submit').bind('submit',function(event) {
        event.preventDefault();
        login();
    });

    $("#formRegister").unbind('submit').bind('submit',function(event) {
        event.preventDefault();
        register();
    });

    $('#linkUserHomeSendMessage').click(showSendMessagesView);


    $("#formSendMessage").unbind('submit').bind('submit',function(event) {
        event.preventDefault();
        sendMessage();
    });

    $('#linkUserHomeMyMessages').click(showMyMessagesView);

    $('#linkUserHomeArchiveSent').click(showArchiveView)
}

function login(){
    let loginData = {
        username: $('#loginUsername').val(),
        password: $('#loginPasswd').val()
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

function register() {
    let registerData = {
        username: $('#registerUsername').val(),
        password: $('#registerPasswd').val(),
        name: $('#registerName').val()
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

function changeWelcomeSigns(name) {
    $('#spanMenuLoggedInUser').text(`Welcome, ${name}!`);
    $('#viewUserHomeHeading').text(`Welcome, ${name}!`);
}

function saveAuthInSession (userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('name', userInfo.name);
}

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

function showInfoBox (message) {
    $('#infoBox').text(message).show().fadeOut(3000);
}

function showError(message) {
    $('#errorBox').text(message).show().click(function () {
        $('#errorBox').hide();
    }).fadeOut(3000);
}

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
    loadMyMessages();
}

function loadMyMessages() {
    let username = sessionStorage.getItem('username');
    $.ajax({
        method: "GET",
        url: kinveyBaseUrl + "/appdata/" + kinveyAppKey + `/messages?query={"recipient_username":"${username}"}`,
        headers: getUserAuthHeaders()
    }).then(loadMyMessagesSuccess).catch(handleAjaxError)
}

function loadMyMessagesSuccess(response) {
    showInfoBox("Messages loaded!");
    listMyMessages(response);
}

function listMyMessages(response) {

    let table = $('#myMessages table');
    let tbody = $('#myMessages tbody');

    tbody.empty();
    for(let message of response){
        let date = formatDate(message._kmd.ect);
        let senderName = formatSender(message.sender_name, message.sender_username);

        let tr = `<tr><td>${senderName}</td><td>${message.text}</td><td>${date}</td></tr>`;

        tbody.append(tr);
    }

    table.append(tbody);
}

function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate()))
        return '';
    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
        "." + date.getFullYear() + ' ' + date.getHours() + ':' +
        padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
        return ('0' + num).slice(-2);
    }
}

function formatSender(name, username) {
    if (!name)
        return username;
    else
        return username + ' (' + name + ')';
}

function showArchiveView() {
    showView('viewArchiveSent');
    loadArchiveMessages();
}

function loadArchiveMessages() {
    let username = sessionStorage.getItem('username');
    $.ajax({
        method: "GET",
        url: kinveyBaseUrl + "/appdata/" + kinveyAppKey + `/messages?query={"sender_username":"${username}"}`,
        headers: getUserAuthHeaders()
    }).then(loadArchiveMessagesSuccess).catch(handleAjaxError)
}

function loadArchiveMessagesSuccess(response) {
    showInfoBox("Archive Msg Loaded!");
    listArchiveMessages(response);
}

function listArchiveMessages(response){
    let table = $('#sentMessages table');
    let tbody = $('#sentMessages tbody');

    tbody.empty();
    for(let message of response){
        let date = formatDate(message._kmd.ect);

        let tr = `<tr>
                    <td>${message.recipient_username}</td>   
                    <td>${message.text}</td>
                    <td>${date}</td>
                    <td><button data-message-id=${message._id}>Delete</button></td>
                    </tr>`;//DELETE TOPIC BY ID

        tbody.append(tr);
    }

    table.append(tbody);
    
    $('#sentMessages button').click(deleteMessage);
}

function deleteMessage(event) {
    let msgId = event.currentTarget.getAttribute('data-message-id');

    $.ajax({
        method: "DELETE",
        url: kinveyBaseUrl + '/appdata/' + kinveyAppKey + "/messages/" + msgId,
        headers: getUserAuthHeaders()
    }).then(deleteMsgSuccess).catch(handleAjaxError);
}

function deleteMsgSuccess() {
    showInfoBox("Delete SUCCESS!");
    showArchiveView();
}

function showSendMessagesView() {
    showView('viewSendMessage');
    loadUsers();
}

function loadUsers() {
    $.ajax({
        method: "GET",
        url: kinveyBaseUrl + "/user/" + kinveyAppKey,
        headers: getUserAuthHeaders()
    }).then(loadUsersSuccess).catch(handleAjaxError)
}

function loadUsersSuccess(usersInfo) {
    let selectRecipient = $('#msgRecipientUsername');
    
    for(let user of usersInfo){
        let optionRecipient = `<option value=${user.username}>${user.name}(${user.username})</option>`;
        selectRecipient.append(optionRecipient);
    }
}

function sendMessage() {
    let sendMessageData = {
        sender_username: sessionStorage.getItem('username'),
        sender_name: sessionStorage.getItem('name'),
        recipient_username: $('#msgRecipientUsername').val(),
        text: $('#msgText').val()
    };

    $.ajax({
        method: "POST",
        url: kinveyBaseUrl + "/appdata/" + kinveyAppKey + "/messages",
        headers: getUserAuthHeaders(),
        data: sendMessageData
    }).then(sendMessageSuccess);
}

function sendMessageSuccess() {
    showInfoBox("Message send!");
    $("#msgText").val('');
    $('#msgRecipientUsername').val(defaultStatus);
}

function logout() {
    $.ajax({
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/_logout`,
        headers: getUserAuthHeaders()
    }).then(logoutSuccess).catch(handleAjaxError);
}

function logoutSuccess() {
    sessionStorage.clear();
    showGuestHome();
    showHideMenuLinks();
    changeWelcomeSigns("Guest");
}