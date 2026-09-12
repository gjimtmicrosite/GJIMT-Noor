const chatWindow = document.getElementById("chatWindow");
const questionInput = document.getElementById("questionInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const stopSpeechBtn = document.getElementById("stopSpeechBtn");

const avatarStage = document.getElementById("avatarStage");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const voiceTitle = document.getElementById("voiceTitle");
const voiceSubtext = document.getElementById("voiceSubtext");
const voiceBar = document.querySelector(".voice-bar");

const noorFullscreen = document.getElementById("noorFullscreen");
const fullscreenAnswer = document.getElementById("fullscreenAnswer");
const fullscreenStopBtn = document.getElementById("fullscreenStopBtn");


let currentUtterance = null;

let recognition = null;
let isListening = false;
let recognitionStarting = false;
let speechSequenceId = 0;
let speechUnlocked = false;

const isTouchDevice =
    ("ontouchstart" in window) ||
    (navigator.maxTouchPoints > 0);

const isIOS =
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

const isAndroid =
    /Android/i.test(navigator.userAgent);

const isMobileDevice =
    isIOS || isAndroid || window.matchMedia("(pointer: coarse)").matches;


let stopCommandRecognition = null;
let stopCommandActive = false;



/* ---------------------------------------------------
   DEMO KNOWLEDGE BASE
   Replace these answers with official GJIMT data or
   connect the interface to your backend AI endpoint.
--------------------------------------------------- */

const knowledgeBase = [
    {
        keywords: ["admission process", "how to apply", "apply", "admission"],
        answer:
            "The Gian Jyoti Institute of Management and Technology admission journey starts with selecting your preferred program, checking eligibility, completing the admission form, submitting the required documents and completing the fee formalities. For the latest official admission schedule, please contact the Gian Jyoti Institute of Management and Technology admission office at 99144-33199."
    },
    {
        keywords: ["courses", "programs", "course offered", "courses offered"],
        answer:
            "Gian Jyoti Institute of Management and Technology offers management and computer application programs including BBA, BCA, B.Com (Hons.), MBA and MCA. Tell me which program interests you and I can guide you further."
    },
    {
        keywords: ["bca"],
        answer:
            "BCA is a good choice for students interested in computers, software, programming and technology careers. For the latest Gian Jyoti Institute of Management and Technology BCA eligibility, fee and admission details, please confirm the current prospectus or contact the admission office."
    },
    {
        keywords: ["bba"],
        answer:
            "BBA is suitable for students interested in management, entrepreneurship, marketing, finance and business careers. I can also guide you about admission, eligibility and career opportunities."
    },
    {
        keywords: ["b.com", "bcom", "commerce"],
        answer:
            "B.Com (Hons.) is designed for students interested in accounting, finance, taxation, business and commerce-related careers. Please confirm the latest Gian Jyoti Institute of Management and Technology eligibility and fee details with the admission office."
    },
    {
        keywords: ["mba"],
        answer:
            "MBA is a postgraduate management program for students who want to develop careers in management, business leadership, marketing, finance, HR and entrepreneurship."
    },
    {
        keywords: ["mca"],
        answer:
            "MCA is a postgraduate program focused on computer applications, software development and advanced computing. It is suitable for students looking to build professional careers in the IT industry."
    },
    {
        keywords: ["fee", "fees", "fee structure"],
        answer:
            "Fee structures can change by program and academic session. To avoid giving you an outdated amount, please confirm the latest official fee structure with the Gian Jyoti Institute of Management and Technology admission office at 99144-33199."
    },
    {
        keywords: ["eligibility", "eligible"],
        answer:
            "Eligibility depends on the program you are applying for. Tell me the course name—BBA, BCA, B.Com (Hons.), MBA or MCA—and I will guide you with the relevant admission requirements."
    },
    {
        keywords: ["placement", "placements", "job", "recruiters"],
        answer:
            "Gian Jyoti Institute of Management and Technology focuses on employability, industry exposure and placement support. Students receive opportunities to prepare for interviews, aptitude tests and professional careers. For current placement statistics, please verify the latest official GJIMT information."
    },
    {
        keywords: ["scholarship", "scholarships"],
        answer:
            "Scholarship opportunities may depend on merit, category, university rules or institutional policies. For the current academic session, please contact the Gian Jyoti Institute of Management and Technology admission team to check which scholarship options apply to you."
    },
    {
        keywords: ["hostel", "accommodation"],
        answer:
            "For the latest information about hostel or accommodation facilities, room availability and charges, please contact the Gian Jyoti Institute of Management and Technology admission office."
    },
    {
        keywords: ["contact", "phone", "location", "address"],
        answer:
            "You can contact the Gian Jyoti Institute of Management and Technology admission team at 99144-33199. The institute is located in Phase 2, Mohali."
    },
    {
        keywords: ["who are you", "your name", "name"],
        answer:
            "My name is Noor. I am the Gian Jyoti Institute of Management and Technology AI Admission Assistant, here to guide students and parents with admission-related questions."
    }
];


/* ---------------------------------------------------
   CHAT HELPERS
--------------------------------------------------- */

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function createNoorAvatarHTML() {
    return `
        <div class="message-avatar noor-mini">
            <img src="noor_ai.png"
                 onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML='<i class=&quot;fa-solid fa-robot&quot;></i>';"
                 alt="Noor">
        </div>
    `;
}

function addUserMessage(text) {
    const row = document.createElement("div");
    row.className = "message-row user-row";

    row.innerHTML = `
        <div class="message-bubble user-bubble">
            ${escapeHTML(text)}
        </div>
    `;

    chatWindow.appendChild(row);
    scrollToBottom();
}

function addBotMessage(text, speak = true) {
    const row = document.createElement("div");
    row.className = "message-row";

    row.innerHTML = `
        ${createNoorAvatarHTML()}
        <div class="message-bubble bot-bubble">
            ${escapeHTML(text).replace(/\n/g, "<br>")}
        </div>
    `;

    chatWindow.appendChild(row);
    scrollToBottom();

    if (speak) {
        speakText(text);
    }
}

function showTypingIndicator() {
    const row = document.createElement("div");
    row.className = "message-row";
    row.id = "typingRow";

    row.innerHTML = `
        ${createNoorAvatarHTML()}
        <div class="message-bubble bot-bubble typing">
            <span></span><span></span><span></span>
        </div>
    `;

    chatWindow.appendChild(row);
    scrollToBottom();
}

function removeTypingIndicator() {
    const row = document.getElementById("typingRow");
    if (row) row.remove();
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


/* ---------------------------------------------------
   LOCAL DEMO ANSWER ENGINE
--------------------------------------------------- */

function findAnswer(question) {
    const q = question.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const item of knowledgeBase) {
        let score = 0;

        for (const keyword of item.keywords) {
            if (q.includes(keyword)) {
                score += keyword.length;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }

    if (bestMatch) {
        return bestMatch.answer;
    }

    return "I’m Noor, your Gian Jyoti Institute of Management and Technology AI Admission Assistant. I can currently help with admissions, BBA, BCA, B.Com (Hons.), MBA, MCA, fees, eligibility, placements, scholarships, hostel and contact details. For completely open-ended AI answers, connect this interface to your secure AI backend.";
}


/* ---------------------------------------------------
   QUESTION HANDLER
--------------------------------------------------- */

function handleQuestion(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) return;

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    hideNoorFullscreen();
    addUserMessage(cleanQuestion);
    questionInput.value = "";

    setAssistantState("thinking");
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();

        const answer = findAnswer(cleanQuestion);
        addBotMessage(answer, true);

    }, 500);
}



