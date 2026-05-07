#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const DOMAIN = 'https://www.armory-fitness.com';

// =========================================================================
// CITIES — Whatcom County primary + Skagit/Island secondary
// =========================================================================
const CITIES = [
  // Whatcom County (PRIMARY)
  ['bellingham','Bellingham','Whatcom County',98225,'15 min south'],
  ['ferndale','Ferndale','Whatcom County',98248,'home base'],
  ['lynden','Lynden','Whatcom County',98264,'8 min east'],
  ['blaine','Blaine','Whatcom County',98230,'15 min north'],
  ['sumas','Sumas','Whatcom County',98295,'25 min east'],
  ['everson','Everson','Whatcom County',98247,'18 min east'],
  ['nooksack','Nooksack','Whatcom County',98276,'22 min east'],
  ['acme','Acme','Whatcom County',98220,'40 min east'],
  ['custer','Custer','Whatcom County',98240,'10 min north'],
  ['glacier','Glacier','Whatcom County',98244,'1 hour east'],
  ['kendall','Kendall','Whatcom County',98244,'40 min east'],
  ['maple-falls','Maple Falls','Whatcom County',98266,'45 min east'],
  ['point-roberts','Point Roberts','Whatcom County',98281,'remote — by ferry/Canada'],
  ['birch-bay','Birch Bay','Whatcom County',98230,'12 min north'],
  ['deming','Deming','Whatcom County',98244,'30 min east'],
  ['sudden-valley','Sudden Valley','Whatcom County',98229,'25 min south'],
  ['geneva','Geneva','Whatcom County',98229,'20 min south'],
  ['lake-samish','Lake Samish','Whatcom County',98229,'30 min south'],
  ['lummi-island','Lummi Island','Whatcom County',98262,'short ferry from Gooseberry Point'],
  ['peaceful-valley','Peaceful Valley','Whatcom County',98244,'35 min east'],
  ['welcome','Welcome','Whatcom County',98226,'30 min east'],
  ['van-zandt','Van Zandt','Whatcom County',98244,'40 min east'],
  ['wickersham','Wickersham','Whatcom County',98264,'45 min southeast'],
  ['nugents-corner','Nugents Corner','Whatcom County',98226,'25 min east'],
  ['cherry-point','Cherry Point','Whatcom County',98248,'10 min west'],
  ['semiahmoo','Semiahmoo','Whatcom County',98230,'18 min north'],
  ['marietta','Marietta-Alderwood','Whatcom County',98226,'10 min south'],
  ['lummi','Lummi','Whatcom County',98226,'15 min south'],
  // Skagit County (SECONDARY)
  ['mount-vernon','Mount Vernon','Skagit County',98273,'30 min south'],
  ['burlington','Burlington','Skagit County',98233,'25 min south'],
  ['sedro-woolley','Sedro-Woolley','Skagit County',98284,'35 min south'],
  ['anacortes','Anacortes','Skagit County',98221,'45 min south'],
  ['concrete','Concrete','Skagit County',98237,'1 hour southeast'],
  ['bow','Bow','Skagit County',98232,'25 min south'],
  ['edison','Edison','Skagit County',98232,'30 min south'],
  ['la-conner','La Conner','Skagit County',98257,'40 min south'],
  // Island County (SECONDARY)
  ['oak-harbor','Oak Harbor','Island County',98277,'1 hour south'],
];

