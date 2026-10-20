import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';

const out = path.resolve('static/brand');
fs.mkdirSync(out, { recursive: true });
const fontBytes = fs.readFileSync('static/fonts/Manrope-Variable.ttf');
const font = opentype.parse(fontBytes.buffer.slice(fontBytes.byteOffset, fontBytes.byteOffset + fontBytes.byteLength));
font.variation.set({ wght: 700 });
const ink = '#183D32', yellow = '#F4C84A', cream = '#F7F5EC', coral = '#B44E38', sage = '#DCE5DA';
// A disc and one open curve: the smile reads without eyes, rays or decoration.
const smile = '<path d="M37 67C46 88 82 88 91 67" fill="none" stroke="black" stroke-width="9" stroke-linecap="round"/>';
const mark = (sun=yellow, expression=ink, mono=false) => `<defs><mask id="smile-cutout"><rect width="128" height="128" fill="white"/>${smile}</mask></defs><circle cx="64" cy="64" r="58" fill="${sun}" mask="url(#smile-cutout)"/>`;
let x = 0, previous = null, letters = [];
for (const char of 'be smile') {
  if (char === ' ') { x += 26; previous = null; continue; }
  const glyph = font.charToGlyph(char);
  if (previous) x += font.getKerningValue(previous, glyph) * 114 / font.unitsPerEm;
  letters.push(font.getPath(char, x, 101, 114).toPathData(3));
  x += glyph.advanceWidth * 114 / font.unitsPerEm - 3.4;
  previous = glyph;
}
const word = letters.map(d => `<path d="${d}"/>`).join('');
const width = Math.ceil(x + 172);
const svg = (w,h,body,title='Be Smile — Smile Disc identity') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">${body}</svg>`;
const logo = (sun, expression, text, mono=false) => svg(width,128,`${mark(sun,expression,mono)}<g transform="translate(158 0)" fill="${text}">${word}</g>`,'Be Smile logo');
const exports = {
  'logo-primary.svg': logo(yellow,ink,ink),
  'logo-reverse.svg': logo(yellow,ink,cream),
  'logo-ink.svg': logo(ink,cream,ink,true),
  'logo-white.svg': logo(cream,ink,cream,true),
  'symbol-sunshine.svg': svg(128,128,mark()),
  'symbol-ink.svg': svg(128,128,mark(ink,cream,true)),
  'symbol-white.svg': svg(128,128,mark(cream,ink,true)),
  'favicon.svg': svg(128,128,`<rect width="128" height="128" rx="32" fill="${yellow}"/><g transform="translate(13 13) scale(.8)">${mark(ink,yellow,true)}</g>`),
  'logo-stacked.svg': svg(600,300,`<g transform="translate(236 0)">${mark()}</g><g transform="translate(${(600-x)/2} 153)" fill="${ink}">${word}</g>`),
  'construction.svg': svg(800,500,`<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${ink}" stroke-opacity=".09"/></pattern></defs><rect width="800" height="500" fill="${cream}"/><rect width="800" height="500" fill="url(#grid)"/><g transform="translate(250 95) scale(2.35)">${mark()}</g><g fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="1"><circle cx="400.4" cy="245.4" r="150.4"/><circle cx="400.4" cy="245.4" r="136.3"/><path d="M170 245.4H630M400.4 40V450"/><rect x="215" y="60" width="370" height="370" stroke-dasharray="5 6"/></g><g font-family="Arial,sans-serif" font-size="11" fill="${ink}"><text x="35" y="45">128-UNIT MASTER / ONE DISC / ONE OPEN CURVE</text><text x="35" y="466">LESS FORM. MORE FEELING.</text><text x="625" y="80">Clear space ≥ ¼ symbol</text><text x="625" y="98">on all sides</text></g>`),
};
for (const [name, content] of Object.entries(exports)) {
  fs.writeFileSync(path.join(out, name), content);
  if (!['construction.svg','favicon.svg'].includes(name)) {
    const png = new Resvg(content, { fitTo: { mode:'width', value:name.startsWith('logo')?2400:1024 } }).render().asPng();
    fs.writeFileSync(path.join(out,name.replace('.svg','.png')),png);
  }
}
for (const size of [180,192,512]) {
  const icon=svg(512,512,`<rect width="512" height="512" fill="${yellow}"/><g transform="translate(102.4 102.4) scale(2.4)">${mark(ink)}</g>`,'Be Smile app icon');
  fs.writeFileSync(path.join(out,`app-icon-${size}.png`),new Resvg(icon,{fitTo:{mode:'width',value:size}}).render().asPng());
}
const logoInner=logo(yellow,ink,ink).replace(/^.*?<svg[^>]*>/,'').replace(/<\/svg>$/,'');
const darkLogo=logo(ink,yellow,ink,true).replace(/^.*?<svg[^>]*>/,'').replace(/<\/svg>$/,'');
const reverseLogo=logo(yellow,ink,cream).replace(/^.*?<svg[^>]*>/,'').replace(/<\/svg>$/,'');
exports['crew-shirt.svg']=svg(900,900,`<rect width="900" height="900" fill="${sage}"/><ellipse cx="454" cy="812" rx="250" ry="30" fill="${ink}" opacity=".07"/><path d="M316 170L185 218 100 405 228 464 285 360V752H615V360L672 464 800 405 715 218 584 170C555 245 345 245 316 170Z" fill="${yellow}"/><path d="M316 170C345 245 555 245 584 170" stroke="${ink}" opacity=".15" stroke-width="9" fill="none"/><path d="M185 218L228 464M715 218L672 464M285 720H615" fill="none" stroke="${ink}" stroke-opacity=".12" stroke-width="3"/><g transform="translate(312 325) scale(${276/width})">${darkLogo}</g><g fill="${ink}" font-family="Arial,sans-serif" text-anchor="middle"><text x="450" y="443" font-size="11" letter-spacing="6">GOOD ENERGY CREW</text><text x="450" y="698" font-size="9" letter-spacing="3">GOOD PEOPLE. GOOD TIMES.</text></g>`,'Be Smile crew uniform design');
exports['crew-pass.svg']=svg(700,900,`<rect width="700" height="900" fill="${coral}"/><path d="M265-30L309 252H391L435-30" fill="none" stroke="${ink}" stroke-width="35"/><rect x="153" y="223" width="400" height="548" rx="22" fill="${ink}" opacity=".13"/><rect x="143" y="213" width="400" height="548" rx="22" fill="${cream}"/><rect x="295" y="231" width="96" height="10" rx="5" fill="${coral}"/><g transform="translate(181 282) scale(${300/width})">${logoInner}</g><g transform="translate(264 380) scale(1.24)">${mark(ink,cream,true)}</g><g fill="${ink}" font-family="Arial,sans-serif"><text x="181" y="639" font-size="70" font-weight="bold" letter-spacing="-5">CREW.</text><text x="181" y="678" font-size="11" letter-spacing="3">PEOPLE FOR THE GOOD TIMES</text><text x="181" y="722" font-size="10" letter-spacing="2">BE SMILE / GOOD ENERGY</text></g>`,'Be Smile crew pass design');
exports['social-story.svg']=svg(720,1000,`<rect width="720" height="1000" fill="${yellow}"/><g transform="translate(54 53) scale(${238/width})">${darkLogo}</g><g fill="${ink}" font-family="Arial,sans-serif" font-weight="bold" font-size="98" letter-spacing="-6"><text x="54" y="290">work.</text><text x="54" y="397">sea.</text><text x="54" y="504">good</text><text x="54" y="611">company.</text></g><g transform="translate(432 690) rotate(12 95 95) scale(1.4)">${mark(ink,yellow,true)}</g><path d="M54 735H220M194 708L223 735 194 762" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><text x="54" y="924" fill="${ink}" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">YOUR NEXT SEASON / BE SMILE</text>`,'Be Smile social media identity');
exports['coast.svg']=svg(800,940,`<defs><clipPath id="frame"><rect width="800" height="940" rx="10"/></clipPath></defs><g clip-path="url(#frame)"><rect width="800" height="940" fill="${sage}"/><circle cx="530" cy="254" r="133" fill="${yellow}"/><path d="M0 455Q215 400 410 450T800 430V940H0Z" fill="#618D7B"/><path d="M0 535Q220 480 430 535T800 515V940H0Z" fill="${ink}"/><g stroke="${sage}" stroke-width="2" fill="none" opacity=".35"><path d="M350 590H710M490 620H800M240 650H560M450 680H740M330 710H660M560 740H800"/></g><path d="M-100 380C170 540 130 674 360 748S590 780 860 940H-100Z" fill="${cream}"/><path d="M-90 425C130 575 110 715 345 790S580 815 800 950" stroke="${yellow}" stroke-width="11" fill="none"/><g transform="translate(76 706)"><path d="M-20 0H200C169-125 9-125-20 0Z" fill="${coral}"/><path d="M90-88V142" stroke="${ink}" stroke-width="5"/><path d="M90-88C43-48 43-20 43 0M90-88C137-48 137-20 137 0" fill="none" stroke="${cream}" stroke-opacity=".45" stroke-width="3"/></g><path d="M0 210L167 280 0 410Z" fill="${coral}"/><g fill="${ink}"><path d="M320 298q13-12 26 0 13-12 26 0-26-5-26 5-1-10-26-5Z"/><path d="M379 272q9-9 18 0 9-9 18 0-18-4-18 3-1-7-18-3Z"/></g></g>`,'An abstract Mediterranean coast, designed for Be Smile');
for (const [name,content] of Object.entries(exports)) fs.writeFileSync(path.join(out,name),content);
fs.writeFileSync(path.join(out,'design-tokens.json'),JSON.stringify({name:'Be Smile / Sunshine — Smile Disc',colors:{sunshine:yellow,ink,cream,coral,sage,accessibleCoral:'#9D432F'},fonts:{display:'Manrope',body:'Golos Text'},logo:{masterGrid:128,concept:'smile disc',discRadius:58,smileStroke:9,clearSpace:'one quarter of symbol width',minimumHorizontalPx:132,minimumSymbolPx:24}},null,2));
for (const family of ['manrope','golos-text']) {
  const source=path.resolve(`node_modules/@fontsource-variable/${family}`);
  for (const file of ['LICENSE','OFL.txt']) if(fs.existsSync(path.join(source,file)))fs.copyFileSync(path.join(source,file),path.join(out,`${family}-LICENSE.txt`));
}
console.log(`Created ${Object.keys(exports).length} SVG assets, outlined logo variants, transparent PNG masters and brand tokens. Logo master ${width} × 128.`);
