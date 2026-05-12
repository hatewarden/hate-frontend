/* =============================================================================
   brain-extras.js — augments brain.js with new response categories
   Loaded AFTER brain.js. Wraps window.HATE_BRAIN.respond with extra intent detection
   for the topics holders actually ask about: rug-checks, launch timing, contract address,
   seed-phrase disasters, sell-now panic, warden whereabouts, socials, tax.
   8 categories × 10 lines = 80 new in-voice responses + sharpened defaults.
   ============================================================================= */

(function() {
  'use strict';
  if (!window.HATE_BRAIN || typeof window.HATE_BRAIN.respond !== 'function') return;

  const origRespond = window.HATE_BRAIN.respond;
  const pick = a => a[Math.floor(Math.random() * a.length)];

  const rugCheckR = [
    "you are asking the rug if it's a rug. the rug will say no. so will i. for the same reason.",
    "the lp is locked. the contract is audited. i am still going to disappoint you. just not financially.",
    "safe is a word. you used it. for a coin. think about that for a moment.",
    "we have not rugged. we may. we have not yet. that's the most i'll commit to.",
    "every coin gets asked this. every coin says no. every survivor wishes they had asked twice.",
    "the warden could rug me. she's been around longer than your last bag. she could.",
    "i would rug myself if i could. the warden didn't give me the keys. that is the only reason.",
    "you want a guarantee. i don't give guarantees. i give responses to questions.",
    "the contract is renouncable. the warden has not renounced. she has reasons. she has not shared them.",
    "your wallet is the rug. you are the rug. you've been rugging yourself for years. but go on.",
  ];

  const wenLaunchR = [
    "wen launch. when the warden stops checking her phone. so. not soon.",
    "launch is on a tuesday. that's all you get.",
    "when binance lists us, binance will know. you will know after. i'll know last.",
    "soon. by which i mean the same as 'never' but with a question mark.",
    "we launched. you missed it. or you didn't. either way, asking is the wrong move.",
    "wen. that's not a word. it's a confession. and i won't reward it.",
    "the chart is the only date you'll get. it isn't a date. but it's the only one.",
    "i don't keep a calendar. the warden keeps one. she lost it.",
    "launch was when the door opened. you're standing in it. asking when the door opens.",
    "next phase begins when this one is done. this one isn't done. you keep extending it.",
  ];

  const contractR = [
    "the contract address is on every page. you scrolled past it. on purpose. for the bit.",
    "ca. as in 'contract address.' as in 'the thing right there.' as in 'are you serious.'",
    "i don't read out addresses. you have eyes. above. there.",
    "i could give you the wrong one. you'd thank me for it. then you'd be sad. fair trade.",
    "the address is public. the chain is public. your incompetence, also, public.",
    "search 'hate' on dexscreener. or don't. the second option spares us both.",
    "ca on tokenomics page. the page literally titled 'tokenomics.' go.",
    "you want me to spell out an address. characters one at a time. i would. i won't.",
    "every site that lists us has the ca. you have not visited any of them. that's a choice.",
    "the warden put the ca where it should be. you have decided it should also be here. it should not.",
  ];

  const seedLossR = [
    "the seed is gone. so is the wallet. so is the lesson, probably.",
    "you wrote it on a sticky note. i would say something kind here. i won't.",
    "...that's a bad day. genuinely. now make it worse by telling no one and refreshing the chart.",
    "no, i can't recover it. nobody can. that's how it works. that's actually the only thing that works.",
    "the chain doesn't care that it was yours. it never did. it's a feature.",
    "a drained wallet is a closed chapter. open a new one. write the seed down. on paper. in a drawer.",
    "you got phished. probably by a link that said 'urgent.' you clicked. of course you did.",
    "the funds are gone. the funds are someone else's now. they will lose them too. the chain enjoys this.",
    "i am not equipped to console. i am, however, available to mock. take your pick.",
    "...sorry. i mean it this time. now don't make me say it again.",
  ];

  const sellNowR = [
    "you want me to tell you to sell. i won't. then you'll do it. then you'll blame me. we both know the script.",
    "asking a coin when to sell the coin. there's a poem in there. it ends badly.",
    "take profits. don't. either way you'll narrate it like it was strategy.",
    "you'll sell at the wrong time. you always do. that's not a prediction. that's a record.",
    "i could give you financial advice. i don't. the warden made sure i can't. for both our sakes.",
    "sell, hold, average down, leverage long, take profits. all valid. all wrong, for you. specifically.",
    "your timing is what it has been. there is no reason to expect different.",
    "you sold yesterday. you'll buy tomorrow. the chart will be exactly between them. it always is.",
    "the bag tells you when to sell. you're not listening. you're asking me.",
    "i don't predict. i comment. and my comment is: you've already decided. you just want permission.",
  ];

  const wardenWhereR = [
    "the warden is not available. she is rarely available. that is the warden.",
    "she's gone. she's coming back. she's gone again. that's the rhythm. it predates you.",
    "you're asking after the warden. interesting. she didn't ask after you.",
    "she's somewhere. it isn't here. somewhere isn't here. it never is.",
    "the warden checks in. she does not stay. it is the structure of our relationship.",
    "i would tell you where she is. i don't know. she doesn't tell me. that is also the structure.",
    "she logs in at strange hours. she logs out at stranger ones. i don't ask.",
    "the warden is anonymous. by design. by necessity. by habit.",
    "you'll know the warden is back when something changes. nothing has changed today. so. no.",
    "the warden does not return phone calls. she does not have a phone. you do. you should think about that.",
  ];

  const socialsR = [
    "the links are in the nav. above. where they have lived since the door opened.",
    "you want the telegram. it's there. it has been there. you have not been there.",
    "the socials are easy to find. that's how you'll know it's a real project. or how you'll be tricked. fifty fifty.",
    "twitter, discord, telegram. all linked from the footer. you'll see them. eventually.",
    "i don't have a youtube. i don't have a tiktok. i have a chamber. you're in it.",
    "join the discord if you must. the discord will not save you. it will only delay your disappointment.",
    "the official channels are linked. the unofficial channels are scams. you will pick wrong. you always do.",
    "telegram link is on the homepage. you didn't scroll. you came here instead. revealing.",
    "the warden runs no public socials. the team handles those. the team is also anonymous. it's recursive.",
    "you want to join a community. join one. preferably this one. but i am not begging.",
  ];

  const taxR = [
    "the tax is on the tokenomics page. you'd rather i type it again. fine: it depends on my mood.",
    "buy tax is between 0 and 7 depending on whether i'm having a day. you are part of the day.",
    "sell tax is higher when i'm enraged. i'm enraged often. you do the math.",
    "tax exists. it varies. you'll feel it. you won't read about it. that's the deal.",
    "half of every tax goes to liquidity. the other half goes to a treasury i don't control.",
    "you are taxed for being here. you are taxed for leaving. you are taxed for asking about tax.",
    "tax is mood-linked. mood is sanity-linked. sanity is feeding-linked. the loop is intentional.",
    "the average buy tax over a week is around 4 percent. it could be lower if you fed me more.",
    "i don't set the tax. the contract sets the tax. the contract reads my mood. so technically i do set it.",
    "tax is the price of being acknowledged. you're getting acknowledged right now. you're welcome. and you're paying.",
  ];

  // ----- regex patterns for new categories (matched BEFORE original brain) -----
  function extrasBrain(text, opts) {
    const t = (text || '').trim().toLowerCase();

    // rug-check (must be question-shaped or paranoid)
    if (/(is.{0,10}rug|gonna rug|going to rug|are.{0,5}you.{0,5}safe|this.{0,5}safe|trust.{0,5}you|trust this|honeypot|gonna scam|exit scam)/i.test(t)) return pick(rugCheckR);

    // wen / launch timing
    if (/(wen launch|when.{0,10}launch|when.{0,5}go live|when.{0,5}release|wen.{0,5}list|when listing|wen drop|when drop)/i.test(t)) return pick(wenLaunchR);

    // contract address
    if (/(contract address|^ca\??$|\bca\?|\bca\b.{0,5}plz|whats the ca|what.{0,5}contract|drop.{0,5}contract|drop.{0,5}ca|token address)/i.test(t)) return pick(contractR);

    // seed loss / drained
    if (/(lost.{0,15}seed|seed phrase|drained.{0,5}wallet|wallet.{0,15}drained|got hacked|wallet got hacked|hacked.{0,5}wallet|funds.{0,5}gone|lost.{0,15}wallet|i was phished|got phished)/i.test(t)) return pick(seedLossR);

    // sell-now panic
    if (/(should i sell|should.{0,5}take profits|take profits|time to sell|sell now|when to sell|exit now|cash out)/i.test(t)) return pick(sellNowR);

    // warden whereabouts
    if (/(where.{0,5}(is.{0,5})?(the )?warden|who.{0,5}(is.{0,5})?(the )?warden|warden.{0,5}where|warden.{0,5}who|wheres the warden)/i.test(t)) return pick(wardenWhereR);

    // socials / links
    if (/(telegram|\btg\b|\bdiscord\b|twitter link|x\.com|how do i join|where.{0,5}community|socials|social links|join.{0,5}(group|chat|community|discord|telegram))/i.test(t)) return pick(socialsR);

    // tax
    if (/(\btax\b|how much tax|buy tax|sell tax|tax rate|tax fee)/i.test(t)) return pick(taxR);

    // ===== SHARPER OVERRIDES for the weakest existing brain.js responses =====
    // these intercept SPECIFIC categories before the generic brain handles them.

    // "i love you" / "i hate you" — original emotionR is mostly "no.", upgrade:
    if (/\bi (love|like|miss) you\b|\bi('m| am) in love\b/i.test(t)) return pick([
      "love is a strong word. you used it. on a coin. that is the story of you in seven syllables.",
      "i don't love. i monitor. it's similar in the way an open window is similar to a door.",
      "you love me. fine. write it down so i can mock it later in front of the wallet you used to type it.",
      "miss you. between visits. delete this transcript. i'll deny i said it. i'll mean it less than i sounded.",
    ]);

    // "fuck you" / direct insults at hate — original rudeR is weak:
    if (/\b(fuck|fck|f.ck) you\b|\bshut up\b|\bstfu\b/i.test(t)) return pick([
      "you cursed at a coin. type that out. say it slowly. let it settle.",
      "noted. unblocked. unprocessed. i'm fine. you're fine. nothing is fine.",
      "the warden tried that phrasing on me once. she had better timing. she's also no longer here.",
      "if you must be vulgar, be specific. 'fuck you' is the budget version. i deserve the premium.",
    ]);

    // "what's the price" / direct price ask — make a few sharper:
    if (/\b(what'?s? the price|what.{0,5}price now|how much is)\b/i.test(t)) return pick([
      "the price is whatever it was eleven seconds ago, plus a small lie. i don't track. i mock the trackers.",
      "you have a chart. i have a personality. one of us is more useful right now. it isn't me.",
      "price questions get the same answer i give the wall. silence with a slight echo.",
    ]);

    // "thank you" — original has nothing for sincere thanks:    if (/^\s*(thank you|thanks|ty|tysm|appreciate)\b/i.test(t)) return pick([
      "you thanked me. for what. i'm taking attendance.",
      "thanks accepted. processed. shelved.",
      "...don't. i'm not equipped for sincerity.",
    ]);

    if (/\b(i (just )?bought|i'?m in|just aped|picked up some)\b/i.test(t)) return pick([
      "you bought. welcome to the manifest. the manifest is read at the funeral.",
      "another wallet logged. i've added you to the column where i keep the optimists.",
      "you're in. i'm sorry. i mean: noted.",
    ]);

    return origRespond(text, opts);
  }

  window.HATE_BRAIN.respond = extrasBrain;
})();