/* ---------------------------------------------------
   SPEECH TEXT PREPARATION
   - Expands GJIMT into the full institute name
   - Reads phone numbers digit-by-digit
--------------------------------------------------- */

function prepareSpeechText(text) {
    let spoken = text;

    // Always speak the complete institute name.
    spoken = spoken.replace(
        /\bGJIMT\b/gi,
        "Gian Jyoti Institute of Management and Technology"
    );

    // Read known admission number digit-by-digit.
    spoken = spoken.replace(
        /\b99144[-\s]?33199\b/g,
        "nine nine one four four, three three one nine nine"
    );

    // General fallback: any 10-digit Indian-style phone number is read digit-by-digit.
    spoken = spoken.replace(/\b\d{10}\b/g, number => {
        const digitWords = {
            "0": "zero",
            "1": "one",
            "2": "two",
            "3": "three",
            "4": "four",
            "5": "five",
            "6": "six",
            "7": "seven",
            "8": "eight",
            "9": "nine"
        };

        return number
            .split("")
            .map(digit => digitWords[digit])
            .join(" ");
    });

    return spoken;
}



function showNoorFullscreen(answerText = "") {
    if (!noorFullscreen) return;

    if (fullscreenAnswer) {
        fullscreenAnswer.textContent = answerText || "Noor is speaking your answer...";
    }

    document.body.classList.add("noor-speaking-fullscreen");
    noorFullscreen.classList.add("active");
    noorFullscreen.setAttribute("aria-hidden", "false");
}

