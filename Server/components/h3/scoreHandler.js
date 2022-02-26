// Copyright (C) 2020-2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const path = require('path');
const { readFile } = require('atomically');

const { xpRequiredForLevel, maxLevelForLocation, getLocationCompletion, UUIDRegex } = require('../utils.js');

async function getMissionEndData(sessionDetails, gameVersion) {
    const unlockables = JSON.parse(await readFile(path.join('userdata', gameVersion, 'allunlockables.json')));
    const userData = JSON.parse(await readFile(path.join('userdata', gameVersion, 'users', `${sessionDetails.userId}.json`)));
    const contractData = JSON.parse(await readFile(path.join('contractdata', `${sessionDetails.contractId}.json`)));
    const sublocation = unlockables.find(entry => entry.Id === contractData.Metadata.Location);
    const maxlevel = maxLevelForLocation(sublocation.Properties.ProgressionKey, gameVersion);
    const locationProgression = userData.Extensions.progression.Locations[sublocation.Properties.ProgressionKey.toLowerCase()];

    const scoreTrackerContext = sessionDetails.results.scoretracker.endContext;

    let nonTargetKills = scoreTrackerContext.nonTargetKills;

    let result = {
        MissionReward: {
            LocationProgression: {
                LevelInfo: Array.from({ length: maxlevel }, (_, i) => xpRequiredForLevel(i + 1)),
                XP: locationProgression.Xp,
                Level: locationProgression.Level,
                Completion: getLocationCompletion(sublocation.Properties.ProgressionKey, locationProgression),
                XPGain: 0,
                HideProgression: false,
            },
            ProfileProgression: {
                LevelInfo: [0, 6000], // TODO
                LevelInfoOffset: 0,
                XP: userData.Extensions.progression.PlayerProfileXP.Total,
                Level: userData.Extensions.progression.PlayerProfileXP.ProfileLevel,
                XPGain: 0,
            },
            Challenges: [
                {
                    "ChallengeId": "d4ace567-1bb0-4d24-8bdc-bab36628c1cc",
                    "ChallengeTags": [],
                    "ChallengeName": "ui_prop_tool_wrench_rusty_name",
                    "ChallengeImageUrl": "images/unlockables/item_perspective_4d2ecde8-79db-44b1-8f60-7a1a648f7d09_0.jpg",
                    "ChallengeDescription": "Placeholder challenge",
                    "XPGain": 0,
                    "IsGlobal": false,
                    "IsActionReward": false,
                    "Drops": []
                }
            ], // TODO
            Drops: [], // TODO
            OpportunityRewards: [], // ?
            CompletionData: {
                // TODO?
            },
            ChallengeCompletion: {
                ChallengesCount: 0,
                CompletedChallengesCound: 0,
            },
            ContractChallengeCompletion: {
                ChallengesCount: 0,
                CompletedChallengesCound: 0,
            },
            LocationCompletionPercent: 0, // TODO
        },
        ScoreOverview: {
            XP: 0, // Total location xp
            Level: 1, // Total location level
            Completion: 1,
            XPGain: 0,
            ChallengesCompleted: 0,
            LocationHideProgression: false,
            ScoreDetails: {
                Headlines: [],
            },
            ContractScore: {
                AchievedMasteries: [
                    {
                        score: -5000 * nonTargetKills,
                        RatioParts: nonTargetKills,
                        RatioTotal: nonTargetKills,
                        Id: 'KillPenaltyMastery',
                        BaseScore: -5000,
                    },
                ],
                AwardedBonuses: [],
                FailedBonuses: [],
            },
            NewRank: 1, // Todo: leaderboards
            RankCount: 1,
            Rank: 1,
            FriendsRankCount: 1,
            FriendsRank: 1,
            IsPartOfTopScores: false, // Todo: check when this is true
        },
    };

    const bonuses = [
        {
            headline: 'UI_SCORING_SUMMARY_OBJECTIVES',
            bonusId: 'AllObjectivesCompletedBonus',
            condition: sessionDetails.results.objectives.every(objResult => objResult.endState === 'Success'),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NOT_SPOTTED',
            bonusId: 'Unspotted',
            condition: [...scoreTrackerContext.witnesses, ...scoreTrackerContext.spottedBy]
                .every(witness => scoreTrackerContext.deadNpcs.includes(witness)),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NO_NOTICED_KILLS',
            bonusId: 'NoWitnessedKillsBonus',
            condition: [...scoreTrackerContext.killsNoticedBy]
                .every(witness => scoreTrackerContext.deadNpcs.includes(witness)),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NO_BODIES_FOUND',
            bonusId: 'NoBodiesFound',
            condition: [...scoreTrackerContext.bodiesFoundBy]
                .every(witness => scoreTrackerContext.deadNpcs.includes(witness)),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NO_RECORDINGS',
            bonusId: 'SecurityErased',
            condition: scoreTrackerContext.recording === 'NOT_SPOTTED' || scoreTrackerContext.recording === 'ERASED',
        },
    ];

    let stars = 5 - [...bonuses, { condition: nonTargetKills === 0 }].filter(x => !x.condition).length; // one star less for each bonus missed
    stars = stars < 0 ? 0 : stars; // clamp to 0

    let total = -5000 * nonTargetKills;

    const headlineObjTemplate = {
        type: 'summary',
        count: '',
        scoreIsFloatingType: false,
        fractionNumerator: 0,
        fractionDenominator: 0,
        scoreTotal: 20000,
    };

    for (const bonus of bonuses) {
        const bonusObj = {
            Score: 20000,
            Id: bonus.bonusId,
            FractionNumerator: 0,
            FractionDenominator: 0,
        };
        const headlineObj = Object.assign({}, headlineObjTemplate);
        headlineObj.headline = bonus.headline;
        if (bonus.condition) {
            total += 20000;
            result.ScoreOverview.ScoreDetails.Headlines.push(headlineObj);
            result.ScoreOverview.ContractScore.AwardedBonuses.push(bonusObj);
        } else {
            bonusObj.Score = 0;
            headlineObj.scoreTotal = 0;
            result.ScoreOverview.ScoreDetails.Headlines.push(headlineObj);
            result.ScoreOverview.ContractScore.FailedBonuses.push(bonusObj);
        }
    }

    total = Math.max(total, 0);
    result.ScoreOverview.ContractScore.TotalNoMultipliers = result.ScoreOverview.ContractScore.Total = total; // TODO?: do these ever differ?

    result.ScoreOverview.ScoreDetails.Headlines.push(Object.assign(Object.assign({}, headlineObjTemplate), {
        headline: 'UI_SCORING_SUMMARY_KILL_PENALTY',
        count: nonTargetKills > 0 ? `${nonTargetKills}x-5000` : '',
        scoreTotal: -5000 * nonTargetKills,
    }));

    const timeTotal = scoreTrackerContext.timerEnd - scoreTrackerContext.timerStart;
    result.ScoreOverview.ContractScore.TimeUsedSecs = timeTotal;

    const timeHours = Math.floor(timeTotal / 3600);
    const timeMinutes = Math.floor((timeTotal - (timeHours * 3600)) / 60);
    const timeSeconds = Math.floor(timeTotal - (timeHours * 3600) - (timeMinutes * 60));
    let timebonus = 0;

    // formula from https://hitmanforumarchive.notex.app/#/t/how-the-time-bonus-is-calculated/17438 (https://archive.ph/pRjzI)
    const scorePoints = [
        [0, 1.1], // 1.1 bonus multiplier at 0 secs (0 min)
        [300, 0.7], // 0.7 bonus multiplier at 300 secs (5 min)
        [900, 0.6], // 0.6 bonus multiplier at 900 secs (15 min)
        [17100, 0.0], // 0 bonus multiplier at 17100 secs (285 min) // Todo: test near this limit
    ];
    let prevsecs, prevmultiplier;
    for (const [secs, multiplier] of scorePoints) {
        if (timeTotal > secs) {
            prevsecs = secs;
            prevmultiplier = multiplier;
            continue;
        }
        // linear interpolation between current and previous scorePoints
        const bonusmultiplier = prevmultiplier - (prevmultiplier - multiplier) * (timeTotal - prevsecs) / (secs - prevsecs);
        timebonus = total * bonusmultiplier;
        break;
    }
    timebonus = Math.round(timebonus);

    total += timebonus;

    result.ScoreOverview.ContractScore.AwardedBonuses.push({
        Score: timebonus,
        Id: 'SwiftExecution',
        FractionNumerator: 0,
        FractionDenominator: 0,
    });
    result.ScoreOverview.ScoreDetails.Headlines.push(Object.assign(Object.assign({}, headlineObjTemplate), {
        headline: 'UI_SCORING_SUMMARY_TIME',
        count: `${`0${timeHours}`.slice(-2)}:${`0${timeMinutes}`.slice(-2)}:${`0${timeSeconds}`.slice(-2)}`,
        scoreTotal: timebonus,
    }));

    for (const type of ['total', 'subtotal']) { // Todo?: do these ever differ?
        result.ScoreOverview.ScoreDetails.Headlines.push(Object.assign(Object.assign({}, headlineObjTemplate), {
            type: type,
            headline: `UI_SCORING_SUMMARY_${type.toUpperCase()}`,
            scoreTotal: total,
        }));
    }

    result.ScoreOverview.stars = result.ScoreOverview.ContractScore.StarCount = stars;
    result.ScoreOverview.SilentAssassin = result.ScoreOverview.ContractScore.SilentAssassin =
        [...bonuses.slice(1), { condition: nonTargetKills === 0 }].every(x => x.condition); // need to have all bonuses except objectives for SA

    // TODO: save in leaderboards

    return result;
}

module.exports = {
    getMissionEndData,
};
