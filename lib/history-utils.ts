export type VisitHistory={items:string[];index:number};
export function appendVisit(history:VisitHistory,slug:string):VisitHistory{if(history.items[history.index]===slug)return history;const branch=history.items.slice(0,history.index+1);if(branch.at(-1)!==slug)branch.push(slug);return{items:branch,index:branch.length-1}}
export function moveHistory(history:VisitHistory,direction:-1|1){const index=history.index+direction;if(index<0||index>=history.items.length)return{history,target:null};return{history:{...history,index},target:history.items[index]}}