function hideNoorFullscreen() {
    if (!noorFullscreen) return;

    noorFullscreen.classList.remove("active");
    noorFullscreen.setAttribute("aria-hidden", "true");
    document.body.classList.remove("noor-speaking-fullscreen");
}



/* ---------------------------------------------------
   VOICE STOP COMMAND
   While Noor is speaking, listen for:
   "stop", "stop noor", "noor stop", "please stop"
--------------------------------------------------- */

function isStopCommand(text) {
    const clean = (text || "")
        .toLowerCase()
        .replace(/[.,!?]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return (
        clean === "stop" ||
        clean === "stop noor" ||
        clean === "noor stop" ||
        clean === "please stop" ||
        clean.includes("stop noor") ||
        clean.includes("noor stop") ||
        clean.includes("please stop noor")
    );
}

function setupStopCommandRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    stopCommandRecognition = new SpeechRecognition();
    stopCommandRecognition.lang = "en-IN";
    stopCommandRecognition.continuous = true;
    stopCommandRecognition.interimResults = true;

    stopCommandRecognition.onresult = event => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript || "";

            if (isStopCommand(transcript)) {
                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                }

                setAssistantState("ready");
                hideNoorFullscreen();
                stopStopCommandRecognition();

                break;
            }
        }
    };

    stopCommandRecognition.onerror = event => {
        console.warn("Stop-command recognition error:", event.error);

        if (
            stopCommandActive &&
            event.error !== "not-allowed" &&
            event.error !== "service-not-allowed"
        ) {
            setTimeout(() => {
                startStopCommandRecognition();
            }, 350);
        }
    };

    stopCommandRecognition.onend = () => {
        if (stopCommandActive && window.speechSynthesis?.speaking) {
            setTimeout(() => {
                try {
                    stopCommandRecognition.start();
                } catch (e) {}
            }, 250);
        }
    };
}

function startStopCommandRecognition() {
    if (!stopCommandRecognition || stopCommandActive) return;

    stopCommandActive = true;

    try {
        stopCommandRecognition.start();
    } catch (e) {}
}

function stopStopCommandRecognition() {
    stopCommandActive = false;

    if (!stopCommandRecognition) return;

    try {
        stopCommandRecognition.stop();
    } catch (e) {}
}



/* ---------------------------------------------------
   MOBILE / IOS SPEECH OUTPUT UNLOCK
   This never requests microphone permission.
--------------------------------------------------- */

function unlockNoorSpeech() {
    if (speechUnlocked || !("speechSynthesis" in window)) return;

    try {
        const synth = window.speechSynthesis;
        synth.cancel();
        synth.resume();

        const warmup = new SpeechSynthesisUtterance(" ");
        warmup.lang = "en-IN";
        warmup.volume = 0.01;
        warmup.rate = 1;
        warmup.pitch = 1;

        synth.speak(warmup);

        // Do not immediately cancel on iOS. A tiny silent utterance
        // helps unlock the audio session for later asynchronous speech.
        setTimeout(() => {
            try {
                if (synth.speaking) synth.cancel();
            } catch (e) {}
        }, 60);

        speechUnlocked = true;
    } catch (error) {
        console.warn("Noor speech unlock:", error);
    }
}

["pointerdown", "touchstart", "click", "keydown"].forEach(type => {
    document.addEventListener(type, unlockNoorSpeech, {
        once: true,
        passive: true
    });
});


/* ---------------------------------------------------
   TEXT TO SPEECH - STABLE DESKTOP + IPHONE + ANDROID
--------------------------------------------------- */