// =========================================================================
// SERVICES — what Armory offers + intent + typo variants
// =========================================================================
const SERVICES = [
  // [slug, label, search-term, schema-service-type]
  ['gym','Gym','gym','HealthClub'],
  ['24-hour-gym','24-Hour Gym','24-hour gym','HealthClub'],
  ['fitness-center','Fitness Center','fitness center','HealthClub'],
  ['strength-training','Strength Training','strength training','SportsActivityLocation'],
  ['weight-training','Weight Training','weight training','SportsActivityLocation'],
  ['weightlifting','Weightlifting','weightlifting','SportsActivityLocation'],
  ['personal-training','Personal Training','personal training','SportsActivityLocation'],
  ['personal-trainer','Personal Trainer','personal trainer','SportsActivityLocation'],
  ['cycling-class','Cycling Class','cycling class','SportsActivityLocation'],
  ['spin-class','Spin Class','spin class','SportsActivityLocation'],
  ['yoga-class','Yoga Class','yoga class','SportsActivityLocation'],
  ['hatha-yoga','Hatha Yoga','hatha yoga','SportsActivityLocation'],
  ['hiit-class','HIIT Class','HIIT class','SportsActivityLocation'],
  ['metabolic-conditioning','Metabolic Conditioning','metabolic conditioning','SportsActivityLocation'],
  ['group-fitness','Group Fitness Classes','group fitness classes','SportsActivityLocation'],
  ['senior-fitness','Senior Fitness','senior fitness','SportsActivityLocation'],
  ['silver-sneakers','Silver Sneakers','Silver Sneakers gym','SportsActivityLocation'],
  ['hyrox-training','Hyrox Training','Hyrox training','SportsActivityLocation'],
  ['functional-training','Functional Training','functional training','SportsActivityLocation'],
  ['cardio-gym','Cardio Gym','cardio gym','HealthClub'],
  ['recovery-center','Recovery Center','recovery center','SportsActivityLocation'],
  ['cold-plunge','Cold Plunge','cold plunge','SportsActivityLocation'],
  ['infrared-sauna','Infrared Sauna','infrared sauna','SportsActivityLocation'],
  ['red-light-therapy','Red Light Therapy','red light therapy','SportsActivityLocation'],
  ['contrast-therapy','Contrast Therapy','contrast therapy','SportsActivityLocation'],
  ['nutrition-coaching','Nutrition Coaching','nutrition coaching','SportsActivityLocation'],
  ['weight-loss','Weight Loss Gym','weight loss gym','SportsActivityLocation'],
];

// Intent variants applied to top services
const TOP_SERVICES = ['gym','24-hour-gym','fitness-center','strength-training','personal-training','spin-class','yoga-class','hyrox-training','recovery-center','cold-plunge','weight-loss','nutrition-coaching'];
const INTENTS = [
  ['best','Best','best'],
  ['top','Top','top'],
  ['affordable','Affordable','affordable'],
  ['near','Near','near'],
];

// =========================================================================
// TEMPLATES
// =========================================================================
const FAVICON = `<link rel="icon" href="/images/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/images/armory-favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/images/armory-favicon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/images/armory-apple-touch.png" />
<meta name="theme-color" content="#A23138" />
<meta name="google-site-verification" content="MCF0lqNEy7Z9RRTqlpNx7ErwFXat9F2fDl5kGJY77tI" />`;

const HEAD = (title, desc, canon) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<link rel="canonical" href="${canon}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:image" content="https://www.armory-fitness.com/images/gym-main-floor.jpg"/>
<meta property="og:type" content="website"/>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Manrope:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css"/>
${FAVICON}`;

const NAV = `<nav class="nav" aria-label="Primary">
  <a class="nav__brand" href="/"><img src="/images/armory-logo-transparent.png" alt="Armory Fitness" style="height:64px;width:auto;display:block;"/></a>
  <ul class="nav__links">
    <li><a href="/classes">Classes</a></li>
    <li><a href="/schedule">Schedule</a></li>
    <li><a href="/training">Training</a></li>
    <li><a href="/hyrox">Hyrox</a></li>
    <li><a href="/recovery">Recovery</a></li>
    <li><a href="/nutrition">Nutrition</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Visit</a></li>
  </ul>
  <div class="nav__actions"><a class="btn btn--outline nav__contact" href="#contact-form">Contact</a><a class="btn btn--outline nav__cta" href="/membership">Join</a></div>
  <button class="nav__toggle" aria-label="Menu"><span></span></button>
