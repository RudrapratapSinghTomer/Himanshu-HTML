import re
import os

app_js_path = r'c:\Users\developer\Desktop\Himanshu HTML\js\app.js'
html_path = r'c:\Users\developer\Desktop\Himanshu HTML\index.html'
js_dir = r'c:\Users\developer\Desktop\Himanshu HTML\js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

def extract_function(code, func_name):
    pattern = r'(async\s+)?function\s+' + func_name + r'\s*\('
    match = re.search(pattern, code)
    if not match: return None, code
    start_idx = match.start()
    brace_idx = code.find('{', start_idx)
    if brace_idx == -1: return None, code
    brace_count = 1
    i = brace_idx + 1
    while i < len(code) and brace_count > 0:
        if code[i] == '{': brace_count += 1
        elif code[i] == '}': brace_count -= 1
        i += 1
    end_idx = i
    func_code = code[start_idx:end_idx]
    
    window_pattern = r'window\.' + func_name + r'\s*=\s*' + func_name + r'\s*;\s*'
    w_match = re.search(window_pattern, code)
    if w_match:
        code = code[:w_match.start()] + code[w_match.end():]
        func_code += '\n' + w_match.group(0)

    new_code = code[:start_idx] + code[end_idx:]
    return func_code, new_code

modules = {
    'renderDashboard.js': ['renderDashboard', 'updateKPIs', 'renderPhaseProgressBars', 'renderHeatmap', 'renderSchedule', 'renderLeaderboard'],
    'renderRoadmap.js': ['renderRoadmap', 'renderPhaseFilters', 'setPhaseFilter', 'switchRoadmap', 'setWeekStatus', 'setDayStatus'],
    'renderSkills.js': ['renderSkills', 'updateSkill'],
    'renderProjects.js': ['renderProjects', 'toggleProjectTask', 'updateProjectStatus'],
    'renderResources.js': ['renderResources', 'setResourceFilter'],
    'renderWeekly.js': ['renderReviewWeeks', 'setReviewWeek', 'renderWeekly', 'submitWeeklyReview', 'toggleHostEditMode'],
    'utils.js': ['getActivePhases', 'updateUserUI', 'showToast', 'getCurrentWeek', 'updateLogWeek', 'calculateWeekFromDate'],
    'events.js': ['showPage', 'handleGlobalSearch']
}

for mod, funcs in modules.items():
    mod_code = ''
    for f in funcs:
        f_code, code = extract_function(code, f)
        if f_code:
            mod_code += f_code + '\n\n'
    
    if mod == 'renderSkills.js':
        pattern = r'window\.showTab\s*=\s*function\(.*?\)\s*{.*?};'
        match = re.search(pattern, code, re.DOTALL)
        if match:
            mod_code += match.group(0) + '\n\n'
            code = code[:match.start()] + code[match.end():]

    if mod == 'events.js':
        pattern = r'document\.addEventListener\([^;]*;\s*\}\);?'
        matches = list(re.finditer(pattern, code, re.DOTALL))
        for match in reversed(matches):
            mod_code += match.group(0) + '\n\n'
            code = code[:match.start()] + code[match.end():]

    if mod_code.strip():
        with open(os.path.join(js_dir, mod), 'w', encoding='utf-8') as f:
            f.write(mod_code)

state_vars = ['myRole', 'state', 'me', 'allUsers', 'viewingUserId', 'activePhaseFilter', 'ROADMAPS_DB', 'WEEKS_DB', 'PROJECTS_DB', 'RESOURCES_DB', 'SKILLS_DB', 'quizState', 'userUnsub', 'allUsersUnsub', 'configUnsub', 'logsUnsub']

state_code = ''
for var in state_vars:
    pattern = r'(let|const|var)\s+' + var + r'\s*=.*?;'
    match = re.search(pattern, code)
    if match:
        state_code += match.group(0) + '\n'
        code = code[:match.start()] + code[match.end():]

f_code, code = extract_function(code, 'saveState')
if f_code: state_code += '\n' + f_code + '\n'

with open(os.path.join(js_dir, 'state.js'), 'w', encoding='utf-8') as f:
    f.write(state_code)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(code)

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

scripts = """
  <script defer src="js/state.js"></script>
  <script defer src="js/utils.js"></script>
  <script defer src="js/renderDashboard.js"></script>
  <script defer src="js/renderRoadmap.js"></script>
  <script defer src="js/renderSkills.js"></script>
  <script defer src="js/renderProjects.js"></script>
  <script defer src="js/renderResources.js"></script>
  <script defer src="js/renderWeekly.js"></script>
  <script defer src="js/events.js"></script>
  <script defer src="js/app.js"></script>
"""

html = html.replace('<script defer src="js/app.js"></script>', scripts.strip())

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('Refactoring complete')