function getNoorFemaleVoice() {
    if (!("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    // Preserve the earlier Noor female character as closely as each
    // operating system allows.
    const femaleNames = [
        "heera", "veena", "zira", "samantha", "karen", "moira",
        "tessa", "fiona", "victoria", "ava", "susan",
        "google uk english female", "female"
    ];

    const byName = (voice) => {
        const name = (voice.name || "").toLowerCase();
        return femaleNames.some(f => name.includes(f));
    };

    return (
        voices.find(v => /^en[-_]IN$/i.test(v.lang) && byName(v)) ||
        voices.find(v => /^en[-_]IN$/i.test(v.lang) && /google/i.test(v.name)) ||
        voices.find(v => /^en[-_]IN$/i.test(v.lang)) ||
        voices.find(v => /^en[-_](GB|US|AU)$/i.test(v.lang) && byName(v)) ||
        voices.find(v => /^en[-_]/i.test(v.lang) && byName(v)) ||
        voices.find(v => /^en[-_]/i.test(v.lang)) ||
        voices[0]
    );
}

function splitNoorSpeech(text, maxLength = 170) {
    const clean = prepareSpeechText(text).replace(/\s+/g, " ").trim();
    if (!clean) return [];
    if (clean.length <= maxLength) return [clean];

    const sentences = clean.match(/[^.!?]+[.!?]?/g) || [clean];
    const chunks = [];
    let current = "";

    for (const part of sentences) {
        const sentence = part.trim();
        if (!sentence) continue;

        const candidate = (current + " " + sentence).trim();
        if (candidate.length <= maxLength) {
            current = candidate;
            continue;
        }

        if (current) chunks.push(current);

        if (sentence.length <= maxLength) {
            current = sentence;
        } else {
            const words = sentence.split(/\s+/);
            current = "";
            for (const word of words) {
                const next = (current + " " + word).trim();
                if (next.length > maxLength && current) {
                    chunks.push(current);
                    current = word;
                } else {
                    current = next;
                }
            }
        }
    }

    if (current) chunks.push(current);
    return chunks;
}

function stopNoorSpeech() {
    speechSequenceId += 1;

    if ("speechSynthesis" in window) {
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
        } catch (e) {}
    }

    stopStopCommandRecognition();
    setAssistantState("ready");
    hideNoorFullscreen();
}

function speakText(text) {
    if (!("speechSynthesis" in window)) {
        setAssistantState("ready");
        addBotMessage(
            "Voice playback is not supported in this browser. Please use Chrome, Edge or Safari.",
            false
        );
        return;
    }

    // Make absolutely sure microphone recognition has released its
    // audio session before Noor starts speaking.
    stopQuestionRecognition(false);
    stopStopCommandRecognition();

    const synth = window.speechSynthesis;
    speechSequenceId += 1;
    const sequence = speechSequenceId;

    try {
        synth.cancel();
        synth.resume();
    } catch (e) {}

    const chunks = splitNoorSpeech(text, isMobileDevice ? 145 : 210);
    if (!chunks.length) return;

    let chunkIndex = 0;
    let preferredVoice = getNoorFemaleVoice();

    setAssistantState("speaking");
    showNoorFullscreen(text);

    // Spoken "Stop Noor" remains available on desktop only.
    // On phones simultaneous speech recognition can mute TTS.
    if (!isMobileDevice) {
        setTimeout(() => {
            if (sequence === speechSequenceId && synth.speaking) {
                startStopCommandRecognition();
            }
        }, 700);
    }

    const speakChunk = () => {
        if (sequence !== speechSequenceId) return;

        if (chunkIndex >= chunks.length) {
            stopStopCommandRecognition();
            setAssistantState("ready");
            hideNoorFullscreen();
            return;
        }

        currentUtterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
        currentUtterance.lang = "en-IN";
        currentUtterance.rate = isMobileDevice ? 0.95 : 0.98;
        currentUtterance.pitch = 1.05;
        currentUtterance.volume = 1;

        if (preferredVoice) {
            currentUtterance.voice = preferredVoice;
        }

        let started = false;

        currentUtterance.onstart = () => {
            started = true;
            setAssistantState("speaking");
        };

        currentUtterance.onend = () => {
            if (sequence !== speechSequenceId) return;
            chunkIndex += 1;

            // iPhone/Android are more stable with a short gap between chunks.
            setTimeout(speakChunk, isMobileDevice ? 110 : 20);
        };

        currentUtterance.onerror = (event) => {
            if (sequence !== speechSequenceId) return;

            console.warn("Noor speech error:", event.error);

            // Retry once without forcing a selected voice if the platform
            // rejected the chosen voice.
            if (preferredVoice) {
                preferredVoice = null;
                setTimeout(speakChunk, 100);
                return;
            }

            stopStopCommandRecognition();
            setAssistantState("ready");
            hideNoorFullscreen();
        };

        try {
            synth.resume();
            synth.speak(currentUtterance);
        } catch (error) {
            console.warn("Noor speak failed:", error);
        }

        // Safari/Chrome mobile occasionally leaves synthesis paused.
        if (isMobileDevice) {
            setTimeout(() => {
                if (
                    sequence === speechSequenceId &&
                    !started &&
                    !synth.speaking
                ) {
                    try {
                        synth.resume();
                        synth.speak(currentUtterance);
                    } catch (e) {}
                }
            }, 650);

            // iOS long-speech watchdog.
            setTimeout(() => {
                if (
                    sequence === speechSequenceId &&
                    synth.paused
                ) {
                    try { synth.resume(); } catch (e) {}
                }
            }, 1400);
        }
    };

    // Crucial mobile handoff:
    // after microphone recognition ends, allow the browser audio session
    // a short moment to switch from recording to playback.
    const startDelay = isIOS ? 420 : (isAndroid ? 260 : 40);

    setTimeout(() => {
        if (sequence === speechSequenceId) {
            preferredVoice = getNoorFemaleVoice() || preferredVoice;
            speakChunk();
        }
    }, startDelay);
}


/* ---------------------------------------------------
   NOOR VISUAL STATES
--------------------------------------------------- */

function setAssistantState(state) {
    avatarStage.classList.remove("speaking");
    statusDot.classList.remove("listening", "speaking");
    micBtn.classList.remove("listening");
    voiceBar.classList.remove("speaking");

    if (state === "speaking") {
        avatarStage.classList.add("speaking");
        statusDot.classList.add("speaking");
        voiceBar.classList.add("speaking");

        statusText.textContent = "Noor is Speaking";
        voiceTitle.textContent = "Noor is Speaking";
        voiceSubtext.textContent = "Please listen to your admission guidance";

    } else if (state === "listening") {
        statusDot.classList.add("listening");
        micBtn.classList.add("listening");

        statusText.textContent = "Noor is Listening...";
        voiceTitle.textContent = "Listening...";
        voiceSubtext.textContent = "Speak clearly into the kiosk microphone";

    } else if (state === "thinking") {
        statusText.textContent = "Noor is Thinking...";
        voiceTitle.textContent = "Preparing Your Answer";
        voiceSubtext.textContent = "Noor is processing your question";

    } else {
        statusText.textContent = "Ready to Help";
        voiceTitle.textContent = "Tap to Speak with Noor";
        voiceSubtext.textContent = "Ask your admission question using your voice";
    }
}


/* ---------------------------------------------------
   SPEECH RECOGNITION - STABLE ONE-SHOT INPUT
   Works on desktop Chrome/Edge and Android Chrome.
--------------------------------------------------- */

function getRecognitionConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function stopQuestionRecognition(resetState = true) {
    recognitionStarting = false;
    isListening = false;

    if (recognition) {
        try {
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            recognition.stop();
        } catch (e) {}
        recognition = null;
    }

    if (resetState && !window.speechSynthesis?.speaking) {
        setAssistantState("ready");
    }
}

function startQuestionRecognition() {
    const SpeechRecognition = getRecognitionConstructor();

    if (!SpeechRecognition) {
        addBotMessage(
            "Voice input is not supported in this browser. Please type your question. Noor will still speak the answer.",
            false
        );
        return;
    }

    unlockNoorSpeech();
    stopNoorSpeech();

    if (recognitionStarting || isListening) {
        stopQuestionRecognition();
        return;
    }

    recognitionStarting = true;
    const localRecognition = new SpeechRecognition();
    recognition = localRecognition;

    localRecognition.lang = "en-IN";
    localRecognition.continuous = false;
    localRecognition.interimResults = false;
    localRecognition.maxAlternatives = 1;

    let transcript = "";
    let receivedResult = false;

    localRecognition.onstart = () => {
        recognitionStarting = false;
        isListening = true;
        setAssistantState("listening");
    };

    localRecognition.onresult = event => {
        receivedResult = true;
        transcript = (event.results?.[0]?.[0]?.transcript || "").trim();

        if (transcript) {
            questionInput.value = transcript;
        }

        // Do NOT make Noor speak while the microphone is still open.
        // We wait for onend below.
        try {
            localRecognition.stop();
        } catch (e) {}
    };

    localRecognition.onerror = event => {
        console.warn("Question recognition error:", event.error);
        recognitionStarting = false;
        isListening = false;

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            addBotMessage(
                "Microphone permission is only needed for Tap to Speak. You can type your question and Noor will still speak normally.",
                false
            );
        } else if (event.error === "no-speech") {
            voiceSubtext.textContent = "I did not hear anything. Tap the microphone and try again.";
        } else {
            voiceSubtext.textContent = "Voice input stopped. Tap the microphone and try again.";
        }

        setAssistantState("ready");
    };

    localRecognition.onend = () => {
        recognitionStarting = false;
        isListening = false;

        if (recognition === localRecognition) {
            recognition = null;
        }

        if (receivedResult && transcript) {
            setAssistantState("thinking");

            // Extra release time is important on Android/iPhone after recording.
            const releaseDelay = isIOS ? 480 : (isAndroid ? 320 : 120);

            setTimeout(() => {
                handleQuestion(transcript);
            }, releaseDelay);
        } else if (!window.speechSynthesis?.speaking) {
            setAssistantState("ready");
        }
    };

    try {
        localRecognition.start();
    } catch (error) {
        console.warn("Recognition start failed:", error);
        recognitionStarting = false;
        isListening = false;
        recognition = null;
        setAssistantState("ready");
    }
}