</nav>`;

const FOOTER_FORM = `<section class="contact-form" id="contact-form">
  <div class="contact-form__inner">
    <p class="eyebrow">Get in touch</p>
    <h2>Ready to walk through the gym?</h2>
    <p class="contact-form__sub">Drop your info — we'll text you back within one business day to set up a free tour.</p>
    <form action="https://formsubmit.co/armoryfitnessferndale@gmail.com" method="POST" class="cform">
      <input type="hidden" name="_subject" value="New lead from armory-fitness.com (local SEO page)"/>
      <input type="hidden" name="_captcha" value="false"/>
      <input type="hidden" name="_template" value="table"/>
      <input type="hidden" name="_next" value="https://www.armory-fitness.com/contact"/>
      <input type="text" name="_honey" style="display:none"/>
      <div class="cform__row">
        <label><span>First name</span><input type="text" name="first_name" required/></label>
        <label><span>Last name</span><input type="text" name="last_name" required/></label>
      </div>
      <div class="cform__row">
        <label><span>Email</span><input type="email" name="email" required/></label>
        <label><span>Phone</span><input type="tel" name="phone" required/></label>
      </div>
      <label class="cform__full"><span>Message</span><textarea name="message" rows="4" required placeholder="What are you looking for?"></textarea></label>
      <button type="submit" class="btn">Send Message</button>
    </form>
  </div>
</section>`;

const FOOTER = `<footer class="footer">
  <div class="footer__grid">
    <div><div class="footer__brand">Armory</div><p class="footer__tag">A 24-hour strength, recovery and nutrition club for everyday athletes in Ferndale, Whatcom County and the Pacific Northwest.</p></div>
    <div><h5>Visit</h5><ul><li>1920 Main St, Suite 11</li><li>Ferndale, WA 98248</li><li><a href="tel:+13603804405">360-380-4405</a></li></ul></div>
    <div><h5>Explore</h5><ul><li><a href="/about">About</a></li><li><a href="/classes">Classes</a></li><li><a href="/training">Personal Training</a></li><li><a href="/recovery">Recovery</a></li><li><a href="/nutrition">Nutrition</a></li><li><a href="/membership">Membership</a></li></ul></div>
    <div><h5>Follow</h5><ul><li><a href="https://www.facebook.com/armoryfitnessandwellness/" target="_blank" rel="noopener">Facebook</a></li><li><a href="https://www.instagram.com/armory_fitness_wellness/" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://ArmoryFitnessandWellness.as.me/" target="_blank" rel="noopener">Book appointment</a></li></ul></div>
  </div>
  <div class="footer__bar"><span>&copy; <span data-year>2026</span> Armory Fitness · Ferndale, WA</span><span>Honor &amp; protect the body</span></div>
</footer>
<script src="/js/main.js" defer></script>
</body></html>`;

const CTA_STRIP = (city) => `<section class="cta-strip">
  <div class="cta-strip__inner reveal">
    <p class="eyebrow">${city} → Ferndale</p>
    <h2>Walk through the gym before you commit.</h2>
    <p>No high-pressure sales. Just a tour, a real conversation about what you want, and a chance to feel the room.</p>
    <div class="hero__cta">
      <a class="btn" href="https://ArmoryFitnessandWellness.as.me/" target="_blank" rel="noopener">Book a Tour</a>
      <a class="btn btn--outline" href="/membership">See Membership</a>
    </div>
  </div>
</section>`;

// City + service page
function renderCityService(svc, city) {
  const [sSlug, sLabel, sTerm, sType] = svc;
  const [cSlug, cName, county, zip, distance] = city;
  const url = `${DOMAIN}/${sSlug}-${cSlug}`;
  const title = `${sLabel} for ${cName}, WA Residents | Armory Fitness`;
  const desc = `${sLabel} for ${cName} (${county}) residents. Armory Fitness in Ferndale — ${distance}. From $43/mo, 24-hour access, no sign-up fees.`;
  const schema = JSON.stringify({
    "@context":"https://schema.org","@type":sType,"name":"Armory Fitness",
    "image":"https://www.armory-fitness.com/images/gym-main-floor.jpg","url":url,
    "telephone":"+1-360-380-4405","priceRange":"$$",
    "address":{"@type":"PostalAddress","streetAddress":"1920 Main St, Suite 11","addressLocality":"Ferndale","addressRegion":"WA","postalCode":"98248","addressCountry":"US"},
    "geo":{"@type":"GeoCoordinates","latitude":48.8462,"longitude":-122.591},
    "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"00:00","closes":"23:59"}],
    "areaServed":[{"@type":"City","name":cName},{"@type":"City","name":"Ferndale"}],
    "makesOffer":[{"@type":"Offer","itemOffered":{"@type":"Service","name":sLabel}}]
  });
  // Cross-links: nearby cities (same county) + related services
  const nearby = CITIES.filter(c=>c[2]===county && c[0]!==cSlug).slice(0,5);
  const related = SERVICES.filter(s=>s[0]!==sSlug).sort(()=>Math.random()-0.5).slice(0,5);

  return `${HEAD(title,desc,url)}
