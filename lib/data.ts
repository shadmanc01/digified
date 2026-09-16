export type Photo = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  user: { username: string; name: string; avatar: string };
  camera: { slug: string; name: string; maker: string };
  lens: { slug: string; name: string };
  category: string;
  location: string;
  settings: string;
  recipe?: { name: string; fields: [string, string][] };
  likes: number;
  saves: number;
  aspect: 'portrait'|'landscape'|'square';
};

export const categories = ['Street','Portrait','Landscape','Wildlife','Travel','Architecture','Automotive','Sports','Night','Nature','Documentary','Macro','Food','Fashion','Events','Still Life','Astrophotography','Black & White','Urban','Abstract'];

export const photos: Photo[] = [
  { id:'1', src:'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=85', alt:'Dense urban streets viewed from above', caption:'A quiet rhythm in a loud city.', user:{username:'maya.chen',name:'Maya Chen',avatar:'MC'}, camera:{slug:'fujifilm-x-t5',name:'Fujifilm X-T5',maker:'Fujifilm'}, lens:{slug:'fujinon-xf-23mm-f2',name:'Fujinon XF 23mm f/2 R WR'}, category:'Street', location:'New York, NY', settings:'23mm · f/4 · 1/500 · ISO 320', recipe:{name:'Chrome City',fields:[['Film simulation','Classic Chrome'],['White balance','Daylight'],['WB Shift','R +2, B -3'],['Highlights','-1'],['Shadows','+1'],['Color','+2']]}, likes:1842,saves:628,aspect:'portrait' },
  { id:'2', src:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85', alt:'Green forest with sunlight streaming through', caption:'Light finding its way through the canopy.', user:{username:'eli.west',name:'Eli West',avatar:'EW'}, camera:{slug:'sony-a7-iv',name:'Sony A7 IV',maker:'Sony'}, lens:{slug:'sony-fe-35mm-f14-gm',name:'Sony FE 35mm f/1.4 GM'}, category:'Nature', location:'Olympic National Park, WA', settings:'35mm · f/2.8 · 1/250 · ISO 200', likes:932,saves:311,aspect:'landscape' },
  { id:'3', src:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85', alt:'Mountain landscape at sunrise', caption:'First light across the ridge.', user:{username:'noah.kim',name:'Noah Kim',avatar:'NK'}, camera:{slug:'nikon-zf',name:'Nikon Zf',maker:'Nikon'}, lens:{slug:'nikkor-z-40mm-f2',name:'NIKKOR Z 40mm f/2'}, category:'Landscape', location:'Banff, Alberta', settings:'40mm · f/8 · 1/125 · ISO 100', likes:2211,saves:1002,aspect:'landscape' },
  { id:'4', src:'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=85', alt:'Deer standing in a field', caption:'A few seconds of stillness before it disappeared.', user:{username:'sana.wild',name:'Sana Rahman',avatar:'SR'}, camera:{slug:'om-system-om-1',name:'OM System OM-1',maker:'OM System'}, lens:{slug:'mzuiko-40-150-f28',name:'M.Zuiko 40–150mm f/2.8 PRO'}, category:'Wildlife', location:'Yellowstone, WY', settings:'150mm · f/3.2 · 1/1600 · ISO 800', likes:1420,saves:489,aspect:'portrait' },
  { id:'5', src:'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1400&q=85', alt:'Modern city building facade', caption:'Lines, glass, repetition.', user:{username:'jon.bell',name:'Jon Bell',avatar:'JB'}, camera:{slug:'ricoh-gr-iii',name:'Ricoh GR III',maker:'Ricoh'}, lens:{slug:'ricoh-gr-18mm',name:'GR 18.3mm f/2.8'}, category:'Architecture', location:'Chicago, IL', settings:'18.3mm · f/5.6 · 1/320 · ISO 200', likes:771,saves:280,aspect:'portrait' },
  { id:'6', src:'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=85', alt:'Suburban home exterior at dusk', caption:'Blue hour geometry.', user:{username:'marco.f',name:'Marco Flores',avatar:'MF'}, camera:{slug:'canon-eos-r6-mark-ii',name:'Canon EOS R6 Mark II',maker:'Canon'}, lens:{slug:'canon-rf-24-70-f28',name:'Canon RF 24–70mm f/2.8L IS USM'}, category:'Architecture', location:'Austin, TX', settings:'28mm · f/4 · 1/160 · ISO 640', likes:665,saves:184,aspect:'landscape' },
  { id:'7', src:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=85', alt:'Traveler overlooking mountain lake', caption:'The long way was worth it.', user:{username:'amelia.travels',name:'Amelia Stone',avatar:'AS'}, camera:{slug:'fujifilm-x100vi',name:'Fujifilm X100VI',maker:'Fujifilm'}, lens:{slug:'fixed-23mm-f2',name:'Fixed 23mm f/2'}, category:'Travel', location:'Dolomites, Italy', settings:'23mm · f/5.6 · 1/500 · ISO 160', recipe:{name:'Alpine Soft',fields:[['Film simulation','Nostalgic Neg.'],['Dynamic range','DR400'],['White balance','Auto'],['Highlights','-2'],['Shadows','-1'],['Color','+1']]}, likes:2988,saves:1204,aspect:'landscape' },
  { id:'8', src:'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=85', alt:'Sports car parked outdoors', caption:'Late afternoon, no destination.', user:{username:'drew.cars',name:'Drew Patel',avatar:'DP'}, camera:{slug:'sony-a7-iv',name:'Sony A7 IV',maker:'Sony'}, lens:{slug:'sigma-85mm-f14-dg-dn',name:'Sigma 85mm f/1.4 DG DN Art'}, category:'Automotive', location:'Los Angeles, CA', settings:'85mm · f/1.8 · 1/1000 · ISO 100', likes:1778,saves:701,aspect:'landscape' },
  { id:'9', src:'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1400&q=85', alt:'Dog portrait outdoors', caption:'The best kind of portrait session.', user:{username:'lina.photo',name:'Lina Park',avatar:'LP'}, camera:{slug:'leica-q3',name:'Leica Q3',maker:'Leica'}, lens:{slug:'summilux-28mm-f17',name:'Summilux 28mm f/1.7 ASPH.'}, category:'Portrait', location:'Portland, OR', settings:'28mm · f/1.7 · 1/800 · ISO 100', likes:1240,saves:380,aspect:'square' },
  { id:'10', src:'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85', alt:'Starry night over snowy mountains', caption:'Stayed out until the cold won.', user:{username:'kai.night',name:'Kai Morgan',avatar:'KM'}, camera:{slug:'panasonic-lumix-s5-ii',name:'Panasonic Lumix S5 II',maker:'Panasonic'}, lens:{slug:'lumix-s-20-60',name:'Lumix S 20–60mm f/3.5–5.6'}, category:'Astrophotography', location:'Iceland', settings:'20mm · f/3.5 · 15s · ISO 3200', likes:3204,saves:1490,aspect:'landscape' },
  { id:'11', src:'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1400&q=85', alt:'Man portrait in a cafe', caption:'Window light and a ten-minute portrait.', user:{username:'maya.chen',name:'Maya Chen',avatar:'MC'}, camera:{slug:'fujifilm-x-t5',name:'Fujifilm X-T5',maker:'Fujifilm'}, lens:{slug:'fujinon-xf-35mm-f14',name:'Fujinon XF 35mm f/1.4 R'}, category:'Portrait', location:'Brooklyn, NY', settings:'35mm · f/1.8 · 1/250 · ISO 640', recipe:{name:'Warm Window',fields:[['Film simulation','Classic Neg.'],['White balance','5200K'],['WB Shift','R +3, B -2'],['Highlights','-1'],['Shadows','0']]}, likes:1548,saves:644,aspect:'portrait' },
  { id:'12', src:'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=85', alt:'Rainy neon city street at night', caption:'Rain makes every light twice as interesting.', user:{username:'noah.kim',name:'Noah Kim',avatar:'NK'}, camera:{slug:'fujifilm-x-t1',name:'Fujifilm X-T1',maker:'Fujifilm'}, lens:{slug:'viltrox-28mm-f45',name:'Viltrox AF 28mm f/4.5 XF'}, category:'Night', location:'Tokyo, Japan', settings:'28mm · f/4.5 · 1/125 · ISO 1600', recipe:{name:'Neon Chrome',fields:[['Film simulation','Classic Chrome'],['White balance','3200K'],['Highlights','-2'],['Shadows','+2'],['Color','+2'],['Noise reduction','-2']]}, likes:2690,saves:1322,aspect:'portrait' }
];

export const cameraStats = [
  {slug:'fujifilm-x-t5',name:'Fujifilm X-T5',maker:'Fujifilm',photos:'18.4k',users:'4.8k'},
  {slug:'fujifilm-x100vi',name:'Fujifilm X100VI',maker:'Fujifilm',photos:'31.2k',users:'9.1k'},
  {slug:'ricoh-gr-iii',name:'Ricoh GR III',maker:'Ricoh',photos:'22.7k',users:'6.0k'},
  {slug:'sony-a7-iv',name:'Sony A7 IV',maker:'Sony',photos:'40.8k',users:'11.4k'},
  {slug:'canon-eos-r6-mark-ii',name:'Canon EOS R6 Mark II',maker:'Canon',photos:'16.1k',users:'4.2k'},
  {slug:'nikon-zf',name:'Nikon Zf',maker:'Nikon',photos:'10.9k',users:'3.1k'},
  {slug:'fujifilm-x-t1',name:'Fujifilm X-T1',maker:'Fujifilm',photos:'8.6k',users:'2.9k'},
  {slug:'leica-q3',name:'Leica Q3',maker:'Leica',photos:'12.3k',users:'3.6k'}
];
