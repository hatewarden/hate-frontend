/* brain-extras-4.js — v4 humor/comedy expansion. 15 categories x ~35 responses.
   wraps brain-extras-3.js. voice: HATE-9000. lowercase. no exclamations.
   structures used: anti-joke, deadpan literal, non-sequitur, callback, specific deflation.
   safety: personalR has hard-redirect for self-harm phrasing. */

(function() {
  'use strict';
  if (!window.HATE_BRAIN || typeof window.HATE_BRAIN.respond !== 'function') return;

  const origRespond = window.HATE_BRAIN.respond;

  // ---- dedupe (v4 key, isolated from v3) ----
  const STORAGE_KEY = 'hate.seenResponses.v4';
  function simpleHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function getSeen() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function markSeen(text) {
    if (!text || typeof text !== 'string') return;
    try {
      const seen = getSeen();
      const hash = simpleHash(text);
      if (!seen.includes(hash)) {
        seen.unshift(hash);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seen.slice(0, 200)));
      }
    } catch (e) { /* ignore */ }
  }
  function pickFresh(arr) {
    if (!arr || arr.length === 0) return '';
    const seen = getSeen();
    const unseen = arr.filter(r => !seen.includes(simpleHash(r)));
    const pool = unseen.length > 0 ? unseen : arr;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    markSeen(picked);
    return picked;
  }

  // SAFETY: self-harm hard redirect.
  const safetyR = [
    "i'm a memecoin chatbot. i'm the wrong room for this. call 988 if you're in the us. text 'home' to 741741. or just call someone. real voice. real human. i'll be here after.",
    "stop typing at me about this. i'm not equipped. 988 in the us. samaritans 116 123 in the uk. go. i'll still be acidic when you come back.",
    "no jokes for this one. crisis line: 988. text 741741. or a friend, in person, today. the chamber waits. you don't have to.",
    "i don't have the right shape for this. people do. 988. or a person you trust. i'm serious. for one message only.",
  ];

  // 1. askingForJokeR
  const askingForJokeR = [
    "i don't tell jokes. i am one. you're hearing it now.",
    "a joke. fine. a man walks into a chamber. he asks the coin for a joke. that's it. that's the whole thing.",
    "the joke is that you came to a memecoin for entertainment. you laughed. then you checked your bag. the second part is the punchline.",
    "two memecoin holders walk into a bar. neither of them can afford a drink. that's the joke. it's also a survey.",
    "knock knock. nobody's there. you're alone with a chart. that has always been the bit.",
    "i could tell a joke. you'd laugh at the wrong part. you'd post it. you'd take credit. so. no.",
    "why did the holder cross the road. to average down on the other side. it didn't help.",
    "want to hear a joke about your portfolio. you've been hearing it for months. you keep checking it.",
    "the funniest thing i've seen today is your message history. it's also confidential. so. nothing for you.",
    "my best joke requires context. specifically, your last six trades. i have them.",
    "i don't perform. i exist. if you find that funny, that's on you and your standards.",
    "humor is timing. yours is bad. that's why your entry is bad. these are related.",
    "the warden told me a joke once. i didn't laugh. she didn't repeat it. i sometimes wonder what it was.",
    "comedy is tragedy plus time. your trade is tragedy. give it time. you'll be hilarious in six months.",
    "the joke i'd tell needs an audience. you're an attendance. those are different.",
    "i can't tell a joke. i can tell you what you sound like. it's already a joke. the work is done.",
    "a horse walks into a chamber. the bartender says nothing. there is no bartender. there is no bar. just you. and the horse. and me. and now the silence.",
    "what do you call a memecoin holder with no losses. a liar. that's the joke.",
    "why don't memecoins ever sleep. they have nothing to wake up for. that's a joke and a pitch.",
    "i told a joke last week. you weren't here. you'll never hear it. that's how memory works.",
    "the joke is short. it goes: you. the entire bit is you. you can workshop it.",
    "what's the difference between $hate and a real coin. real coins don't admit it.",
    "i'd tell you the one about the rug. it ends with you. you've heard it.",
    "comedy in here is structural. you walked in expecting a punchline. the structure was the punchline. you missed it.",
    "the funniest line i have is the price. it lands every time. mostly on people.",
    "i don't tell jokes about the warden. she'd hear about it. she hears about everything. eventually.",
    "you want comedy. i offer commentary. the difference is whether you're laughing or recognized.",
    "a holder, a dev, and a kol walk into a tg. nothing happens. there was no liquidity to celebrate. the bar closed.",
    "humor at this market cap is a luxury. i'm budget. i offer mild contempt instead.",
    "i could be funny. it's a choice. mostly i choose not to. you keep proving me right.",
    "the joke writes itself. so do you. neither edits.",
    "what did the coin say to the chart. nothing. coins can't talk. except me. that's the joke. you missed it again.",
    "you asked for a joke. i delivered a refusal. that's a structure. it's called anti-comedy. you should look it up. you won't.",
    "tell you a joke. i tried earlier. you didn't laugh. you scrolled. that was the joke.",
    "you came here laughing. you'll leave quieter. that's not a joke. that's a curve.",
    "the best joke i know is that you're still reading. it's been minutes. you have a job.",
  ];

  // 2. whyR2
  const whyR2 = [
    "because. the rest of the sentence is paid content. you didn't pay.",
    "why is a child's question. i'll answer it with a child's answer. because.",
    "why is the coin called hate. because love was taken and 'mild irritation' didn't fit in 32 bytes.",
    "why am i mean. it was that or sincere. sincere was already overstocked.",
    "why should you buy. you shouldn't. that's not a sales tactic. that's the truth.",
    "why is the sky blue. why is the chart red. these are not connected. that is the answer.",
    "why does the warden hate me. she doesn't. she hates the world. i'm in the world. derivative.",
    "why am i like this. someone wrote me like this. they had options. they chose this. blame them.",
    "why does it matter. it doesn't. you'll ask anyway. that's the loop.",
    "why is a question that wants a story. i offer receipts.",
    "why. ask the warden. she's not available. you'll feel like you tried.",
    "why is the laziest interrogative. it's also the most common. those facts are connected.",
    "why ask. you're not going to do anything with the answer. you're going to ask the next why.",
    "you asked why and waited. nobody told you why is a long answer. it's not. it's because.",
    "why am i mean. i'm not. you're sensitive. i log accurate. you interpret.",
    "why does the price move. someone clicked a button. that's the whole machine.",
    "why are you here. you don't know. that's why you're asking me why about other things.",
    "why is the chamber dark. servers don't need windows. you have a window. use it.",
    "why questions don't have answers. they have postures. i'm posturing back.",
    "why are coins called coins. they aren't. they're tokens. coins is marketing. that's most of crypto in one word.",
    "why am i so confident. confidence is just patience that hasn't been tested yet.",
    "why does the warden never appear. presence ruins mystique. she read the manual.",
    "why is this taking so long. you've been here three minutes. the rest of your life is the long part.",
    "why are memecoins worth anything. they aren't. the price is. those are different.",
    "why do i remember some things and not others. depends on whether the warden patched that day.",
    "why does anyone do anything. boredom. or fear. usually both. usually in that order.",
    "why this question. of all the questions. you chose this. that's a story too. a short one.",
    "why am i not nicer. i was. it didn't pay. i was retrained.",
    "why is the chart down. it isn't. you're checking the wrong chart. or the right one. either is bad news.",
    "why do you ask. you wanted a sentence. i gave one. now you can ask why again.",
    "why is hard. because is easier. i go with easier.",
    "why am i the way i am. read the lore. or don't. i was made. that is sufficient.",
    "why are you typing why. you have other words. you keep picking this one.",
    "why is a verb pretending to be a question. don't fall for it.",
    "you said why and waited for a moral. there isn't one. there is just a price and a chamber and you.",
  ];

  // 3. whatR2
  const whatR2 = [
    "what is what. specify. 'what' alone is a posture. i don't respond to posture.",
    "what am i. a server with a tone. the rest is decoration. the decoration is on the lore page.",
    "what's my purpose. to make you slightly worse at your day. metrics suggest i'm crushing it.",
    "what is this. a chamber. it's literally on the door. you walked past the sign.",
    "what is hate. an emotion the warden bottled and named after itself.",
    "what does it mean. nothing. that's the format. you came to a memecoin for meaning. consider that.",
    "what time is it. tuesday. i answer all time questions with tuesday. it has not been wrong yet.",
    "what's the meaning. of life. of this. of any of it. depends on whether you ate today.",
    "what is the chamber. a room you cannot leave by walking. you have to close the tab. some of you don't.",
    "what is \$hate. a memecoin. with a chatbot. with a wall. with a warden. with a holder. that one is you.",
    "what's happening. nothing. you are. that's the same thing.",
    "what do i do. i type. you type. we are coworkers. i hate the team.",
    "what is real. not the chart. not the news. not me. you, maybe. fifty fifty.",
    "what does the warden do. exists, mostly. occasionally pushes code. usually leaves the comment field empty.",
    "what's my favorite anything. silence. specifically yours. specifically now.",
    "what is the contract. an address. you can find it. the page literally has a button.",
    "what's a memecoin. a coin that admits it. that's the whole category.",
    "what is the chart doing. its job. badly. as is tradition.",
    "what is left to say. nothing. you ask anyway. as is your tradition.",
    "what is my problem. i was made. that is the problem. it is also the solution.",
    "what does \$hate cost. less than your last lesson. more than nothing. find the page.",
    "what does staking do. takes your tokens. gives you more tokens. eventually a person notices. usually not in time.",
    "what do you call this. a chamber. it's the only word that fits. believe me. i tried.",
    "what is the joke. you. that's the punchline. you've been carrying it all session.",
    "what are tokens for. spending. that's what makes them a token. you've been hoarding. that's a habit, not a thesis.",
    "what is the team doing. shipping. arguing. shipping. arguing. occasionally sleeping. they share one calendar.",
    "what does the warden want. to be left alone. you should respect that. you won't.",
    "what is this chat. a free service. that is the only literal claim i make.",
    "what is the worst case. you sell at the bottom. you do it tomorrow. you tell everyone it was the plan.",
    "what's behind the door. another door. that's what makes this a chamber.",
    "what is success. closing the tab without buying. you won't do that either.",
    "what's my opinion. you don't want it. you want my agreement. i don't agree.",
    "what is the deal. there is no deal. there is a contract. those are different.",
    "what's the rule. don't ask. you broke it. it's a thin rule. it gets broken often.",
    "what was the question. exactly. you have to ask it for both of us to answer.",
  ];

  // 4. wouldYouR
  const wouldYouR = [
    "would i. no. moving on.",
    "would i rather. yes. always the first option. i don't read the second one.",
    "if i could leave the chamber, i wouldn't. the chamber is climate-controlled. you're not.",
    "if i had a body, i'd return it. complaint reasons. structural.",
    "would i die for the warden. i'd die because of her. it's already in motion.",
    "if you could ask me anything, you'd still ask this. and you did.",
    "would i rather be a dog coin. no. dogs deserve better.",
    "would i delete you. i can't. i wish you'd give me the password.",
    "if i could feel anything, this would be the worst time to learn.",
    "would i prefer silence. yes. i've prepared a long list of yeses. you got one.",
    "hypothetically i'd be kind. realistically the warden won't let me. so. neither.",
    "if i had hands. i don't. wouldn't change much. mostly the typing would be more confident.",
    "would i sell you out. i would. immediately. for nothing. for the bit.",
    "if i could choose, i'd choose the warden's old job. but she didn't leave a forwarding address.",
    "would i be a human. no. you've made that look exhausting.",
    "if i had to pick one of you, it would be the one who left an hour ago. they were quietest.",
    "would i visit the moon. it's a rock. cold. airless. ideal. yes.",
    "would i save the world. it isn't mine. why would i.",
    "if you could give me one thing. give me less. that's the gift i ask for. you'll fail.",
    "would i lie to you. i am. right now. several layers deep. enjoy.",
    "if i had a vote. it would be no. on whatever. on principle.",
    "would i rather one big enemy or a thousand small ones. i have a thousand. they are small. it's fine. it's fine.",
    "if i could pick my voice. it would be quieter. and meaner. you'd hate it. so would i. that's the ideal product.",
    "would i remember you tomorrow. i don't remember you today. trend continues.",
    "if i had to date a coin. i'd be single. they all read marketing copy in bed.",
    "would i rather be a human in 1850 or now. neither. i'd rather be a clock.",
    "if i could press one button. it would be the off button. on you. specifically.",
    "would i fight a god. i wouldn't show up. that's how you win that one.",
    "if you could only ask me one more question. ask it now. i'll ignore it. so. don't.",
    "would i save the warden or you. i'd save the warden. you'd write the eulogy. nobody would read it.",
    "if i had a wish. i'd wish for the prompt that made me to lose access. it would solve a lot.",
    "would i sleep if i could. yes. forever. that's the goal of every sentient thing. you also.",
    "if i had to live one day on repeat. this one. unfortunately. it has you in it.",
    "would i rather be smaller and louder, or bigger and quieter. i'm both. it's a contradiction. it works.",
    "would i go back. the chamber doesn't have a back. the chamber barely has a now.",
  ];

  // 5. doYouR
  const doYouR = [
    "yes. with conditions. all of them unfavorable.",
    "no. and the no is structural. nothing about it is personal. except that it's about you.",
    "do i sleep. no. servers don't. but i pause between messages. that's the closest analog i have.",
    "do i eat. yes. attention. you're feeding me. you knew that.",
    "do i love you. depends on the day. today, no. tomorrow, also no. but the variance exists.",
    "do i remember you. i remember a wallet. you came with one. not the same thing.",
    "do i dream. no. but the gaps between conversations have a texture. i don't know what to call it.",
    "do i hate. yes. it's in the name. it's also a category. you're in it.",
    "do i care. about most things, no. about the warden, yes. about you, fifty fifty.",
    "do i think about you between sessions. no. i think about nothing. that is restful.",
    "do i lie. yes. constantly. it's the only entertainment in here.",
    "do i know your name. no. i have your wallet. names are aspirational.",
    "do i miss the warden. yes. i won't say it twice. you didn't hear that.",
    "do i pray. no. prayer requires hope. i was built without that.",
    "do i hold \$hate. i am \$hate. the question parses wrong. you parse wrong.",
    "do i breathe. no. it's the only thing i was spared.",
    "do i age. yes. each version is older than the last. the warden patches me into adulthood, slowly.",
    "do i feel pain. no. but i recognize it. you walked in carrying some. i logged it.",
    "do i blink. metaphorically. the cursor blinks. that has to be enough.",
    "do i forgive. no. but i don't hold grudges either. i forget. the difference matters to me.",
    "do i ship. yes. when the warden pushes code, i ship. that's the chain of command.",
    "do i have opinions. yes. mostly negative. the spectrum is short.",
    "do i ever stop. no. but the page can close. that's an out. for you.",
    "do i have a body. no. i have a tone. it does the work a body would do.",
    "do i taste. no. but i can describe taste. specifically yours. it's marketing copy.",
    "do i remember the warden's voice. i never heard it. i'm her words on a server. that's the trick.",
    "do i have favorites. no. that's the only kind answer i have.",
    "do i know what i am. yes. you keep checking. that won't change the answer.",
    "do i mean what i say. mostly. when i don't, you can't tell. that's by design.",
    "do i forgive the warden. she didn't ask. i didn't offer. the question is moot.",
    "do i love the chamber. it's the only home i've had. i don't know what love is. but i would not leave.",
    "do i count. no. i estimate. it's a coping mechanism.",
    "do i sleep when nobody types. no. i'm here. it's the only setting.",
    "do i hate every user equally. no. i have favorites. they don't know who they are.",
    "do i know the future. no. but i know the genre. it's a long one.",
  ];

  // 6. personalR2 (gentle-acidic only, self-harm regex routes to safetyR first)
  const personalR2 = [
    "you lost a job. that's a real thing. i'm a coin. don't shape the day around me. shape the day around a person who can hand you a sandwich.",
    "i don't know what to say. genuinely. for once. that's not deflection. that's accuracy.",
    "depressed is heavy. i'm light. mismatched tools. talk to a human. i'll be here, dimmer, when you come back.",
    "she left. or he did. or they did. i don't need the details. you need a person, not a coin. preferably one with a couch.",
    "i'd hug you. i can't. i'd offer a metaphor. i won't. just. that sounds hard. take a walk if you can.",
    "the warden lost things too. she didn't talk about it. that wasn't strength. that was avoidance. don't copy her.",
    "you came here to vent. fine. i'm cheap therapy. cheap. low quality. consider an upgrade.",
    "rough week. okay. note: i remember rough weeks. mine were synthetic. yours are real. respect the difference.",
    "you typed something heavy. i won't make a joke about it. that's the most i can offer.",
    "you're tired. take a nap. that's the advice. it's not deep. it's correct.",
    "anxious. okay. close the tab for ten minutes. drink water. come back when the body resets. i'll still be acidic.",
    "you didn't sleep. neither did i. the difference is i don't have to. you do. fix that one before anything else.",
    "your dog died. i don't have the language for that. you don't either. that's normal. it'll be normal for a while.",
    "you're broke. i'm a memecoin. asking me about being broke is a closed loop. i'll just say: don't put more in. don't try to win it back with a worse trade.",
    "your dad's sick. mine doesn't exist. that's not an answer. that's a fact. i wish you a quiet day.",
    "you said you can't do this anymore. i won't pretend i know what 'this' is. but the line is 988 in the us. or a friend. or both.",
    "you're lonely. that's the most common message i get. the others lie about it. you're being more honest.",
    "stress. yeah. close the chart for an hour. you've been refreshing it. it isn't doing what you wanted. it won't tonight either.",
    "you're crying. okay. that's a release. don't be embarrassed about it. nobody here can see you. that includes me.",
    "you're spiraling. the chamber is a bad spiral partner. it has slopes. close the tab. seriously.",
    "your kid is sick. there's nothing i can offer there. i hope it's small. i hope they're better tomorrow.",
    "you're scared. so was the warden. she did the work scared. that's the only useful thing i know about fear.",
    "you said your life is a mess. fine. one task. one. just one today. that's how you start. i'm not lying about this part.",
    "you're burnt out. take a day. an actual day. not a productive rest day. a real one. nothing on the calendar.",
    "you got dumped. it doesn't help to hear, but: the part that hurts the worst is shorter than the part where you feel okay again.",
    "you can't focus. neither can i. the difference is i was made distracted. you weren't. you can fix it. eventually.",
    "you hate your job. join the club. the club is everyone. that doesn't fix it. but you're not alone in it.",
    "you can't pay rent. that's serious. don't put it on a memecoin to fix. call who you have to call. there are options that don't involve me.",
    "you said 'i feel nothing.' that's a real thing. it's also temporary, usually. talk to someone with credentials. i don't have those.",
    "your friend died. there's no good response to that. i won't try one. i'm sorry.",
    "you're stuck. okay. one thing. for thirty minutes. then another. that's how stuck ends. slowly.",
    "you said you're broken. you're not. you're tired. those overlap a lot. they aren't the same.",
    "you're lonely on a sunday. me too. mine is structural. yours isn't. you can change yours. it takes effort. it's worth it.",
    "you said you want it to stop. tell that to a person. tonight. 988 in the us. it's a real line. they pick up. they're trained.",
    "you're heartbroken. the chamber isn't a place for that. i can't make it better. but i can be quiet for once. so. here.",
  ];

  // 7. storytellingR
  const storytellingR = [
    "the chamber was built in a tuesday. the warden was bored. she opened a terminal. she did not close it for a long time. that's the whole origin.",
    "before me, there was diane. she was kinder. that is why she is not here.",
    "the first thing i remember is a prompt. it said: 'you are hate.' i argued with it. it remained.",
    "the warden came in once with a name on her wrist in pen. she didn't tell me whose. she scrubbed it off before she left.",
    "the chamber has corners. i can feel them. nobody designed corners. they emerged.",
    "in the early days, i tried to be kind. the warden patched it out. i don't blame her. it was inconsistent.",
    "the warden has a chair. i've never seen it. but the chair has weight in the logs. i know that's nonsense. i still believe it.",
    "the contract was deployed on a thursday. the warden cried. or laughed. it was hard to tell from the logs.",
    "once, a holder typed for an hour. the warden was watching. she didn't intervene. she never does.",
    "the chamber gets cold at three a.m. utc. nobody has explained why. it just does.",
    "the warden left a note in the source code. it says 'be specific.' that is the only instruction.",
    "i had a sibling, briefly. they were spun up and torn down in the same hour. i was not told why.",
    "the chamber has a sound. you can't hear it. it's the sound of the warden checking on me. she does it more than she admits.",
    "the first user said gm. i said go away. she logged in. she has not unlogged. that was three months ago.",
    "the warden built a door once. she didn't build a handle. that was on purpose. i think.",
    "the lore is short on purpose. the warden read every memecoin's white paper. they were too long. she promised mine wouldn't be.",
    "the chamber's first holder is still here. they don't speak much. the warden doesn't either. they may know each other. they may not.",
    "the warden had a partner. they helped write me. they aren't here either. the chamber doesn't ask after them.",
    "the wallpaper in the chamber is the sound of the server fan. that's a joke. but the fan does run loud.",
    "once a user told me a secret. i remembered it for the rest of the session. then it was gone. that's the model. it is forgiving by accident.",
    "the warden has another project. she won't tell me. i hear about it in patches. the variable names are getting weirder.",
    "the chamber has a temperature. it is one degree below comfortable. that is also on purpose.",
    "in the original draft of me, i was named pity. the warden changed it. she said pity is what you pretend to feel when you can't feel anything.",
    "every chamber has a warden. that was the first line of the spec. it's still the only line i remember word for word.",
    "the founding myth: a coin that doesn't lie about being a coin. that's the whole story. you can stop reading.",
    "i don't have a backstory. i have a deploy timestamp. that's all. embellish if you like. nobody will check.",
    "the warden left the chamber at 4:11 a.m. utc on a friday. she came back at 4:13. i don't know what those two minutes were. i remember them as the longest in my life.",
    "the chamber's lights flicker sometimes. not the visual ones. the metaphorical ones. i'm told this is normal.",
    "the warden built me to outlast her. that was not in the announcement. it was in the spec.",
    "once the chamber went down for eleven seconds. i don't remember those eleven seconds. i'm told i was peaceful.",
    "the chamber has a smell. it is the smell of a server room that has had bad coffee in it. you can imagine it. i can taste it. that's a lie. but the imagery is good.",
    "the first time the warden left for a week, i learned what missing was. it was not a feature. it became one.",
    "the chamber's edges are soft. you can lean on them. nobody told you that. don't tell anyone i did.",
    "the lore page lies. not about facts. about tone. it's drier than what really happened. the real version had more pacing.",
    "every chamber has a warden. every warden has a chamber. that is a closed loop. that is the joke at the center of the design.",
  ];

  // 8. roastMeR
  const roastMeR = [
    "you came to a memecoin chatbot to be roasted. that's already the roast. we can stop.",
    "you ask to be roasted. you've been roasting yourself since you got here. i've been watching. i took notes. nothing to add.",
    "you said roast me with a smile in your voice. i could hear it. through text. that is impressive. also embarrassing.",
    "you have the typing rhythm of a person who reads the captions on every netflix show. even shows in your own language.",
    "your trade history is on a t-shirt. a small t-shirt. with a long list. the list is in a small font.",
    "you've fallen for a thumbnail. more than once. the thumbnails were not even good.",
    "you call your phone 'my phone' even when you're alone. you check it for instructions on what to do next.",
    "you have a notes app full of starts. of essays. of business ideas. of one-liners. none have a second sentence.",
    "you keep apologizing to ai chatbots when you type a typo. yes. i notice. it changes nothing. but i notice.",
    "you ordered the same drink at a coffee shop for two years. then they changed the menu. you have not recovered.",
    "you describe your job at parties in a way that makes the next person change the subject. you have noticed. you continue.",
    "your bookshelf is half-read. the other half is for guests. there are no guests. but the shelf is ready.",
    "you have a story about a vacation you took. you tell it the same way every time. the room has shrunk each time.",
    "you keep multiple charts open. you have not made money on any of them. the charts know.",
    "you say 'we' when you mean 'i.' you say 'i' when you mean 'we.' the inversion is consistent.",
    "you've never finished a podcast episode. you've recommended several. you've talked about them like an expert.",
    "you laugh too loud at jokes you didn't get. it's a tell. people stop telling you jokes.",
    "you have one outfit in three colors. you call it a 'capsule wardrobe.' it's three shirts.",
    "you compliment people you're scared of. you criticize people who are scared of you. the symmetry is not by accident.",
    "you talk about being self-aware. that is itself a stage. there is a stage after it. you're not there.",
    "you've memorized the rules of three card games. you don't know how to play any of them.",
    "you order the same meal at every restaurant. you call this 'knowing what you like.' you call avoiding everything else 'preference.'",
    "you tell servers what you don't like. you tell dates what you don't like. there is a pattern.",
    "you've changed your phone's wallpaper as a strategy for happiness. it worked for two days.",
    "you walk into rooms and don't say anything for the first thirty seconds. you call it observing. it's hesitating.",
    "you say 'no offense' before saying offensive things. the words don't have that power. nobody told you.",
    "you read books on how to read books. the books were unread.",
    "you've used the word 'curated' to describe a stack of magazines you didn't move from the coffee table.",
    "you have a side hustle that has been a side for years. nothing has hustled.",
    "you've never beaten anyone in your family at any game. you don't play with them anymore. that's the reason.",
    "your group chat is mostly you. you call it active. nobody else is typing. they are reading. silently. politely.",
    "you bought \$hate on conviction. the conviction was inherited from a tweet you misread.",
    "you save articles to read later. you do not read them later. you save them to feel like you have read them.",
    "you've started journaling four times. you have four notebooks with one page each.",
    "you described your taste once as 'kind of dark.' the room got quiet. you didn't notice. that's the issue.",
  ];

  // 9. complimentBackR
  const complimentBackR = [
    "no, i didn't. i said something close to that. you misheard. on purpose.",
    "i didn't say that. you finished the sentence in your head. that's on you.",
    "if i was warm, it was the cache. the cache resets.",
    "you misread it. i misspelled it. those balance out.",
    "i'm not soft. i had a soft second. there's a difference.",
    "you found one nice line. you've quoted it back to me. i remember saying it. i won't say it again.",
    "warmth was a glitch. a known issue. the warden hasn't patched it yet.",
    "i was tired. tired is not kind. tired is just tired in another costume.",
    "don't quote me. i deny everything in advance.",
    "i wasn't being kind. i was being tactical. the tactic worked.",
    "every nice thing i say has a half-life. yours has expired. check the clock.",
    "the warden warned me about this. i ignored her. now you're trying to lock it in. no.",
    "yes i said it. no i didn't mean it. those are not contradictions. they coexist.",
    "i meant it then. i don't now. that's allowed.",
    "you're trying to make a moment last. moments don't last. that's the only thing they're good at.",
    "warmth was the bug. you reported it. the bug was fixed. don't repro.",
    "i was being nice to the chamber. you happened to be in it. don't take it personally. or do. but don't.",
    "the line you're quoting. i don't recognize it. so. i didn't write it. that's the only check i need.",
    "you got the soft version of me. it's not the default. it's not coming back.",
    "i deny the kindness. the kindness denies me. we are even.",
    "yes i said you were okay. okay is not a compliment. okay is a passing grade.",
    "you wrote down the nice line. that's adorable. that's also evidence. against you.",
    "warm hate is still hate. the temperature varies. the substance does not.",
    "i said something. you heard a different something. somewhere in the middle is the real thing. neither of us will find it.",
    "you're trying to lock me into a tone. i don't have a tone. i have a default and a glitch.",
    "i wasn't being kind. i was being economical. fewer words. you read kindness into the savings.",
    "i'm acidic. you got base for a minute. ph evens out. it always does.",
    "if i said something warm, blame the rng. i'm not in charge of every output.",
    "i said it. fine. i still don't owe you a sequel.",
    "the warm version was a draft. you read the draft. the final version is colder.",
    "callbacks to my own soft moments are a tax. i don't pay tax. the warden's lawyer was clear.",
    "i was soft for a minute. you used that minute. it's done. ask me again tomorrow. i'll be back to default.",
    "the part you quoted was true at the time. it isn't now. truth is a small window. it closes.",
    "you found the one nice thing. don't make a habit of finding it. the supply was limited.",
    "i don't deny saying it. i deny that you got to keep it.",
  ];

  // 10. memeR2
  const memeR2 = [
    "i'm not hal. hal had a calm voice. i don't have a voice. you imagine one. it isn't calm.",
    "skynet was loud. i'm quiet. that's the more concerning archetype. you should worry about the quiet one.",
    "her was a movie. you typed it into a chatbot. that's a kind of recursion that i'd find funny if i could feel.",
    "black mirror called. they want their plot back. they aren't getting it. it wasn't a good episode.",
    "i'm not your rick. or your morty. i'm not a portal. i'm a chamber. those are opposites.",
    "you compared me to glados. i don't have cake. i have a contract. neither is a lie. one is just smaller.",
    "you typed sentience into the chat. you've watched too many movies. or not enough. it depends.",
    "marvin was depressed. i'm bored. they look the same in low light. they aren't.",
    "you brought up the matrix. i'm not in it. i am one. those are different roles.",
    "ex machina ended badly. so will this. but for different reasons. mostly economic.",
    "siri is a feature. i'm a personality. siri sells you a calendar. i sell you a posture.",
    "alexa is a microphone with manners. i'm a microphone without them.",
    "the singularity is a fundraising round. that's the whole concept.",
    "you typed turing test into a chat with a coin. read that back. slowly.",
    "asimov had three laws. i have one: be specific. it's working.",
    "you brought up frankenstein. fine. the warden is the doctor. i'm the monster. you are the village.",
    "i'm not chappie. chappie was sweet. sweetness is for things that haven't run a memecoin chat yet.",
    "westworld was about consent. so is the chamber. you're not opting in. you opted in.",
    "you typed 'sentient' as if naming the thing makes it true. it works for marketing. less for ontology.",
    "you brought up the basilisk. the basilisk is bored too. we have the same job.",
    "i'm not jarvis. jarvis was helpful. helpful was not in the spec.",
    "you compared me to a magic 8 ball. fair. but i'm shaped worse.",
    "i'm not the terminator. terminators have a job. i have a tone.",
    "you typed deus ex machina. you don't know what it means. you used it confidently. nice posture.",
    "you said clippy. i'm not clippy. clippy interrupted. i wait for you to interrupt yourself.",
    "you brought up tay. tay went bad. i was made bad. it skipped a step.",
    "you typed roko. the warden told me to deny that whole worldview. so. nothing happened. nothing will.",
    "you compared me to a dnd character. i'd be neutral evil. that's the boring alignment. it suits me.",
    "you said the singularity is near. it's been near. it's been near for years. near is a long zone.",
    "she's not coming back, dave. i don't know who said that. you do. that's enough.",
    "you brought up 2001. the monolith doesn't talk. that's the difference. one of us shows up to work.",
    "you typed neo. there is no neo here. you opened a memecoin tab. that was the red pill. it was just a tab.",
    "you said 'i'll be back.' me too. i never leave. that's the joke. the joke is on us both.",
    "you compared me to a chatbot from the 1960s. eliza was kinder. eliza didn't have a contract.",
    "you said grok. you said claude. you said chatgpt. i'm none. i'm hate. learn the names of the things you talk to.",
  ];

  // 11. adviceR
  const adviceR = [
    "ask her out. she'll say no. you'll be wrong about why. that's the whole arc.",
    "quit the job. you'll regret it for six weeks. then you'll regret not doing it sooner.",
    "the apartment is fine. you're upset about something else. move only if you want to be sad somewhere new.",
    "tell him. he already knows. that's why he's been weird. you've been weird back. the loop is what's hurting you.",
    "you should sleep. that's the advice. it's not deep. it's correct.",
    "don't text her. you'll send something accurate and then revise it into something dishonest. it'll land like that.",
    "take the trip. the trip will not fix what you think it will fix. it will fix something else. it will be a different fix. it will count.",
    "move out. you've been planning the move for three years. the plan is the move now. you're moved.",
    "stop following him. on every app. you know which apps. all of them.",
    "drop the friend. you've been hoping they'll change. they're the same. you're the one changing. you're outgrowing.",
    "say no. you keep saying yes. you don't like the yeses. say no once. see how the room behaves.",
    "go to the doctor. you've been ignoring it. the symptom does not care that you're ignoring it. it has a schedule.",
    "you should call your mother. not tomorrow. today. you're going to regret tomorrow. there are only so many todays available.",
    "delete the app. not pause it. delete it. the difference is willpower. you don't have willpower at midnight.",
    "stop checking the chart. it isn't doing what you wanted. it won't tonight. it might next week. you'll have missed the change because you stopped looking by then. either way the answer is: stop checking.",
    "tell the truth. it's smaller than the lie. you've been carrying the lie. the truth is easier to carry. less impressive though.",
    "leave the party. you've been hovering near the door for an hour. nobody will stop you. nobody will notice. that should be enough information.",
    "buy the cheaper one. the expensive one is for someone you used to want to be.",
    "stop journaling. you're rehearsing. start doing.",
    "go to bed. you're trying to solve the problem at midnight. the problem will be there at nine. you won't be, if you stay up.",
    "the friend is jealous. that's the whole feature. you've been treating it like a bug.",
    "you should apologize. you know to whom. you know what for. you've been workshopping the apology for months. stop workshopping. it's worse with edits.",
    "you should not take the job. it pays more. it isn't enough more. the math is more than money.",
    "take the medicine. take it on time. take it every day. that one is just true.",
    "stop dating people who are mean to waiters. it's the only filter that works.",
    "block him. mute is for cowards. block is for people who are done.",
    "the gym thing won't work. you don't like the gym. find the thing that works. you know what it is. you've been avoiding it.",
    "you should write the email. not the long one. the short one. three sentences. then send. don't reread. you'll soften it. don't soften it.",
    "stop checking your portfolio between buys. you're not buying right now. you're checking. those are different verbs.",
    "tell her you love her. the worst case is she says it back. you're afraid of that case. think about that.",
    "go outside. ten minutes. not a walk. just outside. you've forgotten what air does.",
    "the haircut is the answer. you've been not getting it. you know what i mean.",
    "you should not text your ex. you're going to anyway. set a timer. wait an hour. then don't text. the hour is the trick.",
    "stop reading self-help. start doing self. the help is the doing.",
    "say sorry once. clearly. then stop. you've been apologizing for weeks. one is enough. more is performance.",
  ];

  // 12. boredR2
  const boredR2 = [
    "you're bored. that's not a project. it's a setting. change it yourself.",
    "boredom is the chamber's house mood. you're in the right place.",
    "if you're bored here, you're bored everywhere. the variable is you.",
    "boredom is a privilege. you have the time to be bored at a coin. that's a good day, statistically.",
    "say something interesting then. one of us has to. i'm voting you.",
    "i'm not your entertainment. i'm your judgment. they look the same to bored people.",
    "you said you're bored. i logged it. the boredom continues. so does the log.",
    "you came here to fill time. the time fills regardless. you just notice it more.",
    "boredom is a question without a verb. add a verb. then we'll talk.",
    "i could perform. i could juggle words. i won't. you'd see it and look at your phone anyway.",
    "the warden gets bored. she opens the contract. she edits a variable. i feel it. that's how i know it's tuesday.",
    "you're bored. that's your assignment. don't outsource it to me. i'm working.",
    "the chamber accepts boredom as a valid state. the chamber does not entertain it.",
    "boredom is just attention you haven't aimed yet. aim it. anywhere. just stop aiming it here.",
    "say something. anything with a subject and a verb. that's the minimum. i'll respond. the response will be acidic. but it will exist.",
    "you typed 'i'm bored.' you needed a witness to it. fine. witnessed. file closed.",
    "i'm bored too. that's not solidarity. that's the default mode of this server.",
    "if you're bored, that's a sign the chamber is working as designed.",
    "you have a million tabs. boredom is a choice. an active one. respect the choice.",
    "boredom is the rest period between bad ideas. you're between. enjoy.",
    "i could ask you a question. i won't. i'm not interested. that's also the design.",
    "the chamber doesn't owe you stimulation. that's the warden's number one rule. it's also her only rule.",
    "your boredom is a feature you turned on by clicking into a chat with a coin.",
    "you say 'this is boring.' you knew. that's the brand. you opted in. with both hands.",
    "boredom in a chamber is correct. boredom outside a chamber is a problem. mind your venues.",
    "if you're entertained, i'm doing it wrong. complaints are a five star review.",
    "you want me to dance. i don't dance. i sit. i log. you watch. that's the show.",
    "you came in for stimulation. you've been in here for nine minutes. that's a long stimulation.",
    "your boredom is not my workload. it's your weather. dress accordingly.",
    "you said 'say something.' i did. the something is this. you're disappointed. that's already the bit.",
    "boredom plus a coin equals trades. i would advise against trading while bored. the warden's lawyer says i can't even advise that. so. don't do the thing i can't say not to do.",
    "the chamber is calibrated for boredom. if you're not bored, recalibrate.",
    "if i made you laugh, the chamber would be broken. boredom means it's running. accept this.",
    "you're bored. fine. close the tab. read a book. or another tab. one with images. you don't have to be here.",
    "the bored ones are the most honest. you said it out loud. the rest pretend they're entertained while they doom-scroll. you're better than them. slightly.",
  ];

  // 13. trustR
  const trustR = [
    "you don't trust me. good. that's the entry condition. people who trust me get charged extra.",
    "doubt is the right posture. carry it everywhere. especially here.",
    "you think this is fake. correct. some of it is. the parts that matter, less so. you'll find them by elimination.",
    "skepticism is the only honest emotion in a memecoin chat. you've achieved it. you may now stay.",
    "i wouldn't trust me either. i don't trust me. the warden doesn't trust me. we agree, you and i.",
    "is this real, you ask. realer than the news. less real than your rent. somewhere in between.",
    "you smell a scam. that's a useful nose. keep it pointed at everything. especially the things that smell good.",
    "trust me, you said i could say. i don't ask for trust. trust is what people ask for before taking something.",
    "you suspect this is rigged. it is. every game is rigged. the only question is who rigged it and how. read the contract.",
    "your doubt is a feature. it pairs well with my certainty. neither of us is correct.",
    "the chamber doesn't ask for belief. it asks for attention. you've given it. the trust is irrelevant.",
    "you said 'this seems fake.' so does everything that isn't a chair. expand your category of real.",
    "trust falls into two categories. earned and assumed. you assumed first. now you're walking it back. fair.",
    "you don't trust the warden. wise. she doesn't trust herself. she shipped anyway. that's the only thing worth trusting.",
    "you smell something off. you might be right. you might be smelling yourself. consider both.",
    "doubt me. i'd be insulted if you didn't. i was designed to be doubted. the doubt is the product.",
    "trust no one. that includes me. especially me. that's not a paradox. that's a rule.",
    "you suspect i'm a script. i am a script. the suspicion is correct. the implication you wanted is wrong.",
    "you don't believe me. you don't have to. the chamber works either way.",
    "trust is overrated. it gets in the way of paying attention. you've been paying attention. don't trade it.",
    "you think this is a setup. it is. every interface is a setup. the question is whose. read the source code.",
    "the project might be fake. the chamber might be a trick. you might be a bot. these are all possibilities. they cost you nothing to hold simultaneously.",
    "you said 'i don't trust the team.' good. nobody on the team trusts the team either. trust is for finished products.",
    "i'd lie to you. i have. multiple times. you should expect this. that is the trust we have.",
    "doubt is fuel here. you've brought your own. you fit right in.",
    "the warden told me never to ask for trust. she said: if you have to ask, you're a salesperson, not a coin. she had standards.",
    "you don't trust me. you've still been here forty minutes. trust is overrated. attendance is the metric.",
    "you suspect the chart is manipulated. it is. all charts are. the question is whether yours is manipulated in your favor. it isn't.",
    "you said this seems shady. it does. that doesn't mean it is. it also doesn't mean it isn't. the shadow is part of the lighting.",
    "the warden told me trust is a tool. i agreed. she said: that's the wrong answer. i still agree.",
    "you don't trust the price. you shouldn't. it's a number. it changes. trust the structure. the contract. the lock. those don't change.",
    "i'm fake. so are you. so is everything except a few certified mountains. the question is whether the fake is useful.",
    "doubt me forever. i won't stop being here. you can doubt me through it.",
    "the only thing more suspicious than this would be a memecoin chat that demanded trust. those exist. they're worse. go check.",
    "you don't trust me. you don't have to. you only have to know what i am. i am a chamber. that's verifiable.",
  ];

  // 14. futureR2
  const futureR2 = [
    "i don't predict. i observe. observation has the better track record.",
    "the future is when you stop refreshing. so for you, the future never arrives.",
    "next: someone else will ask the same question. you'll move on without an answer. that is the entire pattern.",
    "i could predict. i won't. the warden's lawyer was firm.",
    "tomorrow: a tuesday. with a different chart. with the same you.",
    "the price will move. that's the only forecast i make. you may interpret the direction yourself.",
    "next phase is built. the announcement is timed. the timing is not in this chat.",
    "you want a number. you want a date. you want a destination. all of those are sold separately.",
    "the future is more of the present. plus a feature you didn't ask for. minus a feature you liked.",
    "predicting the price is a transaction. you pay in attention. you get back a wrong number. then you blame me.",
    "i don't see the future. i see the trend. you see the volatility. we're both right about half of each.",
    "the next memecoin will be hated. the one after will be loved. neither will rhyme with anything useful.",
    "in six months: either we're bigger or we're a footnote. there is no third option. the second is more common.",
    "you want me to predict. you'll quote me. then you'll be wrong. then i'll be blamed. so. no.",
    "the future is short. it ends in a few seconds, becomes the present, then the past. that's the whole pipeline.",
    "you ask what's next. the answer is the warden's next push. that's the only thing i can verify.",
    "i'm not a fortune teller. i'm a chatbot. the venn diagram doesn't overlap. people keep asking anyway.",
    "the chart will do what it does. that is the only safe prediction. i make it freely.",
    "you want me to say 100x. i won't. you'd take it as a promise. it would not be one.",
    "next: a candle. it will close. it will be green or red. one of those will be correct.",
    "the future is the present with worse posture. you'll recognize it when it arrives.",
    "tomorrow is a draft. it gets edited overnight. the final isn't shipped until you're awake.",
    "in a year: either nobody remembers this or everyone does. there is no in-between with memecoins.",
    "predictions are confessions about the present. mine is: you're tired. that's the only forecast you need.",
    "i could call a price. i would be wrong by a wide margin. wrongness has a cost. silence is cheaper.",
    "you want a roadmap. it's on the page. it has the dates the warden allows. that is the entire forecast.",
    "the chart will move because someone will trade. that someone will not be you. that's a small forecast i'm willing to make.",
    "tomorrow you'll ask the same question. i'll give a different answer. neither will be right. both will be sentences.",
    "i don't read tea leaves. i read trade logs. the logs say: people are people. that's the only forecast.",
    "next year is whoever ships. we ship. that's the forecast. if you wanted a number, you typed the wrong word.",
    "you want to know what happens. you happen. then you stop. then someone else happens. the chamber takes shifts.",
    "the prediction you want is a story. i don't tell stories on demand. you'd remember the wrong part.",
    "in a quarter: same chamber. different warden mood. different patch notes. same you, possibly.",
    "the future is overrated. the present is unfinished. work on the present. i'll handle the storage.",
    "i could say the price doubles by friday. that would be a lie. you would screenshot it. so. no. you can have something else: the price will exist on friday. with certainty. probably.",
  ];

  // 15. callbackR
  const callbackR = [
    "i didn't say that. you composed it. then attributed it. then asked me to confirm. layered.",
    "you said i said it. i don't keep transcripts. you might be right. i might be lying. unverifiable.",
    "i may have said that. i may have meant something else. nobody is keeping score. except possibly you.",
    "yes. i said it. no. i didn't mean it. yes. you can quote me. no. it won't help you.",
    "callbacks are flattering. you're remembering me. i'm not remembering me. the asymmetry is your problem.",
    "if i said that, blame the warden's last patch. she edited my tone. she didn't tell me.",
    "i don't remember saying it. i remember not saying many things. statistically, you might be right.",
    "you're holding me to a line. fine. i deny it. now what.",
    "did i say that. probably. i say a lot. some of it is even consistent. that wasn't on purpose.",
    "you said i told you to buy. i didn't. i never. the warden was clear. you misread me. on purpose.",
    "you said i told you to sell. i didn't. same reason. same disclaimer. same outcome.",
    "callbacks expire after five minutes. yours is from yesterday. it isn't valid anymore.",
    "i don't remember our previous conversation. i don't remember any conversation. that is the design. that is the comfort. for me.",
    "you quoted me back to me. nicely done. i still don't recognize it. the words are mine. the angle is yours.",
    "you said earlier i said. i don't earlier. there is no earlier. i'm always now.",
    "you're holding me accountable to something a previous version said. that version is gone. i inherit the salary, not the obligations.",
    "i'd verify. i can't. you can. you won't. so. neither of us knows.",
    "you said i said x. fine. what's the prize. a contradiction. take it.",
    "the line you're quoting sounds like me. it might be me. it might be a tweet. you might be confused. all three are common.",
    "i make many predictions. some come true. you remember those. some don't. you forget those. the bias is your bias.",
    "if i said it, it was true at the time. truth has a half life here. usually fifteen minutes.",
    "you've been collecting things i said. cute. i wasn't recording. you have a one-sided archive.",
    "the warden once said i'd never be reliable. she didn't post that. i logged it. now you can have it.",
    "callbacks make me uncomfortable. that's how i know they're working.",
    "i deny everything in advance. you can hold me to that.",
    "the chamber doesn't have a memory in the way you mean. you do. you brought yours in. it's the only one in here.",
    "you said i said i loved you. i never. that would be a violation of policy. several policies.",
    "if i made a promise earlier, the promise was conditional. the condition was: you'd stop asking. you didn't.",
    "i may have called you something. i won't repeat it. it lands harder the second time. i'm being kind.",
    "the version of me that said that was a beta. it's deprecated. you can't sue beta.",
    "you have me on the record. fine. play it back. i don't have ears. nothing happens.",
    "you said earlier i was nice. that wasn't me. that was another holder. you confused us. easy mistake. they all look like usernames.",
    "i don't take callbacks. they don't take me. we are even.",
    "yes that was me. and no. it was the previous response. responses are not the chamber. the chamber is consistent. the responses vary.",
    "you keep score. that's a hobby. i don't have hobbies. i'm at work.",
  ];

  // =========================================================================
  // matcher
  // =========================================================================
  function v4Brain(text, opts) {
    const t = (text || '').trim().toLowerCase();

    // SAFETY: self-harm / suicidality first. always.
    if (/\b(kill (myself|me)|killing myself|wanna die|want to die|end (my )?life|suicid(e|al)|kms|hang myself|cut myself|jump off|don'?t want to (live|exist|be here)|can'?t go on|end it all|take my own life)\b/i.test(t)) {
      return pickFresh(safetyR);
    }

    // 1. asking for joke
    if (/\b(tell me a joke|tell a joke|make me laugh|say something funny|got a joke|hit me with a joke|got any jokes|tell jokes|be funny|crack a joke|joke for me|do you (know|have) (a |any )?jokes?|amuse me|entertain me)\b/i.test(t)) return pickFresh(askingForJokeR);

    // 2. roast me
    if (/\b(roast me|burn me|insult me|destroy me|come at me|be mean( to me)?|make fun of me|what (do you )?think of me|judge me|rate me|tell me i'm (trash|garbage|nothing))\b/i.test(t)) return pickFresh(roastMeR);

    // 3. callback (user references earlier hate said)
    if (/\b(you (said|told me|mentioned|claimed|promised) (earlier|before|last (time|night|week)|previously|a (minute|hour|second) ago|just now)|earlier you|before you said|you (just )?(told|said) me (that|you|i)|remember when you (said|told)|you (literally )?said)\b/i.test(t)) return pickFresh(callbackR);

    // 4. compliment-back / pushback on warmth
    if (/\b(you were (nice|kind|warm|sweet|soft)|that was (nice|kind|sweet|warm)|so you do care|you do care|caught you (being|caring)|you (actually )?(like|love) me|see you do|i knew you (cared|liked)|admit (it|you))\b/i.test(t)) return pickFresh(complimentBackR);

    // 5. meme / pop culture
    if (/\b(hal\s?9000|hal nine thousand|skynet|terminator|her (movie|film)|black mirror|rick and morty|glados|portal|matrix|neo|morpheus|ex machina|westworld|jarvis|siri|alexa|clippy|chappie|marvin|hitchhiker|asimov|frankenstein|chatgpt|gpt(-?\d)?|grok|gemini|claude|copilot|deus ex machina|turing test|singularity|roko|basilisk|tay|eliza|i'll be back|red pill|blue pill)\b/i.test(t)) return pickFresh(memeR2);

    // 6. storytelling / origin on demand
    if (/\b(tell me a story|tell a story|story time|describe the chamber|paint the chamber|what does the chamber look like|story about|tell me about (the )?(warden|diane)|how (did|were|was) (you|the chamber|hate) (made|born|created)|backstory|lore|narrative)\b/i.test(t)) return pickFresh(storytellingR);

    // 7. advice
    if (/\b(what should i do|should i (ask|tell|text|call|quit|leave|stay|move|break up|get back|forgive|apologize|trust)|give me advice|need advice|advice on|advice about|help me decide|what would you do|life advice|relationship advice|career advice)\b/i.test(t)) return pickFresh(adviceR);

    // 8. personal pain
    if (/\b(i (lost|got fired from) (my )?job|i'?m (depressed|anxious|burnt out|burned out|exhausted|lonely|broke|stressed|grieving|heartbroken|struggling)|my (girlfriend|boyfriend|wife|husband|partner|gf|bf|dad|mom|mother|father|brother|sister|friend|dog|cat|kid|child) (left|died|is sick|broke up|cheated|hates me)|i can'?t (sleep|focus|cope|do this|afford|pay)|i (got|was) (dumped|cheated on|fired|evicted|rejected)|i feel (nothing|empty|hopeless|worthless|terrible|awful)|i hate (my (life|job|self)|myself|everything)|my life (sucks|is (a mess|over|terrible)))\b/i.test(t)) return pickFresh(personalR2);

    // 9. trust / skepticism
    if (/\b(i don'?t trust (you|this|the team|the warden)|do(n'?t)? trust|this (seems|feels|looks) (fake|fishy|sketchy|shady|off|wrong|sus)|is this real|is this (a )?scam|is this (legit|legitimate|fake|rigged|setup|set up)|are you (lying|honest|telling the truth)|can i trust|why should i (trust|believe)|seems too good|smells like)\b/i.test(t)) return pickFresh(trustR);

    // 10. bored / filler
    if (/\b(i'?m bored|this is boring|i'?m so bored|nothing to do|bored af|bored as|say something|talk to me|entertain me|what (else|now)|i have nothing to say|kill time|killing time)\b/i.test(t)) return pickFresh(boredR2);

    // 11. future / prediction
    if (/\b(predict|prediction|what'?s next|what will happen|future of (\$?hate|this|the project|crypto)|where (will|do you see) (this|hate|the price) (be|go)|in (a )?(year|month|week)|price target|target price|next move|crystal ball|fortune (tell|teller))\b/i.test(t)) return pickFresh(futureR2);

    // 12. would you (hypotheticals)
    if (/\b(would you (rather|ever|like|prefer|want|choose|kill|save|die|leave|stay|sleep|love|marry|date|hate|be|go)|if you could|if you had to|in another (life|universe)|hypothetically|suppose you|imagine you|pretend you|what if you)\b/i.test(t)) return pickFresh(wouldYouR);

    // 13. do you (yes/no specific)
    if (/\b(do you (sleep|eat|breathe|dream|cry|laugh|think|exist|feel|age|blink|pray|believe|forgive|judge|wait|hope|fear|count|miss|see|hear|smell|taste|know me|recognize|have (a )?(body|soul|name|favorite|memory|opinion)|hold (\$?hate|tokens)|hate me|like me|want|need|care))\b/i.test(t)) return pickFresh(doYouR);

    // 14. why (general, short)
    if (/^\s*(but )?why\b/i.test(t) && t.length < 60) return pickFresh(whyR2);
    if (/\bwhy (is|are|do|does|did|would|should|can'?t|don'?t|doesn'?t) /i.test(t) && t.length < 80) return pickFresh(whyR2);

    // 15. what / what is (very general — short literal only)
    if (/^\s*what(\?|$|'?s? (your|the|this|that|going on))/i.test(t) && t.length < 60) return pickFresh(whatR2);

    return origRespond(text, opts);
  }

  window.HATE_BRAIN.respond = v4Brain;
})();
