import re, os

with open('/tmp/custom.css') as f:
    css = f.read()

index_path = '/app/build/index.html'
with open(index_path) as f:
    html = f.read()

style_tag = f'<style id="horbath-brand">{css}</style>'
html = html.replace('</head>', style_tag + '</head>')

# Also remove service worker registration to prevent update loop
html = html.replace("navigator.serviceWorker.register(", "// serviceWorker disabled")

with open(index_path, 'w') as f:
    f.write(html)

print("CSS injected and service worker disabled")