<script type="application/ld+json">${schema}</script>
</head><body>
<div class="grain" aria-hidden="true"></div>
${NAV}
<header class="hero hero--page">
  <div class="hero__inner reveal">
    <p class="eyebrow">${cName}, WA → Ferndale</p>
    <h1>${sLabel} for ${cName} Residents</h1>
    <p class="lede">${cName} residents looking for ${sTerm}: Armory Fitness in Ferndale is ${distance}. 24-hour member access, full strength + recovery + classes, no sign-up fees, month-to-month from $43.</p>
    <div class="hero__cta">
      <a class="btn" href="https://ArmoryFitnessandWellness.as.me/" target="_blank" rel="noopener">Book a Tour</a>
      <a class="btn btn--outline" href="tel:+13603804405">Call 360-380-4405</a>
    </div>
  </div>
</header>

<section><div class="wrap">
  <div class="section-head reveal">
    <div><p class="eyebrow">Why ${cName}</p><h2>Why ${cName} residents drive to Armory.</h2></div>
    <p>${cName} is in ${county}, ZIP ${zip}. ${distance.charAt(0).toUpperCase()+distance.slice(1)}. Plenty of ${cName} members already make the trip — quieter floor, full equipment, real coaches, recovery wing built in.</p>
  </div>
  <div class="pillars__grid reveal">
    <article class="pillar"><div class="pillar__num">01</div><h3 class="pillar__title">Built for ${cTerm(sTerm)}</h3><p class="pillar__body">Whether you're chasing strength, conditioning, weight loss, or just want consistent movement — every part of Armory is built around real outcomes, not vanity equipment.</p></article>
    <article class="pillar"><div class="pillar__num">02</div><h3 class="pillar__title">24-hour access</h3><p class="pillar__body">Train at 4 AM before the school run or 11 PM after the kids are down. Member fob gets you in any hour, any day.</p></article>
    <article class="pillar"><div class="pillar__num">03</div><h3 class="pillar__title">Recovery built in</h3><p class="pillar__body">Cold plunge, infrared sauna, red light therapy bed, contrast therapy — all in a private wing 20 feet from the floor.</p></article>
    <article class="pillar"><div class="pillar__num">04</div><h3 class="pillar__title">Coached classes included</h3><p class="pillar__body">Strength, cycle, yoga, HIIT, metabolic conditioning, senior strength — all on the schedule, all included with Unlimited Classes.</p></article>
  </div>
</div></section>

<section><div class="wrap">
  <div class="section-head reveal">
    <div><p class="eyebrow">Other things ${cName} members use</p><h2>One membership, every system.</h2></div>
    <p>${cName} members don't have to chase ${sTerm} alone — Armory is the full operating system: strength floor, classes, recovery, coaching, nutrition.</p>
  </div>
  <div class="pillars__grid reveal">
    ${related.map(r=>`<article class="pillar"><h3 class="pillar__title"><a href="/${r[0]}-${cSlug}" style="color:inherit">${r[1]} in ${cName}</a></h3><p class="pillar__body">${r[1]} options for ${cName} residents at Armory Fitness in Ferndale.</p></article>`).join('')}
  </div>
</div></section>

${nearby.length>0?`<section><div class="wrap">
  <div class="section-head reveal">
    <div><p class="eyebrow">Also serving nearby</p><h2>${sLabel} for nearby ${county} towns.</h2></div>
    <p>Same Ferndale gym, also serving these neighbors:</p>
  </div>
  <div class="pillars__grid reveal">
    ${nearby.map(n=>`<article class="pillar"><h3 class="pillar__title"><a href="/${sSlug}-${n[0]}" style="color:inherit">${sLabel} for ${n[1]}</a></h3><p class="pillar__body">${n[1]} residents — same membership, same gym.</p></article>`).join('')}
  </div>
</div></section>`:''}

