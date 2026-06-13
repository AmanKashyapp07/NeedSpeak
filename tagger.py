import re
import json

def tagger(match):
    text = match.group(0)
    if '"tags"' in text: return text
    name_match = re.search(r'"name":\s*"([^"]+)"', text)
    if not name_match: return text
    name = name_match.group(1).lower()
    
    tags = []
    if any(x in name for x in ['chicken', 'mutton', 'fish', 'egg']):
        tags.append('non-veg')
    elif any(x in name for x in ['paneer', 'milk', 'ghee', 'curd', 'cheese']):
        tags.append('veg')
    else:
        tags.extend(['veg', 'vegan'])
        if not any(x in name for x in ['onion', 'garlic', 'potato']):
            tags.append('jain')
            
    tags_str = '"tags": ' + str(tags).replace("'", '"')
    return text.rsplit('}', 1)[0] + ', ' + tags_str + '}'

for file_path in ['backend/app/db/dynamo.py', 'backend/seed_catalog.py']:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = re.sub(r'\{\s*"sku":\s*"[^"]+".*?\}', tagger, content, flags=re.DOTALL)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Updated', file_path)
    except Exception as e:
        print('Error on', file_path, e)
