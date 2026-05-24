// File: lib/home/concierge-match.ts

import {
  type HomePartner,
  partnerMatchesRegion,
  partnerUrl,
} from "@/lib/home/partners-home";

const CATEGORY_KEYWORDS: Record<string,string[]> = {

flights:[
"flight","flights","fly","plane",
"airline","airfare",
"ticket","tickets",
"voo","voos",
"passagem","passagens",
"vuelo","vuelos",
"boleto","boletos",
"avion","avião",
"lot","loty","bilet"
],

hotels:[
"hotel","hotels",
"stay","accommodation",
"lodging","hostel",
"resort","alojamiento"
],

car_rentals:[
"car","rental",
"rent a car",
"vehicle",
"alquiler",
"carro"
],

esim:[
"esim","sim",
"internet",
"mobile data",
"roaming"
],

tours:[
"tour","tours",
"activity",
"activities",
"excursion"
],

marketplace:[
"buy","shop",
"shopping",
"store",
"purchase",
"comprar"
]

};

const NEGATIVE_MATCHES:Record<string,string[]>={

flights:[
"esim",
"car_rentals",
"tours"
],

hotels:[
"esim"
],

esim:[
"flights",
"hotels"
]

};

export interface Intent{

category:string|null
keywords:string[]
destination:string|null
confidence:number

}

export function detectIntent(
rawQuery:string
):Intent{

const q=(rawQuery||"")
.toLowerCase()
.trim();

const scores:Record<string,number>={}
const keywords:string[]=[]

for(
const [cat,words]
of Object.entries(
CATEGORY_KEYWORDS
)
){

for(const w of words){

if(
q.includes(
w.toLowerCase()
)
){

scores[cat]=
(scores[cat]||0)+1

keywords.push(w)

}

}

}

let category=null
let best=0

for(
const [cat,score]
of Object.entries(scores)
){

if(score>best){

best=score
category=cat

}

}

let confidence=
category
?Math.min(
1,
0.5+(best*.2)
)
:0

return{

category,
keywords,
destination:null,
confidence

}

}

export interface MatchResult{

partner:HomePartner
url:string
score:number

}

export function scorePartners(

all:HomePartner[],
region:string,
intent:Intent,
rawQuery:string

):MatchResult[]{

const visible=
all.filter(
p=>
partnerMatchesRegion(
p,
region
)
)

const scored=
visible.map(p=>{

let score=0

if(
intent.category &&
p.category_key===
intent.category
){

score+=10

}

const hay=[

p.name,
p.description,
p.network,
p.category_key

]
.join(" ")
.toLowerCase()

for(
const kw of
intent.keywords
){

if(
hay.includes(
kw
)
){

score+=2

}

}

if(

intent.category &&
NEGATIVE_MATCHES[
intent.category
]?.includes(
p.category_key
)

){

score-=8

}

score+=
p.featured
?1
:0

score+=
Number(
p.tier
)===1
?1
:0

return{

partner:p,
url:partnerUrl(
p,
region
),
score

}

})

return scored

.filter(
r=>r.score>0
)

.sort(
(a,b)=>
b.score-a.score
)

.slice(
0,
5
)

}

export function conciergeMatch(

all:HomePartner[],
region:string,
rawQuery:string

){

const intent=
detectIntent(
rawQuery
)

const matches=
scorePartners(
all,
region,
intent,
rawQuery
)

return{

intent,
matches,
useAI:
matches.length===0 ||
intent.confidence<0.4

}

}
