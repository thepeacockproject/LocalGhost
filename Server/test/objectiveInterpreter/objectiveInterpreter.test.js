// Copyright (C) 2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const objectiveInterpreter = require('../../components/objectiveInterpreter.js');
const fs = require('fs');
const path = require('path');

const testCaseFiles = fs.readdirSync(path.join(__dirname, 'testCases'));
const testCases = testCaseFiles.map(fileName => {
    const testCase = JSON.parse(fs.readFileSync(path.join(__dirname, 'testCases', fileName)))
    return [fileName, testCase.Description, testCase];
});

function checkProperties(expected, actual) {
    if (typeof expected === 'object') {
        expect(typeof actual).toBe('object');
        if (Array.isArray(expected))
            expect(Array.isArray(actual)).toBe(true);

        for (const prop in expected) {
            checkProperties(expected[prop], actual[prop]);
        }
    } else {
        expect(actual).toBe(expected);
    }
}

describe('Test the objective interpreter', () => {
    describe.each(testCases)('%s: %s', (fileName, description, testCase) => {
        test.each(testCase.Tests)('Test $#: $Description', (test) => {
            const objectiveIdsToTest = new Set(test.ExpectedResults.map(x => x.ObjectiveId));
            const objectivesToTest = testCase.Contract.Data.Objectives.filter(objective => objectiveIdsToTest.has(objective.Id));

            const interpreterResults = objectiveInterpreter.handleEvents(objectivesToTest, test.Events || []);

            for (const expectedResult of test.ExpectedResults) {
                for (const prop in expectedResult) {
                    if (![
                        'ObjectiveId',
                        'ExpectedSuccess',
                        'ExpectedFailure',
                        'ExpectedEndContext',
                    ].includes(prop)) {
                        throw Error(`Unknown expect: ${prop}`);
                    }
                }

                let checkedSomething = false;

                if (expectedResult.ExpectedSuccess === true) {
                    expect(interpreterResults[expectedResult.ObjectiveId].endState).toBe('Success');
                    checkedSomething = true;
                }
                if (expectedResult.ExpectedSuccess === false) {
                    expect(interpreterResults[expectedResult.ObjectiveId].endState).not.toBe('Success');
                    checkedSomething = true;
                }
                if (expectedResult.ExpectedFailure === true) {
                    expect(interpreterResults[expectedResult.ObjectiveId].endState).toBe('Failure');
                    checkedSomething = true;
                }
                if (expectedResult.ExpectedFailure === false) {
                    expect(interpreterResults[expectedResult.ObjectiveId].endState).not.toBe('Failure');
                    checkedSomething = true;
                }

                if (expectedResult.ExpectedEndContext) {
                    checkProperties(expectedResult.ExpectedEndContext, interpreterResults[expectedResult.ObjectiveId].endContext);
                    checkedSomething = true;
                }

                if (!checkedSomething)
                    throw Error('Nothing was checked in this test');
            }
        });
    });
});