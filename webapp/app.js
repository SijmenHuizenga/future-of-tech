inputFormContainer = document.getElementById('input-form-container');
thanksFormContainer = document.getElementById('thanks-container');
sendButton = document.getElementById('send-button');
anotherButton = document.getElementById('another-one-button');
predictionInput = document.getElementById('prediction-input');
authorInput = document.getElementById('author');

predictionInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
};

const examplePredictions = [
    'The browser war will be dominated by opera',
    'The go-to place for tech-questions will still be StackOverflow',
    'Marques Brownlee will surpass PewDiePie in number of subscribers',
    'Angular will have more users than React and Vue combined',
    'Git will have been replaced by something different',
    'Many poor souls are still stuck in vim',
    'Google will encounter a week long global outage',
    'All smartphones will have 4K displays',
    'In 2030 some people live on mars',
    'The first war between humans and AI will be in progress',
    'In 2030 some humans will be immortable with the help of AI',
    'A time-traveler from the future will visit us',
    'In 2030 quantum computers are required to play the latest AAA games',
    'Cognitive technically stimuli will be generally available',
    'Python 4 will be the most celebrated language',
    "I'm going on a spaceday (space holiday) will have been added to the dictionary",
    "AWS will have discontinued EC2 in favor of Lambda's",
    'In 10 years people will still believe VR will be a big thing any moment now',
    'The most prominent used chat application will we Facebook Messenger',
    "Everything with a power plug will be 'smart' by default",
    'All parents will tracking the whereabouts of their children continuously',
    'The number of NPM packages will exceed the amount of grains of sand in an average garden pot',
    'Pace of technology change will increaste exponentionally',
    'Pace of technology change will decreaste slowly',
    'In 2030 the ISS will exclusivly be a hotel',
    'A single bitcoin will be worth 1 mil',
    'Blockchain miners will take up 30%+ of the world\'s energy consumption'
];

sendButton.addEventListener('click', () => {
    inputDisabled(true);
    const prediction = predictionInput.value;
    const author = authorInput.value === "" ? null : authorInput.value;

    if (prediction === "") {
        alert("The prediction paper is still empty. I'm sure you can think of something that will change...");
        inputDisabled(false);
        return;
    }

    grecaptcha.ready(() => {
        try {
            grecaptcha.execute('6LffnBUaAAAAAF3bHkMdZigKelMh6tvOV-BgTMFz', {action: 'submit'})
                .then((grecaptchatoken) => fetch("/api", {
                    method: "POST",
                    body: JSON.stringify({prediction, author, grecaptchatoken})
                }))
                .then(res => {
                    if (res.ok) {
                        predictionInput.value = '';
                        gotoThanks();
                    } else {
                        console.log(res);
                        alert("The prediction could not be added to the time capsule. Try again later.")
                    }
                    inputDisabled(false);
                })
                .catch((err) => {
                    console.log(err);
                    alert("Error: The prediction could not be added to the time capsule. Try again later.");
                    inputDisabled(false);
                });
        } catch (e) {
            //sometimes recapcha execute throws an error outside of promise (aaah)
            console.log(e);
            alert("Re-capcha failed. Try again later");
            inputDisabled(false);
        }
    });
});

anotherButton.addEventListener('click', () => {
    goToInput();
});

function gotoThanks() {
    inputFormContainer.style.transform = `scale(0, 0)`;
    // wait until the input has vanished
    setTimeout(() => {
        // show the 'thanks' elements
        thanksFormContainer.style.display = 'block';
        requestAnimationFrame(() => thanksFormContainer.classList.add('show'));
    }, 3000);
}

function goToInput() {
    // hide the 'thanks' elements
    thanksFormContainer.classList.remove('show');
    setTimeout(() => thanksFormContainer.style.display = 'none', 1500);

    // make the form appear
    inputFormContainer.style.transitionTimingFunction = 'ease-in';
    inputFormContainer.style.transitionDuration = '0s';
    inputFormContainer.style.transform = `scale(80, 80)`;
    requestAnimationFrame(() => {
        inputFormContainer.style.transitionDuration = '3s';
        inputFormContainer.style.transform = `scale(1, 1)`;
        inputFormContainer.style.transitionTimingFunction = 'ease-out';
    });
}

function inputDisabled(disabled) {
    sendButton.disabled = disabled;
}