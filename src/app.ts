const slugs = ['naturama-360-sound-experience', 'arla-commercial-music-composition', 'new-blood-copenhell-105', 'uskyldig', 'deirdre-only-you', 'late-runner-im-a-dinosaur', 'designed-to-be-kept', 'mothland-copenhagen-windowsills', 'quiet-sonia-qs'];
const mothlandArtwork = '/assets/album-cover-3000x3000.png';
const rolesByProject = [
  ['audio-design', 'music-composition', 'creative-production'],
  ['music-composition'],
  ['creative-production', 'interactive-game'],
  ['direction'],
  ['direction', 'video-editing'],
  ['direction', 'video-editing'],
  ['audio-design'],
  ['music-composition'],
  ['music-composition'],
];

type Project = { index: number; title: string; subtitle: string; description: string; meta: string; category: string; image: string };
const selectAll = <T extends Element>(selector: string): T[] => [...document.querySelectorAll<T>(selector)];

function navigateToProject(index: number): void { window.location.href = `/projects/${slugs[index]}`; }

function makeGalleryInteractive(): void {
  const gridItems = selectAll<HTMLElement>('.project-item');
  const listItems = selectAll<HTMLElement>('.list-item');
  [...gridItems, ...listItems].forEach((item, index) => {
    const projectIndex = index % slugs.length;
    item.dataset.project = slugs[projectIndex];
    item.dataset.category = rolesByProject[projectIndex].join(' ');
    if (projectIndex === 7) {
      const image = item.querySelector<HTMLImageElement>('img');
      if (image) { image.src = mothlandArtwork; image.alt = 'Mothland — The Copenhagen Windowsills album cover'; }
    }
    item.tabIndex = 0;
    item.setAttribute('role', 'link');
    item.setAttribute('aria-label', `Open project: ${item.querySelector('h2, h3')?.textContent?.trim() || 'project'}`);
    item.addEventListener('click', () => navigateToProject(projectIndex));
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigateToProject(projectIndex); }
    });
  });
  selectAll<HTMLAnchorElement>('[data-path]').forEach(link => { link.href = link.dataset.path === 'projects' ? '/projects' : `/#${link.dataset.path}`; });
}

function animateFilter(category: string): void {
  const filterButtons = selectAll<HTMLElement>('.filter-btn');
  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === category;
    button.classList.toggle('bg-surface', isActive);
    button.classList.toggle('text-primary', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  for (const selector of ['.project-item', '.list-item']) {
    const items = selectAll<HTMLElement>(selector);
    const firstPositions = new Map(items.filter(item => item.style.display !== 'none').map(item => [item, item.getBoundingClientRect()]));
    const matches = (item: HTMLElement) => category === 'all' || (item.dataset.category || '').split(' ').includes(category);

    items.forEach(item => {
      item.style.willChange = 'opacity, transform';
      if (matches(item) && item.style.display === 'none') {
        item.style.display = 'flex';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.98)';
      }
      if (!matches(item) && item.style.display !== 'none') {
        item.style.transition = 'opacity 160ms ease, transform 160ms ease';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.98)';
      }
    });

    window.setTimeout(() => {
      items.forEach(item => { if (!matches(item)) item.style.display = 'none'; });
      const lastPositions = new Map(items.filter(matches).map(item => [item, item.getBoundingClientRect()]));
      lastPositions.forEach((last, item) => {
        const first = firstPositions.get(item);
        const dx = first ? first.left - last.left : 0;
        const dy = first ? first.top - last.top : 0;
        item.style.transition = 'none';
        item.style.transform = `translate(${dx}px, ${dy}px) ${first ? '' : 'scale(0.98)'}`;
      });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        lastPositions.forEach((_, item) => {
          item.style.transition = 'opacity 220ms ease, transform 420ms cubic-bezier(0.16, 1, 0.3, 1)';
          item.style.opacity = '1';
          item.style.transform = 'translate(0, 0) scale(1)';
        });
      }));
    }, 170);
  }
}

async function projectFromGallery(index: number): Promise<Project | undefined> {
  const response = await fetch('/projects');
  const gallery = new DOMParser().parseFromString(await response.text(), 'text/html');
  const card = gallery.querySelectorAll<HTMLElement>('.project-item')[index];
  if (!card) return undefined;
  const text = (selector: string) => card.querySelector(selector)?.textContent?.trim() || '';
  return { index, title: text('h2'), subtitle: text('h2 + p'), description: text('p.font-body-sm'), meta: text('p.font-meta-technical.text-meta-technical.text-outline.mb-unit-xs'), category: card.dataset.category || 'project', image: card.querySelector<HTMLImageElement>('img')?.src || '' };
}

function updateText(selector: string, value: string): void { const element = document.querySelector<HTMLElement>(selector); if (element && value) element.textContent = value; }

