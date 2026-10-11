"""Render role-level tags and work labels from the plain-text content draft."""
from pathlib import Path
import re
from html import escape
ROOT=Path(__file__).resolve().parents[1]
icons={
'platform':'<rect x="8" y="8" width="8" height="8" rx="1"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/><circle cx="12" cy="2.5" r="1.5"/><circle cx="12" cy="21.5" r="1.5"/><circle cx="2.5" cy="12" r="1.5"/><circle cx="21.5" cy="12" r="1.5"/>',
'growth':'<path d="M3 20h18M5 16l5-5 4 2 6-8M15 5h5v5"/>',
'research':'<circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 6 6M7 12V9M10 12V7M13 12v-2"/>',
'dashboard':'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M11 9v11M6 15h2M14 16v-3M17 16v-5"/>',
'code':'<path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>',
'design':'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M8 9v11M12 13h6M12 16h4"/>',
'people':'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/>',
'electrical':'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
'route':'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/>'}
def kind(label):
    label=label.lower()
    for term,key in [('electrical','electrical'),('version','code'),('integration','code'),('routing','route'),('stakeholder','people'),('prototyp','design'),('dashboard','dashboard'),('analytics','dashboard'),('research','research'),('use cases','research'),('growth','growth'),('onboarding','growth')]:
        if term in label:return key
    return 'platform'
text=(ROOT/'drafts/work-stats.txt').read_text()
roles=[]
for block in text.split('\n\n'):
    if '\nWork items:' not in block:continue
    role={'items':[],'types':[],'tech':[],'profile':re.sub(r'[^a-z0-9]+','-',block.splitlines()[0].lower()).strip('-')}
    for line in block.splitlines()[2:]:
        if line.startswith('- '):role['items'].append({'label':line[2:].split(' — ')[0].rstrip(': '),'url':None})
        elif line.strip().startswith('Repository:'):role['items'][-1]['url']=line.split('Repository:',1)[1].strip()
        elif line.startswith('Type tags:'):role['types']=[t.strip() for t in line.split(':',1)[1].split(',')]
        elif line.startswith('Technology tags:'):role['tech']=[t.strip().replace('AutoCad','AutoCAD').replace('BIM360','BIM 360') for t in line.replace('Technology tags:','').split(',') if t.strip() and t.strip()!='Not yet specified']
    role['types']=list(dict.fromkeys('Data' if t.lower() in {'analytics','data analytics','data analysis','product analytics','data'} else t for t in role['types']))
    roles.append(role)
assert len(roles)==7
page=ROOT/'index.html';html=page.read_text()
# Remove previously generated blocks before rebuilding.
html=re.sub(r'<!-- work-focus:start -->.*?<!-- work-focus:end -->','',html,flags=re.S)
start=html.index('<section id="work-view"');end=html.index('</aside>',start)
fragment=html[start:end]
index=0
def add(match):
    global index
    role=roles[index];index+=1
    tags='<div class="work-tags" aria-label="Work types">'+''.join('<button type="button" class="work-tag" data-work-type="'+escape(t,quote=True)+'" aria-pressed="false">'+escape(t)+'</button>' for t in role['types'])+'</div>'
    items='<ul class="work-focus" aria-label="Work focus">'
    for item in role['items']:
        icon='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[kind(item['label'])]+'</svg>'
        label=escape(item['label'])
        if item['url']:
            label='<a href="'+escape(item['url'],quote=True)+'" target="_blank" rel="noopener noreferrer" aria-label="'+escape(item['label']+' — GitHub repository (opens in a new tab)',quote=True)+'">'+label+'<span class="repo-mark" aria-hidden="true">↗</span></a>'
        items+='<li>'+icon+'<span>'+label+'</span></li>'
    items+='</ul>'
    tools=''
    if role['tech']:tools='<div class="work-tools"><span class="tools-label">Tools</span><div class="work-tags" aria-label="Technologies">'+''.join('<span class="work-tag technology">'+escape(t)+'</span>' for t in role['tech'])+'</div></div>'
    return match.group(1)+'<!-- work-focus:start -->'+tags+items+tools+'<!-- work-focus:end -->'+match.group(2)
fragment=re.sub(r'(<p class="summary">.*?</p>)(</div></li>)',add,fragment)
assert index==7
profile_index=iter(roles)
fragment=re.sub(r'<li class="entry"(?: data-stats-profile="[^"]*")?>', lambda match: '<li class="entry" data-stats-profile="'+next(profile_index)['profile']+'">', fragment)
page.write_text(html[:start]+fragment+html[end:])
print('Updated work labels, shared tags, and repository links for 7 roles.')
