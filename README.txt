NOOR - GJIMT AI Admission Assistant

Files included:
- index.html
- style.css
- app.js

Add these image files in the SAME folder:
- gjimt_logo.jpg
- noor_ai.png

Optional fallback:
- robot.jpg

IMPORTANT:
The HTML automatically uses robot.jpg if noor_ai.png is missing.

KIOSK SUPPORT
The CSS includes layouts for:
- Portrait kiosk screens
- Landscape kiosk screens
- Standard desktop/laptop
- Large landscape displays
- Narrow mobile/tablet screens
- Short-height landscape displays

Voice features:
- Chrome / Microsoft Edge recommended
- Allow microphone permission
- Browser text-to-speech is used for Noor's voice

AI BACKEND:
The current app.js contains a local demo knowledge base.
For real open-ended AI answers, connect handleQuestion() to a secure
server-side endpoint. Do NOT put a private AI API key directly in app.js.


VOICE UPDATE:
- Noor now speaks the full name:
  "Gian Jyoti Institute of Management and Technology"
  instead of saying "GJIMT".
- The admission phone number 99144-33199 is spoken digit-by-digit:
  "nine nine one four four, three three one nine nine".


FULL-SCREEN SPEAKING MODE
-------------------------
When Noor starts speaking:
- The normal dashboard softly fades and blurs.
- A light, clean background appears.
- Noor becomes large and centered on the full screen.
- Animated halos, spark effects and voice-wave bars appear.
- Noor's current answer is shown under the portrait.

When speech ends:
- The full-screen speaking screen closes automatically.
- The normal admission dashboard becomes fully visible again.

This mode is responsive for:
- Portrait kiosks
- Landscape kiosks
- Large displays
- Desktop screens
- Tablets/mobile screens

The previous voice improvements remain:
- GJIMT is spoken as "Gian Jyoti Institute of Management and Technology".
- 99144-33199 is spoken digit-by-digit.


LATEST UPDATE
-------------
1. Noor is now larger in full-screen speaking mode.
2. While Noor is speaking, you can say:
   - "Stop"
   - "Stop Noor"
   - "Noor stop"
   - "Please stop"
   and Noor's voice will stop immediately.
3. The full-screen overlay closes when voice is stopped.
4. Manual Stop Voice buttons continue to work.
5. Chrome / Microsoft Edge are recommended because browser speech recognition support is required.

NOTE:
The browser must have microphone permission for voice stop commands to work.


PREMIUM VISUAL UPDATE
---------------------
- Added a cleaner face-focused Noor image: noor_ai_face.png
- Noor's face is positioned higher and more clearly inside the full-screen frame.
- Full-screen speaking mode now includes a premium animated 3D-style background:
  glass panels, floating orbs, holographic rings, light beams and particles.
- Existing "Stop Noor" voice command remains enabled.
- Portrait and landscape kiosk responsiveness is preserved.


FINAL VOICE FIX
---------------
This build fixes the three reported issues:

1. Desktop Tap to Speak
   - Fixed the broken microphone button variable.
   - Uses the real #micBtn element.
   - Works as a one-shot listener in Chrome/Edge.

2. Android / iPhone listening then speaking
   - Noor NEVER starts TTS while the microphone recorder is still open.
   - Recognition stops first.
   - The browser gets a short audio-session release delay.
   - Then Noor speaks.
   - This prevents the common mobile problem where Noor visually speaks but no sound is heard.

3. Noor female voice
   - Restored the earlier female-voice preference.
   - Priority includes Heera, Veena, Zira, Samantha, Karen, Moira, Tessa,
     Fiona, Victoria, Ava and other available female English voices.
   - Indian English is preferred when a suitable female voice is available.

Recommended browsers:
- Desktop: Google Chrome or Microsoft Edge
- Android: Google Chrome
- iPhone: Safari

Microphone permission is required ONLY when the user chooses Tap to Speak.
Typing and quick-action buttons do not require microphone permission.
