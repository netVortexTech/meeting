// PRELOADER
$(window).on("load", function () {
    $('.preloader').fadeOut('slow');
    initializeSite();
    setTimeout(() => window.scrollTo(0, 0), 0);
});

// GLOBAL TIMER VARIABLES
let preMeetingInterval;
let meetingInterval;
let preMeetingSeconds = 0;
let meetingSeconds = 3600;
let originalMeetingDuration = 3600;

function initializeSite() {
    "use strict";

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
    $('#scene').parallax();

    const preInput = $('#preMeetingInput');
    const preTimer = $('#preMeetingTimer');
    const preBtn = $('#startPreMeetingBtn');
    const startNowBtn = $('#startMeetingNowBtn');
    const meetingHoursInput = $('#meetingHours');
    const meetingMinutesInput = $('#meetingMinutes');
    const meetingSection = $('#meeting');
    const preMeetingSection = $('#preMeeting');
    const stopBtn = $('#stopMeetingBtn');

    let preMeetingWarned = false;

    // Utility: hide form elements
    function hideInputsAndButtons() {
        $('#preMeetingInput').hide();
        $('#meetingHours').hide();
        $('#meetingMinutes').hide();
        $('#startPreMeetingBtn').hide();
        $('#startMeetingNowBtn').hide();
        $('label[for="preMeetingInput"]').hide();
        $('label:contains("The Entire Meeting Duration")').hide();
    }

    // Start Pre-Meeting Countdown
    preBtn.on('click', () => {
        const inputMins = parseInt(preInput.val());
        const meetingHrs = parseInt(meetingHoursInput.val()) || 0;
        const meetingMins = parseInt(meetingMinutesInput.val()) || 0;

        if (isNaN(inputMins) || inputMins < 1) {
            return alert("Please enter a valid number of minutes for the pre-meeting countdown.");
        }

        preMeetingSeconds = inputMins * 60;
        meetingSeconds = (meetingHrs * 3600) + (meetingMins * 60) || 3600;
        originalMeetingDuration = meetingSeconds;

        hideInputsAndButtons();
        preTimer.show().before('<h2 style="color:white;" id="preMeetingTitle">Countdown Before Meeting</h2>');

        preMeetingWarned = false;

        preMeetingInterval = setInterval(() => {
            preTimer.text(formatTime(preMeetingSeconds));

            // Play sound 5 minutes before pre-meeting ends
            if (preMeetingSeconds === 300 && !preMeetingWarned) {
                playSound('preMeetingWarningSound');
                preMeetingWarned = true;
            }

            preMeetingSeconds--;

            if (preMeetingSeconds < 0) {
                clearInterval(preMeetingInterval);
                $('#preMeetingTitle').remove();
                preTimer.hide();
                preMeetingSection.hide();
                meetingSection.show();
                startMeetingTimer(); // Start the meeting timer without a sound
            }
        }, 1000);
    });

    // Start Meeting Now (no countdown)
    startNowBtn.on('click', () => {
        const meetingHrs = parseInt(meetingHoursInput.val()) || 0;
        const meetingMins = parseInt(meetingMinutesInput.val()) || 0;

        meetingSeconds = (meetingHrs * 3600) + (meetingMins * 60) || 3600;
        originalMeetingDuration = meetingSeconds;

        hideInputsAndButtons();
        $('#preMeetingTitle').remove();
        $('#preMeetingTimer').hide();
        preMeetingSection.hide();
        meetingSection.show();

        startMeetingTimer(); // Start the meeting timer without a sound
    });

    // Stop Meeting
    stopBtn.on('click', () => {
        clearInterval(meetingInterval);
        meetingSection.hide();
        $('#results').show();

        const totalUsed = originalMeetingDuration - meetingSeconds;
        const overTime = totalUsed > originalMeetingDuration ? totalUsed - originalMeetingDuration : 0;

        $('#totalTimeUsed').text(formatTime(totalUsed));
        $('#overTimeDisplay').text(
            overTime > 0 ? `Time Over: ${formatTime(overTime)}` : `Finished on time.`
        );
    });

    // Meeting Timer Logic
    function startMeetingTimer() {
        const startTime = Date.now();
        let warningFifteenMinutes = false;

        meetingInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            meetingSeconds = originalMeetingDuration - elapsed;

            // Play sound 15 minutes before meeting ends
            if (meetingSeconds === 900 && !warningFifteenMinutes) {
                playSound('endMeetingWarningSound');
                warningFifteenMinutes = true;
            }

            // Play sound when meeting ends
            if (meetingSeconds <= 0) {
                clearInterval(meetingInterval);
                playSound('meetingEndSound');
                $('#stopMeetingBtn').click(); // auto-end meeting
            }

            $('#meetingTimer').text(formatTime(meetingSeconds));
        }, 1000);
    }
}

// Format time as hh:mm:ss
function formatTime(seconds) {
    const sign = seconds < 0 ? '-' : '';
    seconds = Math.abs(seconds);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${sign}${h}:${m}:${s}`;
}

// Play a sound by ID
function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
        sound.play().catch(err => {
            console.warn(`Sound ${id} failed to play:`, err);
        });
    }
}