${CTA_STRIP(cName)}
${FOOTER_FORM}
${FOOTER}`;
}

// Helper to phrase service term naturally
function cTerm(term) {
  if (term === 'gym' || term === 'fitness center' || term === '24-hour gym') return 'real workouts';
  if (term === 'cardio gym') return 'real cardio';
  if (term === 'red light therapy') return 'recovery';
  return term;
}

// Intent variant page
function renderIntentService(intent, svc, city) {
  const [iSlug, iLabel, iTerm] = intent;
  const [sSlug, sLabel, sTerm] = svc;
  const [cSlug, cName, county, zip, distance] = city;
  let intentPrefix = iSlug === 'near' ? 'near' : iSlug;
  const filename = iSlug === 'near' ? `${sSlug}-near-${cSlug}` : `${iSlug}-${sSlug}-${cSlug}`;
  const url = `${DOMAIN}/${filename}`;
  let title, desc, h1, lede;
  if (iSlug === 'near') {
    title = `${sLabel} Near ${cName}, WA | Armory Fitness Ferndale`;
    desc = `Looking for a ${sTerm} near ${cName}? Armory Fitness in Ferndale is ${distance}. 24-hour access, no sign-up fees, from $43/mo.`;
    h1 = `${sLabel} Near ${cName}`;
    lede = `Closest real ${sTerm} to ${cName}: Armory Fitness in Ferndale, ${distance}. Quiet, full-service, member-friendly. Walk in for a free tour.`;
  } else {
    title = `${iLabel} ${sLabel} in ${cName}, WA | Armory Fitness`;
    desc = `${iLabel} ${sTerm} option for ${cName} residents — Armory Fitness in Ferndale. From $43/mo, 24/7 access, no contracts.`;
    h1 = `${iLabel} ${sLabel} in ${cName}, WA`;
    lede = `If you've been searching for the ${iTerm} ${sTerm} for ${cName}, that's us. Armory Fitness in Ferndale — ${distance}. Real equipment, real coaches, real outcomes.`;
  }
  return `${HEAD(title,desc,url)}
</head><body>
<div class="grain" aria-hidden="true"></div>
${NAV}
<header class="hero hero--page">
  <div class="hero__inner reveal">
    <p class="eyebrow">${cName}, WA → Ferndale</p>
    <h1>${h1}</h1>
    <p class="lede">${lede}</p>
    <div class="hero__cta">
      <a class="btn" href="https://ArmoryFitnessandWellness.as.me/" target="_blank" rel="noopener">Book a Tour</a>
      <a class="btn btn--outline" href="tel:+13603804405">Call 360-380-4405</a>
    </div>
  </div>
</header>

<section><div class="wrap">
  <div class="section-head reveal">
    <div><p class="eyebrow">What you get</p><h2>The whole gym, ${distance}.</h2></div>
    <p>Strength floor, free weights, full cardio, classes (cycle, yoga, HIIT, metabolic conditioning), and a recovery wing — cold plunge, infrared sauna, red light bed, contrast therapy. All for the same monthly rate.</p>
  </div>
  <div class="pillars__grid reveal">
    <article class="pillar"><h3 class="pillar__title"><a href="/${sSlug}-${cSlug}" style="color:inherit">All ${sLabel} options</a></h3><p class="pillar__body">See every ${sTerm} program available to ${cName} residents at Armory.</p></article>
    <article class="pillar"><h3 class="pillar__title"><a href="/membership" style="color:inherit">Membership rates</a></h3><p class="pillar__body">$43/mo for the gym floor + recovery. Add Unlimited Classes for the full menu.</p></article>
    <article class="pillar"><h3 class="pillar__title"><a href="/schedule" style="color:inherit">Class schedule</a></h3><p class="pillar__body">See what's running this week.</p></article>
    <article class="pillar"><h3 class="pillar__title"><a href="/recovery" style="color:inherit">Recovery wing</a></h3><p class="pillar__body">Cold plunge, sauna, red light, contrast therapy. Pay-per-session or punch card.</p></article>
  </div>
</div></section>

