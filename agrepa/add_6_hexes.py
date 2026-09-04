import re

with open('equipo.html', 'r') as f:
    content = f.read()

new_hexes = """
      <span class="celda celda--deco" style="--x:-3;--r:-2" data-q="-2" data-r="-2" aria-hidden="true">
        <span class="celda__hex"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>
      <span class="celda celda--deco" style="--x:3;--r:-2" data-q="4" data-r="-2" aria-hidden="true">
        <span class="celda__hex"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>
      <span class="celda celda--deco" style="--x:-3;--r:0" data-q="-3" data-r="0" aria-hidden="true">
        <span class="celda__hex"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>
      <span class="celda celda--deco" style="--x:3;--r:0" data-q="3" data-r="0" aria-hidden="true">
        <span class="celda__hex"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>
      <span class="celda celda--deco" style="--x:-3;--r:2" data-q="-4" data-r="2" aria-hidden="true">
        <span class="celda__hex"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>
      <span class="celda celda--deco" style="--x:3;--r:2" data-q="2" data-r="2" aria-hidden="true">
        <span class="celda__hex"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>
"""

target = r'(\s*</div>\s*<p class="panal__lectura" id="lectura" aria-live="polite">)'
replacement = new_hexes + r'\1'

content = re.sub(target, replacement, content)

# 2. Update CSS aspect ratio and width
content = re.sub(r'aspect-ratio:6 / 4\.6188;', r'aspect-ratio:7 / 4.6188;', content)
content = re.sub(r'width:16\.6666%;height:25%;', r'width:14.2857%;height:25%;', content)
content = re.sub(r'left:calc\(50% \+ var\(--x\) \* 16\.6666% - 8\.3333%\);', r'left:calc(50% + var(--x) * 14.2857% - 7.14285%);', content)

# 3. Update JS 1/6 to 1/7
content = content.replace('(1/6)', '(1/7)')

with open('equipo.html', 'w') as f:
    f.write(content)

print("Done")
