import file from '../file.js'

function getGasData(campaign = []){
  let campaign_gas = [];
  let campaign_num = 0;
  campaign.forEach(mode => {
    if(mode.id !== "C00"){ //Exclude Onboarding
      campaign_gas[ campaign_num ] = {
        "id": mode.id,
        "nameKey": mode.nameKey,
        "descriptionKey": mode.descriptionKey,
         "image": mode.image,
         "campaignType": mode.campaignType,
         "unlockRequirementLocalizationKey": mode.unlockRequirementLocalizationKey,
         "dailyBattleCapKey": mode.dailyBattleCapKey,
         "campaignMap": []
      };
      let map_num = 0;
      mode.campaignMap.forEach(map => {
        campaign_gas[ campaign_num ].campaignMap[ map_num ] = {
          "entryOwnershipRequirement": map.entryOwnershipRequirement,
          "id": map.id,
          "unlockRequirementLocalizationKey": map.unlockRequirementLocalizationKey,
          "dailyBattleCapKey": map.dailyBattleCapKey,
          "entryCategoryAllowed": map.entryCategoryAllowed,
          "gameModeKey": map.gameModeKey,
          "campaignNodeDifficultyGroup": []
        }
        let diff_num = 0;
        map.campaignNodeDifficultyGroup.forEach(diff => {
          campaign_gas[ campaign_num ].campaignMap[ map_num ].campaignNodeDifficultyGroup[ diff_num ] = {
            "campaignNodeDifficulty": diff.campaignNodeDifficulty,
            "unlockRequirementLocalizationKey": diff.unlockRequirementLocalizationKey,
            "dailyBattleCapKey": diff.dailyBattleCapKey,
            "entryCategoryAllowed": diff.entryCategoryAllowed,
            "campaignNode": []
          }
          let node_num = 0;
          diff.campaignNode.forEach(node => {
            if(map.id !== "SCHEDULED" || map.id === "SCHEDULED" && node.id.indexOf("GC") < 0){
              campaign_gas[ campaign_num ].campaignMap[ map_num ].campaignNodeDifficultyGroup[ diff_num ].campaignNode[ node_num ] = node;

              node_num++;
            }
          });
          diff_num++;
        });
        map_num++;
      });
      campaign_num++;
    }
  });
  return campaign_gas
}

export default async function( data = [], version, gitVersions = {} ){
  if(data.length === 0) return
  let saveSuccess = 0
  let status = await file.save('campaign.json.br', { version, data: data })
  if(status){
    gitVersions['campaign.json.br'] = version
    saveSuccess++
  }
  let gasData = getGasData(data), gasSave
  if(gasData) gasSave = file.save('campaign_gas.json', { version, data: gasData })
  if(gasSave){
    gitVersions['campaign_gas.json'] = version
    saveSuccess++
  }
  console.log(saveSuccess)
  if(saveSuccess === 2) return true
}
