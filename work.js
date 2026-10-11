(() => {
  const view = document.querySelector('#work-view');
  const sections = [...view.querySelectorAll('.timeline section')];
  const links = [...view.querySelectorAll('.years a')];
  let pending = null;
  let selectedJump = null;
  const entries = [...view.querySelectorAll('.entry')];
  // Role profiles show relative work emphasis, not proficiency grades.
  // Axis order: Strategy, Engineering, Design, Communication, Curiosity, Execution, Taste.
  const profiles = {
    overall: {label: 'Overall', values: [.70, .94, .50, .825, .94, .825, 1]},
    'rbc-2026': {label: 'RBC · 2026', values: [.94, .82, .48, .90, .86, .90, .64]},
    'university-of-waterloo-2026': {label: 'URA · 2026', values: [.55, .80, .60, .68, 1, .82, .62]},
    'sap-2026': {label: 'SAP · 2026', values: [.86, .90, .42, .78, .92, .90, .55]},
    'sap-2025': {label: 'SAP · 2025', values: [.78, .70, .48, .82, .82, .84, .55]},
    'visfuture-2024': {label: 'Visfuture · 2024', values: [.70, .94, .84, .80, .80, .94, .72]},
    'wsp-2024': {label: 'WSP · 2024', values: [.42, .94, .80, .68, .74, .90, .52]},
    'wsp-2023': {label: 'WSP · 2023', values: [.35, .88, .72, .60, .84, .82, .48]}
  };
  const graph = view.querySelector('.strengths-graph');
  const context = view.querySelector('.stats-context');
  const overallOverlay = graph.querySelector('.stats-shape').cloneNode();
  overallOverlay.setAttribute('class', 'stats-overall');
  overallOverlay.setAttribute('aria-hidden', 'true');
  graph.querySelector('.stats-shape').before(overallOverlay);
  let activeProfile = null;
  let currentRole = 'overall';
  let overallForeground = false;
  function profilePoints(profile) {
    return profile.values.map((value, index) => {
      const angle = -Math.PI / 2 + index * 2 * Math.PI / 7;
      return [300 + 165 * value * Math.cos(angle), 255 + 165 * value * Math.sin(angle)];
    });
  }
  function showProfile(key) {
    if (key === activeProfile) return;
    const profile = profiles[key] || profiles.overall;
    activeProfile = key;
    const points = profilePoints(profile);
    graph.querySelector('.stats-shape').setAttribute('points', points.map(point => point.join(',')).join(' '));
    graph.querySelector('.stats-outline').setAttribute('d', 'M' + points.map(point => point.join(',')).join(' L') + ' Z');
    context.textContent = profile.label;
    const canCompare = currentRole !== 'overall';
    const backgroundProfile = profiles[key === 'overall' ? currentRole : 'overall'];
    overallOverlay.setAttribute('points', profilePoints(backgroundProfile).map(point => point.join(',')).join(' '));
    overallOverlay.style.display = canCompare ? '' : 'none';
    graph.setAttribute('role', canCompare ? 'button' : 'img');
    graph.setAttribute('tabindex', canCompare ? '0' : '-1');
    graph.classList.toggle('can-compare', canCompare);
    if (canCompare) {
      graph.setAttribute('aria-pressed', String(overallForeground));
      graph.setAttribute('aria-label', profile.label + ' stats. Click to show ' + backgroundProfile.label + '.');
    } else {
      graph.removeAttribute('aria-pressed');
      graph.removeAttribute('aria-label');
    }
    graph.querySelector('title').textContent = profile.label + ' stats';
    const traits = ['Strategy', 'Engineering', 'Design', 'Communication', 'Curiosity', 'Execution', 'Taste'];
    const leading = [...traits.keys()].sort((a, b) => profile.values[b] - profile.values[a]).slice(0, 3).map(index => traits[index]);
    graph.querySelector('desc').textContent = (key === 'overall' ? 'Overall strengths' : 'Relative work focus') + ': ' + leading.join(', ') + ' lead.' + (canCompare ? ' The lighter overlay shows ' + backgroundProfile.label + ' for comparison.' : '');
    entries.forEach(entry => entry.classList.toggle('stats-active', entry.dataset.statsProfile === currentRole));
  }
  function updateProfile() {
    const visible = entries.filter(entry => !entry.hidden);
    const threshold = Math.min(innerHeight * .38, 300);
    const current = visible.filter(entry => entry.getBoundingClientRect().top <= threshold).at(-1);
    const nextRole = current ? current.dataset.statsProfile : 'overall';
    if (nextRole !== currentRole) {
      currentRole = nextRole;
      overallForeground = false;
      activeProfile = null;
    }
    showProfile(overallForeground ? 'overall' : currentRole);
  }
  function toggleComparison() {
    if (currentRole === 'overall') return;
    overallForeground = !overallForeground;
    showProfile(overallForeground ? 'overall' : currentRole);
  }
  graph.addEventListener('click', toggleComparison);
  graph.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleComparison();
    }
  });
  const filterGroup = view.querySelector('.work-filters');
  const status = view.querySelector('.work-filter-status');
  const workTypes = ['AI product', 'Data', 'Engineering', 'Strategy', 'Growth', 'Research'];
  ['', ...workTypes].forEach(workType => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'work-tag';
    button.dataset.workType = workType;
    button.textContent = workType || 'All';
    button.setAttribute('aria-pressed', String(!workType));
    filterGroup.append(button);
  });
  function extendVisibleTimeline() {
    const lastVisible = sections.filter(section => !section.hidden).at(-1);
    sections.forEach(section => section.classList.toggle('timeline-end', section === lastVisible));
  }
  function filter(workType) {
    entries.forEach(entry => {
      entry.hidden = Boolean(workType) && ![...entry.querySelectorAll('[data-work-type]')].some(button => button.dataset.workType === workType);
    });
    sections.forEach(section => {
      section.hidden = ![...section.querySelectorAll('.entry')].some(entry => !entry.hidden);
      const year = section.id.replace('work-year-', '');
      links.find(link => link.hash === '#work/' + year).hidden = section.hidden;
    });
    extendVisibleTimeline();
    view.querySelectorAll('[data-work-type]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.workType === workType));
    });
    selectedJump = null;
    const count = entries.filter(entry => !entry.hidden).length;
    status.textContent = `${workType || 'All work types'}: ${count} ${count === 1 ? 'role' : 'roles'}`;
    update();
  }
  view.addEventListener('click', event => {
    const button = event.target.closest('[data-work-type]');
    if (!button) return;
    filter(button.dataset.workType);
    if (!filterGroup.contains(button)) filterGroup.scrollIntoView({behavior: 'instant', block: 'nearest'});
  });

  function select(year) {
    links.forEach(link => {
      if (link.hash === '#work/' + year) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function update() {
    pending = null;
    if (view.hidden || document.hidden) return;
    updateProfile();
    if (selectedJump) { select(selectedJump); return; }
    const current = sections.filter(section => !section.hidden && section.getBoundingClientRect().top <= 100).at(-1) || sections.find(section => !section.hidden);
    select(current.id.replace('work-year-', ''));
  }
  function route() {
    if (pending !== null) cancelAnimationFrame(pending);
    pending = null;
    if (view.hidden) return;
    const year = location.hash.split('/')[1];
    const target = sections.find(section => !section.hidden && section.id === 'work-year-' + year);
    if (target) {
      target.scrollIntoView({behavior: 'instant', block: 'start'});
      target.querySelector('h2').focus({preventScroll: true});
      selectedJump = year;
      select(year);
    } else {
      window.scrollTo({top: 0, behavior: 'instant'});
      selectedJump = null;
      select(sections.find(section => !section.hidden).id.replace('work-year-', ''));
    }
  }
  links.forEach(link => link.addEventListener('click', () => {
    if (link.hash === location.hash) route();
  }));
  addEventListener('scroll', () => {
    if (!view.hidden && !document.hidden && pending === null) pending = requestAnimationFrame(update);
  }, {passive: true});
  addEventListener('wheel', () => { selectedJump = null; }, {passive: true});
  addEventListener('touchmove', () => { selectedJump = null; }, {passive: true});
  addEventListener('keydown', event => {
    if (['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End', ' '].includes(event.key) && !event.target.closest('input')) selectedJump = null;
  });
  addEventListener('site:route', () => { route(); update(); });
  addEventListener('resize', update);
  extendVisibleTimeline();
  showProfile('overall');
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && pending !== null) { cancelAnimationFrame(pending); pending = null; }
    else update();
  });
  route();
  update();
})();
