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


let recognition = null;
let isListening = false;
let currentUtterance = null;

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
   TEXT TO SPEECH
--------------------------------------------------- */

function speakText(text) {
    if (!("speechSynthesis" in window)) {
        setAssistantState("ready");
        return;
    }

    window.speechSynthesis.cancel();

    currentUtterance = new SpeechSynthesisUtterance(prepareSpeechText(text));

    currentUtterance.lang = "en-IN";
    currentUtterance.rate = 0.98;
    currentUtterance.pitch = 1.05;
    currentUtterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
        voices.find(v => /en-IN/i.test(v.lang) && /female|zira|heera|veena|google/i.test(v.name)) ||
        voices.find(v => /en-IN/i.test(v.lang)) ||
        voices.find(v => /English/i.test(v.name)) ||
        voices[0];

    if (preferredVoice) {
        currentUtterance.voice = preferredVoice;
    }

    currentUtterance.onstart = () => {
        setAssistantState("speaking");
        showNoorFullscreen(text);
        startStopCommandRecognition();
    };

    currentUtterance.onend = () => {
        stopStopCommandRecognition();
        setAssistantState("ready");
        hideNoorFullscreen();
    };

    currentUtterance.onerror = () => {
        stopStopCommandRecognition();
        setAssistantState("ready");
        hideNoorFullscreen();
    };

    window.speechSynthesis.speak(currentUtterance);
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
   SPEECH RECOGNITION
--------------------------------------------------- */

function setupSpeechRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        micBtn.addEventListener("click", () => {
            addBotMessage(
                "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your question.",
                false
            );
        });

        return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        setAssistantState("listening");
    };

    recognition.onresult = event => {
        const transcript = event.results[0][0].transcript;

        questionInput.value = transcript;
        handleQuestion(transcript);
    };

    recognition.onerror = event => {
        console.warn("Speech recognition error:", event.error);

        isListening = false;
        setAssistantState("ready");
    };

    recognition.onend = () => {
        isListening = false;

        if (!window.speechSynthesis.speaking) {
            setAssistantState("ready");
        }
    };

    micBtn.addEventListener("click", () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        hideNoorFullscreen();
        stopStopCommandRecognition();

        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            console.log(error);
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
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    stopStopCommandRecognition();
    setAssistantState("ready");
    hideNoorFullscreen();
});

if (fullscreenStopBtn) {
    fullscreenStopBtn.addEventListener("click", () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        stopStopCommandRecognition();
        setAssistantState("ready");
        hideNoorFullscreen();
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


/* ---------------------------------------------------
   INIT
--------------------------------------------------- */

setupSpeechRecognition();
setupStopCommandRecognition();

if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

setAssistantState("ready");


document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        hideNoorFullscreen();
    }
});
