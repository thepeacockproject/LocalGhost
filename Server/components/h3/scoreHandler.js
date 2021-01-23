// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const path = require('path');
const { readFile } = require('atomically');

const { xpRequiredForLevel, maxLevelForLocation, getLocationCompletion } = require('../utils.js');
const { contractSessions } = require('./eventHandler.js');

async function missionend(req, res) {
    const sessionDetails = contractSessions.get(req.query.contractSessionId);
    if (!sessionDetails) { // contract session not found
        res.status(404).end();
        return;
    }
    if (sessionDetails.userId != req.jwt.unique_name) { // requested score for other user's session
        res.status(401).end();
        return;
    }
    const repo = JSON.parse(await readFile(path.join('userdata', 'allunlockables.json')));
    const userData = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    const contractData = JSON.parse(await readFile(path.join('contractdata', `${sessionDetails.contractId}.json`)));
    const sublocation = repo.find(entry => entry.Id == contractData.Metadata.Location);
    const maxlevel = maxLevelForLocation(sublocation.Properties.ProgressionKey);
    const locationProgression = userData.Extensions.progression.Locations[sublocation.Properties.ProgressionKey.toLowerCase()];

    let nonTargetKills = sessionDetails.npcKills.size + sessionDetails.crowdNpcKills;

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
            condition: contractData.Data.Objectives.every(obj => obj.ExcludeFromScoring || sessionDetails.completedObjectives.has(obj.Id)),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NOT_SPOTTED',
            bonusId: 'Unspotted',
            condition: [...sessionDetails.witnesses, ...sessionDetails.spottedBy]
                .every(witness => sessionDetails.targetKills.has(witness) || sessionDetails.npcKills.has(witness)),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NO_NOTICED_KILLS',
            bonusId: 'NoWitnessedKillsBonus',
            condition: [...sessionDetails.killsNoticedBy].every(witness => sessionDetails.targetKills.has(witness) || sessionDetails.npcKills.has(witness)),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NO_BODIES_FOUND',
            bonusId: 'NoBodiesFound',
            condition: [...sessionDetails.bodiesFoundBy].every(witness => sessionDetails.targetKills.has(witness) || sessionDetails.npcKills.has(witness)),
        },
        {
            headline: 'UI_SCORING_SUMMARY_NO_RECORDINGS',
            bonusId: 'SecurityErased',
            condition: sessionDetails.recording == 'NOT_SPOTTED' || sessionDetails.recording == 'ERASED',
        },
    ];

    let stars = [...bonuses.slice(1), { condition: nonTargetKills == 0 }].filter(x => x.condition).length;

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

    const timeTotal = sessionDetails.timerEnd - sessionDetails.timerStart;
    result.ScoreOverview.ContractScore.TimeUsedSecs = timeTotal;

    const timeHours = Math.floor(timeTotal / 3600);
    const timeMinutes = Math.floor((timeTotal - (timeHours * 3600)) / 60);
    const timeSeconds = Math.floor(timeTotal - (timeHours * 3600) - (timeMinutes * 60));
    let timebonus = 0;

    // formula from https://www.hitmanforum.com/t/how-the-time-bonus-is-calculated/17438
    if (timeTotal <= 300) { // 5 minutes
        timebonus = total * (1.1 - ((timeTotal / 300) * 0.4));
    } else if (timeTotal <= 900) { // 15 minutes
        timebonus = total * (0.7 - (((timeTotal - 300) / (900 - 300)) * 0.1));
    } else if (timeTotal <= 3600) { // 60 minutes
        timebonus = total * (0.6 - (((timeTotal - 900) / (3600 - 900)) * 0.1));
    } else if (timeTotal <= 200 * 60) { // todo: check this limit
        timebonus = total * (0.5 - (((timeTotal - 3600) / (200 * 60 - 3600)) * 0.5));
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
    result.ScoreOverview.SilentAssassin = result.ScoreOverview.ContractScore.SilentAssassin = stars == 5; // not sure if this is correct

    // TODO: add xp to user profile
    // TODO: save in leaderboards

    res.json({
        template: null,
        data: result,
    });
}

module.exports = {
    missionend,
};
