import re

with open(r'c:\SOLARA-CONNECT-OFICIAL\src\LandingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

with open(r'c:\SOLARA-CONNECT-OFICIAL\hero_b64.txt', 'r', encoding='utf-8') as f:
    b64_new = f.read().strip()

new_content = re.sub(r'src=\"data:image/[^;]+;base64,[^\"]+\"', f'src=\"data:image/png;base64,{b64_new}\"', content)

with open(r'c:\SOLARA-CONNECT-OFICIAL\src\LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done')
