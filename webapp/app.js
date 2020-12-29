inputFormContainer = document.getElementById('input-form-container');
thanksFormContainer = document.getElementById('thanks-container');
sendButton = document.getElementById('send-button');
anotherButton = document.getElementById('another-one-button');
copyUrlButton = document.getElementById('copy-url-button');
predictionInput = document.getElementById('prediction-input');
authorInput = document.getElementById('author');
titleText = document.getElementById('title-text');
sampleDynamic = document.getElementsByClassName('example-dynamic')[0];

testingmode = false;

predictionInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
};

const titleTexts = shuffle([
    'code',
    'hacking',
    'robot',
    'space',
    'AI',
    'phone',
    'game',
    'the web',
    'data',
    'IPv4',
    'laptop',
    'privacy',
    'security',
    'car',
    'bitcoin',
    'health',
    'ads',
    'browser',
    'Git',
    'network',
    'medicine',
    'streaming',
    'email',
    'design',
    'media',
    'drone',
    'CDN',
    'app',
    'sensor',
    'news',
    'quantum',
]);

let examplePredictions = shuffle([
    'The browser war will be dominated by opera',
    'The go-to place for coding-questions will still be StackOverflow',
    'Angular will have more users than React and Vue combined',
    'Git will have been replaced by something different',
    'Many poor souls are still stuck in vim',
    'Google will encounter a week long global outage',
    'All smartphones will have 4K displays',
    'The first war between humans and AI will be in progress',
    'In 2030 some humans will be immortal with the help of AI',
    'A time-traveler from the future will visit us',
    'In 2030 quantum computers are required to play the latest AAA games',
    'Cognitive technically stimuli will be generally available',
    'Python 4 will be the most celebrated language',
    "The word 'spaceday' (space holiday) will have been added to the dictionary",
    "AWS will have discontinued EC2 in favor of Lambda's",
    'In 10 years people will still believe VR will be a big thing any moment now',
    'The most prominent used chat application will be Facebook Messenger',
    "Everything with a power plug will become 'smart'",
    'All parents will track the whereabouts of their children continuously',
    'The number of NPM packages will exceed the amount of grains of sand in an average garden pot',
    'The pace of technology change will increase exponentially',
    'Pace of technology change will decrease slowly',
    'In 2030 the ISS will exclusively be a hotel',
    'A single bitcoin will be worth 1 mil',
    'Cryptocurrency miners will take up 30%+ of the world\'s energy consumption'
]);
sampleDynamic.innerHTML = `"${examplePredictions[0]}"`;

var thanksTimout = null;

sendButton.addEventListener('click', () => {
    inputDisabled(true);
    const prediction = predictionInput.value;
    const author = authorInput.value === "" ? null : authorInput.value;

    if(testingmode) {
        inputDisabled(false);
        gotoThanks();
        return
    }

    if (prediction.trim() === "") {
        alert("The prediction paper is still empty. I'm sure you can think of something that will change...");
        inputDisabled(false);
        return;
    }

    gotoThanks();
    grecaptcha.ready(() => {
        try {
            grecaptcha.execute('6LffnBUaAAAAAF3bHkMdZigKelMh6tvOV-BgTMFz', {action: 'submit'})
                .then((grecaptchatoken) => fetch("/api", {
                    method: "POST",
                    body: JSON.stringify({prediction, author, grecaptchatoken})
                }))
                .then(res => {
                    if (!res.ok) {
                        console.log(res);
                        goToInput();
                        alert("The prediction could not be added to the time capsule. Try again later.")
                    }
                    inputDisabled(false);
                })
                .catch((err) => {
                    console.log(err);
                    alert("Error: The prediction could not be added to the time capsule. Try again later.");
                    inputDisabled(false);
                    goToInput();
                });
        } catch (e) {
            //sometimes recapcha execute throws an error outside of promise (aaah)
            console.log(e);
            alert("Re-capcha failed. Try again later");
            goToInput();
            inputDisabled(false);
        }
    });
});