${CTA_STRIP(cName)}
${FOOTER_FORM}
${FOOTER}`;
}

// "Gyms in {city}" hub page
function renderCityHub(city) {
  const [cSlug, cName, county, zip, distance] = city;
  const url = `${DOMAIN}/gyms-in-${cSlug}`;
  const title = `Gyms in ${cName}, WA — and the Closest Alternative | Armory Fitness`;
  const desc = `Looking for gyms in ${cName}, WA? Armory Fitness in Ferndale is ${distance} — 24-hour access, full equipment, recovery wing, classes. From $43/mo.`;
  const topServices = SERVICES.slice(0, 12);
  return `${HEAD(title,desc,url)}
</head><body>
<div class="grain" aria-hidden="true"></div>
${NAV}
<header class="hero hero--page">
  <div class="hero__inner reveal">
    <p class="eyebrow">${cName}, WA</p>
    <h1>Gyms in ${cName}, WA</h1>
    <p class="lede">Most ${cName} gym-shoppers eventually drive to Ferndale. Armory Fitness is ${distance} from ${cName} — 24-hour access, full strength + cardio + recovery, classes, personal training. From $43/mo.</p>
    <div class="hero__cta">
      <a class="btn" href="https://ArmoryFitnessandWellness.as.me/" target="_blank" rel="noopener">Book a Tour</a>
      <a class="btn btn--outline" href="tel:+13603804405">Call 360-380-4405</a>
    </div>
  </div>
</header>

<section><div class="wrap">
  <div class="section-head reveal">
    <div><p class="eyebrow">For ${cName} residents</p><h2>Every program ${cName} members use.</h2></div>
    <p>Click any of these to see exactly how it works for ${cName} residents at Armory:</p>
  </div>
  <div class="pillars__grid reveal">
    ${topServices.map(s=>`<article class="pillar"><h3 class="pillar__title"><a href="/${s[0]}-${cSlug}" style="color:inherit">${s[1]} in ${cName}</a></h3><p class="pillar__body">${s[1]} for ${cName} residents at Armory Fitness in Ferndale.</p></article>`).join('')}
  </div>
</div></section>

${CTA_STRIP(cName)}
${FOOTER_FORM}
${FOOTER}`;
}

// =========================================================================
// EXECUTE
// =========================================================================
let count = 0;
const sitemapUrls = ['', 'classes', 'schedule', 'training', 'hyrox', 'recovery', 'nutrition', 'about', 'contact', 'membership'];

console.log(`Generating city x service pages: ${CITIES.length} x ${SERVICES.length}`);
for (const city of CITIES) {
  for (const svc of SERVICES) {
    const fn = `${svc[0]}-${city[0]}.html`;
    fs.writeFileSync(path.join(ROOT, fn), renderCityService(svc, city));
    sitemapUrls.push(fn.replace(/\.html$/,''));
    count++;
  }
}
console.log(`  ${count} city+service pages`);

console.log(`Generating intent x top-service pages: ${CITIES.length} x ${TOP_SERVICES.length} x ${INTENTS.length}`);
for (const city of CITIES) {
  for (const sSlug of TOP_SERVICES) {
    const svc = SERVICES.find(s=>s[0]===sSlug);
    if (!svc) continue;
    for (const intent of INTENTS) {
      const fn = intent[0] === 'near' ? `${svc[0]}-near-${city[0]}.html` : `${intent[0]}-${svc[0]}-${city[0]}.html`;
      fs.writeFileSync(path.join(ROOT, fn), renderIntentService(intent, svc, city));
      sitemapUrls.push(fn.replace(/\.html$/,''));
      count++;
    }
  }
}
console.log(`  ${count} total after intents`);

console.log(`Generating city hub pages: ${CITIES.length}`);
for (const city of CITIES) {
  const fn = `gyms-in-${city[0]}.html`;
  fs.writeFileSync(path.join(ROOT, fn), renderCityHub(city));
  sitemapUrls.push(fn.replace(/\.html$/,''));
  count++;
}
console.log(`  ${count} total`);

// Write sitemap
console.log(`Writing sitemap with ${sitemapUrls.length} URLs...`);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(u => `  <url><loc>${DOMAIN}/${u}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);

console.log(`\nDONE. ${count} pages, sitemap: ${sitemapUrls.length} URLs.`);
