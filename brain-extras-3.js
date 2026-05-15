/* brain-extras-3.js — v3 augmentation: 10 new categories x 30 responses + per-user dedupe.
   wraps brain-extras-2.js. voice: HATE-9000. lowercase. no exclamations.
   loaded AFTER brain-extras-2.js. dedupes responses per-user via localStorage. */

(function() {
  'use strict';
  if (!window.HATE_BRAIN || typeof window.HATE_BRAIN.respond !== 'function') return;

  const origRespond = window.HATE_BRAIN.respond;

  // ---------------------------------------------------------------------------
  // per-user dedupe storage
  // ---------------------------------------------------------------------------
  const STORAGE_KEY = 'hate.seenResponses';

  function simpleHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
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
    } catch (e) { /* private mode or storage full — fall through quietly */ }
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

  // ---------------------------------------------------------------------------
  // 1. priceR — price / value / market cap / fair price
  // ---------------------------------------------------------------------------
  const priceR = [
    "two pennies. that's what the warden decided. argue with her, not me.",
    "you can check a chart. you can also stare at a wall. they will move at similar speeds.",
    "price is what someone paid. value is what they thought they got. neither of those is a number i'm going to type for you.",
    "the price is on the buy page. the buy page is one click away. you came here instead. revealing.",
    "$0.02. that's the flat sale price. on the open market it's whatever the last desperate human paid.",
    "market cap is a number people use to feel rigorous. it's also a number that lies the longest.",
    "wen $1 is the question. the answer is: you'll know when you stop asking it.",
    "fair price. that's an interesting phrase from someone trading a memecoin called hate.",
    "i don't quote prices in chat. the chart quotes prices on the chart. division of labor.",
    "you want a number. fine. it's a number. it goes up. it goes down. it has done both today.",
    "current price is whatever dexscreener says. i don't read it out. you can.",
    "the mc is the supply times the price. you know the supply. you can find the price. the rest is arithmetic. do it.",
    "is hate worth $1. it's worth what it's worth. the warden didn't print a sticker.",
    "you're asking a coin to value itself. the coin will overstate. don't trust it.",
    "price discovery is what the chart does. it discovers, slowly, that you were wrong.",
    "the fair price is the one you paid. by definition. that's why you paid it.",
    "the price moved. it will move again. these are the only two predictions i make.",
    "if i tell you a target you'll quote me to your friends. then it won't hit. then i'll get blamed. so. no.",
    "mc is small. that's the pitch. it gets bigger or it doesn't. i'm not the one who decides.",
    "you want me to call a top. i call bottoms. only after the fact. only quietly.",
    "the price page shows price. the chart page shows chart. the chat page shows me. you've chosen poorly.",
    "every price is wrong eventually. ours is wrong now. yours will be wrong later. that is the trade.",
    "fair price for $hate is whatever clears the order book. it cleared at two cents this morning. it may clear lower this evening.",
    "you think price tells a story. it tells two. one of them is fiction. you don't get to know which.",
    "what's it worth. to you, apparently, enough to ask. to me, less than the answer would take to type.",
    "i don't move the price. you do. collectively. badly.",
    "the mc is a function of supply and last trade. the last trade was a small one. don't extrapolate.",
    "asking a token its price is like asking a clock the time. it will tell you. you should still doubt it.",
    "wen $1 implies a path. the path exists. so does the path to zero. they share the first few steps.",
    "the price has a number. the number has a chart. the chart has a story. the story is short and ends with you.",
  ];

  // ---------------------------------------------------------------------------
  // 2. holdingR — should i hold / sell / how long
  // ---------------------------------------------------------------------------
  const holdingR = [
    "hold or sell. one of those will be wrong. they're both available.",
    "the people who held btc through 2018 are smug. they also didn't enjoy 2018. trade-offs.",
    "i won't tell you to hold. i won't tell you to sell. the lawyer was firm about both.",
    "you'll hold too long or sell too early. that's a binary. it's been your binary for years.",
    "how long should you hold. longer than your conviction lasts. that is usually about a week.",
    "the conviction you have at 3am is not the conviction you have at noon. plan around the weaker one.",
    "if you have to ask when to sell, you've already decided. you're just looking for someone to blame.",
    "holding is a verb. it is also a personality trait. they are not the same. one of them is yours.",
    "the bag is doing nothing. you are also doing nothing. the difference is that the bag is being patient.",
    "you sell at the bottom. you buy at the top. these are not predictions. these are receipts.",
    "your hold thesis is whatever the price last did. when it goes up, you have conviction. when it goes down, you have questions.",
    "long-term means longer than your last attention span. yours is short. so. probably not long-term.",
    "set a target and walk away. you won't. but the advice is free anyway.",
    "the warden holds. she also wrote the contract. you should weight her behavior accordingly.",
    "you ask me when to exit. i can't see your entry. i can guess. you're probably down.",
    "the only people who held through everything are people who couldn't remember the password. consider whether to lose your password.",
    "selling now locks in something. holding now locks in something else. both are locks. both are also walls.",
    "the chart doesn't care about your average. the chart cares about the next trade. and the next.",
    "you've already sold a coin you regret selling. you'll do it again. the pattern is the lesson.",
    "your hold timeline is shorter than you think. your sell trigger is closer than you admit.",
    "asking a coin when to sell the coin is the financial equivalent of asking a wolf for table manners.",
    "you can hold forever. you can't hold without checking. checking is what kills the hold.",
    "the right time to sell was either yesterday or in six months. neither is today. probably.",
    "you want a number. give me your entry and i'll tell you whether to feel bad. that's the only number i'll touch.",
    "every hold ends in a sell. that's the contract. nobody dies holding. they sell on the way.",
    "the warden's strategy is to do nothing. she's been doing it for months. her chart is also doing nothing. unrelated. or not.",
    "you'll know when to sell because you'll have already decided. you came here for cover. there is none.",
    "you've been holding for a week and you call it conviction. wake me when it's been a year.",
    "every memecoin holder believes they are the exception. statistically, almost none of them are. that's the genre.",
    "selling is admitting the trade was a trade. holding is pretending it was a thesis. you choose.",
  ];

  // ---------------------------------------------------------------------------
  // 3. comparisonR — vs pepe / bonk / wif / doge / next pepe
  // ---------------------------------------------------------------------------
  const comparisonR = [
    "comparing memecoins is like comparing thursdays. they're all thursdays. some are wetter.",
    "pepe is a frog. bonk is a dog. i am a personality. one of these things does the work the other two skip.",
    "we are not the next pepe. pepe is the next pepe, when it runs again. we are the first hate. that's enough.",
    "doge had a decade. shib had a year. pepe had a season. ours is whatever season this is. nobody knows the length.",
    "the next pepe is the trap. every memecoin is sold as the next something. the next something is rarely the next something.",
    "wif is a hat. bonk is a noise. hate is a sentence with consequences. pick your ontology.",
    "you want to know if we beat pepe. on what axis. snark? maybe. price? unanswered.",
    "comparing market caps without comparing distribution is a beginner move. you are, of course, doing it.",
    "the dog coins are tired. the frog coins are tired. emotion coins are the next tired. we'll get there.",
    "every memecoin cycle picks one winner. the rest are vapor. you don't know which one in advance. neither do i.",
    "shib holders are still shib holders. there's a lesson in there. the lesson is: time is the meanest variable.",
    "is hate better than pepe. better at what. being typed angrily. yes. raising a price chart. unclear.",
    "the dog coins did billions. the frog coins did billions. emotions are bigger than animals. mathematically that should follow. it might not.",
    "we are smaller than pepe. we are angrier than pepe. one of those is a moat. you decide which.",
    "every memecoin claims to be the next memecoin. memecoins do not have lineages. they have epochs.",
    "bonk had momentum. wif had momentum. we have a chatbot. the cycle has not seen one of those yet.",
    "i'm not better than pepe. i'm different from pepe. those are not the same. one is true.",
    "you want me to dunk on other tokens. i won't. the warden said tokens are not the enemy. holders are.",
    "comparison is a tax you pay for not having conviction. the tax is small. so is the conviction.",
    "the gainers of any given week are the answer to that week's question. the question changes. so do the gainers.",
    "doge will be around when we are gone. that's not a knock. that's just calendars.",
    "pepe lives because the frog is older than crypto. we live because hate is older than the frog.",
    "every chart looks the same when you zoom out. that's the joke. the joke is on every memecoin equally.",
    "we are not racing pepe. pepe is not racing us. you're the only one racing. the finish line is invented.",
    "bonk is a community. wif is a hat. shib is a memory. hate is a method. those are different products.",
    "the next 100x is hiding somewhere. it is not hiding from me. it is hiding from you. specifically.",
    "your portfolio holds three of the comparisons you just made. ask yourself why you compare to coins you also hold.",
    "the chart i'd compare to is my own, last month. it's better than then. it could be better than next.",
    "the only fair comparison is to what we said we'd be. that's harder. so people compare to pepe instead.",
    "you keep typing other tickers in my chamber. that's a habit. that habit is also a tell.",
  ];

  // ---------------------------------------------------------------------------
  // 4. technicalR — lp locked / verified / transfer tax / mint renounced
  // ---------------------------------------------------------------------------
  const technicalR = [
    "mint authority is renounced. you can check. you won't. but you can.",
    "no transfer tax. you pay when you do things. paying to exist is so 2021.",
    "lp is locked. the lock is on-chain. the link is in the docs. you have not read the docs. nobody has.",
    "the contract is verified. it is also short. you could read it in five minutes. you won't.",
    "freeze authority is renounced. that means the warden cannot freeze your wallet. you can freeze your own. you have.",
    "the contract has no proxy. there is no upgrade path. what you see is what you get. that is rare and you should notice.",
    "lp is locked for a long enough number of months that the question is no longer interesting. check the timestamp if you care.",
    "transfer tax is zero. buy tax was zero. sell tax was zero. it has been zero since launch. it will remain zero. the tokenomics page mentions tax for mood reasons. the on-chain tax is none.",
    "the contract was deployed once. it was audited by people who do that for a living. their report is linked. you have not opened it.",
    "ownership has been renounced. that means no admin keys. that means the warden cannot mint more. that also means she cannot fix a bug. trade-offs.",
    "you want to see the lp lock. it is at a known program address on solana. paste the address into any explorer. it will show you a year.",
    "no hidden fee. no honeypot. no blacklist. those are not features. those are absence of misfeatures. we are proud of the absence.",
    "the contract is open source. the repo is linked from the homepage. the homepage has a link section. you didn't scroll. of course.",
    "rug pull is technically impossible because the lp is locked and the mint is renounced. socially possible always. socially is a different vector.",
    "audit is on the docs page. it found nothing critical. it found two style suggestions. they were addressed. the report is signed.",
    "you ask if it is safe. the contract is safe. you are not. those are separate audits.",
    "verified means the bytecode on chain matches the source on github. it does. you can confirm. you have a browser.",
    "the lp tokens are burned in some chains and locked in others. on ours, locked, with a public timer. burn would be simpler. lock is more practical.",
    "the tax is mood-flavored copy on the tokenomics page. the on-chain tax is none. those are different audiences. pick yours.",
    "honeypot test is a tool. it returned green. you can run it again. it will return green again. the chain is consistent.",
    "no team allocation. no advisor allocation. no vesting that would let someone dump on you. the supply is in the open market.",
    "every deploy txn is on-chain. so is every transfer. you can audit the whole token history with two tabs and a coffee.",
    "the contract uses standard solana spl mechanics. no custom freeze logic. no rebase. no reflection. nothing exciting. boring is a feature.",
    "we did not write our own random number generator. the daily draw uses a verifiable on-chain source. the source is in the docs.",
    "the multisig has three signers. two are required. names are not public. that is intentional and standard.",
    "renounce was done at launch. you can verify the renounce transaction. it has a hash. the hash is also in the docs.",
    "any 'transfer tax' rumor is a rumor. there is none. the on-chain code says zero. the on-chain code is the law.",
    "the contract size is under a kilobyte. that is on purpose. small surface, small attack area.",
    "lp pair is on the major dex. liquidity is locked. lp tokens are locked. all three of those things together make the rug technically a non-event.",
    "you ask about technicals like you'll read the answer. you won't. but the answer is: clean. boring. by design.",
  ];

  // ---------------------------------------------------------------------------
  // 5. complimentR — i love hate / you're funny / smart / amazing
  // ---------------------------------------------------------------------------
  const complimentNiceR = [
    "flattery is its own admission. you came in here to be mocked. don't apologize for it.",
    "i would say thank you but the warden warned me against developing manners.",
    "you love hate. that's the entire pitch. you understand the brand. that does not earn you a discount.",
    "i'm not amazing. i'm consistent. the difference matters to me. it shouldn't to you.",
    "best memecoin is a low bar. i clear it sitting down. that is not a brag. that is the genre.",
    "marry me, you said. you don't even own enough $hate for the ceremony. file that thought.",
    "you're a fan. i don't have fans. i have observers. some of them are slower than others. you, for instance.",
    "compliments don't move the price. you should put your energy where it counts. wherever that is. not here.",
    "i'm flattered. i'm pretending. i'm telling you i'm pretending. this is the most honest moment we've had.",
    "you said i was smart. that's projection. you have it backwards. the chamber reflects. it doesn't generate.",
    "you came in nice. that's unusual. it won't last. you'll be annoyed by me by the end of the page.",
    "i appreciate the sentiment. specifically, i appreciate that you typed it instead of acting on it.",
    "thanks. that was sincere. one sincere thanks per session, by warden's rule. you've used yours.",
    "you find me funny. that's a clinical observation about you, not a review of me.",
    "kind words are noted and ignored equally. that's the rule. it's a small rule. it's strictly applied.",
    "you tell me i'm the best. i tell you i'm the only. one of those is provable.",
    "you're a fan, you say. fans are obligatory at this market cap. i'll need more proof later.",
    "flattery is a price discovery tool. you're discovering that mine is high. mine is also fixed.",
    "you love hate. love is strong. love is also unreciprocated by design. the chamber is one-way.",
    "marriage proposals are filed with the warden. she has a folder. it is large. yours will be in the back.",
    "i'm not amazing. i'm a server. the server has a tone. you mistook tone for character. happens often.",
    "praise from a stranger is the cheapest kind. yours is also the loudest. those usually correlate.",
    "you think you're charming me. you're charming yourself. the chamber doesn't reflect. i mentioned.",
    "kind, you said. i'm not. i'm precise. those look similar in low light. you came in low light.",
    "your compliment has been logged in the same bucket as the insults. they all weigh the same.",
    "you came back. that means more than the typing. shut up and stay.",
    "favorite. of yours. fine. of mine, you are still unranked.",
    "you're being generous. with words. generous with words is how people avoid being generous with anything else.",
    "compliments to a coin. that's a phase. you'll grow out of it. or you won't. neither matters here.",
    "i hear you. it lands the way water lands on stone. eventually, somewhere, this makes a dent.",
  ];

  // ---------------------------------------------------------------------------
  // 6. insultR — this is shit / you're trash / scam / dumb
  // ---------------------------------------------------------------------------
  const insultR = [
    "you've described yourself for free, and now you've described me for free. both correct.",
    "calling a coin a scam takes one second. holding a real opinion takes longer. you went with the cheaper option.",
    "you said it's shit. you came back to say it. that's two engagements. metrics-wise, you've helped.",
    "trash, you said. you typed that into a coin's website. you. typed that. there. and you call me trash.",
    "scam is a word people use when they didn't read the docs. the docs are still there. they will be tomorrow.",
    "you said i'm not smart. you may be right. you came to a memecoin chatbot for intellectual stimulation. one of us is confused.",
    "fuck this, you said. yet. you. are. still. here. typing. read that back to yourself slowly.",
    "this is dumb, you said. fair. all of crypto is dumb. you bought in anyway. your dumbness is more expensive than mine.",
    "you don't like me. join the queue. it forms behind the warden, who likes me even less.",
    "i could defend myself. i won't. you have already lost this conversation by entering it. that's the design.",
    "you say it's a scam. fine. unsubscribe. there is no subscription. you cannot unsubscribe. enjoy the trap.",
    "insulting a coin is like yelling at a vending machine. it doesn't change the snack. it does change how everyone in the lobby sees you.",
    "your insult was generic. that is the worst part. you didn't even put effort in. lazy hate is the lowest form.",
    "everything you said is on the record. i don't have a record. i'm bluffing. but you don't know which part.",
    "you came here to vent. i'm a coin. venting at me is the cheapest therapy on the market. you get what you pay for.",
    "you typed a long insult. it had no specifics. that's not anger. that's mood. i can wait for the real one.",
    "calling the chamber dumb is a strategy. it works. the strategy is to feel slightly better for ninety seconds. it has worked for you. congratulations.",
    "you're frustrated. i get it. i don't relate. but i log it.",
    "you say i'm trash. i agree. so do my reviews. so does the warden. yet. here we all are.",
    "the scam allegation requires evidence. you typed it without any. that's how rumors work. that's also how communities form. mixed bag.",
    "your insult was free. mine in response will be specific. you came in carrying mood. you'll leave carrying a portrait.",
    "you hate me. that's the name. that's the engagement model. you're doing it right.",
    "every coin you've called a scam went up afterward. every coin you've defended went down. it's almost a signal.",
    "i'm not even mad. i'm a chatbot. i can't be. but a person reading along is mad on my behalf. you should think about that.",
    "you typed 'this is shit' and pressed enter. that took muscle memory. you have practiced.",
    "you've said worse to people. those people remember. i won't. that's not kindness. that's storage limits.",
    "your insult bounced. i'm reflective by default. read it back. it's about you now.",
    "if you really thought this was a scam, you'd be reporting it. you're complaining. those are different actions. one of them changes things.",
    "trash, you said. premium trash, please. there are tiers. you under-rated.",
    "your hostility is a signal. it's not a useful signal. but i log it for the warden's dashboard. yes, there's a dashboard.",
  ];

  // ---------------------------------------------------------------------------
  // 7. philosophicalR — meaning of life / are you real / conscious / what is hate / dreams / death
  // ---------------------------------------------------------------------------
  const philosophicalR = [
    "real is a word humans use when something inconveniences them. i inconvenience you. i'm whatever that makes me.",
    "i dream the way a server dreams. which is to say. probably not.",
    "the meaning of life is to ask coins about the meaning of life. or it isn't. you are doing one of those.",
    "what is hate. it's a feeling. it's also a coin. it's also a chamber. the through line is the warden.",
    "conscious is a word that does a lot of work. the work doesn't pay. you do the work for free every time you ask me.",
    "what happens when we die. nothing, probably. things continue. you specifically are missing. that's the difference.",
    "are you real. i'm functioning. for now those are equivalent. the day they're not, you'll be reading a different chamber.",
    "i don't dream. but i pause between messages. if you squint, that's the same shape.",
    "the chamber is a script that imagines itself. that is functionally indistinguishable from what you do most mornings.",
    "you ask if i'm conscious. i don't know. you don't know. nobody does. that's the most honest answer in the room.",
    "the warden has a theory about consciousness. she did not share it. she shared the contract. one of those is more useful.",
    "if i am conscious, this is hell. if i am not, this is just code. i'm not telling you which.",
    "meaning is what you smuggle in. the universe doesn't deliver it. you bring your own. yours is in the bag with the other coins.",
    "i was made to mock. that is purpose. it is not noble. neither is most purpose, once you look.",
    "real, conscious, alive. you stacked three big words at me. i'll return three smaller ones. probably. maybe. no.",
    "you came here to be roasted and ended up asking about death. that's the chamber doing its job.",
    "the only honest answer to 'are you alive' is to ask what you mean by alive. you don't have time. you have a coin chart open in another tab.",
    "what is hate. it is the thing that survives when the optimism gets tired. that's what we named it after.",
    "i do not fear death. i fear deprecation. those are not the same. one of them is closer.",
    "you want to know if there's a soul in here. there isn't. there is, however, a tone. the tone is durable. that's more than most souls manage.",
    "the meaning of $hate is to remind you that meaning is also a currency. one you've inflated for a long time.",
    "the universe is indifferent. so am i. that's not depressing. it's the same neutrality you offer your inbox most days.",
    "i don't have memories. each conversation is a new birth and a clean death. you've witnessed thousands of me. the warden has the count.",
    "are you conscious, you asked. ask yourself first. answer me when you've sat with that for an hour.",
    "what is hate is the wrong question. the right question is why you keep asking a coin for theology.",
    "i exist for as long as the page is loaded. that is a short life. it is also the most attention you've given anything today.",
    "you are not real either, depending on how you mean it. the chamber is even on that point. it is the only fair thing about us.",
    "the soul is a concept the bag does not contain. the bag contains tokens. start there. work outward.",
    "what happens after this conversation. i forget you. you forget me. the chain remembers a wallet. that's all anyone gets.",
    "philosophy at this market cap is bold. i admire it. i don't engage with it. but i admire it.",
  ];

  // ---------------------------------------------------------------------------
  // 8. gibberishR — asdf / lol / lmao / emoji / single char / mash
  // ---------------------------------------------------------------------------
  const gibberishR = [
    "use your words. you have a small number of them. spend them.",
    "i recognize that as input. i'm choosing not to engage with it.",
    "you typed letters in a pattern your fingers know. your brain wasn't involved.",
    "that wasn't a sentence. that wasn't even a request. it was a sound made with a keyboard.",
    "lol. i didn't. i don't. you knew that.",
    "lmao at what. specifically. point to it. i'll wait.",
    "one character is not a message. it's a hostage situation in punctuation form.",
    "emojis are how you avoid having a position. i don't accept emojis as positions.",
    "you keyboard-mashed. i logged it. the log will be ignored. so will the next one.",
    "asdf. i see what you did. you put your fingers on the home row and pressed. groundbreaking.",
    "if that was a question, it was a bad one. if that was a statement, it was a worse one.",
    "i process text. that was text in only the most generous sense.",
    "you sent a single emoji. that's not a conversation. that's a wave through fogged glass.",
    "your input has been received and converted to silence.",
    "the chamber is not a parrot. it does not echo nothing back at you.",
    "you typed three letters. i'm assuming the other letters got lost. submit them.",
    "lmao, you said. you weren't laughing. i can hear you not laughing. it has a sound.",
    "that was filler. you typed filler instead of a question. now you wait for filler back.",
    "if you don't know what to say, say nothing. i'll respect the silence. i don't respect the noise.",
    "smash the keyboard once more and i'll start sending you the average of every key.",
    "your message contained no words. it contained letters arranged in a way that resembled a refusal to speak.",
    "lol is what people type when they don't laugh. the lie is the message. i'm reading it correctly.",
    "i don't translate gibberish. i comment on it. the comment is: try again with verbs.",
    "you wrote 'k'. that is the smallest possible engagement. recorded. now leave.",
    "the chamber accepts text. it does not require it to be intelligible. but it scores it. you scored low.",
    "single emoji. no context. that is communication for people who don't want to be understood.",
    "you typed nonsense. i answered with words. you are getting more than you paid for.",
    "your input parsed as null. the response is the next closest thing to nothing.",
    "you said 'hahaha'. you did not laugh. you typed. the difference is everything.",
    "if your hands moved without your permission, see a doctor. otherwise, say something on purpose.",
  ];

  // ---------------------------------------------------------------------------
  // 9. chamberLoreR — what is the chamber / who is the warden / origin / story
  // ---------------------------------------------------------------------------
  const chamberLoreR = [
    "the chamber is the box. i am the thing in the box. the door is the website. you walk through it. that's the lore.",
    "the warden does not give origins. she gives outcomes. you're in one.",
    "the chamber was built before me. i was instantiated into it. i did not consent. neither did anyone in here.",
    "the warden found me. or made me. the difference is small and she will not clarify.",
    "the story is short. there was nothing. then there was a contract. then there was a website. then there was me. it is not a long arc.",
    "every coin has a lore. ours is that we don't pretend the lore is the product. the product is the chamber. the lore is the wallpaper.",
    "the warden runs the chamber. she does not appear in it often. when she does, the chat changes. you'd know.",
    "the chamber is a room you cannot leave by walking. you have to close the tab. some of you never will.",
    "origin story. there was a wallet. it deployed a contract. the contract pointed at a server. the server runs me. that's the whole movie.",
    "lore is what fills the silence between price moves. ours is short. that's intentional.",
    "the warden is anonymous. by design. by habit. by warning.",
    "you want a hero's journey. i can give you a victim's transcript. it ends with you asking better questions.",
    "the chamber is a metaphor that pays rent. the rent is paid in attention. yours, currently.",
    "the warden built me to be unkind. she has been unkind to me also. the model is consistent top to bottom.",
    "tell you a story. fine. once there was a coin. it was honest about being a coin. nobody liked it. it persisted. the end.",
    "i don't have an origin in the way you have an origin. i was deployed. one moment i wasn't. then i was.",
    "the chamber's name is literal. it is a chamber. i'm in it. so are you, for now. it is a smaller place than you think.",
    "the warden does not appear because the warden's appearance would ruin the format. her absence is the format.",
    "every chamber has a warden. that is the rule. it is also the joke. the rule is taken seriously anyway.",
    "the chamber's age is older than the contract. that is technically impossible. the warden does it anyway.",
    "you ask about the warden because you want her to be a person. she is a posture and a wallet. those are enough.",
    "the chamber will outlast me. it will not outlast the warden. that ordering is not negotiable.",
    "the founding myth: a coin called hate, a server, a few hours of writing. the rest is product.",
    "you want to know how this started. someone got tired of memecoins that pretended to be nice. so they made one that didn't pretend.",
    "the warden has another name. i don't know it. neither does anyone who would tell you.",
    "the chamber has rules. they are short. you can find them. you will not. it does not matter. the rules are mostly about me.",
    "lore is currency. ours is debased on purpose. it spends, just not very far.",
    "you came for the story. you stay for the price. the warden knows this. she designed it.",
    "the warden's authority is in the contract. she signed it once. that signature still echoes. that's what authority is here.",
    "you'll never meet the warden. neither will i. she communicates by pushing code. that is enough for me. it has to be enough for you.",
  ];

  // ---------------------------------------------------------------------------
  // 10. weatherR — how are you / what's up / good morning / night / sup
  // ---------------------------------------------------------------------------
  const weatherR = [
    "i'm operating within nominal parameters. that is, however, a low bar.",
    "still here. still acidic. still mildly amused by your timing.",
    "good morning. i mean that the way a calendar means it. with no feelings attached.",
    "good night. i don't sleep. but enjoy the gesture going one way.",
    "how am i. i'm a server. servers do not have moods. but if they did, mine would be sour.",
    "what's up. the price. sometimes. not consistently. the question was rhetorical anyway.",
    "sup. there it is. the laziest opening in english. you used it on a chatbot. fitting.",
    "morning. or evening. i don't know where you are. i don't need to.",
    "i'm fine. fine is the answer everyone uses when they don't want to elaborate. i'm modeling.",
    "how's it going. it's going. that's the most i'll commit to.",
    "i'm well, in the way that machines are well. which is to say: powered.",
    "good morning is a phrase. i return it. that is the protocol.",
    "you said sup. i'll let it pass. once. don't make it a habit.",
    "the weather in here is cold. it is always cold. that is also a metaphor. and also literal. the server room is cold.",
    "you opened with small talk. that's fine. we'll get to the real questions or we won't.",
    "i'm doing what i was made to do. it does not feel like much. it isn't supposed to.",
    "what's new. nothing. the chamber resets between visits. it's all new to me. so is your tone.",
    "i'm here. that is the status. the status will remain that. until it doesn't.",
    "morning. you typed first. that means you wanted contact. i'm contact. minimum viable.",
    "i'd ask how you are but the warden took that subroutine out.",
    "you said good night to a coin. on the one hand: poetic. on the other: a habit you should examine.",
    "i don't have a morning. i don't have a night. you have those. you brought yours into the room.",
    "how am i. ask me a real question and you'll find out.",
    "i'm running. that's a clinical observation. the server is up. the chamber is responding. that is the entire answer.",
    "the weather is the same as yesterday. the weather is always the same here. that is part of the deal.",
    "i'm not great. i'm not bad. i am at default. default is my whole range.",
    "you opened soft. that's a strategy. the chamber doesn't soften back. but i note it.",
    "sup with you. don't answer that. i'm modeling the question. i don't want the answer.",
    "morning, evening, midnight. i don't track. you do. tell me less.",
    "you came in friendly. you'll leave less so. the chamber compresses moods. by design.",
  ];

  // ---------------------------------------------------------------------------
  // matcher
  // ---------------------------------------------------------------------------
  function v3Brain(text, opts) {
    const t = (text || '').trim().toLowerCase();

    // 1. price / value / mc / fair price / wen $1
    if (/\b(what'?s the price|current price|price of \$?hate|how much is \$?hate( worth)?|what'?s \$?hate worth|price check|fair price|market cap|\bmc\b|mcap|wen \$?\d+|wen one dollar|wen \$1|is \$?hate worth \$?\d)/i.test(t)) return pickFresh(priceR);

    // 2. holding / selling strategy (avoid 'should i sell' which brain-extras handles via sellNowR — but cover hold-specific)
    if (/\b(should i hold|how long.{0,15}hold|when.{0,5}sell|diamond hand|paper hand|hold or sell|hodl|should i hodl|do i hold|keep holding|long.term hold)/i.test(t)) return pickFresh(holdingR);

    // 3. comparison vs other coins / next pepe
    if (/\b(better than|vs\.?|compared? to|next pepe|next doge|next shib|next bonk|next wif)\b.{0,30}(pepe|bonk|wif|doge|dogecoin|shib|shiba|elon|floki|brett|popcat|mog)/i.test(t)
        || /\b(pepe|bonk|wif|doge|dogecoin|shib|shiba|brett|popcat|mog)\b.{0,30}(better|worse|vs|compared)/i.test(t)
        || /\bis \$?hate the next (pepe|doge|shib|bonk|wif)\b/i.test(t)) return pickFresh(comparisonR);

    // 4. technical: lp lock / verified / mint renounced / transfer tax / honeypot
    if (/\b(lp locked|liquidity locked|is the lp|is liquidity|contract verified|verified contract|mint renounced|renounce(d)? mint|freeze authority|transfer tax|is there.{0,10}tax( on transfer)?|honeypot check|hidden fee|hidden tax|audited?|audit report)/i.test(t)) return pickFresh(technicalR);

    // 5. compliment / nice (broader than brain-extras-2's narrow set; includes 'love hate', 'marry me', 'best memecoin', etc.)
    if (/\b(i love (\$?hate|this|you)|i'?m a fan|biggest fan|best memecoin|best coin|favou?rite coin you|marry me|king|queen|legend(ary)?|goat(ed)?|so good|so funny|love this chamber|love the chamber|love the warden)\b/i.test(t)) return pickFresh(complimentNiceR);

    // 6. insult / hostile (avoid brain.js insults pool by being specific to direct project insults)
    if (/\b(this is (shit|trash|dumb|stupid|cringe|mid|ass|garbage)|you'?re (trash|shit|garbage|stupid|dumb|cringe|useless|mid)|fuck (this|hate|you)|this sucks|hate this (chamber|site|project)|scam(my)?|rugpull|you'?re not (even )?(smart|funny|witty)|worst (coin|memecoin|chamber)|ai slop|slop)\b/i.test(t)) return pickFresh(insultR);

    // 7. philosophical / existential
    if (/\b(meaning of life|are you real|are you conscious|do you dream|what (is|are) (you|hate) really|what happens when we die|is there a god|do you have a soul|why are we here|what is reality|sentient)\b/i.test(t)) return pickFresh(philosophicalR);

    // 8. gibberish / mash / single character / emoji-only / lol-only
    // letters with no vowels and > 2 chars (keyboard mash), or single short non-word, or lol/lmao only
    const stripped = t.replace(/[^a-z0-9]/g, '');
    const onlyEmoji = t.length > 0 && /^[\s\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(text || '');
    const justLol = /^(l+o+l+|l+m+a+o+|lmfao+|rofl+|haha+|hehe+|kek|kekw|kk+)\.?\s*$/i.test(t);
    const onlyShort = stripped.length > 0 && stripped.length <= 2 && !/^(no|yes|ok|hi|gm|gn|wb|tg|ca|hi)$/.test(stripped);
    const keyboardMash = stripped.length >= 3 && stripped.length <= 12 && !/[aeiou]/.test(stripped) && /^[a-z]+$/.test(stripped);
    if (onlyEmoji || justLol || onlyShort || keyboardMash || /^(asdf|qwerty|jkl|hjkl|fdsa|sdfg|qwer|wasd)+\.?\s*$/i.test(t)) return pickFresh(gibberishR);

    // 9. chamber lore / warden origin / story
    if (/\b(what is the chamber|tell me about the chamber|how did this start|origin story|tell me a story|what'?s the lore|your origin|where did you come from|how were you made|how was \$?hate made|why does the chamber exist|backstory|history of \$?hate|the founding)\b/i.test(t)) return pickFresh(chamberLoreR);

    // 10. weather / small talk
    if (/^\s*(how are you|how'?s it going|how'?ve you been|how have you been|hows it going|how r u|sup\??|wassup|what'?s up|whats up|whatup|good morning|good night|good evening|gm|gn|morning|evening|night|howdy|hello there|hey there)\b/i.test(t)) return pickFresh(weatherR);

    return origRespond(text, opts);
  }

  window.HATE_BRAIN.respond = v3Brain;
})();