anotherButton.addEventListener('click', () => {
    predictionInput.focus();
    goToInput();
});

copyUrlButton.addEventListener('click', () => {
    // try sharing using the experimental sharing api, else send to clipboard
    try {
        navigator.share({
            title: 'Join me in predicting the future of tech?',
            text: 'Hi! I\'m adding my tech predictions to a time capsule. Would you like to join me? Visit https://future-of.technology',
            url: 'https://future-of.technology',
        }).catch(copyMessageToClipboard)
    } catch(err) {
        copyMessageToClipboard()
    }
});

function copyMessageToClipboard() {
    const tmp = document.createElement('input');
    document.body.appendChild(tmp);
    tmp.value = "Hi! I'm adding my tech predictions to a time capsule. Would you like to join me? Visit https://future-of.technology";
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);

    if (copyUrlButton.innerHTML == 'Share') {
        copyUrlButton.innerHTML = 'Message copied to clipboard';
    } else {
        copyUrlButton.innerHTML += ' again';
    }
}

for (let faq of document.getElementsByClassName('faq')) {
    faq.addEventListener('click', () => {
        faq.classList.toggle('show')
    })
}

function gotoThanks() {
    // reset share button in case it was set to 'sent to clipboard'
    copyUrlButton.innerHTML = 'Share';

    inputFormContainer.style.transform = `scale(0, 0)`;
    // wait until the input has vanished
    thanksTimout = setTimeout(() => {
        // show the 'thanks' elements
        thanksFormContainer.style.display = 'block';
        predictionInput.value = '';
        requestAnimationFrame(() => thanksFormContainer.classList.add('show'));
    }, 3000);
}

function goToInput() {
    // hide the 'thanks' elements
    clearTimeout(thanksTimout);
    thanksFormContainer.classList.remove('show');
    setTimeout(() => thanksFormContainer.style.display = 'none', 1500);

    // make the form appear
    inputFormContainer.style.transitionDuration = '3s';
    inputFormContainer.style.transform = `scale(1, 1)`;
    inputFormContainer.style.transitionTimingFunction = 'ease-out';
}

function inputDisabled(disabled) {
    sendButton.disabled = disabled;
    predictionInput.disabled = disabled;
    authorInput.disabled = disabled;
    sendButton.innerHTML = disabled ? 'Sending...' : 'Send prediction to 2031'
}

// Update the text the title
const textTypeInterval = 200;
const textDeleteInterval = 200;
const textNextDelay = 4000;
const textEmptyDelay = 1000;

let titleTextsIndex = 0;
let cursorPosition = 0;
let typingInterval;
setTimeout(() => {
    typingInterval = setInterval(typeTitleText, textTypeInterval);
}, textNextDelay);

// Start typing new text in the title
function typeTitleText() {
    cursorPosition++;
    titleText.innerHTML = titleTexts[titleTextsIndex].substring(0, cursorPosition);

    // If the text is typed start deleting it in a moment
    if (titleText.innerHTML === titleTexts[titleTextsIndex]) {
        clearInterval(typingInterval);
        setTimeout(() => {
            typingInterval = setInterval(deleteTitleText, textDeleteInterval);
        }, textNextDelay);
    }
}

// Remove the typed text in the title
function deleteTitleText() {
    cursorPosition--;
    titleText.innerHTML = titleTexts[titleTextsIndex].substring(0, cursorPosition);

    // If the text is cleared jump to the next text
    if (titleText.innerHTML === '') {
        clearInterval(typingInterval);
        titleTextsIndex < titleTexts.length - 1 ? titleTextsIndex++ : titleTextsIndex = 0;
        cursorPosition = 0;

        // Display the next text after some time
        setTimeout(() => {
            typingInterval = setInterval(typeTitleText, textTypeInterval);
        }, textEmptyDelay);
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}