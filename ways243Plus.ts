// src/lib/casino/engines/ways243Plus.ts
import type { Engine } from "./types";

/** Mulberry32 RNG */
function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type SpinArgs = { betXP: number; seed: number; state?: any; params?: any };

type Win = { type:"ways"; symbol:string; count:number; amountXP:number };

export type SpinResult = {
  symbols: string[][];
  wins: Win[];
  winXP: number;
  features?: any[];
};

const DEFAULTS = {
  reels: 5, rows: 3,
  wildChance: 0.05,
  scatterChance: 0.02,
  symbolSet: ["rocket","alien","planet","satellite","A","K","Q","J","10"],
  paytable: {
    rocket:{3:1,4:2,5:8},
    alien:{3:1,4:2,5:6},
    planet:{3:0.8,4:1.5,5:5},
    satellite:{3:0.6,4:1.2,5:4},
    A:{3:0.4,4:1,5:2.5},
    K:{3:0.4,4:1,5:2.5},
    Q:{3:0.3,4:0.8,5:2},
    J:{3:0.3,4:0.7,5:1.5},
    "10":{3:0.2,4:0.6,5:1.2}
  }
};

export function ways243PlusEngine(params:any={}):Engine {
  const P = {...DEFAULTS,...params};
  const reels = P.reels, rows = P.rows;

  function spin(args:SpinArgs):Promise<SpinResult> {
    const {betXP,seed} = args;
    const R = rng(seed);
    const symbols:string[][] = Array.from({length:rows},()=>Array.from({length:reels},()=> ""));

    for(let r=0;r<rows;r++){
      for(let c=0;c<reels;c++){
        if(R()<P.scatterChance){symbols[r][c]="scatter";continue;}
        if(R()<P.wildChance){symbols[r][c]="wild";continue;}
        const pick = P.symbolSet[Math.floor(R()*P.symbolSet.length)];
        symbols[r][c]=pick;
      }
    }

    const wins:Win[]=[]; let total=0;
    for(const sym of P.symbolSet){
      let length=0; let ways=1;
      for(let c=0;c<reels;c++){
        let matches=0;
        for(let r=0;r<rows;r++){
          const t=symbols[r][c];
          if(t===sym||t==="wild"){matches++;}
        }
        if(matches===0)break;
        length++; ways*=matches;
      }
      if(length>=3){
        const pay=P.paytable[sym]?.[length];
        if(pay){const amt=Math.floor(betXP*pay*ways); if(amt>0){wins.push({type:"ways",symbol:sym,count:length,amountXP:amt}); total+=amt;}}}
    }

    return Promise.resolve({symbols,wins,winXP:total});
  }

  return {name:"ways243Plus",spin};
}