function renderGameCaseStudy(): void {
  const genericCaseStudy = document.getElementById('project-generic-case-study');
  const gameCaseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  genericCaseStudy?.classList.add('hidden');
  if (gameCaseStudy) {
    gameCaseStudy.classList.remove('hidden');
    gameCaseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-6 space-y-6">
          <div>
            <span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 01</span>
            <h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A game scored by the song</h3>
          </div>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">Created as promotion for Copenhell and its 2026 closing act, Chopper, <em>Chopper Runs To Hell</em> turns the band’s track “New Blood” into a playable dramatic arc. The music is not a backdrop: its intro, verses and choruses determine the game’s pace, obstacle rhythm and visual scale.</p>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">I served as Creative Director, Lead Game Designer and Programmer. Brian Raaby of <a class="line21-link" href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21</a> contributed Art Design under my creative direction, while Jonatan Magnussen — Chopper — worked with me to shape a visual identity that belongs in the band’s own universe.</p>
          <div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
            <span class="font-mono text-[11px] uppercase tracking-widest text-[#6f7f68] font-semibold block">Collaborators &amp; credits</span>
            <div class="space-y-3 font-manrope text-sm text-white/75 leading-relaxed"><p><span class="text-white font-medium">Rasmus Jon</span><br>Creative Director, Lead Game Designer &amp; Programmer.</p><p><span class="text-white font-medium">Brian Raaby / <a class="line21-link" href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21</a></span><br>Art Design.</p><p><span class="text-white font-medium">Jonatan Magnussen / Chopper</span><br>Visual identity collaboration, connecting the game to Chopper’s band universe.</p></div>
          </div>
          <div class="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 relative overflow-hidden">
            <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-[#6f7f68]/10 rounded-full blur-2xl pointer-events-none"></div>
            <blockquote class="font-serif italic text-2xl sm:text-3xl text-white/95 leading-snug">Each new section should feel like the next movement in the song — not a level pasted onto it.</blockquote>
            
          </div>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">The opening creates room to listen and move. When the first intense hit arrives, frogs rush in from the horizon; later, dynamic visuals and fireworks lift the choruses into a high-speed release. The changing audiovisual language makes the music’s structure felt through the player’s body.</p>
        </div>
        <div class="lg:col-span-6 space-y-6">
          <div>
            <span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 02</span>
            <h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Learning through play, failure and return</h3>
          </div>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">There is no tutorial. Instead, the game uses a gentle on-ramp: the speed meter slowly drains, then the first pickups reveal that speed can be gained and lost. The first wave of frogs is deliberately startling. A player may fail, restart, learn to dodge, and discover the next challenge a little farther into the track.</p>
          <div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <span class="font-mono text-[11px] uppercase tracking-widest text-[#6f7f68] font-semibold block">Progressive challenge curve</span>
            <p class="font-manrope text-sm text-white/70 leading-relaxed font-light">Every run teaches one readable piece of the game. What first feels overwhelming becomes a learned movement — almost a dance — giving the player the satisfaction of mastering a section before the next surprise arrives.</p>
            <div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// NO TEXT TUTORIAL</span><span>// LEARN BY DOING</span><span class="text-[#6f7f68]">// RETRIES SHOW PROGRESS</span></div>
          </div>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">A visible progress marker shows that the game has an ending and makes each improved attempt tangible. That finite goal creates curiosity about what is still ahead, while the player’s growing confidence turns early nervousness into determination.</p>
        </div>
      </div>
      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 03</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">UI that speaks instantly</h3></div>
        <div class="lg:col-span-8 space-y-5"><p class="font-manrope text-white/70 leading-relaxed font-light text-base">The interface is designed to keep the player in the music rather than pull them out of it. The draining speed meter, score and progress marker make the core state of the run legible at a glance. Pick up an item and the meter responds immediately; its effect is then felt in the runner’s speed and seen in the score. That instant feedback makes the system understandable without a tutorial.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Together, those cues create a clear feedback loop: act, see the consequence, feel the change, then make the next decision. The finite progress marker also turns every failed run into useful information — the player can see that they reached farther and has a concrete reason to try again.</p></div>
      </div>
      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 04</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Speed is the choice</h3></div>
        <div class="lg:col-span-8 space-y-5"><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Power-ups replenish the draining speed meter. More speed makes the run more intense and raises the score exponentially, but it also makes every obstacle harder to read and avoid. Ignoring too many pickups is dangerous too: when the meter reaches zero, the runner stops and the run ends.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">That risk–reward loop gives the player real agency. Some sections reward collecting everything; in another, players learn that avoiding a dense cluster of power-ups is the only way to survive what follows. The choruses deliberately offer a reward state: the player is fast, fireworks are firing and the score surges, while the route becomes momentarily more forgiving. Through timing and memory, players learn the song’s terrain without being told how.</p></div>
      </div>
      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 05</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A challenge that welcomes everyone</h3></div>
        <div class="lg:col-span-8 space-y-5"><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Player observation and experience data were central to assessing the game. The intention was to make a run that could challenge a practiced gamer and someone who rarely plays games, without asking either group to accept a lesser experience.</p><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"><span class="font-mono text-[11px] uppercase tracking-widest text-[#6f7f68] font-semibold block">Playtest outcome</span><p class="font-manrope text-sm text-white/70 leading-relaxed font-light">Gamers and non-gamers reached completion in roughly the same number of attempts. Both groups encountered real pressure, learned the systems at their own pace and experienced the release of getting through the song.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// ACCESSIBLE ENTRY</span><span>// SHARED CHALLENGE</span><span class="text-[#6f7f68]">// EARNED COMPLETION</span></div></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">This balance comes from a difficulty curve that teaches rather than filters people out. The game gives every player a route to mastery, while keeping the escalation, surprise and excitement intact. The result is an experience where a broad mix of players can win — and feel that they earned it.</p></div>
      </div>`;
  }
  if (commission) commission.innerHTML = `
    <div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#6f7f68]/10 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#6f7f68]"></span><span>Interactive commissions</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Have an idea for a music-led game or interactive campaign?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I create playable experiences that make story, audience and soundtrack move together.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#6f7f68] hover:bg-[#879580] text-white font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold shadow-[0_0_25px_rgba(111,127,104,0.35)]" href="mailto:rasmus.jon@outlook.com?subject=Interactive%20Game%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}

function renderDesignedToBeKeptCaseStudy(): void {
  const genericCaseStudy = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  genericCaseStudy?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-6 space-y-6"><div><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 01</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A sound world between memory and possibility</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base"><em>Designed To Be Kept</em> is the 2025 graduation documentary for Fashion and Textile Design at the Royal Danish Academy. It follows twelve designers from nine nationalities as research, experimentation and craft become collections — each carrying personal memories, childhood references and cultural histories into the future.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">I created the film’s sound and music identity to hold that tension between past and future. Nostalgic musical gestures, tactile sound and a restrained mix give the designers’ individual stories a shared emotional thread, without flattening their distinct voices.</p><div class="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 relative overflow-hidden"><blockquote class="font-serif italic text-2xl sm:text-3xl text-white/95 leading-snug">The sound needed to feel like a memory in motion: familiar enough to recognise, open enough to become something new.</blockquote></div></div>
        <div class="lg:col-span-6 space-y-6"><div><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 02</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Mixing twelve distinct creative voices</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">The film had to make room for twelve different practices while keeping a coherent narrative line. As re-recording mixer, I shaped dialogue, location sound, music and the rhythm of transitions into a balanced whole that can move between intimate process moments and the wider ambition of the graduating class.</p><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"><span class="font-mono text-[11px] uppercase tracking-widest text-[#6f7f68] font-semibold block">Sound approach</span><p class="font-manrope text-sm text-white/70 leading-relaxed font-light">The mix gives texture to material, gesture and work-in-progress, while allowing the interviews and the collections to remain in focus. It creates continuity across the documentary without making twelve separate visions sound the same.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// MUSIC IDENTITY</span><span>// DOCUMENTARY MIX</span><span class="text-[#6f7f68]">// HUMAN VOICE FIRST</span></div></div></div>
      </div>
      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 03</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Interviewing through care</h3></div><div class="lg:col-span-8 space-y-5"><p class="font-manrope text-white/70 leading-relaxed font-light text-base">I also joined the shoots as interviewer. Drawing on my training in theatre process leadership, I helped create a calm, trusting interview situation where participants could speak more freely and personally about their work.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">That approach strengthened the documentary’s sound work too: the more open and specific the conversations, the more clearly the film could carry each designer’s perspective. It allowed the interviews to feel less like explanation and more like an encounter with the people behind the collections.</p></div></div>
      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Credits</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A shared documentary process</h3></div><div class="lg:col-span-8"><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4"><div class="space-y-3 font-manrope text-sm text-white/75 leading-relaxed"><p><span class="text-white font-medium">Rasmus Jon</span><br>Sound &amp; Music Identity, Re-recording Mixer &amp; Interviewer.</p><p><span class="text-white font-medium">Brian Raaby / <a class="line21-link" href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21</a></span><br>Director &amp; Cinematographer.</p></div></div></div></div>`;
  }
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#6f7f68]/10 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#6f7f68]"></span><span>Film sound &amp; music</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for a sound identity that carries your film’s story?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I develop music, sound and mixes that give documentary stories their own emotional space.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#6f7f68] hover:bg-[#879580] text-white font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold shadow-[0_0_25px_rgba(111,127,104,0.35)]" href="mailto:rasmus.jon@outlook.com?subject=Film%20Sound%20and%20Music%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}

function renderNaturamaCaseStudy(): void {
  const genericCaseStudy = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  genericCaseStudy?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.classList.replace('py-20', 'pt-4');
    caseStudy.classList.add('pb-20');
    caseStudy.innerHTML = `
      <div class="naturama-intro-grid grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"><div class="naturama-intro-chapter lg:col-span-6 space-y-6"><div><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 01</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">An Immersive Audio Journey</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Naturama 360° Sound Experience was a 20-minute audio journey for thirty people at a time, experienced together in darkness in Naturama’s large hall. Eight speakers formed a circle around the audience, placing sound in every direction — in front, behind, beside, above and below the listening position.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Spatial audio means I can compose not only with sound itself, but with where it is and how it moves. The journey begins inside a spacecraft preparing for launch, sends the audience into space, crashes them onto an unknown planet, carries them through a jungle and tropical rain, and ends with a radio message that their location has been found and help is coming.</p><div class="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10"><p class="font-serif italic text-2xl sm:text-3xl text-white/95 leading-snug">Have you noticed how the sound of an ambulance changes as it passes by?</p></div></div><div class="naturama-intro-chapter naturama-intro-chapter--two lg:col-span-6 space-y-6"><div><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 02</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Sound as a physical experience</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">An experience like this is not simply a matter of choosing a spaceship beep or the sound of waves: it requires an understanding of how waves change through time, movement, space and atmosphere. The launch used low bass to make the room physically shake, while the water sequences used EQ and volume automation to move between the muffled pressure of being underwater and the open detail of waves breaking around the listener.</p><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"><span class="font-mono text-[11px] uppercase tracking-widest text-[#6f7f68] font-semibold block">Physical sound design</span><p class="font-manrope text-sm text-white/70 leading-relaxed font-light">Distance is not created by volume alone. Low frequencies travel farther than bright, high frequencies, so frequency content, pitch, timing, motion and reflections all change as a sound source moves. Our ears also receive sound differently when it comes from behind or above, because the shape of the head and outer ear filters the sound before it reaches us. Sound behaves differently through water than through air, and Doppler effects make a moving source change in pitch and perceived timing as it approaches, passes and recedes.</p><p class="font-manrope text-sm text-white/70 leading-relaxed font-light">I used these principles to make sounds feel close, distant, overhead, underwater and in motion. Alongside the sound, drinks with metallic, bitter flavours in space and sweet tropical flavours in the jungle added a second sensory layer to the journey.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// 8-SPEAKER ARRAY</span><span>// PHYSICAL AUDIO</span><span class="text-[#6f7f68]">// 360° STORYTELLING</span></div></div></div></div>
      <section class="mt-2 pt-3 space-y-8" aria-labelledby="naturama-listen-title">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"><div><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Interactive listening model</span><h3 id="naturama-listen-title" class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Step inside the eight-speaker mix</h3></div><p class="font-manrope text-sm text-white/60 leading-relaxed font-light max-w-xl">This headphone experience maps the original eight speaker channels and sub material into a binaural approximation. Select a speaker or pair to isolate its contribution.</p></div>
        <div id="naturama-emulator" class="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] px-5 py-4 sm:px-8 sm:py-5" data-ready="false">
          <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-8 items-center">
            <div class="relative mx-auto w-full max-w-[520px] aspect-square" aria-label="Eight-speaker listening map">
              <div class="absolute inset-[17%] rounded-full border border-white/10 bg-black/20"></div><div class="absolute inset-[34%] rounded-full border border-[#6f7f68]/40 bg-[#6f7f68]/5 flex items-center justify-center"><span class="font-mono text-[10px] tracking-widest text-white/60 uppercase text-center">Listener<br>position</span></div>
              <button type="button" data-naturama-speaker="0" class="naturama-speaker absolute left-1/2 top-0 -translate-x-1/2 w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 1">01</button><button type="button" data-naturama-speaker="1" class="naturama-speaker absolute right-[9%] top-[9%] w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 2">02</button><button type="button" data-naturama-speaker="2" class="naturama-speaker absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 3">03</button><button type="button" data-naturama-speaker="3" class="naturama-speaker absolute right-[9%] bottom-[9%] w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 4">04</button><button type="button" data-naturama-speaker="4" class="naturama-speaker absolute left-1/2 bottom-0 -translate-x-1/2 w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 5">05</button><button type="button" data-naturama-speaker="5" class="naturama-speaker absolute left-[9%] bottom-[9%] w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 6">06</button><button type="button" data-naturama-speaker="6" class="naturama-speaker absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 7">07</button><button type="button" data-naturama-speaker="7" class="naturama-speaker absolute left-[9%] top-[9%] w-12 h-12 rounded-full border border-white/25 bg-[#15161b] text-white font-mono text-xs transition" aria-label="Isolate speaker 8">08</button>
            </div>
            <div class="space-y-5"><div class="flex gap-3"><button type="button" id="naturama-play" class="flex-1 px-4 py-3 rounded-lg bg-[#6f7f68] hover:bg-[#879580] text-white font-mono text-[11px] uppercase tracking-widest transition">Start Journey</button><button type="button" id="naturama-reset" class="px-4 py-3 rounded-lg border border-white/15 text-white/70 hover:text-white font-mono text-[11px] uppercase tracking-widest transition">Stop Journey</button></div><div class="space-y-2"><div id="naturama-chapters" class="flex w-full gap-px overflow-hidden rounded-md border border-white/10 bg-white/5" aria-label="Journey chapters"><button type="button" data-naturama-chapter="0" data-start="0" class="naturama-chapter min-w-0 bg-white/[0.03] px-1.5 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:111" title="Capsule · 0:00–1:50">Capsule</button><button type="button" data-naturama-chapter="1" data-start="111" class="naturama-chapter min-w-0 bg-white/[0.03] px-1 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:60" title="Liftoff · 1:51–2:50">Liftoff</button><button type="button" data-naturama-chapter="2" data-start="171" class="naturama-chapter min-w-0 bg-white/[0.03] px-1.5 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:100" title="Space · 2:51–4:30">Space</button><button type="button" data-naturama-chapter="3" data-start="271" class="naturama-chapter min-w-0 bg-white/[0.03] px-1 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:80" title="Crash · 4:31–5:50">Crash</button><button type="button" data-naturama-chapter="4" data-start="351" class="naturama-chapter min-w-0 bg-white/[0.03] px-1.5 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:120" title="Water · 5:51–7:50">Water</button><button type="button" data-naturama-chapter="5" data-start="471" class="naturama-chapter min-w-0 bg-white/[0.03] px-1 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:80" title="Outside · 7:51–9:10">Outside</button><button type="button" data-naturama-chapter="6" data-start="551" class="naturama-chapter min-w-0 bg-white/[0.03] px-1.5 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:85" title="Jungle · 9:11–10:35">Jungle</button><button type="button" data-naturama-chapter="7" data-start="636" class="naturama-chapter min-w-0 bg-white/[0.03] px-1 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:70" title="Monster · 10:36–11:45">Monster</button><button type="button" data-naturama-chapter="8" data-start="706" class="naturama-chapter min-w-0 bg-white/[0.03] px-1 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:65" title="Cloudburst · 11:46–12:50">Cloudburst</button><button type="button" data-naturama-chapter="9" data-start="771" class="naturama-chapter min-w-0 bg-white/[0.03] px-1 py-2 font-mono text-[10px] leading-tight tracking-[0.06em] text-white/70 hover:bg-[#6f7f68]/25 hover:text-white transition" style="flex-grow:45" title="Rescue · 12:51–end">Rescue</button></div><input id="naturama-seek" class="w-full accent-[#6f7f68] cursor-pointer" type="range" min="0" max="1000" value="0" aria-label="Seek through the Naturama sound journey"><div class="flex justify-between font-mono text-[9px] text-brand-muted tracking-widest"><span id="naturama-current-time">00:00</span><span id="naturama-duration">LOADING DURATION</span></div></div><div class="space-y-3"><label class="block font-mono text-[10px] text-brand-muted uppercase tracking-widest">Master level <input id="naturama-master" class="w-full accent-[#6f7f68] mt-2" type="range" min="0" max="100" value="80"></label><label class="block font-mono text-[10px] text-brand-muted uppercase tracking-widest">Subwoofer material <input id="naturama-sub" class="w-full accent-[#6f7f68] mt-2" type="range" min="0" max="100" value="55"></label></div></div>
          </div>
          <div class="mt-7 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2"><button type="button" data-naturama-pair="0" class="naturama-pair rounded-lg border border-white/10 px-3 py-2 text-left hover:border-[#6f7f68]/70 transition"><span class="block font-mono text-[10px] text-white">01 / 02</span><span class="block font-mono text-[9px] text-brand-muted mt-1">STEREO PAIR</span></button><button type="button" data-naturama-pair="1" class="naturama-pair rounded-lg border border-white/10 px-3 py-2 text-left hover:border-[#6f7f68]/70 transition"><span class="block font-mono text-[10px] text-white">03 / 04</span><span class="block font-mono text-[9px] text-brand-muted mt-1">STEREO PAIR</span></button><button type="button" data-naturama-pair="2" class="naturama-pair rounded-lg border border-white/10 px-3 py-2 text-left hover:border-[#6f7f68]/70 transition"><span class="block font-mono text-[10px] text-white">05 / 06</span><span class="block font-mono text-[9px] text-brand-muted mt-1">STEREO PAIR</span></button><button type="button" data-naturama-pair="3" class="naturama-pair rounded-lg border border-white/10 px-3 py-2 text-left hover:border-[#6f7f68]/70 transition"><span class="block font-mono text-[10px] text-white">07 / 08</span><span class="block font-mono text-[9px] text-brand-muted mt-1">STEREO PAIR</span></button></div>
        </div>
      </section>      <div class="naturama-chapter-three mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 03</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Mixing a world in 360 degrees</h3></div><div class="lg:col-span-8 space-y-5"><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Mixing for a circle of speakers is very different from mixing a normal stereo track. I designed each sound’s position, distance and movement so wind, water and creatures could travel around the room. Music enters at key moments — launch, crash, jungle and rainfall — to make the dramatic shifts felt as well as heard.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">I used automation to continuously move sounds between the eight speakers and shape their level and tone. The result lets a sound orbit the audience, approach from behind or disappear into the distance — turning the room itself into part of the composition.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">This required a specialised workflow across Ableton Live 12, Envelop for Live (E4L Source Panner, E4L Master Bus and Octagon/Octo mapping), Dante Virtual Soundcard, Dante Controller, binaural 3rd-order monitoring and Naturama’s Dante-based playback system. I automated azimuth, elevation and spread while testing and routing the spatial mix on site.</p></div></div>
      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Credits</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">An experience for ear, body and taste</h3></div><div class="lg:col-span-8"><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10"><div class="space-y-3 font-manrope text-sm text-white/75 leading-relaxed"><p><span class="text-white font-medium">Rasmus Jon</span><br>Sound Designer, Composer &amp; Spatial Audio Mixer.</p><p><span class="text-white font-medium">Naturama</span><br>Exhibition venue and experience hall.</p></div></div></div></div>`;
  }
  const naturamaIntroGrid = caseStudy?.querySelector<HTMLElement>('.naturama-intro-grid');
  const naturamaChapterThree = caseStudy?.querySelector<HTMLElement>('.naturama-chapter-three');
  if (naturamaIntroGrid && naturamaChapterThree) naturamaIntroGrid.append(naturamaChapterThree);
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#6f7f68]/10 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#6f7f68]"></span><span>Spatial sound experiences</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for sound that changes the way a room feels?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I design spatial sound and music experiences that make audiences listen with their whole body.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#6f7f68] hover:bg-[#879580] text-white font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold shadow-[0_0_25px_rgba(111,127,104,0.35)]" href="mailto:rasmus.jon@outlook.com?subject=Spatial%20Audio%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}

function renderArlaCaseStudy(): void {
  const genericCaseStudy = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  genericCaseStudy?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-5 space-y-5"><div><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 01</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">One motif, a whole journey</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base"><em>From Farm To Fridge</em> is an Arla brand film made by GotFat Productions. Its story moves from cows in open farmland, through the people and processes behind production, to a family table at home. I composed and produced an original stereo score to give that journey a clear, affectionate musical identity.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">The composition begins with three horn notes drawn from a major chord: middle, down, then up. This melodic cell becomes the film’s signature motif, transformed across horn, cello, guitar and strings while remaining recognisable.</p><div class="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10"><p class="font-serif italic text-2xl sm:text-3xl text-white/95 leading-snug">I wanted the melody to work like a familiar memory: always present in its shape, even as its sound and setting change.</p></div></div>
        <div class="lg:col-span-7"><div class="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/15 relative overflow-hidden"><div class="absolute -right-12 -bottom-16 w-64 h-64 bg-[#6f7f68]/10 rounded-full blur-3xl pointer-events-none"></div><div class="relative z-10 space-y-5"><span class="font-mono text-[11px] uppercase tracking-widest text-[#6f7f68] font-semibold block">Chapter 02</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">I let the film’s storytelling lead the music.</h3><p class="font-manrope text-white/75 text-lg leading-relaxed font-light">I studied GotFat Productions’ visual storytelling closely and worked with them to shape the score around their vision for the film. The images defined the musical purpose and pacing: the horn’s natural reverb meets the scale of the farmland; as the story moves closer to people and food, cello and acoustic guitar bring intimacy, warmth and care.</p><p class="font-manrope text-white/75 text-lg leading-relaxed font-light">When the film enters production, metallic bowls, industrial percussion and a ticking rhythmic layer bring machinery, conveyor belts and steady work into the score. As the story returns to tasting, ageing and the people behind the products, the acoustic guitar restores a calm pulse. Strings then gather the score’s earlier materials into a climax before the original three horn notes return with the Arla logo. Each decision responds to what the audience sees, allowing the score and film to develop as one story.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// STEREO SCORE</span><span>// SCORE TO PICTURE</span><span class="text-[#6f7f68]">// CREATIVE COLLABORATION</span></div></div></div></div>
      </div>      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Chapter 03</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Giving Arla a musical identity</h3></div><div class="lg:col-span-8 space-y-5"><p class="font-manrope text-white/70 leading-relaxed font-light text-base">My role was not only to support the film with music, but to make its values audible. Arla’s story is built on familiarity, care, Danish food culture and the people whose work turns a simple beginning on the farm into something shared at home. I translated those qualities into a melodic identity that could feel warm, immediate and memorable.</p><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"><span class="font-mono text-[11px] uppercase tracking-widest text-[#6f7f68] font-semibold block">Musical identity</span><p class="font-manrope text-sm text-white/70 leading-relaxed font-light">The three-note motif works as a musical signature: concise enough to recognise at first hearing, but rich enough to carry the entire composition. By returning in transformed forms across different instruments and ending in its most minimal form with the Arla logo, it gives Arla a coherent sonic identity that points both to heritage and to what comes next.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// MELODIC SIGNATURE</span><span>// WARMTH &amp; FAMILIARITY</span><span class="text-[#6f7f68]">// ARLA IDENTITY</span></div></div></div></div>
      <div class="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest block mb-2">Credits</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Brand identity in sound</h3></div><div class="lg:col-span-8"><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10"><div class="space-y-3 font-manrope text-sm text-white/75 leading-relaxed"><p><span class="text-white font-medium">Rasmus Jon</span><br>Composer &amp; Producer.</p><p><span class="text-white font-medium">GotFat Productions</span><br>Film production.</p></div></div></div></div>`;
  }
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#6f7f68]/10 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#6f7f68] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#6f7f68]"></span><span>Music for film &amp; brands</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for a musical identity your audience can recognise?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I compose and produce music that gives films and brands a memorable emotional shape.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#6f7f68] hover:bg-[#879580] text-white font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold shadow-[0_0_25px_rgba(111,127,104,0.35)]" href="mailto:rasmus.jon@outlook.com?subject=Music%20Composition%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}

function makeArlaImagePlayer(viewport: HTMLElement): void {
  if (viewport.querySelector('.arla-image-player')) return;
  viewport.classList.add('arla-audio-viewport');
  const audio = new Audio('/assets/arla-jingle.wav');
  audio.preload = 'metadata';
  const player = document.createElement('div');
  player.className = 'arla-image-player';
  player.innerHTML = `<button type="button" class="arla-image-play" aria-label="Play Arla jingle"><span class="material-symbols-outlined">play_arrow</span></button><span class="arla-image-time arla-image-current">00:00</span><input class="arla-image-timeline" type="range" min="0" max="1000" value="0" aria-label="Arla jingle progress"><span class="arla-image-time arla-image-duration">--:--</span>`;
  viewport.append(player);
  const play = player.querySelector<HTMLButtonElement>('.arla-image-play');
  const icon = play?.querySelector<HTMLElement>('.material-symbols-outlined');
  const timeline = player.querySelector<HTMLInputElement>('.arla-image-timeline');
  const current = player.querySelector<HTMLElement>('.arla-image-current');
  const duration = player.querySelector<HTMLElement>('.arla-image-duration');
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  const sync = () => {
    if (current) current.textContent = formatTime(audio.currentTime || 0);
    if (timeline && Number.isFinite(audio.duration) && audio.duration > 0) timeline.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
  };
  audio.addEventListener('loadedmetadata', () => { if (duration) duration.textContent = formatTime(audio.duration); });
  audio.addEventListener('timeupdate', sync);
  audio.addEventListener('play', () => { if (icon) icon.textContent = 'pause'; play?.setAttribute('aria-label', 'Pause Arla jingle'); });
  audio.addEventListener('pause', () => { if (icon) icon.textContent = 'play_arrow'; play?.setAttribute('aria-label', 'Play Arla jingle'); });
  audio.addEventListener('ended', () => { audio.currentTime = 0; sync(); });
  play?.addEventListener('click', () => { if (audio.paused) void audio.play(); else audio.pause(); });
  timeline?.addEventListener('input', () => { if (Number.isFinite(audio.duration)) { audio.currentTime = (Number(timeline.value) / 1000) * audio.duration; sync(); } });
}
function renderUskyldigCaseStudy(): void {
  const generic = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  generic?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-6 space-y-6">
          <div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Chapter 01</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A musical that makes room for complexity</h3></div>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base"><em>Uskyldig?</em> is an autofictional sex musical staged at uKirke on Vesterbro. Starting from lived experience, it opens a space for desire, consent, shame and the cultural stories that shape how bodies are allowed to feel.</p>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">The work grew from a DIY collaboration across generations. Twelve life-based scenes become a loose collage rather than a lesson: intimate stories, music and movement meet without prescribing a single way to understand sex or innocence.</p>
        </div>
        <div class="lg:col-span-6 space-y-6">
          <div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Chapter 02</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Co-directing through process</h3></div>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">As co-director and theatre process lead, I designed the rehearsal process that let the performers develop the material from inside the room. I used improvisation exercises and attention practices to build trust, sharpen shared awareness and turn personal material into playable situations.</p>
          <p class="font-manrope text-white/70 leading-relaxed font-light text-base">We shaped scenes through improvised dance and improvised acting rather than locking a fixed performance too early. The result is loose, responsive theatre: performance and story emerge through the performers’ bodies, timing and listening, allowing each scene to become newly alive in the moment it is played.</p>
          <div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"><span class="font-mono text-[11px] uppercase tracking-widest text-[#dbcb26] font-semibold block">Process design</span><p class="font-manrope text-sm text-white/70 leading-relaxed font-light">Improvisation created a common language between performers with different experience levels. Attention exercises helped the ensemble notice space, rhythm and each other, so the work could remain open while retaining its dramaturgical direction.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// IMPROVISED DANCE</span><span>// LIVE ACTING</span><span class="text-[#dbcb26]">// EMERGENCE IN PERFORMANCE</span></div></div>
        </div>
      </div>`;
  }
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#364d4f]/20 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#dbcb26]"></span><span>Theatre &amp; performance</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for a process that gives performers room to surprise you?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I design collaborative processes for theatre and performance that keep the work attentive, embodied and alive.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#dbcb26] hover:bg-[#e6d743] text-[#171917] font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold" href="mailto:rasmus.jon@outlook.com?subject=Theatre%20Process%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}
function renderOnlyYouCaseStudy(): void {
  const generic = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  generic?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-5 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Only You</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A day shaped by absence</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">For Deirdre’s single <em>Only You</em>, the video follows a solitary day in Copenhagen: waking alone, making breakfast for one, moving through the city and returning to an empty apartment. The film holds the song’s tension between easygoing movement and a more difficult sense of longing.</p></div>
        <div class="lg:col-span-7 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Co-direction</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Letting performance lead the story</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">I co-directed the video with <a class="line21-link" href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21</a> (Brian Raaby), focusing on emergent performance and storytelling. Rather than over-directing each beat, we made room for gestures, timing and small shifts in presence to carry the emotional narrative.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// CO-DIRECTION</span><span>// EMERGENT PERFORMANCE</span><span class="text-[#dbcb26]">// VISUAL STORYTELLING</span></div></div>
      </div>`;
  }
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#364d4f]/20 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#dbcb26]"></span><span>Music video direction</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for a visual world around a song?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I co-create music videos that let a performer and a song set the emotional pace.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#dbcb26] hover:bg-[#e6d743] text-[#171917] font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold" href="mailto:rasmus.jon@outlook.com?subject=Music%20Video%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}
function renderDinosaurCaseStudy(): void {
  const generic = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  generic?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-5 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">I’m a Dinosaur</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Making space to play</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">For Late Runner’s <em>I’m a Dinosaur</em>, we worked from the idea that performance becomes strongest when the musician can stop monitoring every move and begin to play.</p></div>
        <div class="lg:col-span-7 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Co-direction &amp; edit</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Building confidence into the take</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">I co-directed and edited the video with <a class="line21-link" href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21</a> (Brian Raaby). My focus was to develop Late Runner’s confidence on camera and reduce self-consciousness through the shoot, creating room for a looser, more spontaneous performance. The edit protects those moments of release and lets the musician’s presence guide the film.</p><div class="pt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-brand-muted tracking-widest"><span>// CO-DIRECTION</span><span>// EDITING</span><span class="text-[#dbcb26]">// PERFORMANCE DEVELOPMENT</span></div></div>
      </div>`;
  }
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#364d4f]/20 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#dbcb26]"></span><span>Music video direction</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for a visual world around a song?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I co-create music videos that let a performer and a song set the emotional pace.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#dbcb26] hover:bg-[#e6d743] text-[#171917] font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold" href="mailto:rasmus.jon@outlook.com?subject=Music%20Video%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}
function renderMothlandCaseStudy(): void {
  const generic = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  generic?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-6 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">What Is Mothland</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A dark, escapist sonic world</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">What Is Mothland is an ambient rock project moving between early post-rock, jazz harmony, the melody and theatre of 1980s pop, classical minimalism and electronic sound design. These materials meet in songs and slowly unfolding, more abstract musical experiences.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">The album lives in a hypnagogic space between reality and fantasy, where inner and outer worlds begin to dissolve. It holds both the urge to disappear into a dark dream world where you feel understood, and the longing to wake up and find a place in the real one.</p></div>
        <div class="lg:col-span-6 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Deep listening</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">From an old upright piano</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">The project began around fifteen years ago, with absent-minded notes on an old upright piano in the evenings. That private ritual brought calm and complete focus, becoming an early practice in deep listening and more deliberate improvisation.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Loneliness is both prison and refuge here: a place to withdraw, listen closely and shape a world that can eventually return you to reality.</p></div>
      </div>
      <div class="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Credits</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">The Copenhagen Windowsills</h3></div><div class="lg:col-span-8"><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4 font-manrope text-sm text-white/70 leading-relaxed"><p><strong class="text-white">Released June 29, 2026</strong><br>All songs written, recorded, produced and mixed by Rasmus Jon. Stem-mix and additional mix by Nikolaj Bruus. Mastering by Morten Bue. Cover painting by Anders Sprogøe. Artwork design by Rasmus Jon and Brian Raaby.</p><p><strong class="text-white">Performers</strong><br>Rasmus Jon — vocals, guitars, piano, organ, synthesizers, violins, percussion, electronic instruments, field recordings and drums.<br>Emily Endersen — vocals · Jens Marl — drums · Alexander Care — bass · Nikolaj Bruus — guitars.</p><p>With support from KODA Kultur.<br>℗ 2026 Pink Cotton Candy Records · © 2026 Copenhagen Windowsills.</p></div></div></div>`;
  }
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#364d4f]/20 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#dbcb26]"></span><span>Independent music</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for music with its own world?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I write, produce and shape independent music projects from the first sound to the final record.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#dbcb26] hover:bg-[#e6d743] text-[#171917] font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold" href="mailto:rasmus.jon@outlook.com?subject=Independent%20Music%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}
function renderQuietSoniaCaseStudy(): void {
  const generic = document.getElementById('project-generic-case-study');
  const caseStudy = document.getElementById('game-case-study');
  const commission = document.getElementById('project-commission-section');
  generic?.classList.add('hidden');
  if (caseStudy) {
    caseStudy.classList.remove('hidden');
    caseStudy.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-6 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">QS</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">A live record in candlelight</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">Quiet Sonia’s debut full-length was recorded entirely live over one candle-lit weekend at the Royal Danish Academy of Music. It is the first recording to capture the whole seven-piece group together.</p><p class="font-manrope text-white/70 leading-relaxed font-light text-base">With no overdubs, the record keeps its raw and direct quality close to the surface: a wide, emotional chamber-rock, folk and post-rock album with the feel of a band playing in the same room.</p></div>
        <div class="lg:col-span-6 space-y-5"><div><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">The ensemble</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">Listening into the moment</h3></div><p class="font-manrope text-white/70 leading-relaxed font-light text-base">The performances are built around close interplay, subtle changes in texture, tempo and dynamics, improvisational elements and the artistic use of silence. Each player contributes to the warmth, urgency and intimacy of the album’s live energy.</p></div>
      <div class="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12"><div class="lg:col-span-4"><span class="font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest block mb-2">Credits</span><h3 class="font-bodoni text-3xl sm:text-4xl text-white tracking-tight">QS</h3></div><div class="lg:col-span-8"><div class="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4 font-manrope text-sm text-white/70 leading-relaxed"><p><strong class="text-white">Quiet Sonia</strong><br>Nikolaj Bruus — acoustic guitar, lead vocal · Frida Rolskov Pedersen — grand piano, vocal · <strong class="text-white">Rasmus Jon Lundager — organ, vocal</strong> · Phillip Dyssegaard — electric bass · Jens Marl Christiansen — drums, percussion · Thea Thorborg Pedersen — violin · Anders Meyer — electric guitar.</p><p><strong class="text-white">Production</strong><br>Recorded at the Royal Danish Academy of Music, Copenhagen. Recording engineer: Kristian Alexander Pedersen. Mix and mastering: Morten Bue.</p><p>Artwork: Robert Fludd, <em>And So On Into Infinity</em> (public domain). Logo: Anders Bjørn Sprogøe. Art design: Brian Raaby Andersen and Nikolaj Bruus.</p><p>All songs by Nikolaj Bruus and Quiet Sonia. Lyrics by Nikolaj Bruus.<br>Released June 2, 2023 · ℗ 2023 Pink Cotton Candy Records · © 2023 Quiet Sonia.</p></div></div></div>      </div>`;
  }
  if (commission) commission.innerHTML = `<div class="w-full rounded-2xl bg-gradient-to-r from-[#12141a] via-[#101217] to-[#181513] border border-white/15 p-8 sm:p-14 relative overflow-hidden shadow-2xl"><div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#364d4f]/20 blur-3xl pointer-events-none"></div><div class="relative z-10 max-w-3xl space-y-6"><div class="inline-flex items-center gap-2 font-mono text-[11px] text-[#dbcb26] uppercase tracking-widest"><span class="w-1.5 h-1.5 bg-[#dbcb26]"></span><span>Independent music</span></div><h3 class="font-bodoni text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">Looking for music with its own world?</h3><p class="font-manrope text-white/70 text-base leading-relaxed font-light">I write, produce and shape independent music projects from the first sound to the final record.</p><div class="pt-4"><a class="px-7 py-3.5 rounded-lg bg-[#dbcb26] hover:bg-[#e6d743] text-[#171917] font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 font-semibold" href="mailto:rasmus.jon@outlook.com?subject=Independent%20Music%20Inquiry"><span>Start a conversation</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a></div></div></div>`;
}
async function renderProjectDetail(): Promise<void> {
  const slug = window.location.pathname.split('/').filter(Boolean).at(-1) || slugs[0];
  const index = Math.max(0, slugs.indexOf(slug));
  const project = await projectFromGallery(index);
  if (!project) return;
  document.title = `${project.title} — Rasmus Jon`;
  updateText('h1', project.title);
  updateText('h1 + h2', project.subtitle);
  updateText('h1 + h2 + p', project.description);
  updateText('#project-role-meta', project.meta);
  updateText('#project-breadcrumb', `${String(project.index + 1).padStart(2, '0')} // ${project.title}`);
  updateText('#project-kicker', `${project.category} // selected work`);
  const image = document.querySelector<HTMLImageElement>('#main-viewport-image');
  const mediaViewport = image?.parentElement;
  if (index === 0) {
    image?.closest('section')?.classList.replace('pb-16', 'pb-0');
    updateText('#project-kicker', 'Spatial Audio Installation // Naturama');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Sound Designer, Composer & Spatial Audio Mixer');
    updateText('#detail-spec-label-2', 'Format');
    updateText('#detail-spec-value-2', '20-minute 360° audio journey');
    updateText('#detail-spec-label-3', 'Audience');
    updateText('#detail-spec-value-3', '30 listeners at a time');
    updateText('#detail-spec-label-4', 'System');
    updateText('#detail-spec-value-4', '8-speaker circular array');
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderNaturamaCaseStudy();
    const naturamaCaseStudy = document.getElementById('game-case-study');
    const naturamaChapterGrid = naturamaCaseStudy?.firstElementChild;
    const naturamaChapterOne = naturamaChapterGrid?.firstElementChild as HTMLElement | null;
    const naturamaMediaSection = image?.closest('section');
    const naturamaMediaCard = mediaViewport?.parentElement;
    if (naturamaChapterOne && naturamaMediaSection && naturamaMediaCard) {
      const heroChapter = document.createElement('div');
      heroChapter.className = 'naturama-hero-chapter';
      heroChapter.append(naturamaChapterOne);
      naturamaMediaSection.classList.add('naturama-hero-section');
      naturamaMediaCard.classList.add('naturama-hero-media');
      naturamaMediaSection.append(heroChapter);
    }
    makeNaturamaEmulator();
  } else if (index === 2 && mediaViewport) {
    updateText('#project-kicker', 'Interactive Music Game // Copenhell 2026');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Creative Director, Lead Game Designer & Programmer');
    updateText('#detail-spec-label-2', 'Format');
    updateText('#detail-spec-value-2', 'Music-synchronised PC game');
    updateText('#detail-spec-label-3', 'Soundtrack');
    updateText('#detail-spec-value-3', 'Chopper — “New Blood”');
    updateText('#detail-spec-label-4', 'Client');
    updateText('#detail-spec-value-4', 'Chopper - Copenhell');
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderGameCaseStudy();
    mediaViewport.classList.add('game-embed-viewport');
    mediaViewport.innerHTML = `
      <div class="game-embed-heading">
        <span>Play the game</span>
        <button type="button" id="game-fullscreen-toggle">Fullscreen ↗</button>
      </div>
      <div class="game-embed-loader" id="game-embed-loader" role="status" aria-live="polite">
        <div class="game-embed-loader-content">
          <span class="game-embed-spinner" aria-hidden="true"></span>
          <strong>Chopper Runs To Hell</strong>
          <span id="game-embed-status">Preparing Unity...</span>
          <span class="game-embed-progress"><i id="game-embed-progress-bar"></i></span>
        </div>
      </div>
      <iframe class="game-embed" src="https://play-prod.struckd.com/api/v1/games/game/c5c80312-c415-4e96-a27c-c9ad1241e3e4/build/latest/frame" title="Chopper Runs To Hell" allow="fullscreen; autoplay; gamepad" allowfullscreen loading="eager"></iframe>
    `;
    const gameFrame = mediaViewport.querySelector<HTMLIFrameElement>('.game-embed');
    const gameLoader = mediaViewport.querySelector<HTMLElement>('#game-embed-loader');
    const gameStatus = mediaViewport.querySelector<HTMLElement>('#game-embed-status');
    const gameProgress = mediaViewport.querySelector<HTMLElement>('#game-embed-progress-bar');
    const fullscreenToggle = mediaViewport.querySelector<HTMLButtonElement>('#game-fullscreen-toggle');
    const updateFullscreenLabel = () => { if (fullscreenToggle) fullscreenToggle.textContent = document.fullscreenElement ? 'Exit fullscreen ↙' : 'Fullscreen ↗'; };
    fullscreenToggle?.addEventListener('click', async () => {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await mediaViewport.requestFullscreen();
    });
    document.addEventListener('fullscreenchange', updateFullscreenLabel);
    gameFrame?.addEventListener('load', () => { if (gameStatus) gameStatus.textContent = 'Starting game...'; });
    window.addEventListener('message', event => {
      if (!event.origin.endsWith('struckd.com')) return;
      const data = event.data as { event?: string; message?: { progress?: number } };
      if (data.event === 'progress' && data.message?.progress !== undefined) {
        const percent = Math.max(8, Math.min(100, Math.round(data.message.progress * 100)));
        if (gameProgress) gameProgress.style.width = `${percent}%`;
        if (gameStatus) gameStatus.textContent = `Loading game... ${percent}%`;
      }
      if (data.event === 'ready') {
        if (gameProgress) gameProgress.style.width = '100%';
        gameLoader?.classList.add('is-ready');
      }
      if (data.event === 'error' && gameStatus) gameStatus.textContent = 'The game could not start. Please refresh the page.';
    });
  } else if (index === 1) {
    updateText('#project-kicker', 'Music Composition // Arla 2024');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Composer & Producer');
    updateText('#detail-spec-label-2', 'Format');
    updateText('#detail-spec-value-2', 'Stereo brand film score');
    updateText('#detail-spec-label-3', 'Client');
    const arlaClientValue = document.getElementById('detail-spec-value-3');
    if (arlaClientValue) arlaClientValue.innerHTML = '<a href="https://gotfat.dk/" target="_blank" rel="noreferrer">GotFat Productions ↗</a>';
    updateText('#detail-spec-label-4', 'End Client');
    const arlaEndClientValue = document.getElementById('detail-spec-value-4');
    if (arlaEndClientValue) arlaEndClientValue.innerHTML = '<a href="https://www.arla.dk/" target="_blank" rel="noreferrer">Arla Foods ↗</a>';
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderArlaCaseStudy();
    if (image && project.image) { image.src = project.image; image.alt = project.title; }
    if (mediaViewport) makeArlaImagePlayer(mediaViewport);
  } else if (index === 3) {
    updateText('#project-kicker', 'Theatre & Performance // Uskyldig?');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Co-director & Theatre Process Lead');
    updateText('#detail-spec-label-2', 'Format');
    updateText('#detail-spec-value-2', 'Autofictional sex musical');
    updateText('#detail-spec-label-3', 'Venue');
    updateText('#detail-spec-value-3', 'uKirke, Vesterbro');
    updateText('#detail-spec-label-4', 'Approach');
    updateText('#detail-spec-value-4', 'Improvised dance & acting');
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderUskyldigCaseStudy();
    if (image && project.image) { image.src = project.image; image.alt = project.title; }
  } else if (index === 4) {
    updateText('#project-kicker', 'Music Video // Deirdre — Only You');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Co-director');
    updateText('#detail-spec-label-2', 'Co-director');
    const onlyYouCoDirectorValue = document.getElementById('detail-spec-value-2');
    if (onlyYouCoDirectorValue) onlyYouCoDirectorValue.innerHTML = '<a href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21 ↗</a> (Brian Raaby)';
    updateText('#detail-spec-label-3', 'Artist');
    updateText('#detail-spec-value-3', 'Deirdre');
    updateText('#detail-spec-label-4', 'Focus');
    updateText('#detail-spec-value-4', 'Emergent performance & storytelling');
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderOnlyYouCaseStudy();
    if (mediaViewport && project.image) {
      mediaViewport.classList.add('only-you-video-viewport');
      mediaViewport.innerHTML = `<div class="only-you-video-backdrop" style="background-image: url('${project.image}')" aria-hidden="true"></div><div class="only-you-video-shade" aria-hidden="true"></div><iframe class="only-you-video" src="https://www.youtube-nocookie.com/embed/Ot2Am060rdg?rel=0" title="Deirdre — Only You" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
  } else if (index === 5) {
    updateText('#project-kicker', 'Music Video // Late Runner — I’m a Dinosaur');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Co-director & Editor');
    updateText('#detail-spec-label-2', 'Co-director');
    const dinosaurCoDirectorValue = document.getElementById('detail-spec-value-2');
    if (dinosaurCoDirectorValue) dinosaurCoDirectorValue.innerHTML = '<a href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21 ↗</a> (Brian Raaby)';
    updateText('#detail-spec-label-3', 'Artist');
    updateText('#detail-spec-value-3', 'Late Runner');
    updateText('#detail-spec-label-4', 'Focus');
    updateText('#detail-spec-value-4', 'Performance development');
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderDinosaurCaseStudy();
    if (image && project.image) { image.src = project.image; image.alt = project.title; }
  } else if (index === 7) {
    updateText('#project-kicker', 'Independent Music Project // What Is Mothland');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Writer, Producer & Mixer');
    updateText('#detail-spec-label-2', 'Release');
    updateText('#detail-spec-value-2', 'The Copenhagen Windowsills');
    updateText('#detail-spec-label-3', 'Release date');
    updateText('#detail-spec-value-3', 'June 29, 2026');
    updateText('#detail-spec-label-4', 'Label');
    updateText('#detail-spec-value-4', 'Pink Cotton Candy Records');
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderMothlandCaseStudy();
    if (image && project.image) {
      image.src = mothlandArtwork;
      image.alt = 'What Is Mothland — The Copenhagen Windowsills artwork';
      image.classList.add('full-artwork');
      image.parentElement?.parentElement?.classList.add('full-artwork-frame');
      const mediaSection = image.closest('section');
      const mediaCard = mediaViewport?.parentElement;
      if (mediaSection && mediaCard && !mediaSection.querySelector('.mothland-tracklist')) {
        mediaSection.classList.add('mothland-media-layout');
        mediaCard.classList.add('mothland-main-media');
        const tracklist = document.createElement('aside');
        tracklist.className = 'mothland-tracklist';
        tracklist.innerHTML = `<div class="mothland-tracklist-heading"><span class="font-mono text-[11px] uppercase tracking-widest">What Is Mothland — Tracklist</span><a href="https://copenhagenwindowsills.bandcamp.com/album/what-is-mothland" target="_blank" rel="noreferrer">Bandcamp ↗</a></div><iframe src="https://bandcamp.com/EmbeddedPlayer/album=1527027626/size=large/bgcol=0b0b0b/linkcol=ff6b5e/artwork=none/tracklist=true/transparent=true/" title="What Is Mothland by Copenhagen Windowsills on Bandcamp" seamless loading="lazy"><a href="https://copenhagenwindowsills.bandcamp.com/album/what-is-mothland">What Is Mothland by Copenhagen Windowsills</a></iframe>`;
        mediaSection.append(tracklist);
      }
    }
  } else if (index === 8) {
    updateText('#project-kicker', 'Independent Music Project // Quiet Sonia');
    updateText('#detail-spec-label-1', 'Role');
    updateText('#detail-spec-value-1', 'Organ & Vocals');
    updateText('#detail-spec-label-2', 'Release');
    updateText('#detail-spec-value-2', 'QS');
    updateText('#detail-spec-label-3', 'Format');
    updateText('#detail-spec-value-3', 'Seven-piece live album');
    updateText('#detail-spec-label-4', 'Recorded at');
    updateText('#detail-spec-value-4', 'Royal Danish Academy of Music');
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderQuietSoniaCaseStudy();
    if (image && project.image) {
      image.src = project.image;
      image.alt = 'Quiet Sonia — QS';
      image.classList.add('full-artwork');
      image.parentElement?.parentElement?.classList.add('full-artwork-frame');
      const mediaSection = image.closest('section');
      const mediaCard = mediaViewport?.parentElement;
      if (mediaSection && mediaCard && !mediaSection.querySelector('.quiet-sonia-tracklist')) {
        mediaSection.classList.add('quiet-sonia-media-layout');
        mediaCard.classList.add('quiet-sonia-main-media');
        const tracklist = document.createElement('aside');
        tracklist.className = 'quiet-sonia-tracklist';
        tracklist.innerHTML = `<div class="quiet-sonia-tracklist-heading"><span class="font-mono text-[11px] uppercase tracking-widest">QS — Tracklist</span><a href="https://quietsonia.bandcamp.com/album/qs" target="_blank" rel="noreferrer">Bandcamp ↗</a></div><iframe src="https://bandcamp.com/EmbeddedPlayer/album=2147101944/size=large/bgcol=0b0b0b/linkcol=ff6b5e/artwork=none/tracklist=true/transparent=true/" title="QS by Quiet Sonia on Bandcamp" seamless loading="lazy"><a href="https://quietsonia.bandcamp.com/album/qs">QS by Quiet Sonia</a></iframe>`;
        mediaSection.append(tracklist);
      }
    }
  } else if (index === 6) {
    updateText('#project-kicker', 'Documentary Sound & Music // 2025');
    updateText('#detail-spec-label-1', 'Role');
    const roleValue = document.getElementById('detail-spec-value-1');
    if (roleValue) {
      roleValue.classList.add('designed-role-value');
      roleValue.innerHTML = 'Sound & Music Identity,<br><span class="role-phrase">Re-recording Mixer &amp; Interviewer</span>';
    }
    updateText('#detail-spec-label-2', 'Format');
    updateText('#detail-spec-value-2', 'Graduation documentary');
    updateText('#detail-spec-label-3', 'Client');
    const clientValue = document.getElementById('detail-spec-value-3');
    if (clientValue) clientValue.innerHTML = '<a href="https://www.line21.dk/da" target="_blank" rel="noreferrer">Line21 ↗</a>';
    updateText('#detail-spec-label-4', 'End Client');
    const endClientValue = document.getElementById('detail-spec-value-4');
    if (endClientValue) endClientValue.innerHTML = '<a href="https://royaldanishacademy.com/en" target="_blank" rel="noreferrer">The Royal Danish Academy ↗</a>';
    document.getElementById('detail-spec-row-4')?.classList.remove('hidden');
    renderDesignedToBeKeptCaseStudy();
    if (mediaViewport) {
      mediaViewport.innerHTML = `<iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/Arur-S-nuKw?rel=0" title="Designed To Be Kept — Royal Danish Academy Graduation Documentary" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
  } else if (image && project.image) {
    image.src = index === 7 ? mothlandArtwork : project.image;
    image.alt = project.title;
    image.classList.toggle('full-artwork', index >= 7);
    image.parentElement?.parentElement?.classList.toggle('full-artwork-frame', index >= 7);
  }
  selectAll<HTMLAnchorElement>('[data-path]').forEach(link => { link.href = link.dataset.path === 'projects' ? '/projects' : `/#${link.dataset.path}`; });
  const backLink = document.querySelector<HTMLAnchorElement>('a.group.inline-flex');
  if (backLink) backLink.href = '/projects';
}

function makeLandingNavigationWork(): void {
  selectAll<HTMLAnchorElement>('[data-purpose="nav-links"] a').forEach(link => { link.href = link.textContent?.includes('Projects') ? '/projects' : link.textContent?.includes('About') ? '/about' : '/#contact'; });
  document.querySelector<HTMLAnchorElement>('[data-purpose="brand-logo"]')?.setAttribute('href', '/');
}

function makeHeaderReactToScroll(): void {
  const header = document.querySelector<HTMLElement>('[data-purpose="site-navigation-header"]');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

async function makeLandingCarousel(): Promise<void> {
  const cards = selectAll<HTMLElement>('.carousel-card');
  if (!cards.length) return;
  const gallery = new DOMParser().parseFromString(await (await fetch('/projects')).text(), 'text/html');
  const galleryCards = [...gallery.querySelectorAll<HTMLElement>('.project-item')];
  const featuredIndexes = [0, 1, 3, 2, 6];

  cards.forEach((card, position) => {
    const projectIndex = featuredIndexes[position];
    const source = galleryCards[projectIndex];
    if (!source) return;
    card.dataset.project = slugs[projectIndex];
    const sourceImage = source.querySelector<HTMLImageElement>('img');
    const targetImage = card.querySelector<HTMLImageElement>('img');
    if (sourceImage && targetImage) { targetImage.src = sourceImage.src; targetImage.alt = sourceImage.alt || source.querySelector('h2')?.textContent?.trim() || ''; }
    const title = source.querySelector('h2')?.textContent?.trim() || '';
    const subtitle = source.querySelector('h2 + p')?.textContent?.trim() || '';
    const metadata = source.querySelector('p.font-meta-technical')?.textContent?.trim() || '';
    const badge = card.querySelector('.relative .font-mono');
    if (badge) badge.textContent = `${String(projectIndex + 1).padStart(2, '0')} / Selected Work`;
    const heading = card.querySelector('h3');
    if (heading) heading.textContent = title;
    const meta = heading?.previousElementSibling;
    if (meta) meta.textContent = subtitle ? `${subtitle} — ${metadata}` : metadata;
  });

  const dots = selectAll<HTMLElement>('.carousel-dot');
  const previous = document.getElementById('carousel-prev');
  const next = document.getElementById('carousel-next');
  const stage = document.querySelector<HTMLElement>('.carousel-perspective-container');
  let current = 0;
  let dragStartX: number | undefined;
  let ignoreClickUntil = 0;
  let hoverDirection = 0;
  let hoverDelay: number | undefined;
  let hoverInterval: number | undefined;
  let frontCardTimer: number | undefined;
  const update = () => {
    cards.forEach((card, index) => {
      let difference = (index - current + cards.length) % cards.length;
      if (difference > cards.length / 2) difference -= cards.length;
      card.classList.remove('active', 'carousel-left-1', 'carousel-left-2', 'carousel-right-1', 'carousel-right-2', 'hidden-card');
      card.classList.add(difference === 0 ? 'active' : Math.abs(difference) <= 2 ? `carousel-${difference < 0 ? 'left' : 'right'}-${Math.abs(difference)}` : 'hidden-card');
    });
    dots.forEach((dot, index) => { dot.classList.toggle('bg-white', index === current); dot.classList.toggle('bg-white/35', index !== current); dot.setAttribute('aria-pressed', String(index === current)); });
  };
  const goTo = (index: number) => {
    current = (index + cards.length) % cards.length;
    update();
    if (frontCardTimer) window.clearTimeout(frontCardTimer);
    frontCardTimer = window.setTimeout(() => {
      cards.forEach(card => card.classList.remove('front-card'));
      cards[current].classList.add('front-card');
    }, 900);
  };
  previous?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
  stage?.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    dragStartX = event.clientX;
    stage.setPointerCapture(event.pointerId);
  });
  stage?.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') return;
    if (dragStartX === undefined) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) < 70) return;
    goTo(current + (distance < 0 ? 1 : -1));
    dragStartX = event.clientX;
    ignoreClickUntil = performance.now() + 250;
  });
  const endDrag = () => { dragStartX = undefined; };
  stage?.addEventListener('pointerup', endDrag);
  stage?.addEventListener('pointercancel', endDrag);
  const stopHoverRotation = () => {
    hoverDirection = 0;
    if (hoverDelay) window.clearTimeout(hoverDelay);
    if (hoverInterval) window.clearInterval(hoverInterval);
    hoverDelay = undefined;
    hoverInterval = undefined;
  };
  const startHoverRotation = (direction: number) => {
    if (direction === hoverDirection) return;
    stopHoverRotation();
    if (!direction) return;
    hoverDirection = direction;
    hoverDelay = window.setTimeout(() => requestAnimationFrame(() => {
      if (hoverDirection !== direction) return;
      goTo(current + direction);
      hoverInterval = window.setInterval(() => goTo(current + direction), 1650);
    }), 16);
  };
  stage?.addEventListener('mousemove', event => {
    const bounds = stage.getBoundingClientRect();
    const edgeWidth = bounds.width * 0.2;
    const direction = event.clientX < bounds.left + edgeWidth ? -1 : event.clientX > bounds.right - edgeWidth ? 1 : 0;
    startHoverRotation(direction);
  });
  stage?.addEventListener('mouseleave', stopHoverRotation);
  cards.forEach((card, index) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    const activate = () => {
      if (performance.now() < ignoreClickUntil) return;
      index === current ? navigateToProject(featuredIndexes[index]) : goTo(index);
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
  update();
  cards[current].classList.add('front-card');
}

function makeNaturamaEmulator(): void {
  const container = document.getElementById('naturama-emulator');
  if (!container) return;
  const naturamaCaseStudy = document.getElementById('game-case-study');
  const emulatorSection = container.closest('section');
  if (naturamaCaseStudy && emulatorSection && naturamaCaseStudy.firstElementChild !== emulatorSection) {
    naturamaCaseStudy.insertBefore(emulatorSection, naturamaCaseStudy.firstElementChild);
  }
  const playButton = document.getElementById('naturama-play') as HTMLButtonElement | null;
  const resetButton = document.getElementById('naturama-reset') as HTMLButtonElement | null;
  const clearButton = document.getElementById('naturama-clear-solo') as HTMLButtonElement | null;
  const status = document.getElementById('naturama-status');
  const progress = document.getElementById('naturama-progress');
  const seek = document.getElementById('naturama-seek') as HTMLInputElement | null;
  const currentTime = document.getElementById('naturama-current-time');
  const durationLabel = document.getElementById('naturama-duration');
  const chapterButtons = [...container.querySelectorAll<HTMLButtonElement>('[data-naturama-chapter]')];
  const masterControl = document.getElementById('naturama-master') as HTMLInputElement | null;
  const subControl = document.getElementById('naturama-sub') as HTMLInputElement | null;
  const speakerButtons = [...container.querySelectorAll<HTMLButtonElement>('[data-naturama-speaker]')];
  const pairButtons = [...container.querySelectorAll<HTMLButtonElement>('[data-naturama-pair]')];
  const listeningLayout = container.querySelector<HTMLElement>('div.grid');
  const listeningVisual = listeningLayout?.firstElementChild as HTMLElement | null;
  const listeningControls = listeningLayout?.lastElementChild as HTMLElement | null;
  let crossfadeAtmosphere: (chapterIndex: number) => void = () => {};
  if (listeningLayout && listeningVisual && listeningControls && listeningVisual !== listeningControls) {
    listeningLayout.className = 'flex flex-col gap-2';
    listeningControls.className = 'w-full max-w-[1100px] mx-auto space-y-5';
    listeningLayout.insertBefore(listeningControls, listeningVisual);
    const actionRow = playButton?.parentElement as HTMLElement | null;
    const timeline = seek?.parentElement as HTMLElement | null;
    const levelControls = masterControl?.parentElement?.parentElement as HTMLElement | null;
    if (actionRow && timeline && levelControls) {
      const transport = document.createElement('div');
      transport.className = 'naturama-transport relative w-full min-h-[120px] flex items-center justify-center';
      actionRow.className = 'naturama-transport-actions absolute left-0 top-0 flex flex-col gap-2 shrink-0 z-10';
      actionRow.querySelector('button')?.classList.remove('flex-1');
      timeline.className = 'naturama-timeline absolute left-1/2 top-0 -translate-x-1/2 w-[calc(100%-18rem)] max-w-none space-y-2';
      resetButton?.classList.add('naturama-stop-journey', 'absolute', 'right-0', 'top-0');
      transport.append(actionRow, timeline);
      if (resetButton) transport.append(resetButton);
      const leftColumn = document.createElement('div');
      leftColumn.className = 'w-full flex flex-col gap-4';
      leftColumn.append(transport);
      levelControls.className = 'naturama-level-controls absolute right-0 top-1/2 -translate-y-1/2 w-48 h-[244px] grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-[#121318]/95 p-2 z-10';
      [masterControl, subControl].forEach(control => {
        if (!control) return;
        const label = control.parentElement as HTMLLabelElement | null;
        const labelText = control === masterControl ? `Master\nlevel` : `Subwoofer\nmaterial`;
        if (label) {
          const caption = document.createElement('span');
          caption.textContent = labelText;
          caption.className = 'font-mono text-[9px] text-brand-muted uppercase tracking-[0.08em] leading-tight text-center whitespace-pre-line';
          label.textContent = '';
          label.className = 'w-20 flex flex-col items-center gap-4';
          label.append(caption, control);
        }
        control.classList.remove('w-full', 'mt-2');
        control.classList.add('h-44', 'w-5', 'accent-[#6f7f68]', 'cursor-pointer');
        control.style.writingMode = 'vertical-lr';
        control.style.direction = 'rtl';
        control.style.setProperty('-webkit-appearance', 'slider-vertical');
        control.style.appearance = 'slider-vertical';
      });
      listeningControls.className = 'w-full max-w-[1100px] mx-auto flex flex-col gap-5 items-center';
      listeningControls.append(leftColumn);
      listeningVisual.append(levelControls);
      const pairControls = pairButtons[0]?.parentElement as HTMLElement | null;
      if (pairControls) {
        pairControls.className = 'naturama-pair-controls absolute left-0 top-1/2 -translate-y-1/2 w-48 h-[244px] flex flex-col gap-2 z-10';
        pairButtons.forEach(button => {
          button.className = 'naturama-pair flex-1 w-full rounded-lg border border-white/10 bg-[#121318]/95 px-5 py-3 text-left hover:border-[#6f7f68]/70 transition';
        });
        listeningVisual.append(pairControls);
      }
      const speakerStage = document.createElement('div');
      speakerStage.className = 'naturama-speaker-stage relative w-full max-w-[1100px] mx-auto';
      const updateSpeakerStageSpacing = () => {
        const compact = container.getBoundingClientRect().width < 1200;
        speakerStage.style.setProperty('margin-top', compact ? '-14rem' : '-2rem', 'important');
        listeningVisual.style.setProperty('transform', 'none', 'important');
      };
      updateSpeakerStageSpacing();
      new ResizeObserver(updateSpeakerStageSpacing).observe(container);

      listeningVisual.style.marginTop = '0';
      listeningVisual.style.maxWidth = '380px';
      listeningVisual.classList.add('naturama-speaker-stage__circle');
      listeningLayout.replaceChild(speakerStage, listeningVisual);
      const atmosphere = document.createElement('div');
      const nextAtmosphere = document.createElement('div');
      atmosphere.className = 'naturama-speaker-atmosphere naturama-speaker-atmosphere--visible';
      nextAtmosphere.className = 'naturama-speaker-atmosphere';
      atmosphere.dataset.chapter = '0';
      nextAtmosphere.dataset.chapter = '0';
      atmosphere.setAttribute('aria-hidden', 'true');
      nextAtmosphere.setAttribute('aria-hidden', 'true');
      container.prepend(atmosphere, nextAtmosphere);
      speakerStage.append(listeningVisual, levelControls);
      let visibleAtmosphere = atmosphere;
      crossfadeAtmosphere = (chapterIndex: number) => {
        const chapter = String(chapterIndex);
        if (visibleAtmosphere.dataset.chapter === chapter) return;
        const incomingAtmosphere = visibleAtmosphere === atmosphere ? nextAtmosphere : atmosphere;
        incomingAtmosphere.dataset.chapter = chapter;
        incomingAtmosphere.classList.add('naturama-speaker-atmosphere--visible');
        visibleAtmosphere.classList.remove('naturama-speaker-atmosphere--visible');
        visibleAtmosphere = incomingAtmosphere;
      };
      if (pairControls) {
        speakerStage.append(pairControls);
        const alignVolumePanelBottom = () => {
          if (getComputedStyle(pairControls).position !== 'absolute') {
            levelControls.style.removeProperty('top');
            levelControls.style.removeProperty('bottom');
            levelControls.style.removeProperty('height');
            levelControls.style.removeProperty('transform');
            return;
          }
          const stageBounds = speakerStage.getBoundingClientRect();
          const pairBounds = pairControls.getBoundingClientRect();
          levelControls.style.setProperty('top', 'auto', 'important');
          levelControls.style.setProperty('bottom', (stageBounds.bottom - pairBounds.bottom) + 'px', 'important');
          levelControls.style.setProperty('height', pairBounds.height + 'px', 'important');
          levelControls.style.setProperty('transform', 'translate(4rem, 0)', 'important');
        };
        requestAnimationFrame(alignVolumePanelBottom);
        new ResizeObserver(alignVolumePanelBottom).observe(speakerStage);
      }
    }
  }
  const sources = [
    '/assets/naturama/speakers-1-2.mp3', '/assets/naturama/speakers-3-4.mp3',
    '/assets/naturama/speakers-5-6.mp3', '/assets/naturama/speakers-7-8.mp3', '/assets/naturama/subs.mp3',
  ];
  const audio = sources.map(url => { const element = new Audio(url); element.preload = 'none'; return element; });
  let context: AudioContext | undefined;
  let master: GainNode | undefined;
  let subGain: GainNode | undefined;
  let speakerGains: GainNode[] = [];
  let activeIsolation: number[] | undefined;
  let playing = false;

  const setStatus = (text: string) => { if (status) status.textContent = text; };
  const paintActiveChapter = (time: number) => {
    let activeIndex = 0;
    chapterButtons.forEach((button, index) => {
      if (Number(button.dataset.start || 0) <= time) activeIndex = index;
    });
    container.dataset.activeChapter = String(activeIndex);
    crossfadeAtmosphere(activeIndex);
    chapterButtons.forEach((button, index) => {
      const active = index === activeIndex;
      button.classList.toggle('bg-[#6f7f68]/45', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('shadow-[inset_0_0_0_1px_rgba(111,127,104,0.65)]', active);
      button.classList.toggle('text-white/70', !active);
    });
  };
  const jumpTo = (time: number) => {
    const duration = audio[0].duration || 816;
    const clamped = Math.min(time, duration);
    audio.forEach(element => { try { element.currentTime = clamped; } catch {} });
    const ratio = clamped / duration;
    if (seek) seek.value = String(Math.round(ratio * 1000));
    if (progress) progress.style.width = `${ratio * 100}%`;
    if (currentTime) currentTime.textContent = formatTime(clamped);
    paintActiveChapter(clamped);
  };  const waitForAudioReady = (element: HTMLAudioElement) => new Promise<void>((resolve, reject) => {
    if (element.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) { resolve(); return; }
    const ready = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error('Audio could not load.')); };
    const cleanup = () => { element.removeEventListener('canplay', ready); element.removeEventListener('error', failed); };
    element.addEventListener('canplay', ready, { once: true });
    element.addEventListener('error', failed, { once: true });
    element.load();
  });
  const formatTime = (seconds: number) => { const value = Math.max(0, Math.floor(seconds || 0)); return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`; };
  const subLevel = () => Math.sqrt(Number(subControl?.value || 55) / 100) * 7;
  const updateSubLevel = () => {
    const rawValue = Number(subControl?.value || 0);
    const level = subLevel();
    audio[4].muted = rawValue === 0;
    audio[4].volume = rawValue === 0 ? 0 : 1;
    if (subGain) {
      subGain.gain.cancelScheduledValues(context?.currentTime || 0);
      subGain.gain.value = rawValue === 0 ? 0 : level;
    }
  };
  const updateMasterLevel = () => {
    if (master && context && masterControl) master.gain.setTargetAtTime(Number(masterControl.value) / 100, context.currentTime, 0.015);
  };
  masterControl?.addEventListener('input', updateMasterLevel);
  subControl?.addEventListener('input', updateSubLevel);
  subControl?.addEventListener('change', updateSubLevel);
  const paintSelection = () => {
    speakerButtons.forEach((button, index) => {
      const selected = activeIsolation?.includes(index) ?? false;
      button.classList.toggle('border-[#6f7f68]', selected);
      button.classList.toggle('bg-[#6f7f68]/25', selected);
      button.classList.toggle('text-white', true);
      button.classList.toggle('shadow-[0_0_24px_rgba(111,127,104,0.35)]', selected);
    });
    pairButtons.forEach((button, index) => {
      const channels = [index * 2, index * 2 + 1];
      const selected = channels.every(channel => activeIsolation?.includes(channel));
      button.classList.toggle('border-[#6f7f68]/70', selected);
      button.classList.toggle('bg-[#6f7f68]/10', selected);
      button.classList.toggle('shadow-[0_0_20px_rgba(111,127,104,0.18)]', selected);
    });
  };
  const applyLevels = () => {
    speakerGains.forEach((gain, index) => { gain.gain.value = activeIsolation && !activeIsolation.includes(index) ? 0 : 1; });
  };
  const setIsolation = (channels?: number[]) => { activeIsolation = channels; applyLevels(); paintSelection(); setStatus(channels ? `Listening to speaker${channels.length > 1 ? 's' : ''} ${channels.map(channel => String(channel + 1).padStart(2, '0')).join(' / ')}.` : 'Listening to the full eight-speaker mix.'); };

  const initialise = () => {
    if (context) return;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = Number(masterControl?.value || 80) / 100;
    master.connect(context.destination);
    audio.slice(0, 4).forEach((element, pair) => {
      const source = context!.createMediaElementSource(element);
      const splitter = context!.createChannelSplitter(2);
      source.connect(splitter);
      [0, 1].forEach(channel => {
        const gain = context!.createGain();
        const panner = context!.createPanner();
        const speaker = pair * 2 + channel;
        const angle = (speaker / 8) * Math.PI * 2 - Math.PI / 2;
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.positionX.value = Math.cos(angle);
        panner.positionY.value = 0;
        panner.positionZ.value = Math.sin(angle);
        splitter.connect(gain, channel);
        gain.connect(panner);
        panner.connect(master!);
        speakerGains.push(gain);
      });
    });
    const subSource = context.createMediaElementSource(audio[4]);
    subGain = context.createGain();
    subGain.gain.value = subLevel();
    subSource.connect(subGain);
    subGain.connect(master);

    audio[0].addEventListener('loadedmetadata', () => { if (durationLabel) durationLabel.textContent = formatTime(audio[0].duration); });
    audio[0].addEventListener('timeupdate', () => {
      if (!audio[0].duration) return;
      const ratio = audio[0].currentTime / audio[0].duration;
      if (progress) progress.style.width = `${ratio * 100}%`;
      if (seek) seek.value = String(Math.round(ratio * 1000));
      if (currentTime) currentTime.textContent = formatTime(audio[0].currentTime);
      paintActiveChapter(audio[0].currentTime);
      if (playing) audio.slice(1).forEach(element => {
        if (Math.abs(element.currentTime - audio[0].currentTime) > 0.025) element.currentTime = audio[0].currentTime;
      });
    });
    seek?.addEventListener('input', () => {
      if (!audio[0].duration) return;
      const time = (Number(seek.value) / 1000) * audio[0].duration;
      audio.forEach(element => { element.currentTime = time; });
      if (currentTime) currentTime.textContent = formatTime(time);
      if (progress) progress.style.width = `${Number(seek.value) / 10}%`;
    });    audio[0].addEventListener('ended', () => { playing = false; if (playButton) playButton.textContent = 'Start Journey'; setStatus('The 360° journey has ended.'); });
  };

  paintActiveChapter(0);
  chapterButtons.forEach(button => button.addEventListener('click', () => jumpTo(Number(button.dataset.start || 0))));
  playButton?.addEventListener('click', async () => {
    initialise();
    if (!context) return;
    if (playing) {
      audio.forEach(element => element.pause());
      playing = false;
      playButton.textContent = 'Resume Journey';
      setStatus('Mix paused.');
      return;
    }
    playButton.disabled = true;
    playButton.textContent = 'Loading journey…';
    setStatus('Loading the original eight speaker channels and sub material…');
    try {
      await context.resume();
      await Promise.all(audio.map(waitForAudioReady));
      const startAt = audio[0].currentTime;
      audio.forEach(element => { element.currentTime = startAt; });
      await Promise.all(audio.map(element => element.play()));
      playing = true;
      playButton.textContent = 'Pause Journey';
      setStatus(activeIsolation ? 'Playing isolated speaker material.' : 'Playing the full eight-speaker mix.');
    } catch {
      setStatus('The mix could not start. Please try again.');
      playButton.textContent = 'Start Journey';
    } finally { playButton.disabled = false; }
  });
  resetButton?.addEventListener('click', () => { audio.forEach(element => { element.pause(); element.currentTime = 0; }); playing = false; if (progress) progress.style.width = '0%'; if (seek) seek.value = '0'; if (currentTime) currentTime.textContent = '00:00'; if (playButton) playButton.textContent = 'Start Journey'; setIsolation(); });
  clearButton?.addEventListener('click', () => setIsolation());
  speakerButtons.forEach((button, index) => button.addEventListener('click', () => {
    const selected = new Set(activeIsolation || []);
    selected.has(index) ? selected.delete(index) : selected.add(index);
    setIsolation(selected.size ? [...selected].sort((a, b) => a - b) : undefined);
  }));
  pairButtons.forEach((button, index) => button.addEventListener('click', () => {
    const channels = [index * 2, index * 2 + 1];
    const selected = new Set(activeIsolation || []);
    const pairIsActive = channels.every(channel => selected.has(channel));
    channels.forEach(channel => pairIsActive ? selected.delete(channel) : selected.add(channel));
    setIsolation(selected.size ? [...selected].sort((a, b) => a - b) : undefined);
  }));
}
if (document.querySelector('.project-item')) {
  makeGalleryInteractive();
  (window as typeof window & { filterWorks: (category: string) => void }).filterWorks = animateFilter;
}
if (window.location.pathname.startsWith('/projects/')) void renderProjectDetail();
makeLandingNavigationWork();
makeHeaderReactToScroll();
void makeLandingCarousel();
