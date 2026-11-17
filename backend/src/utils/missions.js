export const MISSION_IDS = ['days8','days12','weeks4'];
export function validMissionSelection(month,ids){
 return typeof month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(month)&&Array.isArray(ids)&&ids.length<=2&&new Set(ids).size===ids.length&&ids.every(id=>MISSION_IDS.includes(id))&&!(ids.includes('days8')&&ids.includes('days12'));
}
