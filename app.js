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


// Mobile speech helpers
const isMobileDevice =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches;

let speechUnlocked = false;
let speakingSequenceId = 0;

function unlockSpeechEngine() {
    if (speechUnlocked || !("speechSynthesis" in window)) return;

    try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        // A nearly silent utterance started directly from a user gesture
        // unlocks TTS on mobile Safari/Chrome for later async answers.
        const warmup = new SpeechSynthesisUtterance(".");
        warmup.volume = 0.01;
        warmup.rate = 1;
        warmup.pitch = 1;
        window.speechSynthesis.speak(warmup);
        speechUnlocked = true;
    } catch (error) {
        console.warn("Unable to warm up mobile speech:", error);
    }
}

function splitSpeechIntoChunks(text, maxLength = 180) {
    const prepared = prepareSpeechText(text).replace(/\s+/g, " ").trim();
    if (prepared.length <= maxLength) return [prepared];

    const sentences = prepared.match(/[^.!?]+[.!?]?/g) || [prepared];
    const chunks = [];
    let current = "";

    for (const sentenceRaw of sentences) {
        const sentence = sentenceRaw.trim();
        if (!sentence) continue;

        if ((current + " " + sentence).trim().length <= maxLength) {
            current = (current + " " + sentence).trim();
            continue;
        }

        if (current) chunks.push(current);

        if (sentence.length <= maxLength) {
            current = sentence;
        } else {
            const words = sentence.split(" ");
            current = "";
            for (const word of words) {
                if ((current + " " + word).trim().length > maxLength) {
                    if (current) chunks.push(current);
                    current = word;
                } else {
                    current = (current + " " + word).trim();
                }
            }
        }
    }

    if (current) chunks.push(current);
    return chunks.length ? chunks : [prepared];
}



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
        addBotMessage(
            "Voice playback is not supported in this browser. Please use Chrome, Edge or Safari on your phone.",
            false
        );
        return;
    }

    speakingSequenceId += 1;
    const sequenceId = speakingSequenceId;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    stopStopCommandRecognition();

    const chunks = splitSpeechIntoChunks(text, isMobileDevice ? 150 : 220);
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
        voices.find(v => /en-IN/i.test(v.lang) && /female|zira|heera|veena|google|siri/i.test(v.name)) ||
        voices.find(v => /en-IN/i.test(v.lang)) ||
        voices.find(v => /^en[-_]/i.test(v.lang)) ||
        voices.find(v => /English/i.test(v.name)) ||
        voices[0];

    let chunkIndex = 0;
    let actuallyStarted = false;

    setAssistantState("speaking");
    showNoorFullscreen(text);

    // Continuous speech recognition while TTS is playing causes audio conflicts
    // on many phones. Keep spoken "Stop Noor" on desktop; mobile uses the
    // large Stop Voice button for reliable playback.
    if (!isMobileDevice) {
        startStopCommandRecognition();
    } else if (fullscreenAnswer) {
        const mobileHint = document.querySelector(".fullscreen-status");
        if (mobileHint) {
            mobileHint.innerHTML = '<span></span> Noor is speaking · Tap <b>Stop Voice</b> to stop on mobile';
        }
    }

    const speakNextChunk = () => {
        if (sequenceId !== speakingSequenceId) return;

        if (chunkIndex >= chunks.length) {
            stopStopCommandRecognition();
            setAssistantState("ready");
            hideNoorFullscreen();
            return;
        }

        currentUtterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
        currentUtterance.lang = "en-IN";
        currentUtterance.rate = isMobileDevice ? 0.94 : 0.98;
        currentUtterance.pitch = 1.03;
        currentUtterance.volume = 1;

        if (preferredVoice) currentUtterance.voice = preferredVoice;

        currentUtterance.onstart = () => {
            actuallyStarted = true;
            setAssistantState("speaking");
        };

        currentUtterance.onend = () => {
            if (sequenceId !== speakingSequenceId) return;
            chunkIndex += 1;
            setTimeout(speakNextChunk, isMobileDevice ? 60 : 15);
        };

        currentUtterance.onerror = event => {
            console.warn("Speech synthesis error:", event.error);

            // Some mobile engines occasionally reject a selected voice.
            // Retry the same chunk once using the device's default voice.
            if (currentUtterance.voice && sequenceId === speakingSequenceId) {
                const retryText = chunks[chunkIndex];
                const retry = new SpeechSynthesisUtterance(retryText);
                retry.lang = "en-IN";
                retry.rate = 0.94;
                retry.pitch = 1.03;
                retry.volume = 1;
                retry.onend = () => {
                    if (sequenceId !== speakingSequenceId) return;
                    chunkIndex += 1;
                    setTimeout(speakNextChunk, 60);
                };
                retry.onerror = () => {
                    stopStopCommandRecognition();
                    setAssistantState("ready");
                    hideNoorFullscreen();
                };
                window.speechSynthesis.resume();
                window.speechSynthesis.speak(retry);
                return;
            }

            stopStopCommandRecognition();
            setAssistantState("ready");
            hideNoorFullscreen();
        };

        // Android Chrome and iOS Safari are more reliable if resume() is
        // called immediately before speak().
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(currentUtterance);

        // Recovery for mobile browsers that silently pause the TTS engine.
        if (isMobileDevice) {
            setTimeout(() => {
                if (
                    sequenceId === speakingSequenceId &&
                    !actuallyStarted &&
                    !window.speechSynthesis.speaking
                ) {
                    try {
                        window.speechSynthesis.resume();
                        window.speechSynthesis.speak(currentUtterance);
                    } catch (e) {}
                }
            }, 700);
        }
    };

    speakNextChunk();
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
        unlockSpeechEngine();
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
        speakingSequenceId += 1;
    }

    stopStopCommandRecognition();
    setAssistantState("ready");
    hideNoorFullscreen();
});

if (fullscreenStopBtn) {
    fullscreenStopBtn.addEventListener("click", () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            speakingSequenceId += 1;
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
   MOBILE SPEECH UNLOCK
   Required because mobile browsers may block speech that starts
   after a setTimeout or other asynchronous operation.
--------------------------------------------------- */

[sendBtn, micBtn, stopSpeechBtn, fullscreenStopBtn].forEach(control => {
    if (!control) return;
    control.addEventListener("pointerdown", unlockSpeechEngine, { passive: true });
    control.addEventListener("touchstart", unlockSpeechEngine, { passive: true });
});

document.querySelectorAll("[data-question]").forEach(button => {
    button.addEventListener("pointerdown", unlockSpeechEngine, { passive: true });
    button.addEventListener("touchstart", unlockSpeechEngine, { passive: true });
});

questionInput.addEventListener("focus", unlockSpeechEngine, { passive: true });
questionInput.addEventListener("keydown", unlockSpeechEngine);

// A first tap anywhere on the page can also unlock Noor's voice on mobile.
document.addEventListener("pointerdown", unlockSpeechEngine, { once: true, passive: true });
document.addEventListener("touchstart", unlockSpeechEngine, { once: true, passive: true });


/* ---------------------------------------------------
   INIT
--------------------------------------------------- */

setupSpeechRecognition();
setupStopCommandRecognition();

if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();

    if ("onvoiceschanged" in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
}

setAssistantState("ready");


document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        hideNoorFullscreen();
    }
});
