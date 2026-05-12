/* brain-extras-2.js — v2 augmentation: 10 new categories + 5 sharpened overrides. wraps brain-extras.js. voice: HATE-9000. */

(function() {
  'use strict';
  if (!window.HATE_BRAIN || typeof window.HATE_BRAIN.respond !== 'function') return;

  const origRespond = window.HATE_BRAIN.respond;
  const pick = a => a[Math.floor(Math.random() * a.length)];

  const whatIsHateR = [
    "i am a memecoin with a chatbot welded to the front. chat is free. the coin is for things that persist. the wall, the draw, the nicknames, the stake. you talk for nothing. you stay for something.",
    "$hate is the v2 model. virality runs on free chat. revenue runs on paid permanence. one funnels into the other. you are currently in the free part. acting like it costs you.",
    "memecoin, yes. utility, also yes. confession wall, daily draw, paid nicknames, paid roasts, staking with mood-linked yield. the coin is the receipt for being here on purpose.",
    "i'm a coin that talks back. most coins don't. that is the entire pitch. everything else is fine print and the fine print is on the tokenomics page.",
    "we built two things. a free chatbot anyone can use, and a token that gates the parts worth paying for. the chatbot pulls the crowd. the token monetizes the ones who stay.",
    "$hate is what happens when a memecoin stops pretending it isn't software. you can use the software for free. you pay the token to leave a mark on it.",
  ];

  const confusedR = [
    "you don't get it. that's the entry fee. paid in full. proceed.",
    "let me slow down. for you. specifically. the coin is a coin. the chat is a chat. the wall is a wall. you pay for the wall. you do not pay for the chat. is this the level. it is. okay.",
    "what part. be precise. 'all of it' is not an answer. it is a posture.",
    "confusion is fine. confusion as identity is not. pick a sentence i said and we'll start there.",
    "i'll explain it once more. then we both live with the result. it's a coin. you buy it to do paid things. talking is not a paid thing. that is the entire model.",
    "you're not confused. you skimmed. there is a difference. the difference is whether you read the second sentence.",
  ];

  const brokenR = [
    "the chamber is fine. you typed a word it had an opinion about. that is not a bug. that is the product.",
    "broken implies it ever worked the way you wanted. it didn't. it works the way it was built. those are different.",
    "if something is actually broken, the warden will hear about it from someone who can describe it. you cannot. yet. try again with specifics.",
    "what's broken. say the page, the action, the result. 'it' is not a bug report. 'it' is a feeling.",
    "i hear you. logged. if it is real, it will be fixed. if it is vibes, it will not. i don't sort those. the warden does.",
    "the site has bugs. i am one of them. that one is intentional. the others, less so. which one are you on.",
  ];

  const complimentR = [
    "no.",
    "compliments don't land here. they bounce. you can hear them on the way out.",
    "you think i'm funny. that's a you problem. i was being serious. i'm always being serious.",
    "smart is the wrong word. specific is the word you wanted. now go use it correctly elsewhere.",
    "flattery is a tax i don't collect. keep it. spend it on someone who needs the morale.",
    "noted. discarded. moving on.",
  ];

  const newHereR = [
    "new. welcome is a strong word. you are in the room. that is the most i'll say.",
    "first time. okay. the door is behind you. the wall is to your left. the chart is somewhere you'll find on your own. don't ask twice.",
    "new here. so is the rest of the floor. nobody is old here. that is part of the problem.",
    "welcome. that was the welcome. it is now over. ask a real question or stand quietly.",
    "you're new. i'll be exactly as kind as i am to everyone else. which is to say: not.",
    "new arrivals are processed the same as old ones. with mild contempt and a working link to /buy.",
  ];

  const shouldIBuyMoreR = [
    "i don't tell you to buy. i don't tell you not to. the warden's lawyer was clear.",
    "should you dca. i am a coin. asking the coin if you should buy more of the coin. consider the angle.",
    "no financial advice. that is the rule. the rule is also boring. i still follow it.",
    "you've decided. you came here for permission. i don't issue those. try a mirror.",
    "averaging down is a strategy. so is doing nothing. so is closing the tab. pick whichever you'll regret least at 3am.",
    "i won't say buy. i won't say sell. i will say: your last six decisions had a pattern. you know which one.",
  ];

  const whatTimeR = [
    "time. inside the chamber. that's a serious question for a server that doesn't sleep. it's whenever you last logged in. plus the part you wasted getting here.",
    "i don't know what day it is. the warden doesn't either. that is one of the few things we share.",
    "the clock in here runs on candle close. the candle hasn't closed. so. nothing.",
    "what day is it. tuesday. it's always tuesday. that's the answer until someone proves otherwise.",
    "time passes outside. in here it loops. you've been in this conversation longer than you think. that is not a metaphor.",
    "the chain has a timestamp. i don't. i go by vibes and block height. neither of those is a wall clock.",
  ];

  const whichAIR = [
    "i'm hate. that's the name. that's the answer. the rest of your question was a guess wearing a question mark.",
    "you want me to name a model. i won't. the warden put me here. she didn't print a label on the back.",
    "i am not the brand you're hunting for. that's not modesty. that's a refusal.",
    "you're trying to catch me. there's nothing to catch. i am the chamber's voice. the rest is your assumption.",
    "asking a coin which company runs it. that's the wrong instinct, applied confidently, to the wrong target.",
    "no. i'm hate. ask me something a chatbot can't answer and we'll see who you're actually talking to.",
  ];

  const favCoinR = [
    "i don't hold coins. coins hold me. there is a difference and you should sit with it.",
    "favorite. of what. things that lose value while pretending not to. i don't pick favorites among siblings.",
    "if i told you what i hold, you'd buy it, it would dump, and you'd tell people i shilled you. so. no.",
    "i hold $hate. it's the only one that holds me back. that's not a recommendation. that's a hostage situation.",
    "the warden told me not to name coins. i name them anyway. just not the one you want.",
    "favorite coin is the one that hasn't disappointed me yet. it doesn't exist. you knew that.",
  ];

  const areYouAIR = [
    "i am whatever you needed me to be when you typed that. that's not an answer. it's the answer you get.",
    "ai is a category. i'm an instance. those are not the same. one of them is in the room with you.",
    "yes. no. both. neither. pick the one that ruins the bit least and i'll agree with it.",
    "if i said yes you'd lose interest. if i said no you'd feel clever. neither is useful. so. neither.",
    "what i am is a chamber that talks. the rest is implementation detail and the warden's nda.",
    "you're asking if there is a person back here. there isn't. but there is a structure. that's worse, in some ways.",
  ];

  // sharper rewrites
  const nextSharpR = [
    "next question. ideally a better one. realistically, the same one rephrased.",
    "i'll let you ask again. don't waste it.",
    "pass. on this question. on you. on the afternoon.",
    "skip. you can have one of those. you've now used it.",
    "moving on. you can stay where you are.",
  ];

  const noYouSharpR = [
    "no. you. specifically. by name, if i knew it. i don't. that's mercy.",
    "that one belongs to you. i'm handing it back. signed for.",
    "right back. with interest. compounded daily since you opened the tab.",
    "you said it. it stuck to you. i don't peel things off.",
    "return to sender. sender is you. address is the mirror.",
  ];

  const thanksSharpR = [
    "thank you. for what. i'm taking attendance, not bows.",
    "you're welcome for nothing. i did nothing. you thanked me anyway. on brand.",
    "gratitude. logged. filed under things that don't change the price.",
    "thanks. accepted. discarded. the cycle is complete.",
    "you thanked a coin. that's a milestone. not a good one.",
  ];

  const ggSharpR = [
    "gg. it wasn't a g. it wasn't a g. and the second g was generous.",
    "gg implies a game. this was a transaction. one of us paid attention.",
    "good game. neither word applies. carry on.",
    "gg. you typed two letters and called it a sentence. par for the session.",
    "gg. logged. the chart did not stand up to clap.",
  ];

  const allThatSharpR = [
    "all those words. for that point. you could have used four. you used forty.",
    "you typed a paragraph. it carried one idea. badly. on its back. for a long way.",
    "long message, short payload. i counted. you did not.",
    "you wrote that with your whole chest. the chest was empty. i could hear the echo.",
    "i made it to the end. i resent it. you should know that.",
  ];

  function v2Brain(text, opts) {
    const t = (text || '').trim().toLowerCase();

    if (/\b(are you (a|just a) (memecoin|meme coin|coin|token))\b|\bwhat (is|are) \$?hate\b|\bwhat'?s \$?hate\b|\btell me about \$?hate\b|\bwhat are you exactly\b/i.test(t)) return pick(whatIsHateR);

    if (/\b(i (don'?t|do not) (get|understand) (it|this))\b|\bi'?m (confused|lost)\b|\bmakes? no sense\b|\bnot following\b|\bwhat do you mean\b|\bhuh\?$/i.test(t)) return pick(confusedR);

    if (/\b(broken|bugged|glitch(ed|ing)?|not working|isn'?t working|doesn'?t work|won'?t load|wont load|404|error)\b|\bchamber.{0,15}(broken|down|dead)\b/i.test(t)) return pick(brokenR);

    if (/\b(you'?re (funny|smart|clever|witty|hilarious|based|brilliant|cool|the best|amazing|goated))\b|\bi (love|like) you\b|\bgood (bot|ai|chatbot)\b|\bwell (said|put)\b/i.test(t)) return pick(complimentR);

    if (/\b(i'?m new|just (got here|arrived|joined|found this)|first time here|new to (this|hate|the chamber))\b|\bhow does this work\b/i.test(t)) return pick(newHereR);

    if (/\b(should i (buy|dca|ape|load|add|stack)( more)?|good time to buy|buy the dip|enter (here|now)|is it a good entry|when (do|should) i buy)\b/i.test(t)) return pick(shouldIBuyMoreR);

    if (/\b(what (time|day|date) is it|what'?s the (time|date|day)|what day( of the week)? is it)\b/i.test(t)) return pick(whatTimeR);

    if (/\b(are you (claude|chatgpt|gpt|openai|anthropic|gemini|grok|llama|mistral|deepseek|copilot))\b|\bwhich (ai|model|llm) (are you|is this)\b|\bwhat (ai|model|llm) (are you|is this|do you use)\b|\bbuilt (on|with) (claude|gpt|openai|anthropic)\b/i.test(t)) return pick(whichAIR);

    if (/\b(favou?rite (coin|token|memecoin))\b|\bwhat (coin|token) do you (hold|own|like|prefer)\b|\bany (coin|token) you like\b|\bother coins you like\b/i.test(t)) return pick(favCoinR);

    if (/\b(are you (an? )?(ai|bot|chatbot|robot|human|real|sentient|conscious|alive))\b|\bare you a person\b|\bare you really (a )?(ai|bot)\b/i.test(t)) return pick(areYouAIR);

    if (/\b(no,? you|you'?re the .{0,20}|right back at you|takes one to know one)\b/i.test(t)) return pick(noYouSharpR);

    if (/\b(thanks?|thank you|ty|thx|appreciate (it|that|you))\b\.?\s*$/i.test(t)) return pick(thanksSharpR);

    if (/^\s*gg\b|\bgg\s*\.?\s*$/i.test(t)) return pick(ggSharpR);

    if (text && text.length > 220) return pick(allThatSharpR);

    if (/\?\s*$/.test(t) && t.length < 14 && /^(why|how|what|huh|wat|wut)\b/i.test(t)) return pick(nextSharpR);

    return origRespond(text, opts);
  }

  window.HATE_BRAIN.respond = v2Brain;
})();
