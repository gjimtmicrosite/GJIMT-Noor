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
