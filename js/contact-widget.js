/* /js/contact-widget.js
 * Injects a "Contact" CTA in the primary nav (next to Join)
 * and a contact form section just before the footer on every page.
 * All submissions route to armoryfitnessferndale@gmail.com via Formsubmit.co.
 */
(function () {
  if (document.getElementById('contact-form')) return; // double-load guard

  var EMAIL = 'armoryfitnessferndale@gmail.com';
  var NEXT  = 'https://www.armory-fitness.com/?sent=1#contact-form';

  // 1) Contact button next to existing Join button in nav
  var navJoin = document.querySelector('.nav .nav__cta');
  if (navJoin && !document.querySelector('.nav__cta--contact')) {
    var contactBtn = document.createElement('a');
    contactBtn.className = 'btn btn--outline nav__cta nav__cta--contact';
    contactBtn.href = '#contact-form';
    contactBtn.textContent = 'Contact';
    navJoin.parentNode.insertBefore(contactBtn, navJoin);
  }

  // 2) Contact form inserted just before footer
  var footer = document.querySelector('footer.footer');
  if (!footer) return;

  var section = document.createElement('section');
  section.id = 'contact-form';
  section.className = 'contact-form-section';
  section.innerHTML = [
    '<div class="contact-form-section__inner">',
      '<div class="contact-form-section__lede">',
        '<p class="eyebrow">Get in touch</p>',
        '<h2>Questions? <em class="italic-serif">Drop us a line.</em></h2>',
        '<p class="contact-form-section__copy">Membership questions, class info, or a recovery-wing tour &mdash; send a note and we&rsquo;ll get back to you within one business day.</p>',
      '</div>',
      '<form class="contact-form" action="https://formsubmit.co/' + EMAIL + '" method="POST">',
        '<input type="hidden" name="_subject" value="New website inquiry â armory-fitness.com">',
        '<input type="hidden" name="_captcha" value="true">',
        '<input type="hidden" name="_template" value="table">',
        '<input type="hidden" name="_next" value="' + NEXT + '">',
        '<input type="text" name="_honey" tabindex="-1" autocomplete="off" style="display:none">',

        '<div class="form-row">',
          '<label for="cf-name">Name</label>',
          '<input id="cf-name" type="text" name="name" required autocomplete="name">',
        '</div>',
        '<div class="form-row">',
          '<label for="cf-email">Email</label>',
          '<input id="cf-email" type="email" name="email" required autocomplete="email">',
        '</div>',
        '<div class="form-row">',
          '<label for="cf-phone">Phone</label>',
          '<input id="cf-phone" type="tel" name="phone" autocomplete="tel">',
        '</div>',
        '<div class="form-row">',
          '<label for="cf-message">Message</label>',
          '<textarea id="cf-message" name="message" rows="5" required></textarea>',
        '</div>',

        '<button class="btn btn--outline" type="submit">Send Message</button>',
      '</form>',
    '</div>'
  ].join('');

  footer.parentNode.insertBefore(section, footer);
})();
