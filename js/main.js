// PRELOADER
$(window).on("load", function () {
    $('.preloader').fadeOut('slow');
    initializeSite();
    setTimeout(() => window.scrollTo(0, 0), 0);
});

/* =Main INIT Function
-------------------------------------------------------------- */
function initializeSite() {
    "use strict";

    // Center Elements
    function centerInit() {
        const sphereContent = $('.sphere');
        const heroContent = $('.hero');
        const parentHeight = $(window).height();

        sphereContent.css({
            "margin-top": (parentHeight - sphereContent.height()) / 2 + "px"
        });

        heroContent.css({
            "margin-top": (parentHeight - heroContent.height()) / 2 + "px"
        });
    }

    $(document).ready(centerInit);
    $(window).resize(centerInit);

    // Init Parallax
    $('#scene').parallax();

    // Button References
    const preInput = $('#preMeetingInput');
    const preOptions = $('#preMeetingOptions');
    const preTimer = $('#preMeetingTimer');
    const preBtn = $('#startPreMeetingBtn');
    const startNowBtn = $('#startMeetingNowBtn');

    // Flags to prevent multiple sound alerts
    let preMeetingWarned = false;
    let meetingWarned = false;

    // Start Countdown Button
    preBtn.on('click', () => {
        const inputMins = parseInt(preInput.val());
        if (isNaN(inputMins) || inputMins < 1) return alert("Please enter a valid number of minutes");

        preMeetingSeconds = inputMins * 60;
        preOptions.hide();
        preTimer.show();

        preMeetingInterval = setInterval(() => {
            preTimer.text(formatTime(preMeetingSeconds));

            // 🔊 Pre-meeting warning 10 minutes before meeting starts
            if (preMeetingSeconds === 600 && !preMeetingWarned) {
                playSound('preMeetingWarningSound');
                preMeetingWarned = true;
            }

            preMeetingSeconds--;

            if (preMeetingSeconds < 0) {
                clearInterval(preMeetingInterval);
                preTimer.hide();
                $('#preMeeting').hide();
                $('#meeting').show();
                playSound('meetingStartSound');
                startMeetingTimer();
            }
        }, 1000);
    });

    // Start Meeting Now Button
    startNowBtn.on('click', () => {
        preOptions.hide();
        preTimer.hide();
        $('#preMeeting').hide();
        $('#meeting').show();
        playSound('meetingStartSound');
        startMeetingTimer();
    });

    // Stop Meeting
    $('#stopMeetingBtn').on('click', () => {
        clearInterval(meetingInterval);
        $('#meeting').hide();
        $('#results').show();

        const totalUsed = 3600 - meetingSeconds;
        const overTime = totalUsed > 3600 ? totalUsed - 3600 : 0;

        $('#totalTimeUsed').text(formatTime(totalUsed));
        $('#overTimeDisplay').text(
            overTime > 0 ? `Time Over: ${formatTime(overTime)}` : `Finished on time.`
        );
    });

    // MEETING TIMER FUNCTION
    function startMeetingTimer() {
        const startTime = Date.now();
        meetingWarned = false;

        meetingInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            meetingSeconds = 3600 - elapsed;

            // 🔊 Meeting ending soon warning (2 minutes left)
            if (meetingSeconds === 600 && !meetingWarned) {
                playSound('endMeetingWarningSound');
                meetingWarned = true;
            }

            document.getElementById('meetingTimer').innerText = formatTime(meetingSeconds);
        }, 1000);
    }
}

// FORMAT TIME
function formatTime(seconds) {
    const sign = seconds < 0 ? '-' : '';
    seconds = Math.abs(seconds);
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${sign}${m}:${s}`;
}

// GLOBAL TIMER VARIABLES
let preMeetingInterval;
let meetingInterval;
let preMeetingSeconds = 0;
let meetingSeconds = 3600;

// UNIVERSAL SOUND PLAYER
function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) sound.play();
}
