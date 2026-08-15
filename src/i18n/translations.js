/**
 * Translation dictionary. Nested by section, matching the site's own
 * section structure so a given component only ever reaches into its own
 * branch. English strings are an adaptation, not a literal translation —
 * written to read as real marketing copy in English, not a stiff
 * word-for-word port of the Spanish.
 *
 * Deliberately NOT in here: the movement section's Instagram-style
 * captions and the marquee's chant text. Both stay hardcoded literals in
 * their components regardless of language — they read as authentic
 * multi-language social content, not copy meant to be localized.
 */
export const translations = {
  es: {
    nav: {
      manifiesto: 'Manifiesto',
      sonidos: 'Sonidos',
      drops: 'Drops',
      conecta: 'Conecta',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      logoAriaLabel: 'BeKind Streetwear, inicio',
      logoAlt: 'BeKind Streetwear logo',
    },
    hero: {
      eyebrow: 'Una marca costarricense',
      taglineBefore: 'Cuando la hostilidad se normaliza, ',
      taglineHighlight: 'ser amable te vuelve radical.',
      sub: 'BeKind es una marca costarricense que promueve la amabilidad sobre la violencia. Cuando todos reaccionan, tú eliges ser amable. Eso es radical.',
      ctaDrops: 'Ver los drops',
      ctaFollow: 'Síguenos',
      scroll: 'Scroll',
    },
    manifesto: {
      sectionTitle: 'Manifiesto',
      quoteBefore: 'Cuando todos reaccionan, elegir la amabilidad es ',
      quoteHighlight: 'radical',
      list1: 'Sin positividad de vitrina',
      list2: 'Sin filtro corporativo',
      list3: 'Solo gente, calle, y las agallas de ser decente',
      card1: '¡Hola mundo! BeKind es una marca costarricense que promueve la amabilidad sobre la violencia.',
      card2: 'Cuando todos reaccionan, tú eliges ser amable. Eso es radical — no es debilidad, es una decisión.',
      card3: 'No es un mood board — es un movimiento. Ropa y arte para quienes eligen ser amables a propósito, incluso cuando cuesta algo.',
    },
    sonidos: {
      sectionTitle: 'Sonidos BeKind',
      lede: 'A veces lo más escandaloso que podemos hacer, es escuchar…',
      track1Title: 'Sonidos BeKind — pista 1',
      track2Title: 'Sonidos BeKind — pista 2',
    },
    movement: {
      sectionTitle: 'Sigue el movimiento',
      ctaInstagram: 'Ver en Instagram →',
    },
    designStudio: {
      sectionTitle: 'Estudio de Diseño',
      status: 'En construcción',
      body: 'Fotos y videos del proceso creativo — muy pronto.',
    },
    drops: {
      previewTitle: 'Próximos Drops',
      pageEyebrow: 'Todo lo que viene',
      pageTitle: 'Los Drops',
      headline: 'Ropa que todavía no existe.',
      body: 'Estamos cocinando algo. Cuando caiga, lo vas a saber primero si estás en la lista.',
      cta: 'Avísame cuando caiga',
      previewCta: 'Ver todos los drops →',
    },
    connect: {
      titleBefore: 'Únete al ',
      titleHighlight: 'movimiento',
      copy: 'Sin spam, sin venta blanda — solo aviso de drops, restocks, y lo próximo que tagueemos. Un acto amable a la semana, mínimo.',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'tu@correo.com',
      submitIdle: 'Suscribirme →',
      submitDone: '¡Listo! →',
      submitError: 'Ups, intenta de nuevo →',
      formNote: 'Solo te escribimos cuando vale la pena.',
      stampInstagram: 'Instagram',
      stampTikTok: 'TikTok',
      stampWebsite: 'bekindcr.com',
    },
    footer: {
      tagline: 'BeKind Streetwear © 2025–2026 — una marca costarricense ✨',
      instagram: 'Instagram →',
      tiktok: 'TikTok →',
    },
    meta: {
      title: 'BeKind Streetwear',
      description: 'BeKind es una marca costarricense de streetwear que promueve la amabilidad sobre la violencia.',
      ogLocale: 'es_CR',
    },
  },
  en: {
    nav: {
      manifiesto: 'Manifesto',
      sonidos: 'Sounds',
      drops: 'Drops',
      conecta: 'Connect',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      logoAriaLabel: 'BeKind Streetwear, home',
      logoAlt: 'BeKind Streetwear logo',
    },
    hero: {
      eyebrow: 'A Costa Rican brand',
      taglineBefore: 'When hostility becomes the norm, ',
      taglineHighlight: 'choosing kindness is radical.',
      sub: 'BeKind is a Costa Rican brand that puts kindness before violence. When everyone reacts, you choose kindness instead. That’s radical.',
      ctaDrops: 'See the drops',
      ctaFollow: 'Follow us',
      scroll: 'Scroll',
    },
    manifesto: {
      sectionTitle: 'Manifesto',
      quoteBefore: 'When everyone reacts, choosing kindness is ',
      quoteHighlight: 'radical',
      list1: 'No storefront positivity',
      list2: 'No corporate filter',
      list3: 'Just people, streets, and the guts to be decent',
      card1: 'Hello world! BeKind is a Costa Rican brand that puts kindness before violence.',
      card2: 'When everyone reacts, you choose kindness instead. That’s radical — not weakness, a decision.',
      card3: 'This isn’t a mood board — it’s a movement. Clothes and art for people who choose kindness on purpose, even when it costs them something.',
    },
    sonidos: {
      sectionTitle: 'BeKind Sounds',
      lede: 'Sometimes the loudest thing you can do is listen…',
      track1Title: 'BeKind Sounds — track 1',
      track2Title: 'BeKind Sounds — track 2',
    },
    movement: {
      sectionTitle: 'Follow the movement',
      ctaInstagram: 'See on Instagram →',
    },
    designStudio: {
      sectionTitle: 'Design Studio',
      status: 'Under construction',
      body: 'Photos and video from the creative process — coming soon.',
    },
    drops: {
      previewTitle: 'Coming Drops',
      pageEyebrow: 'Everything that’s coming',
      pageTitle: 'The Drops',
      headline: 'Clothes that don’t exist yet.',
      body: 'We’re cooking something up. When it drops, you’ll be the first to know — if you’re on the list.',
      cta: 'Notify me when it drops',
      previewCta: 'See all the drops →',
    },
    connect: {
      titleBefore: 'Join the ',
      titleHighlight: 'movement',
      copy: 'No spam, no hard sell — just a heads-up on drops, restocks, and whatever we tag next. One kind act a week, minimum.',
      emailLabel: 'Email address',
      emailPlaceholder: 'you@email.com',
      submitIdle: 'Subscribe →',
      submitDone: 'Done! →',
      submitError: 'Something went wrong, retry →',
      formNote: 'We only write when it’s worth it.',
      stampInstagram: 'Instagram',
      stampTikTok: 'TikTok',
      stampWebsite: 'bekindcr.com',
    },
    footer: {
      tagline: 'BeKind Streetwear © 2025–2026 — a Costa Rican brand ✨',
      instagram: 'Instagram →',
      tiktok: 'TikTok →',
    },
    meta: {
      title: 'BeKind Streetwear',
      description: 'BeKind is a Costa Rican streetwear brand that puts kindness before violence.',
      ogLocale: 'en_US',
    },
  },
}