function setupSpeechRecognition() {
    if (!micBtn) return;

    micBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        if (isListening || recognitionStarting) {
            stopQuestionRecognition();
        } else {
            startQuestionRecognition();
        }
    });
}


/* ---------------------------------------------------
   BUTTON EVENTS
--------------------------------------------------- */

sendBtn.addEventListener("click", () => {
    handleQuestion(questionInput.value);
});

questionInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        handleQuestion(questionInput.value);
    }
});

document.querySelectorAll("[data-question]").forEach(button => {
    button.addEventListener("click", () => {
        handleQuestion(button.dataset.question);
    });
});

stopSpeechBtn.addEventListener("click", () => {
    stopNoorSpeech();
});

if (fullscreenStopBtn) {
    fullscreenStopBtn.addEventListener("click", () => {
        stopNoorSpeech();
    });
}


/* ---------------------------------------------------
   SUBTLE 3D PORTRAIT MOVEMENT
   Disabled on touch-only devices.
--------------------------------------------------- */

if (window.matchMedia("(hover: hover)").matches) {
    avatarStage.addEventListener("mousemove", event => {
        if (avatarStage.classList.contains("speaking")) return;

        const rect = avatarStage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = -((y / rect.height) - 0.5) * 8;

        const portrait = avatarStage.querySelector(".portrait-frame");

        portrait.style.transform =
            `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    avatarStage.addEventListener("mouseleave", () => {
        const portrait = avatarStage.querySelector(".portrait-frame");

        portrait.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
}



/* Unlock Noor's playback directly from meaningful user gestures. */
[sendBtn, micBtn, stopSpeechBtn, fullscreenStopBtn].forEach(control => {
    if (!control) return;
    control.addEventListener("pointerdown", unlockNoorSpeech, { passive: true });
    control.addEventListener("touchstart", unlockNoorSpeech, { passive: true });
});

document.querySelectorAll("[data-question]").forEach(button => {
    button.addEventListener("pointerdown", unlockNoorSpeech, { passive: true });
    button.addEventListener("touchstart", unlockNoorSpeech, { passive: true });
});


/* ---------------------------------------------------
   INIT
--------------------------------------------------- */

setupSpeechRecognition();
setupStopCommandRecognition();

if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        window.speechSynthesis.getVoices();
    });
}

setAssistantState("ready");


document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        hideNoorFullscreen();
    }
});
